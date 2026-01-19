const EMPTY = null;

// Заглавные — белые, строчные — чёрные
let boardState = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

let selectedCell = null;
let currentPlayer = "white"; // white / black

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

renderPieces();

function handleCellClick(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const piece = boardState[row][col];

    // Выбор фигуры
    if (!selectedCell && piece && isCurrentPlayerPiece(piece)) {
        selectedCell = { row, col };
        cell.style.outline = "2px solid red";
        return;
    }

    // Ход
    if (selectedCell) {
        const from = selectedCell;
        const to = { row, col };

        if (isValidMove(from, to)) {
            movePiece(from, to);
            clearSelection();
            switchPlayer();
        }
    }
}

function isCurrentPlayerPiece(piece) {
    return currentPlayer === "white"
        ? piece === piece.toUpperCase()
        : piece === piece.toLowerCase();
}

function isValidPawnMove(from, to) {
    const piece = boardState[from.row][from.col];
    if (!piece) return false;

    const direction = piece === "P" ? -1 : 1;
    const startRow = piece === "P" ? 6 : 1;
    const target = boardState[to.row][to.col];

    // обычный ход вперёд
    if (from.col === to.col && target === null) {
        if (to.row === from.row + direction) return true;

        if (
            from.row === startRow &&
            to.row === from.row + 2 * direction &&
            boardState[from.row + direction][from.col] === null
        ) return true;
    }

    // ВЗЯТИЕ ПО ДИАГОНАЛИ
    if (
        Math.abs(from.col - to.col) === 1 &&
        to.row === from.row + direction &&
        target !== null &&
        isOpponentPiece(piece, target)
    ) {
        return true;
    }

    return false;
}


function movePiece(from, to) {
    boardState[to.row][to.col] = boardState[from.row][from.col];
    boardState[from.row][from.col] = null;
    renderPieces();
}

function clearSelection() {
    document.querySelectorAll(".cell").forEach(c => c.style.outline = "");
    selectedCell = null;
}

function switchPlayer() {
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    
    if (currentPlayer === "black") {
        setTimeout(makeAIMove, 500);
    }
}

function isOpponentPiece(piece, target) {
    return piece === piece.toUpperCase()
        ? target === target.toLowerCase()
        : target === target.toUpperCase();
}

function isValidMove(from, to) {
    const piece = boardState[from.row][from.col];
    if (!piece) return false;

    const type = piece.toLowerCase();

    if (type === "p") return isValidPawnMove(from, to);
    if (type === "r") return isValidRookMove(from, to);
    if (type === "n") return isValidKnightMove(from, to);
    if (type === "b") return isValidBishopMove(from, to);
    if (type === "q") return isValidQueenMove(from, to);

    return false;
}

function isValidRookMove(from, to) {
    if (from.row !== to.row && from.col !== to.col) return false;

    const piece = boardState[from.row][from.col];
    const target = boardState[to.row][to.col];
    if (target && !isOpponentPiece(piece, target)) return false;

    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);

    let r = from.row + rowStep;
    let c = from.col + colStep;

    while (r !== to.row || c !== to.col) {
        if (boardState[r][c] !== null) return false;
        r += rowStep;
        c += colStep;
    }

    return true;
}

function isValidKnightMove(from, to) {
    const piece = boardState[from.row][from.col];
    const target = boardState[to.row][to.col];
    if (target && !isOpponentPiece(piece, target)) return false;

    const dr = Math.abs(from.row - to.row);
    const dc = Math.abs(from.col - to.col);

    return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
}

function isValidBishopMove(from, to) {
    const dr = Math.abs(from.row - to.row);
    const dc = Math.abs(from.col - to.col);
    if (dr !== dc) return false;

    const piece = boardState[from.row][from.col];
    const target = boardState[to.row][to.col];
    if (target && !isOpponentPiece(piece, target)) return false;

    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);

    let r = from.row + rowStep;
    let c = from.col + colStep;

    while (r !== to.row && c !== to.col) {
        if (boardState[r][c] !== null) return false;
        r += rowStep;
        c += colStep;
    }

    return true;
}

function isValidQueenMove(from, to) {
    return isValidRookMove(from, to) || isValidBishopMove(from, to);
}


