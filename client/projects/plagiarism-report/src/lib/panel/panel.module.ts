import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule, MatIconModule, MatButtonModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
	PanelComponent,
	PanelActionsComponent,
	PanelBodyComponent,
	PanelHeaderComponent,
	PanelActionComponent,
} from './panel.component';

@NgModule({
	declarations: [PanelComponent, PanelHeaderComponent, PanelActionsComponent, PanelActionComponent, PanelBodyComponent],
	imports: [CommonModule, FlexLayoutModule, MatIconModule, MatDividerModule, MatButtonModule],
	exports: [PanelComponent, PanelActionsComponent, PanelActionComponent, PanelHeaderComponent, PanelBodyComponent],
})
export class PanelModule {}
