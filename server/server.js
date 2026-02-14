const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// раздаём фронт
app.use(express.static(path.join(__dirname, "..", "public")));

io.on("connection", (socket) => {
    console.log("Игрок подключился:", socket.id);

    socket.on("disconnect", () => {
        console.log("Игрок отключился:", socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
