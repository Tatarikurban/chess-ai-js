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


