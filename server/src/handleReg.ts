import { RegData, type User } from './types';
import { WebSocket } from 'ws';
import sendMessage from './utils/sendMessage';

function handleReg(
  ws: WebSocket,
  users: Map<string, User>,
  wsToUser: Map<WebSocket, string>,
  data: RegData
): void {
  const { name, password } = data;

  const existingUser = [...users.values()].find((u) => u.name === name);

  if (existingUser) {
    if (existingUser.password !== password) {
      sendMessage(ws, 'reg', {
        name,
        index: '',
        error: true,
        errorText: 'Wrong password',
      });
      return;
    }

    existingUser.ws = ws;
    wsToUser.set(ws, existingUser.index);

    sendMessage(ws, 'reg', {
      name: existingUser.name,
      index: existingUser.index,
      error: false,
      errorText: '',
    });
  } else {
    const index = crypto.randomUUID();
    const user: User = { name, password, index, ws };

    users.set(index, user);
    wsToUser.set(ws, index);

    sendMessage(ws, 'reg', {
      name,
      index,
      error: false,
      errorText: '',
    });
  }
}

export default handleReg;
