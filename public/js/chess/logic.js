/**
 * Модуль логики шахматных правил
 * Содержит функции для проверки валидности ходов всех фигур
 */

/**
 * Проверяет, является ли фигура фигурой противника
 * @param {string} piece - фигура, которая ходит
 * @param {string} target - фигура на целевой клетке
 * @returns {boolean}
 */
function isOpponentPiece(piece, target) {
    return piece === piece.toUpperCase()
        ? target === target.toLowerCase()
        : target === target.toUpperCase();
}

/**
 * Проверяет валидность хода пешки
 * @param {Array<Array<string|null>>} boardState - состояние доски
 * @param {Object} from - {row, col} начальная позиция
 * @param {Object} to - {row, col} конечная позиция
 * @returns {boolean}
 */
function isValidPawnMove(boardState, from, to) {
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

/**
 * Проверяет валидность хода ладьи
 */
function isValidRookMove(boardState, from, to) {
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

/**
 * Проверяет валидность хода коня
 */
function isValidKnightMove(boardState, from, to) {
    const piece = boardState[from.row][from.col];
    const target = boardState[to.row][to.col];
    if (target && !isOpponentPiece(piece, target)) return false;

    const dr = Math.abs(from.row - to.row);
    const dc = Math.abs(from.col - to.col);

    return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
}

/**
 * Проверяет валидность хода слона
 */
function isValidBishopMove(boardState, from, to) {
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

/**
 * Проверяет валидность хода ферзя
 */
function isValidQueenMove(boardState, from, to) {
    return (
        isValidRookMove(boardState, from, to) ||
        isValidBishopMove(boardState, from, to)
    );
}

/**
 * Проверяет валидность хода короля
 */
function isValidKingMove(boardState, from, to) {
    const piece = boardState[from.row][from.col];
    const target = boardState[to.row][to.col];
    if (target && !isOpponentPiece(piece, target)) return false;

    const dr = Math.abs(from.row - to.row);
    const dc = Math.abs(from.col - to.col);

    return dr <= 1 && dc <= 1;
}

/**
 * Главная функция проверки валидности хода
 */
function isValidMove(boardState, from, to) {
    const piece = boardState[from.row][from.col];
    if (!piece) return false;

    const type = piece.toLowerCase();

    if (type === "p") return isValidPawnMove(boardState, from, to);
    if (type === "r") return isValidRookMove(boardState, from, to);
    if (type === "n") return isValidKnightMove(boardState, from, to);
    if (type === "b") return isValidBishopMove(boardState, from, to);
    if (type === "q") return isValidQueenMove(boardState, from, to);
    if (type === "k") return isValidKingMove(boardState, from, to);

    return false;
}

// Экспортируем функции в глобальную область видимости для использования в других модулях
if (typeof window !== "undefined") {
    window.isOpponentPiece = isOpponentPiece;
    window.isValidPawnMove = isValidPawnMove;
    window.isValidRookMove = isValidRookMove;
    window.isValidKnightMove = isValidKnightMove;
    window.isValidBishopMove = isValidBishopMove;
    window.isValidQueenMove = isValidQueenMove;
    window.isValidKingMove = isValidKingMove;
    window.isValidMove = isValidMove;
}


