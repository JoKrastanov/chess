import { addPieceEventListeners, allowDrop, drop } from "../utils";
import { PieceCode, PieceIcon } from "./piece";

export class Board {
  boardDOM: Element;
  squaresDOM: NodeListOf<Element>;
  squares: number[];
  turn: number; // 0: white, 1: black

  constructor() {
    this.squares = Array(64).fill(PieceCode.Empty);
    this.boardDOM = document.querySelector(".board") || document.createElement("div")
    this.drawSquares()
    this.squaresDOM = document.querySelectorAll(".square")
    this.turn = 0
  }

  drawSquares() {
    for (let rank = 0; rank < 8; rank++) {
      const rankDiv = document.createElement("div");
      rankDiv.className = "rank"
      this.boardDOM.appendChild(rankDiv)
      for (let file = 0; file < 8; file++) {
        const squareDiv = document.createElement("div")
        squareDiv.className = "square"
        squareDiv.ondrop = drop
        squareDiv.ondragover = allowDrop
        rankDiv.appendChild(squareDiv)
      }
    }
  }

  addPiece(squareIdx: number, piece: PieceCode) {
    const squareDOM = this.squaresDOM[this.squaresDOM.length - 1 - squareIdx]
    const pieceDOM = document.createElement("span")
    this.squares[squareIdx] = piece

    pieceDOM.className = "piece"
    pieceDOM.id = squareIdx.toString()
    pieceDOM.innerHTML = PieceIcon[piece]

    squareDOM.appendChild(pieceDOM)
    addPieceEventListeners(this.boardDOM, pieceDOM)
  }

  movePiece(squareOrigin: number) {

  }
}
