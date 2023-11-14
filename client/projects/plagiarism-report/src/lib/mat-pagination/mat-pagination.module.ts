import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
