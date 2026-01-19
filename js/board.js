const boardElement = document.getElementById("board");

function createBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            const isWhite = (row + col) % 2 === 0;
            cell.classList.add(isWhite ? "white" : "black");

            cell.dataset.row = row;
            cell.dataset.col = col;

            boardElement.appendChild(cell);
        }
    }
}

createBoard();
renderPieces();

boardElement.addEventListener("click", (e) => {
    if (!e.target.classList.contains("cell")) return;
    handleCellClick(e.target);
});
