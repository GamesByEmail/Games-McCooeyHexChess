import { Territory } from '../territory';
import { Piece, PieceChar } from '../piece';

export class Bishop extends Piece {
  public static readonly pieceChar: PieceChar = 'b';
  canMoveTo(toTerritory: Territory, darkTest?: boolean): boolean {
    const delta = this.territory!.delta(toTerritory);
    return (2 * delta.x === delta.y || delta.x === 2 * delta.y || delta.x === -delta.y) && this.territory!.pathIsEmpty(toTerritory);
  }
}
