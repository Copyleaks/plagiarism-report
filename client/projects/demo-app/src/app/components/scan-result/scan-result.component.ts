/* tslint:disable */

import { Component, OnInit } from '@angular/core';
import { ResultCardComponent } from 'projects/plagiarism-report/src/lib/plagiarism-report/components/result-card/result-card.component';
import { ResultPreviewComponentBase, ResultPreviewBase, ResultItem, EResultPreviewType } from 'projects/plagiarism-report/src/public-api';

@Component({
	selector: 'app-scan-result',
	templateUrl: './scan-result.component.html',
	styleUrls: ['./scan-result.component.scss']
})
export class ScanResultComponent implements ResultPreviewComponentBase, OnInit {
	preview: ResultPreviewBase;
	loading: boolean = true;
	result: ResultItem;
	parent: ResultCardComponent;
	eResultPreviewType = EResultPreviewType;
	dir: string = 'ltr';
	isSameAuthor: boolean = false;

	constructor() { }

	ngOnInit() {
	}

	setPreview(preview: ResultPreviewBase) {
		this.preview = preview;
		this.isSameAuthor = preview.metadata?.author == "Contributors to Wikimedia projects";
	}
	isLoading(isLoading: boolean) {
		this.loading = isLoading;
	}
	setResult(result: ResultItem) {
		this.result = result;
	}
	setParentRef(parent: ResultCardComponent) {
		this.parent = parent;
	}
	onTitleClick() {
		this.parent.onTitleClick();
	}
}
