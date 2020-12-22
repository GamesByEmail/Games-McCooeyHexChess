import { NgModule } from '@angular/core';

import { SvgDialogModule, SvgDialogService } from '@packageforge/svg-dialog';
import { TemplateProjectionModule } from '@packageforge/template-projection';
import { PromoteDialogComponent } from './promote-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    TemplateProjectionModule,
    MatButtonModule,
    SvgDialogModule
  ],
  declarations: [
    PromoteDialogComponent,
  ],
  entryComponents: [
    PromoteDialogComponent,
  ],
  providers: [
    SvgDialogService
  ]
})
export class PromoteDialogModule {}
