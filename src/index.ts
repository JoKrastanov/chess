import { Board } from "./Board";

const STARTING_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

function initGame() {
    new Board(STARTING_BOARD_FEN);
}

initGame()