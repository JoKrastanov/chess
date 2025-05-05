import { PieceColor } from "./Piece";

export interface AttackedSquares {
    [PieceColor.White]: Set<number>;
    [PieceColor.Black]: Set<number>;
}