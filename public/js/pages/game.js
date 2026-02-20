// Онлайн-игра: UI доски + синхронизация через socket.io

let gameOver = false;
let gameStatus = "";

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;

let blackRookLeftMoved = false;
let blackRookRightMoved = false;

const EMPTY = null;

// Заглавные — белые, строчные — чёрные
const initialBoard = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
];

let boardState = JSON.parse(JSON.stringify(initialBoard));

function renderBoard() {
    const board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if ((row + col) % 2 === 0) {
                cell.classList.add("white");
            } else {
                cell.classList.add("black");
            }

            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", (e) => {
                const target = e.target.classList.contains("cell")
                    ? e.target
                    : e.target.closest(".cell");
                if (target) handleCellClick(target);
            });

            board.appendChild(cell);
        }
    }
}

let selectedCell = null;

// сетевые переменные
let myColor = null;       // "white" | "black"
let isMyTurn = false;
let currentTurn = null;   // чей ход по мнению сервера

const PIECES = {
    "P": "♙",
    "R": "♖",
    "N": "♘",
    "B": "♗",
    "Q": "♕",
    "K": "♔",
    "p": "♟",
    "r": "♜",
    "n": "♞",
    "b": "♝",
    "q": "♛",
    "k": "♚"
};

function renderPieces() {
    document.querySelectorAll(".cell").forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const piece = boardState[row][col];
        cell.textContent = piece ? PIECES[piece] : "";
    });
}

const params = new URLSearchParams(window.location.search);
let gameId = params.get("game");

const socket = io();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
} else {
    initGame();
}

function initGame() {
    renderBoard();
    renderPieces();
    renderStatus();
}

function handleCellClick(cell) {
    if (gameOver || !myColor) return;
    if (!cell || !cell.dataset) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    if (isNaN(row) || isNaN(col)) return;

    const piece = boardState[row][col];

    // первый клик — выбираем свою фигуру
    if (!selectedCell) {
        if (!piece || !isCurrentPlayerPiece(piece)) return;
        clearHighlights();
        selectedCell = { row, col };
        cell.classList.add("selected");
        highlightPossibleMoves(selectedCell);
        return;
    }

    // второй клик — пытаемся сделать ход
    const from = selectedCell;
    const to = { row, col };

    if (!isValidMoveLocal(from, to)) return;

    const pieceToMove = boardState[from.row][from.col];
    const captured = boardState[to.row][to.col];

    socket.emit("make_move", {
        gameId,
        from,
        to,
        color: myColor,
        piece: pieceToMove,
        captured: captured || null
    });

    clearSelection();
}

function isCurrentPlayerPiece(piece) {
    if (!myColor) return false;
    return myColor === "white"
        ? piece === piece.toUpperCase()
        : piece === piece.toLowerCase();
}

function movePiece(from, to) {
    const target = boardState[to.row][to.col];
    const piece = boardState[from.row][from.col];

    // рокировка белых
    if (piece === "K" && from.row === 7 && from.col === 4) {
        if (to.row === 7 && to.col === 6 && !whiteKingMoved && !whiteRookRightMoved) {
            boardState[7][6] = "K";
            boardState[7][5] = "R";
            boardState[7][4] = null;
            boardState[7][7] = null;
            whiteKingMoved = true;
            whiteRookRightMoved = true;
            renderPieces();
            return;
        }
        if (to.row === 7 && to.col === 2 && !whiteKingMoved && !whiteRookLeftMoved) {
            boardState[7][2] = "K";
            boardState[7][3] = "R";
            boardState[7][4] = null;
            boardState[7][0] = null;
            whiteKingMoved = true;
            whiteRookLeftMoved = true;
            renderPieces();
            return;
        }
    }

    // рокировка чёрных
    if (piece === "k" && from.row === 0 && from.col === 4) {
        if (to.row === 0 && to.col === 6 && !blackKingMoved && !blackRookRightMoved) {
            boardState[0][6] = "k";
            boardState[0][5] = "r";
            boardState[0][4] = null;
            boardState[0][7] = null;
            blackKingMoved = true;
            blackRookRightMoved = true;
            renderPieces();
            return;
        }
        if (to.row === 0 && to.col === 2 && !blackKingMoved && !blackRookLeftMoved) {
            boardState[0][2] = "k";
            boardState[0][3] = "r";
            boardState[0][4] = null;
            boardState[0][0] = null;
            blackKingMoved = true;
            blackRookLeftMoved = true;
            renderPieces();
            return;
        }
    }

    boardState[to.row][to.col] = boardState[from.row][from.col];
    boardState[from.row][from.col] = null;

    if (piece === "K") whiteKingMoved = true;
    if (piece === "k") blackKingMoved = true;

    if (from.row === 7 && from.col === 0) whiteRookLeftMoved = true;
    if (from.row === 7 && from.col === 7) whiteRookRightMoved = true;

    if (from.row === 0 && from.col === 0) blackRookLeftMoved = true;
    if (from.row === 0 && from.col === 7) blackRookRightMoved = true;

    const movedPiece = boardState[to.row][to.col];
    const movedPieceIsWhite = movedPiece === movedPiece.toUpperCase();
    const opponentIsWhite = !movedPieceIsWhite;

    if (isKingInCheck(opponentIsWhite)) {
        if (!hasAnyLegalMove(opponentIsWhite)) {
            gameOver = true;
            gameStatus = "Мат";
        } else {
            gameStatus = "Шах";
        }
    } else {
        gameStatus = "";
    }

    if (target && target.toLowerCase() === "k") {
        gameOver = true;
        gameStatus = target === "k" ? "Белые победили!" : "Чёрные победили!";
    }

    renderPieces();
    renderStatus();
}

function clearSelection() {
    clearHighlights();
    selectedCell = null;
}

// Локальная обёртка над валидатором из public/js/chess/logic.js
function isValidMoveLocal(from, to) {
    // if (wouldLeaveKingInCheck(from, to)) return false; // можно включить позже
    return window.isValidMove(boardState, from, to);
}

function highlightPossibleMoves(from) {
    clearHighlights();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const to = { row, col };
            if (isValidMoveLocal(from, to)) {
                const cell = document.querySelector(
                    `.cell[data-row="${row}"][data-col="${col}"]`
                );
                if (cell) cell.classList.add("possible-move");
            }
        }
    }
}

function clearHighlights() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("possible-move", "selected");
    });
}

function restartGame() {
    boardState = JSON.parse(JSON.stringify(initialBoard));
    selectedCell = null;
    gameOver = false;
    renderBoard();
    renderPieces();
}

document.getElementById("restartBtn")?.addEventListener("click", restartGame);

function findKing(isWhite) {
    const king = isWhite ? "K" : "k";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === king) return { row: r, col: c };
        }
    }
    return null;
}

function isKingInCheck(isWhite) {
    const kingPos = findKing(isWhite);
    if (!kingPos) return false;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (!piece) continue;

            if (window.isOpponentPiece(isWhite ? "K" : "k", piece)) {
                if (isValidMoveLocal({ row: r, col: c }, kingPos)) return true;
            }
        }
    }
    return false;
}

function hasAnyLegalMove(isWhite) {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = boardState[fromRow][fromCol];
            if (!piece) continue;

            if ((piece === piece.toUpperCase()) !== isWhite) continue;

            for (let toRow = 0; toRow < 8; toRow++) {
                for (let toCol = 0; toCol < 8; toCol++) {
                    const from = { row: fromRow, col: fromCol };
                    const to = { row: toRow, col: toCol };

                    if (!isValidMoveLocal(from, to)) continue;

                    const captured = boardState[toRow][toCol];
                    boardState[toRow][toCol] = piece;
                    boardState[fromRow][fromCol] = null;

                    const stillInCheck = isKingInCheck(isWhite);

                    boardState[fromRow][fromCol] = piece;
                    boardState[toRow][toCol] = captured;

                    if (!stillInCheck) return true;
                }
            }
        }
    }
    return false;
}

function renderStatus() {
    const statusEl = document.getElementById("status");
    if (!statusEl) return;

    if (gameOver) {
        statusEl.textContent = gameStatus || "Игра окончена";
        return;
    }

    if (!myColor) {
        statusEl.textContent = "Подключение к игре…";
        return;
    }

    if (!currentTurn) {
        statusEl.textContent =
            `Вы играете за ${myColor === "white" ? "белых" : "чёрных"}. Ожидание второго игрока…`;
        return;
    }

    const turnText = currentTurn === "white" ? "Ход белых" : "Ход чёрных";
    const myTurnText = isMyTurn ? " (ваш ход)" : " (ход соперника)";
    const extra = gameStatus ? ` — ${gameStatus}` : "";
    statusEl.textContent = `${turnText}${myTurnText}${extra}`;
}

socket.on("start_game", (data) => {
    gameId = data.gameId;
    currentTurn = data.turn;
    myColor = data.color;
    isMyTurn = myColor === currentTurn;

    renderBoard();
    renderPieces();
    renderStatus();
});

const createdGameId = localStorage.getItem("createdGameId");
const isHost = createdGameId === gameId;
const username = localStorage.getItem("username");

if (isHost) localStorage.removeItem("createdGameId");

if (gameId) {
    socket.emit("join_game", { gameId, isHost, username: username || null });
} else {
    gameStatus = "Ошибка: не указан gameId";
    renderStatus();
}

socket.on("move_made", ({ from, to, turn }) => {
    movePiece(from, to);
    currentTurn = turn;
    isMyTurn = myColor === currentTurn;
    renderStatus();
});


