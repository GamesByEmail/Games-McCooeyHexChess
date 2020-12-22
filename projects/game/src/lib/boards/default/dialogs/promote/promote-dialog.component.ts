import { Component, Inject } from '@angular/core';
import { SvgDialogRef, SVG_DIALOG_DATA } from '@packageforge/svg-dialog';
import { PieceChar } from '../../../../game/piece';

@Component({
  selector: "svg[gbe-games-mccooeyhexchess-promote-dialog][xmlns=http://www.w3.org/2000/svg]",
  templateUrl: './promote-dialog.component.html',
  styleUrls: ['./promote-dialog.component.css']
})
export class PromoteDialogComponent {
  constructor(public dialogRef: SvgDialogRef<PieceChar | undefined>, @Inject(SVG_DIALOG_DATA) public data: any) {
  }
  close(value?: PieceChar) {
    this.dialogRef.close(value);
  }
  dialogSize={
    width:400,
    height:170
  };
}
