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
  [PieceCode.WPawn]: "&#9817;",
  [PieceCode.WKnight]: "&#9816;",
  [PieceCode.WBishop]: "&#9815;",
  [PieceCode.WRook]: "&#9814;",
  [PieceCode.WQueen]: "&#9813;",
  [PieceCode.WKing]: "&#9812;",
  [PieceCode.BPawn]: "&#9823;",
  [PieceCode.BKnight]: "&#9822;",
  [PieceCode.BBishop]: "&#9821;",
  [PieceCode.BRook]: "&#9820;",
  [PieceCode.BQueen]: "&#9819;",
  [PieceCode.BKing]: "&#9818;",
};

export const FenPieces = {
  "p": PieceType.Pawn,
  "r": PieceType.Rook,
  "n": PieceType.Knight,
  "b": PieceType.Bishop,
  "q": PieceType.Queen,
  "k": PieceType.King
}