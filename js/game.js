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

