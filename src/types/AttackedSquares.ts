import { PieceColor } from "./Piece";

export interface IAttackedSquares {
    [PieceColor.White]: Set<number>
    [PieceColor.Black]: Set<number>
}