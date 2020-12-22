import { BaseGridBoard, IBaseBoardSave, Player } from '@gamesbyemail/base';
import { HexHelper } from '@gamesbyemail/base';
import { Game, IGameOptions, IGameState, IGameSave } from './game';
import { Team, ITeamSave } from './team';
import { Territory, ITerritorySave } from './territory';
import { TeamId } from './team-id';
import { Move, IModMove } from './move';
import { Piece, PieceChar } from './piece';
import { King } from './pieces/king';
import { createPiece } from './create-piece';
import { IPoint2D } from '@packageforge/geometry2d';

interface Check {
  king: King;
  threats: Piece[];
}
export interface IBoardSave extends IBaseBoardSave<Game, IGameOptions, IGameState, IGameSave, Board, IBoardSave, Territory, ITerritorySave, Team, TeamId, ITeamSave, Move, IModMove> {
}
export class Board extends BaseGridBoard<Game, IGameOptions, IGameState, IGameSave, Board, IBoardSave, Territory, ITerritorySave, Team, TeamId, ITeamSave, Move, IModMove>  {
  public controller: any;
  sides=HexHelper.extrapolateHexSides(6);
  constructor(game: Game) {
    super(game);
    const hexCount=HexHelper.getHexCount(this.sides);
    for (let i = 0; i < hexCount; i++)
      this._territories[i] = new Territory(this, i);
    Object.freeze(this._territories);
    HexHelper.calculateAdjacents(this.territories);
  }
  positionFromIndex(index: number): IPoint2D {
    return HexHelper.getHexPositionFromIndex(index,this.sides);
  }
  calculateRotation(id: TeamId): number {
    return id === TeamId.Black ? 210 : 30;
  }
  isInCheck(team: Team): boolean {
    return this.checkList(team, true).length > 0;
  }
  checkList(team: Team, firstOnly?: boolean): Check[] {
    let king: Piece | King | undefined, threats: Piece[];
    const checks: Check[] = [];
    for (let i = 0; i < this.territories.length; i++)
      if ((king = this.territories[i].piece) && king instanceof King && king.team === team &&
        (threats = this.territoryThreats(king.territory!, team, true)).length > 0) {
        checks.push({ threats: threats, king: king });
        if (firstOnly)
          break;
      }
    return checks;
  }
  territoryThreats(territory: Territory, friendy: Team, all?: boolean): Piece[] {
    const pieces: Piece[] = [];
    let piece: Piece | undefined;
    for (let i = 0; i < this.territories.length; i++)
      if ((piece = this.territories[i].piece) && piece.team !== friendy && piece.canMoveTo(territory)) {
        pieces.push(piece);
        if (!all)
          break;
      }
    return pieces;
  }
  canMove(team: Team): boolean {
    for (let fromIndex = 0; fromIndex < this.territories.length; fromIndex++) {
      const fromTerritory = this.territories[fromIndex];
      const piece = fromTerritory.piece;
      if (piece && piece.team === team)
        for (let toIndex = 0; toIndex < this.territories.length; toIndex++)
          if (toIndex !== fromIndex) {
            const toTerritory = this.territories[toIndex];
            team.save();
            this.save();
            const canMove = piece.makeMove(toTerritory) && !this.isInCheck(team);
            this.restore(0);
            team.restore(0);
            if (canMove)
              return true;
          }
    }
    return false;
  }
  openPromote(teamColor: TeamId): Promise<PieceChar | undefined> {
    return this.controller.openPromote(teamColor.toString());
  }
  createPiece(state: PieceChar): Piece {
    return createPiece(this.game, state);
  }
  setDark(player: Player<Game, IGameOptions, IGameState, IGameSave, Board, IBoardSave, Territory, ITerritorySave, Team, TeamId, ITeamSave, Move, IModMove> | undefined) {
    for (let i = 0; i < this.territories.length; i++)
      this.territories[i].setDark(player);
  }
  anyKingsLeft(team: Team): boolean {
    let king: Piece | King | undefined;
    for (let i = 0; i < this.territories.length; i++)
      if ((king = this.territories[i].piece) && king instanceof King && king.team === team)
        return true;
    return false;
  }
}
