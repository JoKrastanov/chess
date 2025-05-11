import { Board } from "./Board";

const STARTING_BOARD_FEN = "1nbqkbnr/Pppppppp/8/8/8/8/PPPPPPPp/RNBQKBN1"

function initGame() {
    new Board(STARTING_BOARD_FEN);
}

initGame()