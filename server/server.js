const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

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
 *   turn: "white" | "black"
 * }
 */
const games = {};

io.on("connection", (socket) => {
    console.log("Игрок подключился:", socket.id);

    // отправляем актуальный список игр при подключении
    socket.emit("games_list", Object.keys(games));

    // создание лобби / игры (без привязки к конкретному сокету, цвет назначим при join_game)
    socket.on("create_game", () => {
        const gameId = Math.random().toString(36).substring(2, 8);

        games[gameId] = {
            white: null,
            black: null,
            turn: "white"
        };

        console.log("Создана игра:", gameId);

        // сообщаем создателю id игры, чтобы он перешёл на game.html
        socket.emit("game_created", gameId);

        // рассылаем обновлённый список игр всем в лобби
        io.emit("games_list", Object.keys(games));
    });

    /**
     * Подключение к игре со страницы game.html
     * payload: { gameId, isHost?: boolean }
     * Создатель лобби передаёт isHost = true и всегда получает белых.
     */
    socket.on("join_game", ({ gameId, isHost }) => {
        const game = games[gameId];
        if (!game) {
            console.log("Попытка подключения к несуществующей игре:", gameId);
            return;
        }

        // если оба слота уже заняты — не пускаем
        if (game.white && game.black) {
            console.log("Игра заполнена:", gameId);
            return;
        }

        // назначаем цвет
        let assignedColor = null;

        if (isHost && !game.white) {
            game.white = socket.id;
            assignedColor = "white";
        } else if (!isHost && !game.black) {
            game.black = socket.id;
            assignedColor = "black";
        } else if (!game.white) {
            game.white = socket.id;
            assignedColor = "white";
        } else if (!game.black) {
            game.black = socket.id;
            assignedColor = "black";
        }

        if (!assignedColor) {
            console.log("Не удалось назначить цвет игроку для игры:", gameId);
            return;
        }

        socket.join(gameId);
        console.log(
            `Игрок ${socket.id} подключился к игре ${gameId} за цвет ${assignedColor}`
        );

        // Если оба игрока на месте — запускаем партию и сообщаем каждому его цвет
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

    /**
     * Ход фигуры: сервер выступает "ретранслятором",
     * правила и состояние доски считаются на клиенте.
     * payload: { gameId, from, to, color }
     */
    socket.on("make_move", ({ gameId, from, to, color }) => {
        const game = games[gameId];
        if (!game) return;

        // можно добавить проверку, что ход делает именно тот цвет, чей сейчас ход
        if (color && color !== game.turn) {
            return;
        }

        game.turn = game.turn === "white" ? "black" : "white";

        io.to(gameId).emit("move_made", {
            from,
            to,
            turn: game.turn
        });
    });

    socket.on("disconnect", () => {
        console.log("Игрок отключился:", socket.id);

        // простое удаление игрока из игр (без сложной логики завершения)
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

            // если оба слота пустые — удаляем игру
            if (!game.white && !game.black) {
                delete games[gameId];
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
