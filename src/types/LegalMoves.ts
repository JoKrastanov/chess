import { Move } from "./Move";
import { PieceColor } from "./Piece";

export interface LegalMoves {
    [PieceColor.White]: LegalMovesMap;
    [PieceColor.Black]: LegalMovesMap;
}

export interface LegalMovesMap {
    [key: string]: Move[];
}