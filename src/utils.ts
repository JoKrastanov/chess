import { Board } from "./Board";
import { PieceCode, PieceColor, PieceType } from "./types/Piece";

export const slidingMovementOffsets = [8, -8, -1, 1, 7, -7, 9, -9]
export const knightMovementOffsets = [17, -15, 15, -17, 6, -10, -6, 10]

export const moveSound = new Audio('../../assets/audio/move-self.mp3');
export const captureSound = new Audio('../../assets/audio/capture.mp3');
export const checkSound = new Audio('../../assets/audio/move-check.mp3');

export function addPieceEventListeners(pieceDOM: HTMLSpanElement, board: Board) {
    pieceDOM.draggable = true;
    pieceDOM.ondragstart = function (this: GlobalEventHandlers, ev: DragEvent) {
        drag(ev, board)
    }
}

export function getPawnOffsets(color: PieceColor): [number, number, number, number] {
    return color === PieceColor.White ? [8, 7, 9, 16] : [-8, -9, -7, -16]
}

export function getSquareById(id: string, boardDOM: HTMLDivElement): HTMLDivElement | undefined {
    let squareNodeDOM: HTMLDivElement | undefined = undefined;
    boardDOM.childNodes.forEach(squareNode => {
        if (squareNode instanceof HTMLDivElement) {
            if (squareNode.id === id) {
                squareNodeDOM = squareNode
            }
        }
    })
    return squareNodeDOM;
}

export function drop(ev: any, board: Board) {
    ev.preventDefault();
    board.squaresDOM.forEach(square => {
        square.classList.remove("red")
        square.classList.remove("origin")
        square.classList.remove("attack")
    })
    let data = ev.dataTransfer.getData("text");
    if (data === "") return;
    let pieceDOM = document.getElementById(data)
    if (!pieceDOM) return
    const [piece, origin] = pieceDOM.id.split("_") as unknown as [number, number]
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
    }
    target.appendChild(pieceDOM);
    let targetId = target.id
    if (targetId.includes("_")) {
        targetId = targetId.split("_")[1]
    }
    pieceDOM.id = `${piece}_${targetId}`
}

function drag(e: DragEvent, board: Board) {
    if (board.promotionMenuIsOpen) return
    board.boardDOM.childNodes.forEach(squareNode => {
        if (squareNode instanceof HTMLDivElement) {
            squareNode.classList.remove("highlight")
        }
    })
    if (!e.dataTransfer || !e.target) return
    const target = (<HTMLSpanElement>e.target)
    const [piece, square] = target.id.split("_") as unknown as [number, number]
    if (board.colorToMove !== getPieceColor(piece)) return
    const allowedMovesForPiece = board.moves[board.colorToMove][square]
    Array.from(board.squaresDOM).find(sq => sq.id === allowedMovesForPiece[0]?.startSquare.toString())?.classList.add("origin")
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
    return piece == <number>pieceType || piece == <number>pieceType + PieceCode.Black
}

export function getPieceColor(piece: PieceCode) {
    if (piece >= PieceCode.Black) return PieceColor.Black;
    return PieceColor.White;
}

export function isSlidingPiece(piece: PieceCode) {
    return [PieceCode.WBishop, PieceCode.WRook, PieceCode.WQueen, PieceCode.BBishop, PieceCode.BRook, PieceCode.BQueen].includes(piece)
}

export function isKnight(piece: PieceCode) {
    return piece == PieceCode.WKnight || piece == PieceCode.BKnight
}

export function isPawn(piece: PieceCode) {
    return piece == PieceCode.WPawn || piece == PieceCode.BPawn
}

export function allowDrop(ev: any) {
    ev.preventDefault();
}

export function getOppositeColor(colorToMove: number): PieceColor {
    return 8 - colorToMove;
}

export function moveLeadsToPawnPromotion(piece: PieceCode, square: number): boolean {
    return isPawn(piece) && squareIsOnLastRank(piece, square)
}

export function squareIsOnLastRank(piece: PieceCode, square: number) {
    const color = getPieceColor(piece)
    if (color === PieceColor.White) {
        return square >= 56 && square <= 63
    } else {
        return square >= 0 && square <= 7
    }
}

export function displayPromotionMenu(piece: PieceCode, origin: number, board: Board, target: Element) {
    const color = getPieceColor(piece) === PieceColor.White ? "white" : "black";
    const promotionMenu: HTMLDivElement = document.querySelector(`#${color}.promotion-menu`)!;
    promotionMenu.style.display = "flex";
    promotionMenu.style.flexDirection = "column";
    promotionMenu.childNodes.forEach((child) => {
        const childElement = child as HTMLImageElement;
        childElement.onclick = () => {
            const newPiece = childElement.id;
            const newPieceCode = PieceCode[newPiece as keyof typeof PieceCode];
            promotionMenu.style.display = "none";
            board.makeMove(<number>newPieceCode, origin, target, true);
            console.log(board.squaresDOM, board.squares)
        }
    })
}

export function targetSquareCausesKnightAHFileWrap(startSquare: number, targetSquare: number) {
    return (isAFile(startSquare) && getKnightAFileWrappingOffsets(startSquare).includes(targetSquare))
        || (isBFile(startSquare) && getKnightBFileWrappingOffsets(startSquare).includes(targetSquare))
        || (isGFile(startSquare) && getKnightGFileWrappingOffsets(startSquare).includes(targetSquare))
        || (isHFile(startSquare) && getKnightHFileWrappingOffsets(startSquare).includes(targetSquare))
}

export function getKnightAFileWrappingOffsets(square: number) {
    return [
        square + knightMovementOffsets[0],
        square + knightMovementOffsets[1],
        square + knightMovementOffsets[6],
        square + knightMovementOffsets[7]
    ]
}

export function getKnightBFileWrappingOffsets(square: number) {
    return [
        square + knightMovementOffsets[6],
        square + knightMovementOffsets[7],
    ]
}

export function getKnightHFileWrappingOffsets(square: number) {
    return [
        square + knightMovementOffsets[2],
        square + knightMovementOffsets[3],
        square + knightMovementOffsets[4],
        square + knightMovementOffsets[5]
    ]
}

export function getKnightGFileWrappingOffsets(square: number) {
    return [
        square + knightMovementOffsets[4],
        square + knightMovementOffsets[5],
    ]
}

export function getPieceTypeFromCode(piece: PieceCode) {
    if (piece >= 8) return piece - PieceColor.Black as PieceType
    else return piece + PieceColor.White as PieceType
}

export function isAFile(square: number) {
    return square % 8 === 7;
}

export function isBFile(square: number) {
    return square % 8 === 6;
}

export function isGFile(square: number) {
    return square % 8 === 1;
}

export function isHFile(square: number) {
    return square % 8 === 0;
}

export function playSound(audio: HTMLAudioElement) {
    audio.play();
}