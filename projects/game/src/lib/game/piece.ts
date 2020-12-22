import { IProjectedEntity } from '@packageforge/template-projection';
import { IBindableTarget, StateStore } from '@gamesbyemail/base';
import { Game } from './game';
import { Territory } from './territory';
import { Team } from './team';
import { TeamId } from './team-id';
import { IPieceKey } from './i-piece-key';
import { ElementRef } from '@angular/core';
import { Rectangle2D } from '@packageforge/geometry2d';
import { Deferred } from '@packageforge/deferred';

export type PieceChar = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K';
export interface IPieceSave {
  territory: number;
}

export abstract class Piece implements IProjectedEntity, IBindableTarget {
  public getChar(): PieceChar {
    return (<any>this.constructor).pieceChar[this.team.id === TeamId.White ? "toLowerCase" : "toUpperCase"]();
  }
  public get game(): Game {
    return this._game;
  }
  private _team: Team;
  public get team(): Team {
    return this._team;
  }
  private _territory: Territory | undefined;
  public get territory(): Territory | undefined {
    return this._territory;
  }
  public set territory(value: Territory | undefined) {
    if (this.elementRef)
      this.lastClientRect = new Rectangle2D(this.elementRef.nativeElement.getBoundingClientRect());
    this._territory = value;
    this.templateKey.small = this._territory === undefined;
  }
  private templateKey: IPieceKey;
  private stateStore = new StateStore<IPieceSave>();
  public showCheck = false;
  constructor(private _game: Game, state: string) {
    this._team = this.game.findTeam(state === state.toLowerCase() ? TeamId.White : TeamId.Black);
    this.templateKey = { type: <any>this.constructor.name, team: this.team.id, small: true, resigned: this.team.resigned };
  }
  elementRef: ElementRef<SVGElement> | undefined;
  private lastClientRect: Rectangle2D | undefined;
  bindElement(elementRef: ElementRef<SVGElement>): Rectangle2D | undefined {
    if (this.elementRef && this.elementRef !== elementRef)
      this.unbindElement(this.elementRef);
    this.elementRef = elementRef;
    const r = this.lastClientRect;
    this.lastClientRect = undefined;
    return r;
  }
  unbindElement(elementRef: ElementRef<SVGElement>): void {
    if (this.elementRef === elementRef)
      this.elementRef = undefined;
  }
  getTemplateKey(key?: IPieceKey): IPieceKey {
    return this.templateKey;
  }
  canMove(): boolean {
    return this.team.myTurn;
  }
  save(): IPieceSave {
    const saved = this.saving();
    this.stateStore.push(saved);
    return saved;
  }
  saving(): IPieceSave {
    return {
      territory: this.territory ? this.territory.index : -1
    };
  }
  restore(depth: number) {
    const saved = this.stateStore.pop(depth);
    this.restoring(saved);
  }
  restoring(saved: IPieceSave | undefined) {
    this.territory = saved && saved.territory >= 0 ? this.team.game.board.territories[saved.territory] : undefined;
  }
  commit() {
    this.stateStore.commit();
  }
  abstract canMoveTo(toTerritory: Territory, darkTest?: boolean): boolean;
  getCapture(toTerritory: Territory): Piece | undefined {
    return toTerritory.piece;
  }
  makeMove(toTerritory: Territory, logIt?: boolean): boolean {
    if (toTerritory === this.territory || toTerritory.isFriendly(this) || !this.canMoveTo(toTerritory))
      return false;
    if (logIt)
      this.game.log({
        piece: this.getChar(),
        from: this.territory!.index,
        to: toTerritory.index
      });
    const enemy = this.getCapture(toTerritory);
    if (enemy) {
      if (logIt)
        this.game.modLog({
          capture: {
            piece: enemy.getChar(),
            from: enemy.territory!.index
          }
        });
      this.team.capture(enemy);
    }
    this.changeTerritory(toTerritory);
    return true;
  }
  completeMove(fromTerritory: Territory): Promise<boolean> {
    return Promise.resolve(true);
  }
  attemptMove(toTerritory: Territory): Promise<boolean> {
    const fromTerritory = this.territory!;
    if (!this.makeMove(toTerritory, true))
      return Promise.resolve(false);
    const checks = this.game.options.dark ? [] : this.game.board.checkList(this.team);
    if (checks.length === 0)
      return this.completeMove(fromTerritory);
    const defer = new Deferred<false>();
    checks.forEach(check => {
      check.king.showCheck = true;
      check.threats.forEach(threat => {
        threat.showCheck = true;
      });
    });
    setTimeout(() => {
      checks.forEach(check => {
        check.king.showCheck = false;
        check.threats.forEach(threat => {
          threat.showCheck = false;
        });
      });
      defer.resolve(false);
    }, 1100);
    return defer.promise;
  }
  changeTerritory(toTerritory: Territory | undefined): void {
    if (this.territory)
      this.territory.setPiece();
    this.territory = toTerritory;
    if (this.territory)
      this.territory.setPiece(this);
  }
  isUs(team?: Team): boolean {
    return team ? this.team === team : this.team.isUs();
  }
  replaceWith(replacement: Piece) {
    const territory = this.territory;
    this.changeTerritory(undefined);
    replacement.changeTerritory(territory);
    replacement.lastClientRect = this.lastClientRect;
  }
  beginningMove() {
  }
}
