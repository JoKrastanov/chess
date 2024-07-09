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
    let rank = 7
    let file = 0
    for (let i = 0; i < fen.length; i++) {
        const curChar = fen.charAt(i)
        if (curChar === "/") {
            file = 0
            rank--
            continue
        }
        if (isFinite(parseInt(curChar))) {
            file += parseInt(curChar)
            continue
        }
        const pieceToRender = FenPieces[curChar.toLowerCase() as FENChar]
        const squareIdx = rank * 8 + file
        // If it is upper case => white piece
        if (curChar === curChar.toUpperCase()) {
            board.addPiece(squareIdx, pieceToRender + 0);
        }
        else {
            board.addPiece(squareIdx, pieceToRender + 8);
        }
        file++
    }
}

initGame()