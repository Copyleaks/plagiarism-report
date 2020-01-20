import { Component, HostBinding, Input, OnInit, OnDestroy } from '@angular/core';

import { ResultPreview, ScanSource, CopyleaksReportOptions } from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { ReportService } from '../../services/report.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
	selector: 'cr-result-card',
	templateUrl: './result-card.component.html',
	styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit, OnDestroy {
	@HostBinding('class.mat-elevation-z3')
	public readonly elevation = true;
	@Input()
	public preview: ResultPreview;
	public result: ScanResult;
	public source: ScanSource;
	public loading = true;
	public options: CopyleaksReportOptions;
	public similarWords$: Observable<number>;
	constructor(private reportService: ReportService) {}

	/**
	 * Card click handler, will update the suspect id and switch to one-to-one view mode
	 */
	onTitleClick() {
		if (this.result) {
			this.reportService.configure({ viewMode: 'one-to-one', suspectId: this.preview.id });
		}
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - the scan result associated with this card
	 */
	ngOnInit() {
		if (!this.preview) {
			return;
		}
		const result$ = this.reportService.findResultById$(this.preview.id);
		const { source$, options$ } = this.reportService;
		combineLatest([result$, source$]).subscribe(([result, source]) => {
			this.source = source;
			this.result = result.result;
			this.loading = false;
		});
		this.similarWords$ = combineLatest([result$, options$]).pipe(
			map(([result, options]) => {
				if (result && result.result && options) {
					const { showIdentical, showMinorChanges, showRelated } = options;
					const { identical, minorChanges, relatedMeaning } = result.result.statistics;
					return (
						(showIdentical ? identical : 0) + (showMinorChanges ? minorChanges : 0) + (showRelated ? relatedMeaning : 0)
					);
				}
				return this.preview.matchedWords;
			})
		);
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
