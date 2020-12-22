import { Territory } from '../territory';
import { Piece, PieceChar } from '../piece';

export class King extends Piece {
  public static readonly pieceChar: PieceChar = 'k';
  canMoveTo(toTerritory: Territory, darkTest?: boolean): boolean {
    const delta = this.territory!.delta(toTerritory);
    return (Math.abs(delta.x) <= 1 && Math.abs(delta.y) <= 1) ||
      (Math.abs(delta.x) === 2 && delta.x === delta.y * 2) ||
      (Math.abs(delta.y) === 2 && delta.x * 2 === delta.y);
  }
}
