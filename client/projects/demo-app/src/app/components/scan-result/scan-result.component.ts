/* tslint:disable */

import { Component } from '@angular/core';
import { ResultPreviewComponentBase, ResultPreviewBase, ResultItem } from 'projects/plagiarism-report/src/public-api';

@Component({
	selector: 'app-scan-result',
	templateUrl: './scan-result.component.html',
	styleUrls: ['./scan-result.component.scss']
})
export class ScanResultComponent implements ResultPreviewComponentBase {
	preview: ResultPreviewBase;
	loading: boolean = true;
	result: ResultItem;

	constructor() { }

	setPreview(preview: ResultPreviewBase) {
		this.preview = preview;
	}
	isLoading(isLoading: boolean) {
		this.loading = isLoading;
	}
	setResult(result: ResultItem) {
		this.result = result;
	}
}
