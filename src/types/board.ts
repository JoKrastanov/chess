import { addPieceEventListeners } from "../utils";
import { PieceCode, PieceIcon } from "./piece";

export class Board {
  boardDOM: Element;
  squaresDOM: NodeListOf<Element>;
  squares: number[];

  constructor() {
    this.squares = Array(64).fill(PieceCode.Empty);
    this.boardDOM = document.querySelector(".board") || document.createElement("div")
    this.squaresDOM = document.querySelectorAll(".square")
  }

  addPiece(squareIdx: number, piece: PieceCode) {
    const squareDOM = this.squaresDOM[this.squaresDOM.length - 1 - squareIdx]
    const pieceDOM = document.createElement("span")
    this.squares[squareIdx] = piece

    const boardDOMBounds = this.boardDOM.getBoundingClientRect()
    const squareDOMBounds = squareDOM.getBoundingClientRect()

    const offsetX = squareDOMBounds.left - boardDOMBounds.left;
    const offsetY = squareDOMBounds.top - boardDOMBounds.top;

    pieceDOM.className = "piece"
    pieceDOM.innerHTML = PieceIcon[piece]

    pieceDOM.style.left = `${offsetX}px`;
    pieceDOM.style.top = `${offsetY}px`;

    this.boardDOM.appendChild(pieceDOM)
    addPieceEventListeners(this.boardDOM, pieceDOM)
  }
}
