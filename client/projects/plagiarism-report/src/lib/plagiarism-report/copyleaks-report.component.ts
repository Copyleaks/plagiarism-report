import { Component, EventEmitter, HostBinding, OnDestroy, OnInit, Output } from '@angular/core';
import { untilDestroy } from '../shared/operators/untilDestroy';
import { ReportDownloadEvent, ReportShareEvent } from './models';
import { ViewMode } from './models/CopyleaksReportConfig';
import { LayoutMediaQueryService } from './services/layout-media-query.service';
import { ReportService } from './services/report.service';
import { expandAnimation, fadeIn } from './utils/animations';
import { HighlightService } from './services/highlight.service';

@Component({
	selector: 'cr-copyleaks-report',
	templateUrl: 'copyleaks-report.component.html',
	styleUrls: ['./copyleaks-report.component.scss'],
	animations: [expandAnimation, fadeIn],
})
export class CopyleaksReportComponent implements OnInit, OnDestroy {
	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		highlight: HighlightService
	) {}
	@HostBinding('class.one-to-one') get isOneToOne() {
		return this.view === 'one-to-one';
	}
	@HostBinding('class.one-to-many') get isOneToMany() {
		return this.view === 'one-to-many';
	}
	public isMobile: boolean;
	public zoom = 2;
	public view: ViewMode;

	@Output() download = new EventEmitter<ReportDownloadEvent>();
	@Output() share = new EventEmitter<ReportShareEvent>();

	resultsActive = false;
	/**
	 * life-cycle method
	 * Initialize the component view mode
	 */
	ngOnInit() {
		const { viewMode$, downloadClick$, shareClick$ } = this.reportService;
		viewMode$.pipe(untilDestroy(this)).subscribe(value => (this.view = value));
		downloadClick$.pipe(untilDestroy(this)).subscribe(data => this.download.emit(data));
		shareClick$.pipe(untilDestroy(this)).subscribe(data => this.share.emit(data));
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
