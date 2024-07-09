import { addPieceEventListeners, allowDrop, drop } from "../utils";
import { EdgeMap } from "./edgeMap";
import { PieceCode, PieceIcon } from "./piece";

const movementOffsets = [8, -8, 1, -1, 7, -7, 9, 9]

export class Board {
  boardDOM: Element;
  squaresDOM: NodeListOf<Element>;
  squares: number[];
  colorToMove: number;
  nrOfSquaresToEdge: EdgeMap[];


  constructor() {
    this.squares = Array(64).fill(PieceCode.Empty);
    this.colorToMove = 0 // 0 - white, 1 - black
    this.boardDOM = document.querySelector(".board") || document.createElement("div")
    this.nrOfSquaresToEdge = this.computeNrOfSquaresToEdge()
    this.drawSquares()
    this.squaresDOM = document.querySelectorAll(".square")
  }

  computeNrOfSquaresToEdge(): EdgeMap[] {
    let nrOfSquaresToEdge: EdgeMap[] = []
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {

        let nrOfSquaresUp = 7 - rank
        let nrOfSquaresDown = rank
        let nrOfSquaresLeft = file
        let nrOfSquaresRight = 7 - file

        let squareIdx = rank * 8 + file

        nrOfSquaresToEdge[squareIdx] = {
          up: nrOfSquaresUp,
          down: nrOfSquaresDown,
          left: nrOfSquaresLeft,
          right: nrOfSquaresRight,
          upLeft: Math.min(nrOfSquaresUp, nrOfSquaresLeft), // Top left diagonal
          upRight: Math.min(nrOfSquaresUp, nrOfSquaresRight), // Top right diagonal
          downLeft: Math.min(nrOfSquaresDown, nrOfSquaresLeft), // Bottom left diagonal
          downRight: Math.min(nrOfSquaresDown, nrOfSquaresRight) // Bottom right diagonal
        }
      }
    }
    return nrOfSquaresToEdge
  }

  drawSquares(): void {
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

  addPiece(squareIdx: number, piece: PieceCode): void {
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
