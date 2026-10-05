import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type SocketConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface UseFaboSocketOptions {
  brokerUrl?: string; // e.g. "ws://localhost:8080/ws-kds"
  sockJsFallbackUrl?: string; // e.g. "http://localhost:8080/ws-kds"
  reconnectDelayMs?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  debug?: boolean;
}

export function useFaboSocket(options: UseFaboSocketOptions = {}) {
  const {
    brokerUrl = 'ws://localhost:8080/ws-kds',
    sockJsFallbackUrl = 'http://localhost:8080/ws-kds',
    reconnectDelayMs = 5000,
    heartbeatIncoming = 10000,
    heartbeatOutgoing = 10000,
    debug = false,
  } = options;

  const [status, setStatus] = useState<SocketConnectionStatus>('DISCONNECTED');
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  useEffect(() => {
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
        // Fallback to SockJS if brokerURL is an HTTP url or standard WS fails
        if (sockJsFallbackUrl) {
          return new SockJS(sockJsFallbackUrl);
        }
        return new WebSocket(brokerUrl);
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
        console.error('[STOMP ERROR]', frame.headers['message'], frame.body);
      },
      onWebSocketError: (event) => {
        setStatus('ERROR');
        console.error('[STOMP WS ERROR]', event);
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
  }, [brokerUrl, sockJsFallbackUrl, reconnectDelayMs, heartbeatIncoming, heartbeatOutgoing, debug]);

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
