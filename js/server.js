const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// раздаём фронт
app.use(express.static(path.join(__dirname, "public")));

const games = {}; // gameId -> { players: [] }
io.on("connection", (socket) => {
    console.log("Игрок подключился:", socket.id);

    socket.on("create_game", () => {
        const gameId = Math.random().toString(36).substring(2, 8);

        games[gameId] = {
            players: [socket.id]
        };

        socket.join(gameId);
        socket.emit("game_created", gameId);

        console.log("Создана игра:", gameId);
    });

    socket.on("disconnect", () => {
        console.log("Игрок отключился:", socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
socket.on("create_game", () => {
    const gameId = Math.random().toString(36).substr(2, 6);
    socket.join(gameId);
    socket.emit("game_created", gameId);
});
