/* tslint:disable */

import { Component } from '@angular/core';
import { ScanResultComponentBase, ScanResult } from 'projects/plagiarism-report/src/public-api';

@Component({
	selector: 'app-scan-result',
	templateUrl: './scan-result.component.html',
	styleUrls: ['./scan-result.component.scss']
})
export class ScanResultComponent implements ScanResultComponentBase {
	result: ScanResult;
	constructor() { }

	setResult(result: ScanResult) {
		this.result = result;
	}
}
