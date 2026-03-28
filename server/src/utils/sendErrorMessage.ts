import { WebSocket } from 'ws';
import sendMessage from './sendMessage';

const sendErrorMessage = (ws: WebSocket, errorText: string) =>
  sendMessage(ws, 'error', { error: true, errorText });

export default sendErrorMessage;
