import { Board } from "./types/board";
import { PieceCode, PieceColor, PieceType } from "./types/piece";

export const slidingMovementOffsets = [8, -8, -1, 1, 7, -7, 9, -9]
export const knightMovementOffsets = [17, -15, 15, -17, 6, -10, -6, 10]

const moveSound = new Audio('../../assets/audio/move-self.mp3');
const captureSound = new Audio('../../assets/audio/capture.mp3');

export function addPieceEventListeners(pieceDOM: HTMLSpanElement, board: Board) {
    pieceDOM.draggable = true;
    pieceDOM.ondragstart = function (this: GlobalEventHandlers, ev: DragEvent) {
        drag(ev, board)
    }
}

export function drop(ev: any, board: Board) {
    ev.preventDefault();
    board.squaresDOM.forEach(square => {
        square.classList.remove("red")
        square.classList.remove("origin")
    })
    let data = ev.dataTransfer.getData("text");
    let pieceDOM = document.getElementById(data)
    if (!pieceDOM) return
    const [piece, origin] = pieceDOM.id.split("_") as unknown as [PieceCode, number]
    let target = ev.target
    if (pieceDOM == ev.target) {
        return
    }
    const continueWithMove = board.makeMove(piece, <number>origin, target)
    if (!continueWithMove) return
    if (ev.target.id.includes("_")) {
        const targetSquare = ev.target.id.split("_")[1]
        document.getElementById(ev.target.id)?.remove()
        target = document.getElementById(targetSquare)
        captureSound.play();
    }
    else {
        moveSound.play();
    }
    target.appendChild(pieceDOM);
    let targetId = target.id
    if (targetId.includes("_")) {
        targetId = targetId.split("_")[1]
    }
    pieceDOM.id = `${piece}_${targetId}`

}

function drag(e: DragEvent, board: Board) {
    if (!e.dataTransfer || !e.target) return
    const target = (<HTMLSpanElement>e.target)
    const [piece, square] = target.id.split("_") as unknown as [number, number]
    if (board.colorToMove !== getPieceColor(piece)) return
    const allowedMovesForPiece = board.moves[square]
    Array.from(board.squaresDOM).find(sq => sq.id === allowedMovesForPiece[0].startSquare.toString())?.classList.add("origin")
    allowedMovesForPiece.forEach(move => {
        const square = Array.from(board.squaresDOM).find(sq => sq.id === move.targetSquare.toString())
        if (!square) return
        square.classList.add("red")
    })
    e.dataTransfer.setData("text", target.id);
}

export function computeNrOfSquaresToEdge(): number[][] {
    let nrOfSquaresToEdge: number[][] = new Array(64).fill([])
    for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
            let numNorth = 7 - rank
            let numSouth = rank
            let numWest = file
            let numEast = 7 - file

            let squareIdx = rank * 8 + file

            nrOfSquaresToEdge[squareIdx] = [
                numNorth,
                numSouth,
                numWest,
                numEast,
                Math.min(numNorth, numWest),
                Math.min(numSouth, numEast),
                Math.min(numNorth, numEast),
                Math.min(numSouth, numWest)
            ]
        }
    }
    return nrOfSquaresToEdge
}

export function pieceIsType(piece: PieceCode, pieceType: PieceType) {
    // Check for piece type for both colors
    return piece === <number>pieceType || piece === <number>pieceType + PieceCode.Black
}

export function getPieceColor(piece: PieceCode) {
    if (piece >= PieceCode.Black) return PieceColor.Black;
    return PieceColor.White;
}

export function isSlidingPiece(piece: PieceCode) {
    return [PieceCode.WBishop, PieceCode.WRook, PieceCode.WQueen, PieceCode.BBishop, PieceCode.BRook, PieceCode.BQueen].includes(piece)
}

export function isKnight(piece: PieceCode) {
    return piece === PieceCode.WKnight || piece === PieceCode.BKnight
}

export function isPawn(piece: PieceCode) {
    return piece === PieceCode.WPawn || piece === PieceCode.BPawn
}

export function allowDrop(ev: any) {
    ev.preventDefault();
}