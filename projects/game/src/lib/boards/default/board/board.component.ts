import { Component, Input, ElementRef, ViewChild, AfterViewInit, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition, sequence } from '@angular/animations';

import { BoardService, HexHelper, IHexSize } from '@gamesbyemail/base';
import { PromoteDialogService } from '../dialogs/promote/promote-dialog.service';

import { Territory } from '../../../game/territory';
import { Game } from '../../../game/game';
import { fromEvent, Subscription, Observable, Subject, race } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import { Point2D, Rectangle2D } from '@packageforge/geometry2d';
import { PieceChar } from '../../../game/piece';

@Component({
  selector: 'gamesbyemail-games-mccooeyhexchess-default-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  animations: [
    trigger('showCheck', [
      state('false', style({ opacity: 1 })),
      state('true', style({ opacity: 1 })),
      transition('false => true', sequence([
        animate("0.05s", style({ opacity: 0 })),
        animate("0.15s", style({ opacity: 0 })),
        animate("0.05s", style({ opacity: 1 })),
        animate("0.15s", style({ opacity: 1 })),
        animate("0.05s", style({ opacity: 0 })),
        animate("0.15s", style({ opacity: 0 })),
        animate("0.05s", style({ opacity: 1 })),
        animate("0.15s", style({ opacity: 1 })),
        animate("0.05s", style({ opacity: 0 })),
        animate("0.15s", style({ opacity: 0 })),
        animate("0.05s", style({ opacity: 1 }))
      ]))
    ])
  ]
})
export class BoardComponent implements AfterViewInit {
  @Input() game!: Game;
  @ViewChild('boardArea') boardArea!: ElementRef<SVGElement>;
  @ViewChild('dialogArea', { read: ViewContainerRef }) dialogArea!: ViewContainerRef;
  @ViewChild('dialogOverlay', { read: ElementRef }) dialogOverlay!: ElementRef;
  @ViewChild('pieceLibrary') pieceLibrary!: any;

  mousemove: Observable<MouseEvent> = <any>fromEvent(document, 'mousemove');
  mouseup: Observable<any> = fromEvent(document, 'mouseup').pipe(map(() => undefined));
  territoryUp: Subject<Territory> = new Subject();

  size:IHexSize=HexHelper.extrapolateHexSize(39);
  viewBox:Rectangle2D=new Rectangle2D(0,0,100,100);
  constructor(private cd: ChangeDetectorRef,private boardService: BoardService, private promoteDialogService: PromoteDialogService) {

  }
  subscription!: Subscription;
  overlayPoly!:string;
  ngAfterViewInit() {
    this.game.board.controller = this;
    this.viewBox=HexHelper.getHexViewBox(this.size,this.game.board.rotation,this.game.board.territories);
    this.overlayPoly=HexHelper.getOverlayPolygon(this.size,this.game.board.territories,false);

    this.cd.detectChanges();
  }
  get perspectiveTeam() {
    return this.game.findTeam(this.game.perspective);
  }
  get opposingTeam() {
    return this.perspectiveTeam.getNext(true)!;
  }
  territoryMouseup(territory: Territory) {
    this.territoryUp.next(territory);
  }
  territoryMousedown(fromTerritory: Territory) {
    if (this.game.over || !fromTerritory.piece || !fromTerritory.piece.isUs() || !fromTerritory.piece.team.myTurn)
      return;
    const target = <SVGElement>fromTerritory.piece.elementRef!.nativeElement;
    if (!target)
      return;
    this.game.beginningMove();
    this.game.save();
    this.boardService.moveToTopOfStack(target);
    const startRect = new Rectangle2D(target.getBoundingClientRect());
    const start = startRect.center();
    //const start = new Point2D(md.clientX, md.clientY);
    const startTrans = this.boardService.getTranslation(target);
    this.mousemove
      .pipe(map((mm) => {
        mm.preventDefault();
        return (new Point2D(mm.clientX, mm.clientY)).subtract(start);
      }))
      .pipe(takeUntil(race(this.mouseup, this.territoryUp)
        .pipe(map(toTerritory => {
          (toTerritory ? fromTerritory.piece!.attemptMove(toTerritory) : Promise.resolve(false)).then(suceeded => {
            if (suceeded)
              this.game.incrementTurn();
            else {
              this.game.restore();
              this.boardService.setTranslation(target,startTrans);
            }
          });
        }))
      ))
      .pipe(switchMap(pos => {
        return this.boardService.moveToRect(target, startRect.clone().translate(pos).constrainTo(this.boardArea.nativeElement.getBoundingClientRect()), 0);
      })).subscribe(() => {
        ;
      });
  }
  boardTransform() {
    let transform = "";
    const angle = this.game.board.rotation;
    transform += " translate(" + (-this.viewBox.x) + " " + (-this.viewBox.y) + ")";
    if (angle)
      transform += " rotate(" + angle + " " + (this.viewBox.width / 2) + " " + (this.viewBox.height / 2) + ")";
    return transform;
  }
  territoryTransform(territory: Territory, unrotate?: boolean): string {
    const offset=HexHelper.getHexOffset(this.size,territory.position);
    let transform = "";
    transform += " translate(" + offset.x + " " + offset.y + ")";
    const angle = territory.board.rotation;
    if (unrotate && angle)
      transform += " rotate(-" + angle + ")";
    return transform;
  };
  classes(territory: Territory) {
    return {
      'movable': territory.piece && territory.piece.canMove(),
      'white': (territory.position.x + territory.position.y) % 3 === 1,
      'grey': (territory.position.x + territory.position.y) % 3 === 2,
      'black': (territory.position.x + territory.position.y) % 3 === 0,
      'dark': territory.dark
    };
  }
  openPromote(teamColor: string): Promise<PieceChar | undefined> {
    return new Promise((resolve, reject) => {
      this.promoteDialogService.open(this.dialogArea, { pieceLibrary: this.pieceLibrary, teamColor: teamColor },this.dialogOverlay)
        .afterClosed()
        .subscribe(value => {
          resolve(value);
        }, (err: any) => {
          reject(err);
        });
    });
  }
}
