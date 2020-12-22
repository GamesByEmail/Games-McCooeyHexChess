import { Territory } from '../territory';
import { Piece, PieceChar } from '../piece';

export class Queen extends Piece {
  public static readonly pieceChar: PieceChar = 'q';
  canMoveTo(toTerritory: Territory, darkTest?: boolean): boolean {
    const delta = this.territory!.delta(toTerritory);
    return (delta.x === 0 || delta.y === 0 || delta.x === delta.y || 2 * delta.x === delta.y || 
      delta.x === 2 * delta.y || -delta.x === delta.y) &&
      this.territory!.pathIsEmpty(toTerritory);
  }
}