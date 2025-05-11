import { PieceCode } from "./Piece";

export class Square {
    idx: number;
    file: number;
    rank: number;
    piece: PieceCode;
    pieceDOM: HTMLDivElement | null;

    constructor(idx: number, file: number, rank: number) {
        this.idx = idx;
        this.file = file;
        this.rank = rank;
        this.piece = PieceCode.Empty;
        this.pieceDOM = null;
    }

    placePiece(piece: PieceCode) {
        this.piece = piece;
    } 
     
    getPiece() {
        return this.piece;
    }
}