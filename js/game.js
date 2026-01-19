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

        if (isValidPawnMove(from, to)) {
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

    // ход вперёд
    if (
        from.col === to.col &&
        boardState[to.row][to.col] === null
    ) {
        if (to.row === from.row + direction) return true;
        if (
            from.row === startRow &&
            to.row === from.row + 2 * direction &&
            boardState[from.row + direction][from.col] === null
        ) return true;
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


