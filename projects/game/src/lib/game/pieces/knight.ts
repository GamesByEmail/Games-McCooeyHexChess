import { Territory } from '../territory';
import { Piece, PieceChar } from '../piece';

export class Knight extends Piece {
  public static readonly pieceChar: PieceChar = 'n';
  canMoveTo(toTerritory: Territory, darkTest?: boolean): boolean {
    const delta = this.territory!.delta(toTerritory);
    return ((delta.x === -3 && (delta.y === -2 || delta.y === -1)) ||
      (delta.x === -2 && (delta.y === -3 || delta.y === 1)) ||
      (delta.x === -1 && (delta.y === -3 || delta.y === 2)) ||
      (delta.x === 1 && (delta.y === -2 || delta.y === 3)) ||
      (delta.x === 2 && (delta.y === -1 || delta.y === 3)) ||
      (delta.x === 3 && (delta.y === 1 || delta.y === 2)));
  }
}