export enum PieceType {
  None = 0, // empty square
  Pawn = 1,
  Knight = 2,
  Bishop = 3,
  Rook = 4,
  Queen = 5,
  King = 6
}

export enum PieceCode {
  Empty = PieceType.None,
  Black = 8, // color code for recognizing if a piece is black

  // White pieces
  WPawn = PieceType.Pawn,
  WKnight = PieceType.Knight,
  WBishop = PieceType.Bishop,
  WRook = PieceType.Rook,
  WQueen = PieceType.Queen,
  WKing = PieceType.King,

  //Black Pieces
  BPawn = PieceType.Pawn + PieceCode.Black,
  BKnight = PieceType.Knight + PieceCode.Black,
  BBishop = PieceType.Bishop + PieceCode.Black,
  BRook = PieceType.Rook + PieceCode.Black,
  BQueen = PieceType.Queen + PieceCode.Black,
  BKing = PieceType.King + PieceCode.Black,
}

// HTML (dec) code for rendering the chess piece icons
export const PieceIcon: Record<number, string> = {
  [PieceCode.WPawn]: "./assets/pieces/pawn-w.svg",
  [PieceCode.WKnight]: "./assets/pieces/knight-w.svg",
  [PieceCode.WBishop]: "./assets/pieces/bishop-w.svg",
  [PieceCode.WRook]: "./assets/pieces/rook-w.svg",
  [PieceCode.WQueen]: "./assets/pieces/queen-w.svg",
  [PieceCode.WKing]: "./assets/pieces/king-w.svg",
  [PieceCode.BPawn]: "./assets/pieces/pawn-b.svg",
  [PieceCode.BKnight]: "./assets/pieces/knight-b.svg",
  [PieceCode.BBishop]: "./assets/pieces/bishop-b.svg",
  [PieceCode.BRook]: "./assets/pieces/rook-b.svg",
  [PieceCode.BQueen]: "./assets/pieces/queen-b.svg",
  [PieceCode.BKing]: "./assets/pieces/king-b.svg",
};

export const FenPieces = {
  "p": PieceType.Pawn,
  "r": PieceType.Rook,
  "n": PieceType.Knight,
  "b": PieceType.Bishop,
  "q": PieceType.Queen,
  "k": PieceType.King
}

export enum PieceColor {
  White,
  Black
}