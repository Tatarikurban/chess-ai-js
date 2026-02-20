/**
 * server/db/index.js
 * Модуль для работы с базой данных SQLite
 */

const Database = require("better-sqlite3");
const path = require("path");

// БД хранится в server/db/chess.db
const dbPath = path.join(__dirname, "chess.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            creator_id INTEGER,
            white_player_id INTEGER,
            black_player_id INTEGER,
            status TEXT DEFAULT 'waiting',
            turn TEXT DEFAULT 'white',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            started_at DATETIME,
            finished_at DATETIME,
            FOREIGN KEY (creator_id) REFERENCES users(id),
            FOREIGN KEY (white_player_id) REFERENCES users(id),
            FOREIGN KEY (black_player_id) REFERENCES users(id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS moves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id TEXT NOT NULL,
            move_number INTEGER NOT NULL,
            from_row INTEGER NOT NULL,
            from_col INTEGER NOT NULL,
            to_row INTEGER NOT NULL,
            to_col INTEGER NOT NULL,
            piece TEXT NOT NULL,
            captured_piece TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        )
    `);

    console.log("База данных инициализирована");
}

function getOrCreateUser(username) {
    let user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

    if (!user) {
        const insert = db.prepare("INSERT INTO users (username) VALUES (?)");
        const result = insert.run(username);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
        console.log(`Создан новый пользователь: ${username} (id: ${user.id})`);
    } else {
        db.prepare("UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
    }

    return user;
}

function createGame(gameId, creatorId) {
    const insert = db.prepare(`
        INSERT INTO games (id, creator_id, white_player_id, status)
        VALUES (?, ?, ?, 'waiting')
    `);
    insert.run(gameId, creatorId, creatorId);

    return db.prepare("SELECT * FROM games WHERE id = ?").get(gameId);
}

function joinGame(gameId, playerId, color) {
    const field = color === "white" ? "white_player_id" : "black_player_id";
    const update = db.prepare(
        `UPDATE games SET ${field} = ?, status = 'active', started_at = CURRENT_TIMESTAMP WHERE id = ?`
    );
    update.run(playerId, gameId);

    return db.prepare("SELECT * FROM games WHERE id = ?").get(gameId);
}

function saveMove(gameId, moveData) {
    const game = db.prepare("SELECT * FROM games WHERE id = ?").get(gameId);
    if (!game) return;

    const moveCount = db
        .prepare("SELECT COUNT(*) as count FROM moves WHERE game_id = ?")
        .get(gameId);
    const moveNumber = moveCount.count + 1;

    const insert = db.prepare(`
        INSERT INTO moves (game_id, move_number, from_row, from_col, to_row, to_col, piece, captured_piece)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
        gameId,
        moveNumber,
        moveData.from.row,
        moveData.from.col,
        moveData.to.row,
        moveData.to.col,
        moveData.piece,
        moveData.captured || null
    );
}

function updateGameStatus(gameId, status) {
    const update = db.prepare(`
        UPDATE games
        SET status = ?, finished_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    update.run(status, gameId);
}

function getGame(gameId) {
    return db.prepare("SELECT * FROM games WHERE id = ?").get(gameId);
}

function getWaitingGames() {
    return db
        .prepare(`
        SELECT g.*, u.username as creator_username
        FROM games g
        LEFT JOIN users u ON g.creator_id = u.id
        WHERE g.status = 'waiting'
        ORDER BY g.created_at DESC
    `)
        .all();
}

function getGameHistory(gameId) {
    return db
        .prepare(`
        SELECT *
        FROM moves
        WHERE game_id = ?
        ORDER BY move_number ASC
    `)
        .all(gameId);
}

initDatabase();

module.exports = {
    getOrCreateUser,
    createGame,
    joinGame,
    saveMove,
    updateGameStatus,
    getGame,
    getWaitingGames,
    getGameHistory,
    db
};


