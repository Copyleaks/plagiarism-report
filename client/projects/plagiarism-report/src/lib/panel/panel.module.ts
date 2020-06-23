import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
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
