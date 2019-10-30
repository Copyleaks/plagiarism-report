import {
	Component,
	EventEmitter,
	HostBinding,
	OnDestroy,
	OnInit,
	Output,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { untilDestroy } from '../shared/operators/untilDestroy';
import { ReportDownloadEvent, ReportShareEvent } from './models';
import { ViewMode } from './models/CopyleaksReportConfig';
import { LayoutMediaQueryService } from './services/layout-media-query.service';
import { ReportService } from './services/report.service';
import { expandAnimation, fadeIn } from './utils/animations';
import { StatisticsService } from './services/statistics.service';
import { MatchService } from './services/match.service';
import { HighlightService } from './services/highlight.service';

@Component({
	selector: 'cr-copyleaks-report',
	templateUrl: 'copyleaks-report.component.html',
	styleUrls: ['./copyleaks-report.component.scss'],
	animations: [expandAnimation, fadeIn],
})
export class CopyleaksReportComponent implements OnInit, OnDestroy, OnChanges {
	constructor(
		private reportService: ReportService,
		private statisticsService: StatisticsService,
		private matchService: MatchService,
		private highlightService: HighlightService,
		private layoutService: LayoutMediaQueryService
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

	@Input()
	public scanId: string;

	@Output() download = new EventEmitter<ReportDownloadEvent>();
	@Output() share = new EventEmitter<ReportShareEvent>();

	resultsActive = false;

	/**
	 * Life-cycle method
	 * Check if scanId changed and reset services state
	 * @param changes changes of the component
	 */
	ngOnChanges(changes: SimpleChanges) {
		if (changes.scanId && changes.scanId.currentValue) {
			this.reportService.initialize();
			this.statisticsService.initialize();
			this.matchService.initialize();
			this.highlightService.initialize();
		}
	}

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
	ngOnDestroy() {
		this.reportService.initialize();
	}
}
