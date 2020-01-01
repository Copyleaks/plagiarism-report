import { Component, HostBinding, Input, OnInit } from '@angular/core';

import { ResultPreview, ScanSource } from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { ReportService } from '../../services/report.service';
import { combineLatest } from 'rxjs';

@Component({
	selector: 'cr-result-card',
	templateUrl: './result-card.component.html',
	styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit {
	@HostBinding('class.mat-elevation-z3')
	public readonly elevation = true;
	@Input()
	public preview: ResultPreview;
	public result: ScanResult;
	public source: ScanSource;
	public loading = true;
	constructor(private reportService: ReportService) {}

	/**
	 * Card click handler, will update the suspect id and switch to one-to-one view mode
	 */
	onTitleClick() {
		this.reportService.configure({ viewMode: 'one-to-one', suspectId: this.preview.id });
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - the scan result associated with this card
	 */
	ngOnInit() {
		if (this.preview) {
			const result$ = this.reportService.findResultById$(this.preview.id);
			const { source$ } = this.reportService;
			combineLatest([result$, source$]).subscribe(([result, source]) => {
				this.source = source;
				this.result = result.result;
				this.loading = false;
			});
		}
	}
}
