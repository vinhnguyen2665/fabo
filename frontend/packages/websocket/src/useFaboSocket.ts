import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type SocketConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface UseFaboSocketOptions {
  brokerUrl?: string;
  useSockJs?: boolean;
  sockJsFallbackUrl?: string;
  reconnectDelayMs?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  debug?: boolean;
  enabled?: boolean; // Only connect when enabled
}

interface PendingSubscription {
  id: string;
  destination: string;
  callback: (data: any, rawMessage: IMessage) => void;
  stompSub: StompSubscription | null;
}

export function useFaboSocket(options: UseFaboSocketOptions = {}) {
  const {
    brokerUrl,
    useSockJs = false,
    sockJsFallbackUrl = '/ws-kds',
    reconnectDelayMs = 5000,
    heartbeatIncoming = 10000,
    heartbeatOutgoing = 10000,
    debug = false,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<SocketConnectionStatus>('DISCONNECTED');
  const clientRef = useRef<Client | null>(null);
  const subsMapRef = useRef<Map<string, PendingSubscription>>(new Map());

  // Helper to activate a pending subscription on the client
  const activateSub = (sub: PendingSubscription) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;

    try {
      if (sub.stompSub) {
        try {
          sub.stompSub.unsubscribe();
        } catch (_) {}
      }
      sub.stompSub = client.subscribe(sub.destination, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body);
          sub.callback(parsed, message);
        } catch {
          sub.callback(message.body, message);
        }
      });
    } catch (err) {
      console.warn('[STOMP] Subscribe error:', err);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setStatus('DISCONNECTED');
      return;
    }

    setStatus('CONNECTING');

    const defaultNativeWsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws-kds`
        : undefined;

    const client = new Client({
      brokerURL: useSockJs ? undefined : (brokerUrl || defaultNativeWsUrl),
      reconnectDelay: reconnectDelayMs,
      heartbeatIncoming,
      heartbeatOutgoing,
      debug: (msg: string) => {
        if (debug) console.log('[STOMP DEBUG]', msg);
      },
      ...(useSockJs
        ? {
            webSocketFactory: () => new SockJS(sockJsFallbackUrl),
          }
        : {}),
      onConnect: () => {
        setStatus('CONNECTED');
        if (debug) console.log('[STOMP] Kết nối thành công!');
        // Re-activate all registered subscriptions
        subsMapRef.current.forEach((sub) => {
          activateSub(sub);
        });
      },
      onDisconnect: () => {
        setStatus('DISCONNECTED');
        if (debug) console.log('[STOMP] Đã ngắt kết nối!');
        subsMapRef.current.forEach((sub) => {
          sub.stompSub = null;
        });
      },
      onStompError: (frame) => {
        setStatus('ERROR');
        console.warn('[STOMP ERROR]', frame.headers['message'], frame.body);
      },
      onWebSocketError: (event) => {
        setStatus('ERROR');
        console.warn('[STOMP WS ERROR]', event);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subsMapRef.current.forEach((sub) => {
        if (sub.stompSub) {
          try {
            sub.stompSub.unsubscribe();
          } catch (_) {}
          sub.stompSub = null;
        }
      });
      client.deactivate();
      setStatus('DISCONNECTED');
    };
  }, [brokerUrl, sockJsFallbackUrl, reconnectDelayMs, heartbeatIncoming, heartbeatOutgoing, debug, enabled]);

  /**
   * Subscribe to a STOMP topic with type-safe JSON payload decoding.
   * Safe to call before connection is established: will auto-subscribe on connect.
   */
  const subscribe = useCallback(
    <T>(destination: string, callback: (data: T, rawMessage: IMessage) => void) => {
      const subId = destination + '_' + Math.random().toString(36).substring(2, 9);
      const subObj: PendingSubscription = {
        id: subId,
        destination,
        callback: callback as (data: any, rawMessage: IMessage) => void,
        stompSub: null,
      };

      subsMapRef.current.set(subId, subObj);

      // If already connected, activate immediately
      if (clientRef.current && clientRef.current.connected) {
        activateSub(subObj);
      }

      return () => {
        const existing = subsMapRef.current.get(subId);
        if (existing && existing.stompSub) {
          try {
            existing.stompSub.unsubscribe();
          } catch (_) {}
        }
        subsMapRef.current.delete(subId);
      };
    },
    []
  );

  /**
   * Send a JSON payload to a STOMP application destination.
   */
  const publish = useCallback((destination: string, body: unknown) => {
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('[STOMP] Không thể publish vì client chưa kết nối:', destination);
    }
  }, []);

  return {
    status,
    isConnected: status === 'CONNECTED',
    subscribe,
    publish,
    client: clientRef.current,
  };
}
