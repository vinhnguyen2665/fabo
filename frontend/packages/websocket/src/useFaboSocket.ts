import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type SocketConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface UseFaboSocketOptions {
  brokerUrl?: string;
  sockJsFallbackUrl?: string; // Default to relative '/ws-kds' so it leverages dev/prod proxy
  reconnectDelayMs?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  debug?: boolean;
  enabled?: boolean; // Only connect when enabled (e.g. when modal is open)
}

export function useFaboSocket(options: UseFaboSocketOptions = {}) {
  const {
    brokerUrl,
    sockJsFallbackUrl = '/ws-kds',
    reconnectDelayMs = 5000,
    heartbeatIncoming = 10000,
    heartbeatOutgoing = 10000,
    debug = false,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<SocketConnectionStatus>('DISCONNECTED');
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

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

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: reconnectDelayMs,
      heartbeatIncoming,
      heartbeatOutgoing,
      debug: (msg: string) => {
        if (debug) console.log('[STOMP DEBUG]', msg);
      },
      webSocketFactory: () => {
        if (sockJsFallbackUrl) {
          return new SockJS(sockJsFallbackUrl);
        }
        if (brokerUrl) {
          return new WebSocket(brokerUrl);
        }
        return new SockJS('/ws-kds');
      },
      onConnect: () => {
        setStatus('CONNECTED');
        if (debug) console.log('[STOMP] Kết nối thành công!');
      },
      onDisconnect: () => {
        setStatus('DISCONNECTED');
        if (debug) console.log('[STOMP] Đã ngắt kết nối!');
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
      // Cleanup subscriptions
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current.clear();
      client.deactivate();
      setStatus('DISCONNECTED');
    };
  }, [brokerUrl, sockJsFallbackUrl, reconnectDelayMs, heartbeatIncoming, heartbeatOutgoing, debug, enabled]);

  /**
   * Subscribe to a STOMP topic with type-safe JSON payload decoding.
   */
  const subscribe = useCallback(
    <T>(destination: string, callback: (data: T, rawMessage: IMessage) => void) => {
      const client = clientRef.current;
      if (!client) {
        console.warn('[STOMP] Client chưa sẵn sàng để subscribe:', destination);
        return () => {};
      }

      const subscription = client.subscribe(destination, (message: IMessage) => {
        try {
          const parsed: T = JSON.parse(message.body);
          callback(parsed, message);
        } catch (e) {
          console.warn('[STOMP] Không thể parse JSON từ message:', message.body);
          callback(message.body as unknown as T, message);
        }
      });

      subscriptionsRef.current.set(destination, subscription);

      return () => {
        subscription.unsubscribe();
        subscriptionsRef.current.delete(destination);
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
