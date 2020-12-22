import { Territory } from '../territory';
import { Piece, IPieceSave, PieceChar } from '../piece';
import { isIMove } from '../move';
import { TeamId } from '../team-id';

export class Pawn extends Piece {
  public static readonly pieceChar: PieceChar = 'p';
  getHomeRank(): number {
    if (this.team.id === TeamId.Black)
      return [-1, -1, 7, 7, 7, -1, 8, 9, 10, -1, -1][this.territory!.position.x];
    return [-1, -1, 0, 1, 2, -1, 3, 3, 3, -1, -1][this.territory!.position.x];
  }
  getPromoteRank(): number {
    if (this.team.id === TeamId.Black)
      return [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5][this.territory!.position.x];
    return [5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 10][this.territory!.position.x];
  }
  canMoveTo(toTerritory: Territory, darkTest?: boolean): boolean {
    const delta = this.territory!.delta(toTerritory);
    if (this.team.id === TeamId.Black) {
      if (darkTest && (delta.equals(-1, -1) || delta.equals(1, 0)) && toTerritory.isEnemy(this) && toTerritory.piece instanceof Pawn && toTerritory.piece.passedLastTurn())
        return true;
      if (delta.x === 0)
        return (darkTest || toTerritory.isEmpty()) && (delta.y === -1 || (delta.y == -2 && this.territory!.position.y === this.getHomeRank() && this.territory!.pathIsEmpty(toTerritory)));
      if (delta.equals(-1, -2) || delta.equals(1, -1)) {
        if (darkTest || toTerritory.isEnemy(this))
          return true;
        const passedT = this.territory!.board.findTerritory(toTerritory.position.x, toTerritory.position.y + 1);
        if (passedT && passedT.isEnemy(this) && passedT.piece instanceof Pawn && passedT.piece.passedLastTurn())
          return true;
      }
    } else {
      if (darkTest && (delta.equals(-1, 0) || delta.equals(1, 1)) && toTerritory.isEnemy(this) && toTerritory.piece instanceof Pawn && toTerritory.piece.passedLastTurn())
        return true;
      if (delta.x === 0)
        return (darkTest || toTerritory.isEmpty()) && (delta.y === 1 || (delta.y == 2 && this.territory!.position.y === this.getHomeRank() && this.territory!.pathIsEmpty(toTerritory)));
      if (delta.equals(-1, 1) || delta.equals(1, 2)) {
        if (darkTest || toTerritory.isEnemy(this))
          return true;
        const passedT = this.territory!.board.findTerritory(toTerritory.position.x, toTerritory.position.y - 1);
        if (passedT && passedT.isEnemy(this) && passedT.piece instanceof Pawn && passedT.piece.passedLastTurn())
          return true;
      }
    }
    return false;
  }
  passedLastTurn(): boolean {
    if (this.game.lastMoves.length > 0) {
      const move = this.game.lastMoves[0];
      if (isIMove(move))
        return move.to === this.territory!.index && Math.abs(this.territory!.board.territories[move.from].position.y - this.territory!.position.y) === 2;
    }
    return false;
  }
  getCapture(toTerritory: Territory): Piece | undefined {
    let piece = super.getCapture(toTerritory), passedT;
    if (!piece && this.territory!.position.x !== toTerritory.position.x &&
      (passedT = this.territory!.board.findTerritory(toTerritory.position.x, toTerritory.position.y + (this.team.id === TeamId.Black ? 1 : -1))))
      piece = passedT.piece;
    return piece;
  }
  completeMove(fromTerritory: Territory): Promise<boolean> {
    return super.completeMove(fromTerritory).then(completed => {
      if (completed && this.territory!.position.y === this.getPromoteRank())
        return this.territory!.board.openPromote(this.team.id).then(newPieceType => {
          if (!newPieceType)
            return false;
          const replacement = this.territory!.board.createPiece(this.team.id === TeamId.Black ? <PieceChar>newPieceType.toUpperCase() : newPieceType)!;
          this.replaceWith(replacement);
          this.game.modLog({ promote: replacement.getChar() });
          return true;
        });
      return completed;
    });
  }
}

interface IPawnSave extends IPieceSave {
  passingLastTurn: boolean;
}