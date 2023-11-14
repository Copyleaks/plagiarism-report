import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CopyleaksReportModule } from 'projects/plagiarism-report/src/public-api';
import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';

@NgModule({
	declarations: [ReportComponent],
	imports: [
		CommonModule,
		MatIconModule,
		MatListModule,
		MatButtonModule,
		ReportRoutingModule,
		CopyleaksReportModule.forRoot({ contentMode: 'text', share: true, settings: true, download: false }),
	],
})
export class ReportModule {}
