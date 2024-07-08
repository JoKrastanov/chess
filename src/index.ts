import { Board } from "./types/board";
import { FenPieces } from "./types/piece";

type FENString = string
type FENChar = "r" | "n" | "b" | "q" | "k"

const STARTING_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

function initGame() {
    const board = new Board();
    renderFromFEN(STARTING_BOARD_FEN, board)
}

function renderFromFEN(fen: FENString, board: Board) {
    let squareIdx = 63
    for (let i = 0; i < fen.length; i++) {
        const curChar = fen.charAt(i)
        if (curChar === "/") continue;
        if (isFinite(parseInt(curChar))) {
            squareIdx -= parseInt(curChar)
            continue
        }
        const pieceToRender = FenPieces[curChar.toLowerCase() as FENChar]
        // If it is upper case => black piece
        if (curChar === curChar.toUpperCase()) {
            board.addPiece(squareIdx, pieceToRender + 0);
        }
        else {
            board.addPiece(squareIdx, pieceToRender + 8);
        }
        squareIdx--
    }
}

initGame()