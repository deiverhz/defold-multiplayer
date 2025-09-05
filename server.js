const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Almacenamiento de jugadores y estado del juego
const players = new Map();
const gameState = {
    keys: [],
    locks: [],
    platforms: []
};

// Configuración del juego (debe coincidir con Defold)
const GAME_CONFIG = {
    moveSpeed: 200,
    jumpSpeed: 750,
    gravity: -1000
};

// Mensajes WebSocket
const MESSAGE_TYPES = {
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    PLAYER_UPDATE: 'player_update',
    GAME_STATE: 'game_state',
    KEY_COLLECTED: 'key_collected',
    LOCK_OPENED: 'lock_opened',
    INPUT: 'input'
};

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    console.log(`Jugador conectado: ${playerId}`);

    // Crear nuevo jugador
    const newPlayer = {
        id: playerId,
        position: { x: 100, y: 100 },
        direction: 0,
        isJumping: false,
        verticalSpeed: 0,
        onGround: false,
        hasKey: false,
        lastUpdate: Date.now()
    };

    players.set(playerId, newPlayer);

    // Enviar estado inicial al nuevo jugador
    ws.send(JSON.stringify({
        type: MESSAGE_TYPES.GAME_STATE,
        players: Array.from(players.values()),
        config: GAME_CONFIG,
        gameState: gameState
    }));

    // Notificar a otros jugadores
    broadcast(JSON.stringify({
        type: MESSAGE_TYPES.PLAYER_JOINED,
        player: newPlayer
    }), playerId);

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(playerId, message, ws);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Jugador desconectado: ${playerId}`);
        players.delete(playerId);

        // Notificar a otros jugadores
        broadcast(JSON.stringify({
            type: MESSAGE_TYPES.PLAYER_LEFT,
            playerId: playerId
        }));
    });
});

function handleMessage(playerId, message, ws) {
    const player = players.get(playerId);
    if (!player) return;

    switch (message.type) {
        case MESSAGE_TYPES.INPUT:
            handleInput(playerId, message.data);
            break;

        case MESSAGE_TYPES.PLAYER_UPDATE:
            player.position = message.position;
            player.direction = message.direction;
            player.isJumping = message.isJumping;
            player.verticalSpeed = message.verticalSpeed;
            player.onGround = message.onGround;
            player.hasKey = message.hasKey;
            player.lastUpdate = Date.now();

            // Broadcast update to other players
            broadcast(JSON.stringify({
                type: MESSAGE_TYPES.PLAYER_UPDATE,
                playerId: playerId,
                data: {
                    position: player.position,
                    direction: player.direction,
                    isJumping: player.isJumping,
                    hasKey: player.hasKey
                }
            }), playerId);
            break;

        case MESSAGE_TYPES.KEY_COLLECTED:
            player.hasKey = true;
            gameState.keys = gameState.keys.filter(key => key.id !== message.keyId);

            broadcast(JSON.stringify({
                type: MESSAGE_TYPES.KEY_COLLECTED,
                playerId: playerId,
                keyId: message.keyId
            }));
            break;

        case MESSAGE_TYPES.LOCK_OPENED:
            if (player.hasKey) {
                player.hasKey = false;
                gameState.locks = gameState.locks.filter(lock => lock.id !== message.lockId);

                broadcast(JSON.stringify({
                    type: MESSAGE_TYPES.LOCK_OPENED,
                    playerId: playerId,
                    lockId: message.lockId
                }));
            }
            break;
    }
}

function handleInput(playerId, inputData) {
    const player = players.get(playerId);
    if (!player) return;

    // Aquí puedes procesar inputs si quieres validación del servidor
    // Por ahora solo reenviamos a otros jugadores
    broadcast(JSON.stringify({
        type: MESSAGE_TYPES.INPUT,
        playerId: playerId,
        data: inputData
    }), playerId);
}

function broadcast(message, excludePlayerId = null) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            if (excludePlayerId && client.playerId === excludePlayerId) {
                return;
            }
            client.send(message);
        }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', players: players.size });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor multijugador ejecutándose en puerto ${PORT}`);
});