import { PieceCode } from "./piece";

export class Square {
    idx: number;
    file: number;
    rank: number;
    piece: PieceCode;

    constructor(idx: number, file: number, rank: number) {
        this.idx = idx;
        this.file = file;
        this.rank = rank;
        this.piece = PieceCode.Empty;
    }

    placePiece(piece: PieceCode) {
        this.piece = piece;
    } 
     
    getPiece() {
        return this.piece;
    }
}