import { allowDrop, createBoardPiece, drop } from "../utils";
import { EdgeMap } from "./edgeMap";
import { PieceCode } from "./piece";

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
    for (let rank = 8; rank > 0; rank--) {
      for (let file = 8; file > 0; file--) {
        const squareDiv = document.createElement("div")
        const color = (rank + file) % 2 === 0 ? "white" : "black"
        squareDiv.id = (rank * 8 - file).toString()
        squareDiv.className = "square " + color
        squareDiv.ondrop = drop
        squareDiv.ondragover = allowDrop
        this.boardDOM.appendChild(squareDiv)
      }
    }
  }

  addPiece(squareIdx: number, piece: PieceCode): void {
    const squareDOM = Array.from(this.squaresDOM).find(sq => sq.id === squareIdx.toString())
    if (!squareDOM) return

    this.squares[squareIdx] = piece
    const pieceDOM = createBoardPiece(piece, squareIdx)
    squareDOM.appendChild(pieceDOM)
  }
}
