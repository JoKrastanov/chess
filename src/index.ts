import { Board } from "./types/board";
import { FenPieces, PieceCode, PieceIcon } from "./types/piece";

type FENString = string
type FENChar = "r" | "n" | "b" | "q" | "k"

const STARTING_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

function initGame() {
    const board = new Board();
    renderBoard(board)
}

function addPieceToBoard(board: Board, squaresDOM: NodeListOf<Element>, squareIdx: number, piece: PieceCode) {
    const boardDOM = document.querySelector(".board")
    if (!boardDOM) return

    const squareDOM = squaresDOM[squaresDOM.length - 1 - squareIdx]
    const pieceDOM = document.createElement("span")
    board.squares[squareIdx] = piece

    const boardDOMBounds = boardDOM.getBoundingClientRect()
    const squareDOMBounds = squareDOM.getBoundingClientRect()

    const offsetX = squareDOMBounds.left - boardDOMBounds.left;
    const offsetY = squareDOMBounds.top - boardDOMBounds.top;

    pieceDOM.className = "piece"
    pieceDOM.innerHTML = PieceIcon[piece]
    pieceDOM.style.left = `${offsetX}px`;
    pieceDOM.style.top = `${offsetY}px`;

    boardDOM?.appendChild(pieceDOM)
}

function renderFromFEN(fen: FENString, board: Board, squaresDOM: NodeListOf<Element>) {
    let boardIdx = 63
    for (let i = 0; i < fen.length; i++) {
        const curChar = fen.charAt(i)
        if (curChar === "/") continue;
        if (isFinite(parseInt(curChar))) {
            boardIdx -= parseInt(curChar)
            continue
        }
        const pieceToRender = FenPieces[curChar.toLowerCase() as FENChar]
        // If it is upper case => black piece
        if (curChar === curChar.toUpperCase()) {
            addPieceToBoard(board, squaresDOM, boardIdx, pieceToRender + 0);
        }
        else {
            addPieceToBoard(board, squaresDOM, boardIdx, pieceToRender + 8);
        }
        boardIdx--
    }
}

function renderBoard(board: Board) {
    const squaresDOM = document.querySelectorAll(".square")
    renderFromFEN("8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P1K/8/8", board, squaresDOM)
}

initGame()