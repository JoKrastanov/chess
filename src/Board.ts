import {
  addPieceEventListeners,
  allowDrop,
  captureSound,
  checkSound,
  computeNrOfSquaresToEdge,
  drop,
  getOppositeColor,
  getPawnOffsets,
  getPieceColor,
  getSquareById,
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
import { FenPieces, PieceCode, PieceColor, PieceIcon, PieceType } from "./types/Piece";
import { Square } from "./types/Square";
import { LegalMoves } from "./types/LegalMoves";
import { AttackedSquares } from "./types/AttackedSquares";

// TODO: FEATURES TO IMPLEMENT
/*
  * Pinned pieces check
  * Mate
  * Castling
  * Pawn promotion
  * En passant
*/
const DEBUG_MODE = false;

export class Board {
  boardDOM: HTMLDivElement;
  squaresDOM: NodeListOf<HTMLDivElement>;
  squares: Square[];
  colorToMove: PieceColor;
  moves: LegalMoves;
  attackedSquares: AttackedSquares;
  attackPathToKing: Set<number>;
  checkedColor: PieceColor | null;
  nrOfSquaresToEdge: number[][];
  info: HTMLParagraphElement
  checkInfo: HTMLParagraphElement
  isInCheck: boolean

  constructor(fen: string) {
    this.info = document.getElementsByClassName("info")[0] as HTMLParagraphElement
    this.checkInfo = document.getElementsByClassName("check-info")[0] as HTMLParagraphElement
    this.checkedColor = null;
    this.squares = Array(64).fill(undefined);
    this.moves = {
      [PieceColor.White]: {},
      [PieceColor.Black]: {}
    };
    this.attackedSquares = {
      [PieceColor.White]: new Set<number>(),
      [PieceColor.Black]: new Set<number>(),
    }
    this.colorToMove = PieceColor.White
    this.attackPathToKing = new Set();
    this.boardDOM = document.querySelector(".board") || document.createElement("div")
    this.drawSquares()
    this.squaresDOM = document.querySelectorAll(".square")
    this.nrOfSquaresToEdge = computeNrOfSquaresToEdge()
    this.renderFromFEN(fen)
    this.generateLegalMoves()
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
        if (DEBUG_MODE) {
          squareDiv.innerHTML = idx.toString();
        }
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

  generateLegalMoves() {
    this.moves = {
      [PieceColor.White]: {},
      [PieceColor.Black]: {}
    };

    this.attackedSquares[PieceColor.White].clear()
    this.attackedSquares[PieceColor.Black].clear()

    for (let startSquare = 0; startSquare < 64; startSquare++) {
      const piece = this.squares[startSquare]?.getPiece()
      if (piece === PieceCode.Empty) continue;
      this.getMovesForPiece(piece, startSquare);
    }
    if (DEBUG_MODE) {
      console.log(this.attackedSquares)
      this.colorAttackedSquares();
    }
  }

  getMovesForPiece(piece: PieceCode, startSquare: number) {
    const pieceColor = getPieceColor(piece);
    if (isSlidingPiece(piece)) {
      this.generateSlidingMoves(startSquare, piece, pieceColor)
    } else if (isKnight(piece)) {
      this.generateKnightMoves(startSquare, piece, pieceColor)
    } else if (isPawn(piece)) {
      this.generatePawnMoves(startSquare, piece, pieceColor)
    } else { // is King
      this.generateKingMoves(startSquare, pieceColor)
    }
  }

  addMoveToLegalMoves(startSquare: number, targetSquare: number, pieceColor: PieceColor, addAtackedSquare: boolean = true) {
    if (!this.moves[pieceColor][startSquare]) {
      this.moves[pieceColor][startSquare] = []
    }
    if (pieceColor === this.checkedColor && !this.attackPathToKing.has(targetSquare)) {
      return;
    }
    this.moves[pieceColor][startSquare].push({ startSquare: startSquare, targetSquare: targetSquare })
    if (addAtackedSquare) {
      this.attackedSquares[pieceColor].add(targetSquare)
    }
  }

  generateSlidingMoves(startSquare: number, piece: PieceCode, pieceColor: PieceColor) {
    const startDirIndex = pieceIsType(piece, PieceType.Bishop) ? 4 : 0
    const endDirIndex = pieceIsType(piece, PieceType.Rook) ? 4 : 8
    for (let dirIdx = startDirIndex; dirIdx < endDirIndex; dirIdx++) {
      for (let nrOfSquares = 0; nrOfSquares < this.nrOfSquaresToEdge[startSquare][dirIdx]; nrOfSquares++) {
        const targetSquare = startSquare + slidingMovementOffsets[dirIdx] * (nrOfSquares + 1)
        if (targetSquare > 63 || targetSquare < 0) break;
        const pieceOnTargetSquare = this.squares[targetSquare]?.getPiece()
        // If we find a piece in a direction and it is our color we cannot go to it
        if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) === this.colorToMove) break

        if (!this.moves[pieceColor][startSquare]) {
          this.moves[pieceColor][startSquare] = []
        }
        this.addMoveToLegalMoves(startSquare, targetSquare, pieceColor);
        // If we find a piece in a direction and it is not our color we capture it and cannot go further
        if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) !== this.colorToMove) break
      }
    }
  }

  generateKnightMoves(startSquare: number, piece: PieceCode, pieceColor: PieceColor) {
    for (let dirIdx = 0; dirIdx < 8; dirIdx++) {
      const targetSquare = startSquare + knightMovementOffsets[dirIdx]
      if (targetSquare > 63 || targetSquare < 0) continue;
      const pieceOnTargetSquare = this.squares[targetSquare]?.getPiece()
      if (
        pieceOnTargetSquare !== PieceCode.Empty
        && getPieceColor(pieceOnTargetSquare) === getPieceColor(piece)
      ) continue

      if (targetSquareCausesKnightAHFileWrap(startSquare, targetSquare)) continue
      this.addMoveToLegalMoves(startSquare, targetSquare, pieceColor);
    }
  }

  generatePawnMoves(startSquare: number, piece: PieceCode, pieceColor: PieceColor) {
    const pawnOffsets = getPawnOffsets(pieceColor);
    if (!this.moves[pieceColor][startSquare]) {
      this.moves[pieceColor][startSquare] = []
    }
    if (this.squares[startSquare + pawnOffsets[0]]?.getPiece() === PieceCode.Empty) {
      this.addMoveToLegalMoves(startSquare, startSquare + pawnOffsets[0], pieceColor, false);
    }
    const leftDiagonalSquarePiece = this.squares[startSquare + pawnOffsets[1]]?.getPiece()
    const rightDiagonalSquarePiece = this.squares[startSquare + pawnOffsets[2]]?.getPiece()
    if (!isHFile(startSquare)) {
      if (leftDiagonalSquarePiece !== PieceCode.Empty && getPieceColor(leftDiagonalSquarePiece) !== pieceColor) {
        this.addMoveToLegalMoves(startSquare, startSquare + pawnOffsets[1], pieceColor, false);
      }
      this.attackedSquares[pieceColor].add(startSquare + pawnOffsets[1])
    }
    if (!isAFile(startSquare)) {
      if (rightDiagonalSquarePiece !== PieceCode.Empty && getPieceColor(rightDiagonalSquarePiece) !== pieceColor) {
        this.addMoveToLegalMoves(startSquare, startSquare + pawnOffsets[2], pieceColor, false);
      }
      this.attackedSquares[pieceColor].add(startSquare + pawnOffsets[2])
    }
    if (this.isFirstPawnMove(startSquare, piece, pawnOffsets)) {
      this.addMoveToLegalMoves(startSquare, startSquare + pawnOffsets[3], pieceColor, false);
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

  generateKingMoves(startSquare: number, pieceColor: PieceColor) {
    for (let dirIdx = 0; dirIdx < 8; dirIdx++) {
      const targetSquare = startSquare + slidingMovementOffsets[dirIdx]
      if (targetSquare > 63 || targetSquare < 0 || this.attackedSquares[getOppositeColor(pieceColor)].has(targetSquare)) continue;
      const pieceOnTargetSquare = this.squares[targetSquare]?.getPiece()
      // If we find a piece in a direction and it is our color we cannot go to it
      if (pieceOnTargetSquare !== PieceCode.Empty && getPieceColor(pieceOnTargetSquare) === this.colorToMove) continue
      this.addMoveToLegalMoves(startSquare, targetSquare, pieceColor);
    }
  }

  movePutsOppositeColorInCheck(targetSquare: number): boolean {
    const oppositeColor = getOppositeColor(this.colorToMove);
    const kingSquare = this.findSquareOfPiece(PieceType.King + oppositeColor);

    if (!kingSquare) return false;

    this.getMovesForPiece(this.squares[targetSquare].getPiece(), targetSquare)
    return Object.values(this.moves[this.colorToMove]).some(moveList =>
      moveList.some(move => move.targetSquare === kingSquare.idx)
    );
  }

  makeMove(piece: PieceCode, origin: number, target: Element): boolean {
    let targetSquare = parseInt(target.id)
    let soundToPlay = moveSound;
    const targetIsOccupied = target.id.includes("_")
    if (targetIsOccupied) {
      targetSquare = parseInt(target.id.split("_")[1])
      soundToPlay = captureSound;
    }
    if (!this.moves[this.colorToMove][origin].find(move => move.targetSquare == targetSquare)) return false
    this.squares[origin].placePiece(PieceCode.Empty)
    this.squares[targetSquare].placePiece(parseInt(piece.toString()))
    if (this.movePutsOppositeColorInCheck(targetSquare)) {
      this.checkedColor = getOppositeColor(this.colorToMove)
      soundToPlay = checkSound;
      this.checkInfo.innerHTML = "Check!"
      this.isInCheck = true;
      this.calculateAttackPathToOppositeKing(piece, targetSquare);
      if (DEBUG_MODE) {
        this.colorPathToKing();
      }
    }
    playSound(soundToPlay);
    this.colorToMove = getOppositeColor(this.colorToMove)
    this.generateLegalMoves()
    if (this.colorToMove === 0) {
      this.info.innerHTML = "White to paly"
    } else {
      this.info.innerHTML = "Black to paly"
    }
    return true;
  }

  calculateAttackPathToOppositeKing(piece: PieceCode, attackingSquare: number): void {
    this.attackPathToKing.clear();

    const attackingPieceColor = getPieceColor(piece);
    const oppositeColor = getOppositeColor(attackingPieceColor);
    const kingSquare = this.findSquareOfPiece(PieceType.King + oppositeColor);

    if (!kingSquare) return;

    const kingPosition = kingSquare.idx;

    if (isKnight(piece) || isPawn(piece)) {
      this.attackPathToKing.add(attackingSquare);
      return;
    }

    const startDirIndex = pieceIsType(piece, PieceType.Bishop) ? 4 : 0;
    const endDirIndex = pieceIsType(piece, PieceType.Rook) ? 4 : 8;

    for (let dirIdx = startDirIndex; dirIdx < endDirIndex; dirIdx++) {
      let currentSquare = attackingSquare;
      let path = new Set<number>([currentSquare]);

      for (let steps = 0; steps < this.nrOfSquaresToEdge[attackingSquare][dirIdx]; steps++) {
        currentSquare += slidingMovementOffsets[dirIdx];

        if (currentSquare === kingPosition) {
          this.attackPathToKing = path;
          return;
        }
        path.add(currentSquare);

        if (this.squares[currentSquare].getPiece() !== PieceCode.Empty) break;
      }
    }
  }

  colorPathToKing() {
    console.log(this.attackPathToKing)
    this.attackPathToKing.forEach(squareIdx => {
      getSquareById(squareIdx.toString(), this.boardDOM)?.classList.add("attack")
    })
  }

  colorAttackedSquares() {
    this.squaresDOM.forEach(square => {
      square.classList.remove("attacked-white")
      square.classList.remove("attacked-black")
    })
    this.attackedSquares[PieceColor.White].forEach(squareIdx => {
      getSquareById(squareIdx.toString(), this.boardDOM)?.classList.add("attacked-white")
    })
    this.attackedSquares[PieceColor.Black].forEach(squareIdx => {
      getSquareById(squareIdx.toString(), this.boardDOM)?.classList.add("attacked-black")
    })
  }

  findSquareOfPiece(piece: PieceCode): Square | undefined {
    return this.squares.find(sq => sq.getPiece() === piece);
  }
}

