let gameOver = false;
let gameStatus = "";
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
            cell.addEventListener("click", handleCellClick);

            board.appendChild(cell);
        }
    }
}

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
    if (gameOver) return;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const piece = boardState[row][col];

    // Выбор фигуры
    if (!selectedCell && piece && isCurrentPlayerPiece(piece)) {
        clearHighlights();
        selectedCell = { row, col };
        cell.classList.add("selected");
        highlightPossibleMoves(selectedCell);

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
    const target = boardState[to.row][to.col];

    // делаем ход
    boardState[to.row][to.col] = boardState[from.row][from.col];
    boardState[from.row][from.col] = null;

    const opponentIsWhite =
        boardState[to.row][to.col] === boardState[to.row][to.col]?.toUpperCase();

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
        gameStatus =
            target === "k"
                ? "Белые победили!"
                : "Чёрные победили!";
    }

    renderPieces();
    renderStatus();
}
function clearSelection() {
    clearHighlights();
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
    if (wouldLeaveKingInCheck(from, to)) return false;
    const piece = boardState[from.row][from.col];
    if (!piece) return false;

    const type = piece.toLowerCase();

    if (type === "p") return isValidPawnMove(from, to);
    if (type === "r") return isValidRookMove(from, to);
    if (type === "n") return isValidKnightMove(from, to);
    if (type === "b") return isValidBishopMove(from, to);
    if (type === "q") return isValidQueenMove(from, to);
    if (type === "k") return isValidKingMove(from, to);

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

function isValidKingMove(from, to) {
    const piece = boardState[from.row][from.col];
    const target = boardState[to.row][to.col];
    if (target && !isOpponentPiece(piece, target)) return false;

    const dr = Math.abs(from.row - to.row);
    const dc = Math.abs(from.col - to.col);

    return dr <= 1 && dc <= 1;
}

function highlightPossibleMoves(from) {
    clearHighlights();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const to = { row, col };
            if (isValidMove(from, to)) {
                const cell = document.querySelector(
                    `.cell[data-row="${row}"][data-col="${col}"]`
                );
                cell.classList.add("possible-move");
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

document
    .getElementById("restartBtn")
    .addEventListener("click", restartGame);

function findKing(isWhite) {
    const king = isWhite ? "K" : "k";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === king) {
                return { row: r, col: c };
            }
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

            if (isOpponentPiece(
                isWhite ? "K" : "k",
                piece
            )) {
                if (isValidMove({ row: r, col: c }, kingPos)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function wouldLeaveKingInCheck(from, to) {
    const piece = boardState[from.row][from.col];
    const captured = boardState[to.row][to.col];

    boardState[to.row][to.col] = piece;
    boardState[from.row][from.col] = null;

    const isWhite = piece === piece.toUpperCase();
    const inCheck = isKingInCheck(isWhite);

    boardState[from.row][from.col] = piece;
    boardState[to.row][to.col] = captured;

    return inCheck;
}

function hasAnyLegalMove(isWhite) {
    for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
            const piece = boardState[r1][c1];
            if (!piece) continue;

            if ((piece === piece.toUpperCase()) !== isWhite) continue;

            for (let r2 = 0; r2 < 8; r2++) {
                for (let c2 = 0; c2 < 8; c2++) {
                    if (isValidMove({ row: r1, col: c1 }, { row: r2, col: c2 })) {
                        return true;
                    }
                }
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

            // фигура не этой стороны
            if ((piece === piece.toUpperCase()) !== isWhite) continue;

            for (let toRow = 0; toRow < 8; toRow++) {
                for (let toCol = 0; toCol < 8; toCol++) {
                    const from = { row: fromRow, col: fromCol };
                    const to = { row: toRow, col: toCol };

                    if (!isValidMove(from, to)) continue;

                    // временно делаем ход
                    const captured = boardState[toRow][toCol];
                    boardState[toRow][toCol] = piece;
                    boardState[fromRow][fromCol] = null;

                    const stillInCheck = isKingInCheck(isWhite);

                    // откат
                    boardState[fromRow][fromCol] = piece;
                    boardState[toRow][toCol] = captured;

                    if (!stillInCheck) {
                        return true; // нашли спасительный ход
                    }
                }
            }
        }
    }
    return false;
}

function renderStatus() {
    const statusEl = document.getElementById("status");
    statusEl.textContent = gameStatus;
}
