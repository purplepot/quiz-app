// ============================================================
// useWebSocket Hook - This file is COMPLETE
// Auto-reconnect with exponential backoff
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import type { ClientMessage, ServerMessage } from "@shared/index";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface UseWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Sends a message to the server */
  sendMessage: (message: ClientMessage) => void;
  /** Last message received from server */
  lastMessage: ServerMessage | null;
}

/**
 * React hook to manage a WebSocket connection with auto-reconnect.
 *
 * @param url - WebSocket server URL (e.g. "ws://localhost:3003")
 * @returns Object with status, sendMessage, and lastMessage
 *
 * @example
 * ```tsx
 * const { status, sendMessage, lastMessage } = useWebSocket('ws://localhost:3003')
 *
 * useEffect(() => {
 *   if (lastMessage?.type === 'joined') {
 *     setPlayers(lastMessage.players)
 *   }
 * }, [lastMessage])
 *
 * const handleJoin = () => {
 *   sendMessage({ type: 'join', quizCode: 'ABC123', name: 'Alice' })
 * }
 * ```
 */
export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptRef = useRef(0);
  const unmountedRef = useRef(false);

  const MAX_RECONNECT_DELAY = 30000; // max 30 seconds

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmountedRef.current) {
        ws.close();
        return;
      }
      console.log("[useWebSocket] Connected");
      setStatus("connected");
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as ServerMessage;
        setLastMessage(message);
      } catch (err) {
        console.error("[useWebSocket] Parse error:", err);
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      console.log("[useWebSocket] Disconnected");
      setStatus("disconnected");
      wsRef.current = null;

      // Reconnect with exponential backoff: 1s, 2s, 4s, 8s... max 30s
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttemptRef.current),
        MAX_RECONNECT_DELAY,
      );
      console.log(`[useWebSocket] Reconnecting in ${delay}ms...`);
      reconnectAttemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(() => {
        if (!unmountedRef.current) {
          connect();
        }
      }, delay);
    };

    ws.onerror = (event: Event) => {
      console.error("[useWebSocket] Error:", event);
      // onclose will be called automatically after onerror
    };
  }, [url]);

  // Initial connection and cleanup
  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[useWebSocket] Cannot send, WebSocket not connected");
    }
  }, []);

  return { status, sendMessage, lastMessage };
}
