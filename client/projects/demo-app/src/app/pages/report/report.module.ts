import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';
import { CopyleaksReportModule } from 'projects/plagiarism-report/src/public-api';

@NgModule({
	declarations: [ReportComponent],
	imports: [
		CommonModule,
		ReportRoutingModule,
		CopyleaksReportModule.forRoot({ contentMode: 'text', share: true, download: false }),
	],
})
export class ReportModule {}
