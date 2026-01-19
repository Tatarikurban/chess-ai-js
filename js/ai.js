function makeAIMove() {
    const moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (boardState[row][col] === "p") {
                const from = { row, col };

                const forward = { row: row + 1, col };
                if (isValidPawnMove(from, forward)) {
                    moves.push({ from, to: forward });
                }

                const leftCapture = { row: row + 1, col: col - 1 };
                const rightCapture = { row: row + 1, col: col + 1 };

                if (leftCapture.col >= 0 && isValidPawnMove(from, leftCapture)) {
                    moves.push({ from, to: leftCapture });
                }

                if (rightCapture.col < 8 && isValidPawnMove(from, rightCapture)) {
                    moves.push({ from, to: rightCapture });
                }
            }
        }
    }

    if (moves.length === 0) return;

    const move = moves[Math.floor(Math.random() * moves.length)];
    movePiece(move.from, move.to);
    switchPlayer();
}


