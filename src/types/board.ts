import { addPieceEventListeners, allowDrop, computeNrOfSquaresToEdge, drop, getPieceColor, isKnight, isPawn, isSlidingPiece, pieceIsType } from "../utils";
import { Move } from "./move";
import { FenPieces, PieceCode, PieceColor, PieceIcon, PieceType } from "./piece";

// TODO: FEATURES TO IMPLEMENT
/*
  * Оverflowing pieces
  * Check
  * Check legal moves
  * Pinned pieces check
  * Mate
  * Castling
  * Pawn promotion
  * Eval
  * En passant
*/

const slidingMovementOffsets = [8, -8, -1, 1, 7, -7, 9, -9]
const knightMovementOffsets = [17, -15, 15, -17, 6, -10, -6, 10]

type FENString = string
type FENChar = "r" | "n" | "b" | "q" | "k"

export class Board {
  boardDOM: Element;
  squaresDOM: NodeListOf<HTMLDivElement>;
  squares: number[];
  colorToMove: PieceColor;
  moves: Record<number, Move[]>
  nrOfSquaresToEdge: number[][];
  info: HTMLParagraphElement
  isInCheck: boolean

  constructor(fen: string) {
    this.info = document.getElementsByClassName("info")[0] as HTMLParagraphElement
    this.squares = Array(64).fill(PieceCode.Empty);
    this.colorToMove = PieceColor.White // 0 - white, 1 - black
    this.boardDOM = document.querySelector(".board") || document.createElement("div")
    this.drawSquares()
    this.squaresDOM = document.querySelectorAll(".square")
    this.nrOfSquaresToEdge = computeNrOfSquaresToEdge()
    this.renderFromFEN(fen)
    this.moves = this.generateLegalMoves()
    this.info.innerHTML = "White to paly"
    this.isInCheck = false;
  }

  renderFromFEN(fen: FENString) {
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
        this.addPiece(squareIdx, pieceToRender + 0);
      }
      else {
        this.addPiece(squareIdx, pieceToRender + 8);
      }
      file++
    }
  }

  drawSquares(): void {
    let that = this
    for (let rank = 8; rank > 0; rank--) {
      for (let file = 8; file > 0; file--) {
        const squareDiv = document.createElement("div")
        const color = (rank + file) % 2 === 0 ? "white" : "black"
        squareDiv.id = (rank * 8 - file).toString()
        squareDiv.className = "square " + color
        squareDiv.ondrop = function (ev: DragEvent) {
          drop(ev, that)
        }
        squareDiv.ondragover = allowDrop
        this.boardDOM.appendChild(squareDiv)
      }
    }
  }

  addPiece(squareIdx: number, piece: PieceCode): void {
    const squareDOM = Array.from(this.squaresDOM).find(sq => sq.id === squareIdx.toString())
    if (!squareDOM) return
    this.squares[squareIdx] = piece
    const pieceDOM = this.createBoardPiece(piece, squareIdx)
    squareDOM.appendChild(pieceDOM)
  }

  createBoardPiece(piece: PieceCode, squareIdx: number) {
    const pieceDOM = document.createElement("span")
    const pieceImg = document.createElement("img")

    pieceDOM.className = "piece"
    pieceDOM.id = `${piece}_${squareIdx}`
    pieceImg.src = PieceIcon[piece]
    pieceImg.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });
    pieceDOM.appendChild(pieceImg)
    addPieceEventListeners(pieceDOM, this)
    return pieceDOM
  }

  getMovesForPiece(piece: PieceCode, moves?: Move) { }

  generateLegalMoves(): Record<number, Move[]> {
    if (this.isInCheck) {
      //TODO: Implement check legal moves
    }
    const moves: Record<number, Move[]> = {}
    for (let startSquare = 0; startSquare < 64; startSquare++) {
      moves[startSquare] = []
      const piece = this.squares[startSquare]
      if (piece === PieceCode.Empty) continue
      if (getPieceColor(piece) !== this.colorToMove) continue;
      if (isSlidingPiece(piece)) {
        this.generateSlidingMoves(startSquare, piece, moves[startSquare])
      } else if (isKnight(piece)) {
        this.generateKnightMoves(startSquare, piece, moves[startSquare])
      } else if (isPawn(piece)) {
        this.generatePawnMoves(startSquare, piece, moves[startSquare])
      } else { // is King
        this.generateKingMoves(startSquare, moves[startSquare])
      }
    }
    return moves
  }

  generateSlidingMoves(startSquare: number, piece: PieceCode, moves: Move[]) {
    const startDirIndex = pieceIsType(piece, PieceType.Bishop) ? 4 : 0
    const endDirIndex = pieceIsType(piece, PieceType.Rook) ? 4 : 8
    for (let dirIdx = startDirIndex; dirIdx < endDirIndex; dirIdx++) {
      for (let nrOfSquares = 0; nrOfSquares < this.nrOfSquaresToEdge[startSquare][dirIdx]; nrOfSquares++) {
        const targetSquare = startSquare + slidingMovementOffsets[dirIdx] * (nrOfSquares + 1)
        const pieceOnTargetSquare = this.squares[targetSquare]
        // If we find a piece in a direction and it is our color we cannot go to it
        if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) === this.colorToMove) break

        moves.push({ startSquare: startSquare, targetSquare: targetSquare })

        // If we find a piece in a direction and it is not our color we capture it and cannot go further
        if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) !== this.colorToMove) break
      }
    }
  }

  generateKnightMoves(startSquare: number, piece: PieceCode, moves: Move[]) {
    for (let dirIdx = 0; dirIdx < 8; dirIdx++) {
      if (this.nrOfSquaresToEdge[startSquare][dirIdx] < 1) continue
      const targetSquare = startSquare + knightMovementOffsets[dirIdx]
      if (this.squares[targetSquare] !== PieceCode.Empty && getPieceColor(this.squares[targetSquare]) === getPieceColor(piece)) continue
      moves.push({ startSquare: startSquare, targetSquare: targetSquare })
    }
  }

  generatePawnMoves(startSquare: number, piece: PieceCode, moves: Move[]) {
    let pawnOffsets = getPieceColor(piece) === PieceColor.White ? [8, 7, 9, 16] : [-8, -9, -7, -16]
    if (this.squares[startSquare + pawnOffsets[0]] === PieceCode.Empty) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[0] })
    }
    const leftDiagonalSquarePiece = this.squares[startSquare + pawnOffsets[1]]
    const rightDiagonalSquarePiece = this.squares[startSquare + pawnOffsets[2]]
    if (leftDiagonalSquarePiece !== PieceCode.Empty && getPieceColor(leftDiagonalSquarePiece) !== getPieceColor(piece)) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[1] })
    }
    if (rightDiagonalSquarePiece !== PieceCode.Empty && getPieceColor(rightDiagonalSquarePiece) !== getPieceColor(piece)) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[2] })
    }
    if (this.isFirstPawnMove(startSquare, piece, pawnOffsets)) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[3] })
    }
  }

  isFirstPawnMove(startSquare: number, piece: PieceCode, pawnOffsets: number[]) {
    if (this.isPawnOnStartRank(startSquare, getPieceColor(piece)) && this.squares[startSquare + pawnOffsets[3]] === PieceCode.Empty && this.squares[startSquare + pawnOffsets[0]] === PieceCode.Empty) return true
    return false
  }

  isPawnOnStartRank(startSquare: number, color: PieceColor) {
    if (color === PieceColor.White && startSquare > 7 && startSquare < 16) return true
    else if (color === PieceColor.Black && startSquare > 47 && startSquare < 56) return true
    return false
  }

  generateKingMoves(startSquare: number, moves: Move[]) {
    for (let dirIdx = 0; dirIdx < 8; dirIdx++) {
      const targetSquare = startSquare + slidingMovementOffsets[dirIdx]
      const pieceOnTargetSquare = this.squares[targetSquare]
      // If we find a piece in a direction and it is our color we cannot go to it
      if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) === this.colorToMove) continue
      moves.push({ startSquare: startSquare, targetSquare: targetSquare })
    }
  }

  movePutsOppositeColorInCheck(piece: PieceCode, targetSquare: number): boolean {
    return false
  }

  makeMove(piece: PieceCode, origin: number, target: Element): boolean {
    let targetSquare = parseInt(target.id)
    const targetIsOccupied = target.id.includes("_")
    if (targetIsOccupied) {
      const [targetPiece, targetSquare] = target.id.split("_") as unknown as [number, number]
      if (!this.moves[origin].find(move => move.targetSquare == targetSquare)) return false
      this.squares[origin] = PieceCode.Empty
      this.squares[targetSquare] = parseInt(piece.toString())
    } else {
      if (!this.moves[origin].find(move => move.targetSquare == targetSquare)) return false
      this.squares[origin] = PieceCode.Empty
      this.squares[targetSquare] = parseInt(piece.toString())
    }
    this.colorToMove = 1 - this.colorToMove // change color to move 
    if (this.movePutsOppositeColorInCheck(piece, targetSquare)) {
      this.isInCheck = true;
    }
    this.moves = this.generateLegalMoves()
    if (this.colorToMove === 0) {
      this.info.innerHTML = "White to paly"
    } else {
      this.info.innerHTML = "Black to paly"
    }
    return true;
  }
}
