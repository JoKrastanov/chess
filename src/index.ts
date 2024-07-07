import { Board } from "./types/board";
import { PieceCode, PieceIcon } from "./types/piece";

function initGame() {
    const board = new Board();
    renderBoard(board)
}

function addPieceToBoard(board: Board, squaresDOM: NodeListOf<Element>, squareIdx: number, piece: PieceCode) {
    const boardDOM = document.querySelector(".board")
    if (!boardDOM) return
    const squareDOM = squaresDOM[squareIdx]
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

function renderBoard(board: Board) {
    const squaresDOM = document.querySelectorAll(".square")

    // Add all starting pieces
    addPieceToBoard(board, squaresDOM, 0, PieceCode.BRook);
    addPieceToBoard(board, squaresDOM, 1, PieceCode.BKnight);
    addPieceToBoard(board, squaresDOM, 2, PieceCode.BBishop);
    addPieceToBoard(board, squaresDOM, 3, PieceCode.BQueen);
    addPieceToBoard(board, squaresDOM, 4, PieceCode.BKing);
    addPieceToBoard(board, squaresDOM, 5, PieceCode.BBishop);
    addPieceToBoard(board, squaresDOM, 6, PieceCode.BKnight);
    addPieceToBoard(board, squaresDOM, 7, PieceCode.BRook);
    addPieceToBoard(board, squaresDOM, 8, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 9, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 10, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 11, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 12, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 13, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 14, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 15, PieceCode.BPawn);
    addPieceToBoard(board, squaresDOM, 48, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 49, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 50, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 51, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 52, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 53, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 54, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 55, PieceCode.WPawn);
    addPieceToBoard(board, squaresDOM, 56, PieceCode.WRook);
    addPieceToBoard(board, squaresDOM, 57, PieceCode.WKnight);
    addPieceToBoard(board, squaresDOM, 58, PieceCode.WBishop);
    addPieceToBoard(board, squaresDOM, 59, PieceCode.WQueen);
    addPieceToBoard(board, squaresDOM, 60, PieceCode.WKing);
    addPieceToBoard(board, squaresDOM, 61, PieceCode.WBishop);
    addPieceToBoard(board, squaresDOM, 62, PieceCode.WKnight);
    addPieceToBoard(board, squaresDOM, 63, PieceCode.WRook);
}

initGame()