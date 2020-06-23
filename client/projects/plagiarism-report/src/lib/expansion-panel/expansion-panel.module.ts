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
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

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
