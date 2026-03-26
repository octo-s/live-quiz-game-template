import {CreateGameData, type Game} from "../types";
import {WebSocket} from "ws";
import sendMessage from "../utils/sendMessage";

function generateCode(): string {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 6; i++) {
        code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    return code;
}

function handleCreateGame(
    ws: WebSocket,
    games: Map<string, Game>,
    wsToUser: Map<WebSocket, string>,
    data: CreateGameData
): void {
    const userIndex = wsToUser.get(ws);

    if (!userIndex) {
        sendMessage(ws, 'error', { error: true, errorText: 'Not logged in' });
        return;
    }

    const { questions } = data;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        sendMessage(ws, 'error', { error: true, errorText: 'Questions are required' });
        return;
    }

    const gameId = crypto.randomUUID();
    let code = generateCode();

    while ([...games.values()].some(g => g.code === code)) {
        code = generateCode();
    }

    const game: Game = {
        id: gameId,
        code,
        hostId: userIndex,
        questions,
        players: [],
        currentQuestion: -1,
        status: 'waiting',
        playerAnswers: new Map(),
    };

    games.set(gameId, game);

    sendMessage(ws, 'game_created', { gameId, code });
}

export default handleCreateGame