import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
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
