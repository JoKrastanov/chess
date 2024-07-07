import { PieceCode } from "./piece";

export class Board {
  squares: number[];

  constructor() {
    this.squares = Array(64).fill(PieceCode.Empty);
  }
}
