const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// раздаём фронт
app.use(express.static(path.join(__dirname, "..", "public")));

/**
 * Структура игр:
 * games[gameId] = {
 *   white: socketId | null,
 *   black: socketId | null,
 *   turn: "white" | "black",
 *   createdAt: number (Date.now),
 *   creatorId?: number
 * }
 */
const games = {};

const EMPTY_GAME_TTL_MS = 30 * 60 * 1000; // 30 минут
setInterval(() => {
    const now = Date.now();
    let changed = false;

    for (const [gameId, game] of Object.entries(games)) {
        const isEmpty = !game.white && !game.black;
        const tooOld =
            typeof game.createdAt === "number"
                ? now - game.createdAt > EMPTY_GAME_TTL_MS
                : true;

        if (isEmpty && tooOld) {
            delete games[gameId];
            changed = true;
        }
    }

    if (changed) {
        io.emit("games_list", Object.keys(games));
    }
}, 60 * 1000).unref?.();

// socket.id -> userId
const socketToUser = {};

io.on("connection", (socket) => {
    console.log("Игрок подключился:", socket.id);

    socket.emit("games_list", Object.keys(games));

    socket.on("create_game", ({ username }) => {
        if (!username) return;

        const user = db.getOrCreateUser(username);
        socketToUser[socket.id] = user.id;

        const gameId = Math.random().toString(36).substring(2, 8);

        games[gameId] = {
            white: null,
            black: null,
            turn: "white",
            createdAt: Date.now(),
            creatorId: user.id
        };

        db.createGame(gameId, user.id);

        socket.emit("game_created", gameId);
        io.emit("games_list", Object.keys(games));
    });

    socket.on("join_game", ({ gameId, isHost, username }) => {
        const game = games[gameId];
        if (!game) return;

        if (game.white && game.black) return;

        let userId = socketToUser[socket.id];
        if (username && !userId) {
            const user = db.getOrCreateUser(username);
            userId = user.id;
            socketToUser[socket.id] = userId;
        }

        let assignedColor = null;

        if (isHost && !game.white) {
            game.white = socket.id;
            assignedColor = "white";
            if (userId) db.joinGame(gameId, userId, "white");
        } else if (!isHost && !game.black) {
            game.black = socket.id;
            assignedColor = "black";
            if (userId) db.joinGame(gameId, userId, "black");
        } else if (!game.white) {
            game.white = socket.id;
            assignedColor = "white";
            if (userId) db.joinGame(gameId, userId, "white");
        } else if (!game.black) {
            game.black = socket.id;
            assignedColor = "black";
            if (userId) db.joinGame(gameId, userId, "black");
        }

        if (!assignedColor) return;

        socket.join(gameId);

        if (game.white && game.black) {
            io.to(game.white).emit("start_game", {
                gameId,
                color: "white",
                turn: game.turn
            });

            io.to(game.black).emit("start_game", {
                gameId,
                color: "black",
                turn: game.turn
            });
        }
    });

    socket.on("make_move", ({ gameId, from, to, color, piece, captured }) => {
        const game = games[gameId];
        if (!game) return;

        if (color && color !== game.turn) return;

        if (piece) {
            try {
                db.saveMove(gameId, { from, to, piece, captured });
            } catch (err) {
                console.error("Ошибка при сохранении хода в БД:", err);
            }
        }

        game.turn = game.turn === "white" ? "black" : "white";

        io.to(gameId).emit("move_made", {
            from,
            to,
            turn: game.turn
        });
    });

    socket.on("disconnect", () => {
        delete socketToUser[socket.id];

        for (const [gameId, game] of Object.entries(games)) {
            let changed = false;

            if (game.white === socket.id) {
                game.white = null;
                changed = true;
            }
            if (game.black === socket.id) {
                game.black = null;
                changed = true;
            }

            if (changed) {
                io.emit("games_list", Object.keys(games));
            }
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});


