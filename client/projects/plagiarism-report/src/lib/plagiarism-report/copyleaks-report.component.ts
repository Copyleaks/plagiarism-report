import {
	Component,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
} from '@angular/core';
import { untilDestroy } from '../shared/operators/untilDestroy';
import { CopyleaksReportConfig, ViewMode } from './models/CopyleaksReportConfig';
import { CopyleaksService } from './services/copyleaks.service';
import { HighlightService } from './services/highlight.service';
import { LayoutMediaQueryService } from './services/layout-media-query.service';
import { MatchService } from './services/match.service';
import { ReportService } from './services/report.service';
import { StatisticsService } from './services/statistics.service';
import { expandAnimation, fadeIn } from './utils/animations';

@Component({
	selector: 'cr-copyleaks-report',
	templateUrl: 'copyleaks-report.component.html',
	styleUrls: ['./copyleaks-report.component.scss'],
	animations: [expandAnimation, fadeIn],
	providers: [ReportService, StatisticsService, MatchService, HighlightService],
})
export class CopyleaksReportComponent implements OnInit, OnDestroy, OnChanges {
	@HostBinding('class.one-to-one') get isOneToOne() {
		return this.viewMode === 'one-to-one';
	}
	@HostBinding('class.one-to-many') get isOneToMany() {
		return this.viewMode === 'one-to-many';
	}

	public isMobile: boolean;
	public viewMode: ViewMode;
	public resultsActive = false;

	@Input()
	public config: CopyleaksReportConfig;

	@Output()
	public configChange = new EventEmitter<CopyleaksReportConfig>();

	@Output()
	public help = new EventEmitter<MouseEvent>();

	@Output()
	public share = new EventEmitter<MouseEvent>();

	@Output()
	public download = new EventEmitter<MouseEvent>();

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
		const { viewMode$, helpClick$, shareClick$, downloadClick$, configChange$ } = this.reportService;
		viewMode$.pipe(untilDestroy(this)).subscribe(viewMode => (this.viewMode = viewMode));
		helpClick$.pipe(untilDestroy(this)).subscribe(data => this.help.emit(data));
		shareClick$.pipe(untilDestroy(this)).subscribe(data => this.share.emit(data));
		downloadClick$.pipe(untilDestroy(this)).subscribe(data => this.download.emit(data));
		configChange$.pipe(untilDestroy(this)).subscribe(config => this.configChange.emit(config));
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
	}

	/**
	 * Life-cycle method
	 * Handles `changes` for input properties
	 * @param changes the changes
	 */
	ngOnChanges(changes: SimpleChanges) {
		this.copyleaksService.setConfig({ ...changes.config.currentValue });
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
