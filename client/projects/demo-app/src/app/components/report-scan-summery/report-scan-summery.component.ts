import { Component, OnInit } from '@angular/core';
import { IScanSummeryComponent } from 'projects/plagiarism-report/src/lib/plagiarism-report/models/ScanProperties';
import { CompleteResult } from 'projects/plagiarism-report/src/public-api';

@Component({
	selector: 'app-report-scan-summery',
	templateUrl: './report-scan-summery.component.html',
	styleUrls: ['./report-scan-summery.component.scss'],
})
export class ReportScanSummeryComponent implements OnInit, IScanSummeryComponent {
	completeResult: CompleteResult;

	constructor() {}
	/**
	 * Life-cycle method
	 */
	ngOnInit() {}

	/**
	 * set the complete result that passed from the report
	 */
	setCompleteResult(result: CompleteResult) {
		this.completeResult = result;
	}
}
