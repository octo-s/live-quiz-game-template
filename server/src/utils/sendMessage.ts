import {WebSocket} from "ws";

function sendMessage(ws: WebSocket, type: string, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data, id: 0 }));
    }
}

export default sendMessage;