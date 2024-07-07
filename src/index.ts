import { Board } from "./types/board"; 

function initGame() {
    const board = new Board();
    renderBoard(board)   
}

function renderBoard(board: Board) {
    console.log(board.square)
}

initGame()