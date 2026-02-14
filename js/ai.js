/*function makeAIMove() {
    let bestMove = null;
    let bestScore = -Infinity;

    const moves = getAllPossibleMoves(false); // false = чёрные

    for (let move of moves) {
        const { from, to } = move;

        const captured = boardState[to.row][to.col];
        const piece = boardState[from.row][from.col];

        // временный ход
        boardState[to.row][to.col] = piece;
        boardState[from.row][from.col] = null;

        const score = evaluateBoard();

        // откат
        boardState[from.row][from.col] = piece;
        boardState[to.row][to.col] = captured;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    if (bestMove) {
        movePiece(bestMove.from, bestMove.to);
    }
}*/

function makeAIMove() {
    if (gameOver) return;
    const moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (!piece || piece !== piece.toLowerCase()) continue;

            for (let tr = 0; tr < 8; tr++) {
                for (let tc = 0; tc < 8; tc++) {
                    const from = { row: r, col: c };
                    const to = { row: tr, col: tc };

                    if (isValidMove(from, to)) {
                        moves.push({ from, to });
                    }
                }
            }
        }
    }

    if (moves.length === 0) return;

    const move = moves[Math.floor(Math.random() * moves.length)];
    movePiece(move.from, move.to);
    switchPlayer();
}

/*function getPieceValue(piece) {
    if (!piece) return 0;

    const values = {
        p: 1,
        n: 3,
        b: 3,
        r: 5,
        q: 9,
        k: 1000
    };

    return values[piece.toLowerCase()] || 0;
}

function evaluateBoard() {
    let score = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (!piece) continue;

            const value = getPieceValue(piece);

            if (piece === piece.toUpperCase()) {
                score -= value; // белые
            } else {
                score += value; // чёрные (ИИ)
            }
        }
    }

    return score;
}*/


