import {
  addPieceEventListeners,
  allowDrop,
  captureSound,
  checkSound,
  computeNrOfSquaresToEdge,
  drop,
  getOppositeColor,
  getPieceColor,
  isAFile,
  isHFile,
  isKnight,
  isPawn,
  isSlidingPiece,
  knightMovementOffsets,
  moveSound,
  pieceIsType,
  playSound,
  slidingMovementOffsets,
  targetSquareCausesKnightAHFileWrap
} from "./utils";
import { FENChar, FENString } from "./types/FEN";
import { Move } from "./types/Move";
import { FenPieces, PieceCode, PieceColor, PieceIcon, PieceType } from "./types/Piece";
import { Square } from "./types/Square";

// TODO: FEATURES TO IMPLEMENT
/*
  * Pinned pieces check
  * Mate
  * Castling
  * Pawn promotion
  * En passant
  * Bitboards ???
  * Eval
*/

export class Board {
  boardDOM: Element;
  squaresDOM: NodeListOf<HTMLDivElement>;
  squares: Square[];
  colorToMove: PieceColor;
  moves: Record<number, Move[]>;
  attackedSquaresByOpponent: Set<number>;
  attackPathToKing: Set<number>;
  nrOfSquaresToEdge: number[][];
  info: HTMLParagraphElement
  isInCheck: boolean

  constructor(fen: string) {
    this.info = document.getElementsByClassName("info")[0] as HTMLParagraphElement
    this.squares = Array(64).fill(undefined);
    this.colorToMove = PieceColor.White
    this.attackedSquaresByOpponent = new Set();
    this.attackPathToKing = new Set();
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
        this.addPiece(squareIdx, pieceToRender + PieceColor.White);
      }
      else {
        this.addPiece(squareIdx, pieceToRender + PieceColor.Black);
      }
      file++
    }
  }

  drawSquares(): void {
    let that = this
    for (let rank = 8; rank > 0; rank--) {
      for (let file = 8; file > 0; file--) {
        const idx = rank * 8 - file;
        this.squares[idx] = new Square(
          idx,
          file,
          rank
        )
        const squareDiv = document.createElement("div")
        const color = (rank + file) % 2 === 0 ? "white" : "black"
        squareDiv.id = idx.toString()
        squareDiv.className = "square " + color
        squareDiv.ondrop = function (ev: DragEvent) {
          drop(ev, that)
        }
        squareDiv.ondragover = allowDrop
        squareDiv.addEventListener('contextmenu', function (ev) {
          ev.preventDefault();
          if (squareDiv.classList.contains("highlight")) {
            squareDiv.classList.remove("highlight")
            return
          }
          squareDiv.classList.add("highlight")
        }, false);
        this.boardDOM.appendChild(squareDiv)
      }
    }
  }

  addPiece(squareIdx: number, piece: PieceCode): void {
    const squareDOM = Array.from(this.squaresDOM).find(sq => sq.id === squareIdx.toString())
    if (!squareDOM) return
    this.squares[squareIdx].placePiece(piece)
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

  getMovesForPiece(piece: PieceCode, startSquare: number, moves: Record<number, Move[]>) {
    if (piece === PieceCode.Empty) return
    if (getPieceColor(piece) !== this.colorToMove) return;
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

  generateLegalMoves(): Record<number, Move[]> {
    if (this.isInCheck) {
      //TODO: Implement check legal moves
    }
    const moves: Record<number, Move[]> = {}
    for (let startSquare = 0; startSquare < 64; startSquare++) {
      moves[startSquare] = []
      const piece = this.squares[startSquare]?.getPiece()
      if (piece === PieceCode.Empty) continue;
      this.getMovesForPiece(piece, startSquare, moves);
    }
    return moves
  }

  generateSlidingMoves(startSquare: number, piece: PieceCode, moves: Move[]) {
    const startDirIndex = pieceIsType(piece, PieceType.Bishop) ? 4 : 0
    const endDirIndex = pieceIsType(piece, PieceType.Rook) ? 4 : 8
    for (let dirIdx = startDirIndex; dirIdx < endDirIndex; dirIdx++) {
      for (let nrOfSquares = 0; nrOfSquares < this.nrOfSquaresToEdge[startSquare][dirIdx]; nrOfSquares++) {
        const targetSquare = startSquare + slidingMovementOffsets[dirIdx] * (nrOfSquares + 1)
        const pieceOnTargetSquare = this.squares[targetSquare]?.getPiece()
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
      const targetSquare = startSquare + knightMovementOffsets[dirIdx]
      const pieceOnTargetSquare = this.squares[targetSquare]?.getPiece()
      if (
        pieceOnTargetSquare !== PieceCode.Empty
        && getPieceColor(pieceOnTargetSquare) === getPieceColor(piece)
      ) continue

      if (targetSquareCausesKnightAHFileWrap(startSquare, targetSquare)) continue
      moves.push({ startSquare: startSquare, targetSquare: targetSquare })
    }
  }

  generatePawnMoves(startSquare: number, piece: PieceCode, moves: Move[]) {
    let pawnOffsets = getPieceColor(piece) === PieceColor.White ? [8, 7, 9, 16] : [-8, -9, -7, -16]
    if (this.squares[startSquare + pawnOffsets[0]]?.getPiece() === PieceCode.Empty) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[0] })
    }
    const leftDiagonalSquarePiece = this.squares[startSquare + pawnOffsets[1]]?.getPiece()
    const rightDiagonalSquarePiece = this.squares[startSquare + pawnOffsets[2]]?.getPiece()
    if (leftDiagonalSquarePiece !== PieceCode.Empty && getPieceColor(leftDiagonalSquarePiece) !== getPieceColor(piece) && !isHFile(startSquare)) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[1] })
    }
    if (rightDiagonalSquarePiece !== PieceCode.Empty && getPieceColor(rightDiagonalSquarePiece) !== getPieceColor(piece) && !isAFile(startSquare)) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[2] })
    }
    if (this.isFirstPawnMove(startSquare, piece, pawnOffsets)) {
      moves.push({ startSquare: startSquare, targetSquare: startSquare + pawnOffsets[3] })
    }
  }

  isFirstPawnMove(startSquare: number, piece: PieceCode, pawnOffsets: number[]) {
    if (this.isPawnOnStartRank(startSquare, getPieceColor(piece))
      && this.squares[startSquare + pawnOffsets[3]]?.getPiece() === PieceCode.Empty
      && this.squares[startSquare + pawnOffsets[0]]?.getPiece() === PieceCode.Empty)
      return true
    return false
  }

  isPawnOnStartRank(startSquare: number, color: PieceColor) {
    if (
      (color === PieceColor.White && startSquare > 7 && startSquare < 16)
      || (color === PieceColor.Black && startSquare > 47 && startSquare < 56))
      return true
    return false
  }

  generateKingMoves(startSquare: number, moves: Move[]) {
    for (let dirIdx = 0; dirIdx < 8; dirIdx++) {
      const targetSquare = startSquare + slidingMovementOffsets[dirIdx]
      const pieceOnTargetSquare = this.squares[targetSquare]?.getPiece()
      // If we find a piece in a direction and it is our color we cannot go to it
      if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) === this.colorToMove) continue
      moves.push({ startSquare: startSquare, targetSquare: targetSquare })
    }
  }

  movePutsOppositeColorInCheck(): boolean {
    const moves = this.generateLegalMoves()
    return Object.keys(moves).some(moveKey => {
      return moves[Number(moveKey)].some(move => {
        return this.squares[move.targetSquare]?.getPiece() === PieceType.King + getOppositeColor(this.colorToMove)
      })
    })
  }

  makeMove(piece: PieceCode, origin: number, target: Element): boolean {
    let targetSquare = parseInt(target.id)
    let soundToPlay = moveSound;
    const targetIsOccupied = target.id.includes("_")
    if (targetIsOccupied) {
      targetSquare = parseInt(target.id.split("_")[1])
      soundToPlay = captureSound;
    }
    if (!this.moves[origin].find(move => move.targetSquare == targetSquare)) return false
    this.squares[origin].placePiece(PieceCode.Empty)
    this.squares[targetSquare].placePiece(parseInt(piece.toString()))
    if (this.movePutsOppositeColorInCheck()) {
      soundToPlay = checkSound
      this.isInCheck = true;
    }
    playSound(soundToPlay);
    this.colorToMove = getOppositeColor(this.colorToMove) // change color to move 
    this.moves = this.generateLegalMoves()
    if (this.colorToMove === 0) {
      this.info.innerHTML = "White to paly"
    } else {
      this.info.innerHTML = "Black to paly"
    }
    return true;
  }
}

