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
import { ViewMode, CopyleaksReportConfig } from './models/CopyleaksReportConfig';
import { HighlightService } from './services/highlight.service';
import { LayoutMediaQueryService } from './services/layout-media-query.service';
import { MatchService } from './services/match.service';
import { ReportService } from './services/report.service';
import { StatisticsService } from './services/statistics.service';
import { expandAnimation, fadeIn } from './utils/animations';
import { CopyleaksService } from './services/copyleaks.service';

@Component({
	selector: 'cr-copyleaks-report',
	templateUrl: 'copyleaks-report.component.html',
	styleUrls: ['./copyleaks-report.component.scss'],
	animations: [expandAnimation, fadeIn],
	providers: [ReportService, StatisticsService, MatchService, HighlightService],
})
export class CopyleaksReportComponent implements OnInit, OnDestroy, OnChanges {
	@HostBinding('class.one-to-one') get isOneToOne() {
		return this.view === 'one-to-one';
	}
	@HostBinding('class.one-to-many') get isOneToMany() {
		return this.view === 'one-to-many';
	}

	public isMobile: boolean;
	public view: ViewMode;
	public resultsActive = false;

	@Input()
	public config: CopyleaksReportConfig;

	@Output()
	public download = new EventEmitter<ReportDownloadEvent>();

	@Output()
	public share = new EventEmitter<ReportShareEvent>();

	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private copyleaksService: CopyleaksService
	) {}

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
	 * Handles `changes` for input properties
	 * @param changes the changes
	 */
	ngOnChanges(changes: SimpleChanges) {
		this.copyleaksService.setConfig(changes.config.currentValue);
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
