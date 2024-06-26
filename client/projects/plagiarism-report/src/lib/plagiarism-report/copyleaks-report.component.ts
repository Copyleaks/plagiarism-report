import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	Renderer2,
	SimpleChanges,
} from '@angular/core';

import packageInfo from '../report-version.json';
import { untilDestroy } from '../shared/operators/untilDestroy';
import { CopyleaksReportConfig, ViewMode } from './models/CopyleaksReportConfig';
import { CopyleaksService } from './services/copyleaks.service';
import { DirectionService } from './services/direction.service';
import { HighlightService } from './services/highlight.service';
import { MatchService } from './services/match.service';
import { ReportService } from './services/report.service';
import { StatisticsService } from './services/statistics.service';
import { EReportViewModel, ViewModeService } from './services/view-mode.service';
import { ECRPackageProducts } from './models';
import { IconRegistryService } from './services/icon-registry.service';
@Component({
	selector: 'cr-copyleaks-report',
	templateUrl: 'copyleaks-report.component.html',
	styleUrls: ['./copyleaks-report.component.scss'],
	animations: [],
	providers: [ReportService, StatisticsService, MatchService, HighlightService, ViewModeService, IconRegistryService],
})
export class CopyleaksReportComponent implements OnInit, OnDestroy, OnChanges {
	@HostBinding('class.mat-typography')
	public readonly typography = true;

	@HostBinding('class.one-to-one') get isOneToOne() {
		return this.viewMode === 'one-to-one';
	}

	@HostBinding('class.one-to-many') get isOneToMany() {
		return this.viewMode === 'one-to-many';
	}

	@Input()
	public config: CopyleaksReportConfig = {};
	@Input()
	public isPDFDownloading = false;
	@Input()
	public hideCreationTime = false;
	@Input()
	public showProductUpgradeButton = false;
	@Input()
	public showAIContentProperty = true;

	@Output()
	public configChange = new EventEmitter<CopyleaksReportConfig>();
	@Output()
	public help = new EventEmitter<MouseEvent>();
	@Output()
	public share = new EventEmitter<MouseEvent>();
	@Output()
	public download = new EventEmitter<MouseEvent>();
	@Output()
	public propertiesExpandChange = new EventEmitter<boolean>();
	@Output()
	public upgradePlan = new EventEmitter<number>();
	@Output()
	public upgradeProduct = new EventEmitter<ECRPackageProducts>();

	@Input()
	public dir: 'rtl' | 'ltr' = 'ltr';

	public viewMode: ViewMode;
	public resultsActive = false;
	public aaa = false;
	public hasResultsOverlay = false;

	public reportViewMode: EReportViewModel;
	public eReportViewModel = EReportViewModel;

	constructor(
		private reportService: ReportService,
		private copyleaksService: CopyleaksService,
		private viewModeService: ViewModeService,
		private directionService: DirectionService,
		public el: ElementRef,
		renderer: Renderer2,
		private iconRegistryService: IconRegistryService
	) {
		renderer.setAttribute(el.nativeElement, 'plagiarism-report-version', packageInfo.version);
	}

	/**
	 * life-cycle method
	 * Initialize the component view mode
	 */
	ngOnInit() {
		this.directionService.setDir(this.dir);
		const { viewMode$, helpClick$, shareClick$, downloadClick$, configChange$, planUpgradeEvent$ } = this.reportService;
		viewMode$.pipe(untilDestroy(this)).subscribe(viewMode => (this.viewMode = viewMode));
		helpClick$.pipe(untilDestroy(this)).subscribe(data => this.help.emit(data));
		shareClick$.pipe(untilDestroy(this)).subscribe(data => this.share.emit(data));
		downloadClick$.pipe(untilDestroy(this)).subscribe(data => this.download.emit(data));
		planUpgradeEvent$.pipe(untilDestroy(this)).subscribe(data => this.upgradePlan.emit(data));
		configChange$.pipe(untilDestroy(this)).subscribe(config => this.configChange.emit(config));
		this.hasResultsOverlay = !!this.config && !!this.config.resultsOverlayComponent;

		this.viewModeService.reportViewMode$
			.pipe(untilDestroy(this))
			.subscribe(viewMode => (this.reportViewMode = viewMode));

		this.iconRegistryService.init();
	}

	/**
	 * Life-cycle method
	 * Handles `changes` for input properties
	 * @param changes the changes
	 */
	ngOnChanges(changes: SimpleChanges) {
		if (changes.config) {
			this.copyleaksService.setConfig({ ...changes.config.currentValue });
			this.hasResultsOverlay = !!changes.config.currentValue && !!changes.config.currentValue.resultsOverlayComponent;
		}
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

@Component({
	selector: 'cr-custom-report-action',
	template: '<cr-expansion-panel-menu-item><ng-content></ng-content></cr-expansion-panel-menu-item>',
})
export class CustomReportActionComponent {}
