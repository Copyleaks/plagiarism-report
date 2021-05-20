import {
	ChangeDetectorRef,
	Component,
	HostBinding,
	OnDestroy,
	OnInit,
	ComponentFactoryResolver,
	ViewChild,
	ViewContainerRef,
	ElementRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { Match, ResultPreview, CopyleaksReportConfig } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { ReportService } from '../../services/report.service';
import { ResultsFilterDialogComponent } from '../results-filter-dialog/results-filter-dialog.component';
import { IMAGES } from '../../assets/images';
import { CopyleaksService } from '../../services/copyleaks.service';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';
import { DirectionService } from '../../services/direction.service';
import { delay, filter } from 'rxjs/operators';
@Component({
	selector: 'cr-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.scss'],
	animations: [],
})
export class ResultsComponent implements OnInit, OnDestroy {
	@ViewChild('vcr', { read: ViewContainerRef })
	vcr: ViewContainerRef;
	resultsOverlayComponentInstance: any;
	hasOverlay = false;
	translations: CopyleaksTranslations;
	isLoadingResults = true;
	isComponentDisplayed = true;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private copyleaksService: CopyleaksService,
		private reportService: ReportService,
		private dialogService: MatDialog,
		private layoutService: LayoutMediaQueryService,
		private highlightService: HighlightService,
		private translationsService: CopyleaksTranslateService,
		private directionService: DirectionService,
		private cd: ChangeDetectorRef,
		private elementRef: ElementRef<HTMLElement>
	) {}

	@HostBinding('class.active') isActive = false;
	@HostBinding('class.mobile') isMobile = false;

	public previews: ResultPreview[];
	public focusedMatch: Match;
	public hiddenResults: string[] = [];
	public readonly plagFreeImg = IMAGES.PLAGIARISM_FREE_PNG;
	public get visibleResults() {
		return this.focusedMatch.ids.filter(id => !this.hiddenResults.includes(id));
	}

	/**
	 * Displays the results filter dialog modal
	 */
	openFilterDialog() {
		this.dialogService.open<ResultsFilterDialogComponent, ReportService>(ResultsFilterDialogComponent, {
			direction: this.directionService.dir,
			data: this.reportService,
		});
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - filtered match previews
	 * - currently selected match
	 * - user configured hidden results
	 * - layout changes
	 */
	ngOnInit() {
		this.translations = this.translationsService.translations;
		const { filteredPreviews$, hiddenResults$, contentMode$, results$ } = this.reportService;
		const { originalText$, originalHtml$ } = this.highlightService;
		combineLatest([originalText$, originalHtml$, contentMode$])
			.pipe(
				untilDestroy(this),
				filter(_ => this.isComponentDisplayed)
			)
			.subscribe(([text, html, content]) => {
				this.focusedMatch = content === 'text' ? text && text.match : html;
				this.cd.detectChanges();
			});

		filteredPreviews$.pipe(untilDestroy(this)).subscribe(previews => {
			this.previews = this.copyleaksService.sortScanResults(previews);
		});

		hiddenResults$.pipe(untilDestroy(this)).subscribe(ids => {
			this.hiddenResults = ids;
			this.highlightService.clear();
			this.highlightService.clearAllMatchs();
		});
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(isMobile => (this.isMobile = isMobile));

		this.copyleaksService.onReportConfig$.pipe(untilDestroy(this)).subscribe(config => {
			this.checkAndAddOverlay(config);
		});

		results$.pipe(untilDestroy(this), delay(1000)).subscribe(results => {
			if (results?.length === this.previews?.length) {
				this.isLoadingResults = false;
			}
		});

		this.listenForDisplayChange();
	}

	/**
	 * listener for display change
	 */
	private listenForDisplayChange() {
		const observer = new MutationObserver(() => {
			this.isComponentDisplayed = this.elementRef?.nativeElement?.style?.display !== 'none';
		});

		const target = this.elementRef.nativeElement;
		observer.observe(target, { attributes: true, attributeFilter: ['style'] });
	}

	/**
	 * check if the results overlay component was passed
	 */
	private checkAndAddOverlay(config: CopyleaksReportConfig) {
		if (config && config.resultsOverlayComponent) {
			this.hasOverlay = true;
			if (!this.resultsOverlayComponentInstance) {
				const factory = this.componentFactoryResolver.resolveComponentFactory(config.resultsOverlayComponent);
				setTimeout(() => {
					if (!this.resultsOverlayComponentInstance) {
						const resultsOverlayComponentInstance = this.vcr?.createComponent(factory);
						if (resultsOverlayComponentInstance) {
							this.resultsOverlayComponentInstance = resultsOverlayComponentInstance;
						}
					}
				}, 100);
			}
		} else {
			this.hasOverlay = false;
		}
	}

	/**
	 * Removes the focus of the currently focused match
	 */
	clearFocusedMatch() {
		this.highlightService.setOriginalTextMatch(null);
		this.highlightService.setOriginalHtmlMatch(null);
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
