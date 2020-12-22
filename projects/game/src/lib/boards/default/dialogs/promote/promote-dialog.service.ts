import { Injectable, ViewContainerRef, ElementRef } from '@angular/core';
import { SvgDialogService, SvgDialogRef } from '@packageforge/svg-dialog';
import { PieceChar } from '../../../../game/piece';
import { PromoteDialogComponent } from './promote-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PromoteDialogService {

  constructor(private svgDialogService: SvgDialogService) { }

  open(outlet: ViewContainerRef, data?: any, overlay?: ElementRef<SVGElement>): SvgDialogRef<PieceChar | undefined> {
    return this.svgDialogService.open<PieceChar | undefined>(outlet, PromoteDialogComponent, data, overlay);
  }
}
