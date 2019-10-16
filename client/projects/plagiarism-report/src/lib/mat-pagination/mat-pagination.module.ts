import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatButtonModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatPaginationComponent } from './mat-pagination.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [MatPaginationComponent],
	imports: [
		CommonModule,
		FormsModule,
		MatIconModule,
		FlexLayoutModule,
		MatButtonModule,
		MatInputModule,
		MatTooltipModule,
	],
	exports: [MatPaginationComponent],
})
export class MatPaginationModule {}
