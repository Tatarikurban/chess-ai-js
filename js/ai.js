function makeAIMove() {
    const moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (piece === "p") {
                const from = { row, col };

                const forward = { row: row + 1, col };
                if (isValidPawnMove(from, forward)) {
                    moves.push({ from, to: forward });
                }

                const doubleForward = { row: row + 2, col };
                if (isValidPawnMove(from, doubleForward)) {
                    moves.push({ from, to: doubleForward });
                }
            }
        }
    }

    if (moves.length === 0) return;

    const move = moves[Math.floor(Math.random() * moves.length)];
    movePiece(move.from, move.to);
    switchPlayer();
}
