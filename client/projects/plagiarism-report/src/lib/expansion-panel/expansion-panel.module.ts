import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	ExpansionPanelComponent,
	ExpansionPanelTitleComponent,
	ExpansionPanelMenuComponent,
	ExpansionPanelMenuItemComponent,
	ExpansionPanelBodyComponent,
} from './expansion-panel.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDividerModule, MatIconModule, MatRippleModule, MatButtonModule } from '@angular/material';

@NgModule({
	declarations: [
		ExpansionPanelComponent,
		ExpansionPanelTitleComponent,
		ExpansionPanelMenuComponent,
		ExpansionPanelMenuItemComponent,
		ExpansionPanelBodyComponent,
	],
	imports: [CommonModule, MatDividerModule, FlexLayoutModule, MatRippleModule, MatButtonModule, MatIconModule],
	exports: [
		ExpansionPanelComponent,
		ExpansionPanelTitleComponent,
		ExpansionPanelMenuComponent,
		ExpansionPanelMenuItemComponent,
		ExpansionPanelBodyComponent,
	],
})
export class ExpansionPanelModule {}
