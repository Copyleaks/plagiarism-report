import { Component, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CopyleaksReportOptions, ResultPreview, ScanSource, ResultAccess } from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { CopyleaksTextConfig } from '../../models/CopyleaksTextConfig';
import { ReportService } from '../../services/report.service';
import { COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN } from '../../utils/constants';

@Component({
	selector: 'cr-result-card',
	templateUrl: './result-card.component.html',
	styleUrls: ['./result-card.component.scss'],
	providers: [],
})
export class ResultCardComponent implements OnInit, OnDestroy {
	@HostBinding('class.mat-elevation-z3')
	public readonly elevation = true;
	@Input()
	public preview: ResultPreview;
	public result: ScanResult;
	public source: ScanSource;
	public loading = true;
	public access: ResultAccess = ResultAccess.requirePayment;
	public resultAccess = ResultAccess;
	public options: CopyleaksReportOptions;
	public similarWords$: Observable<number>;
	constructor(
		private reportService: ReportService,
		@Inject(COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN)
		public messages: CopyleaksTextConfig
	) { }

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
	ngOnDestroy() { }
}
