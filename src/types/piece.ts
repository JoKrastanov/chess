export enum PieceType {
  None = 0, // empty square

  // white and black pawns are treated as different types to account for their move-directions
  WPawn = 1,
  BPawn = 2,

  Knight = 3,
  Bishop = 4,
  Rook = 5,
  Queen = 6,
  King = 7
}

export enum PieceCode {
  Empty = PieceType.None,

  // White pieces
  WPawn = PieceType.WPawn,
  WKnight = PieceType.Knight,
  WBishop = PieceType.Bishop,
  WRook = PieceType.Rook,
  WQueen = PieceType.Queen,
  WKing = PieceType.King,

  Black = 8, // color code for recognizing if a piece is black

  //Black Pieces
  BPawn = PieceType.BPawn + PieceCode.Black,
  BKnight = PieceType.Knight + PieceCode.Black,
  BBishop = PieceType.Bishop + PieceCode.Black,
  BRook = PieceType.Rook + PieceCode.Black,
  BQueen = PieceType.Queen + PieceCode.Black,
  BKing = PieceType.King + PieceCode.Black,
}

// HTML (dec) code for rendering the chess piece icons
export interface PieceIcon {
  [PieceCode.WPawn]: "&#9817;";
  [PieceCode.WKnight]: "&#9816;";
  [PieceCode.WBishop]: "&#9815;";
  [PieceCode.WRook]: "&#9814;";
  [PieceCode.WQueen]: "&#9813;";
  [PieceCode.WKing]: "&#9812;";

  [PieceCode.BPawn]: "&#9823;";
  [PieceCode.BKnight]: "&#9822;";
  [PieceCode.BBishop]: "&#9821;";
  [PieceCode.BRook]: "&#9820;";
  [PieceCode.BQueen]: "&#9819;";
  [PieceCode.BKing]: "&#9818;";
}

