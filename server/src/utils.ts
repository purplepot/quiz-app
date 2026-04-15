// ============================================================
// WebSocket utilities - This file is COMPLETE
// ============================================================

import WebSocket from "ws";
import type { ServerMessage } from "../../packages/shared-types";

/**
 * Sends a message to a single WebSocket client.
 * Ensures the connection is open before sending.
 */
export function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Sends a message to all clients in a collection.
 * The message is serialized once for better performance.
 */
export function broadcast(
  clients: Iterable<WebSocket>,
  message: ServerMessage,
): void {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

/**
 * Generates a random 6-character uppercase alphanumeric quiz code.
 * Exemple : "A3F9K2"
 */
export function generateQuizCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
