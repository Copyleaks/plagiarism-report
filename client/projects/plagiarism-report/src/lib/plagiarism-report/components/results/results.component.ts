import {
	ChangeDetectorRef,
	Component,
	HostBinding,
	OnDestroy,
	OnInit,
	ComponentFactoryResolver,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { combineLatest } from 'rxjs';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { Match, ResultPreview, CopyleaksReportConfig } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { ReportService } from '../../services/report.service';
import { ResultsFilterDialogComponent } from '../results-filter-dialog/results-filter-dialog.component';
import { IMAGES } from '../../assets/images';
import { CopyleaksService } from '../../services/copyleaks.service';
@Component({
	selector: 'cr-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.scss'],
	animations: [],
})
export class ResultsComponent implements OnInit, OnDestroy {
	@ViewChild('vcr', { read: ViewContainerRef, static: false })
	vcr: ViewContainerRef;
	resultsOverlayComponentInstance: any;
	hasOverlay = false;
	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private copyleaksService: CopyleaksService,
		private reportService: ReportService,
		private dialogService: MatDialog,
		private layoutService: LayoutMediaQueryService,
		private highlightService: HighlightService,
		private cd: ChangeDetectorRef
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
		const { filteredPreviews$, hiddenResults$, contentMode$ } = this.reportService;
		const { originalText$, originalHtml$ } = this.highlightService;
		combineLatest([originalText$, originalHtml$, contentMode$])
			.pipe(untilDestroy(this))
			.subscribe(([text, html, content]) => {
				this.focusedMatch = content === 'text' ? text && text.match : html;
				this.cd.detectChanges();
			});

		filteredPreviews$.pipe(untilDestroy(this)).subscribe(previews => {
			this.previews = this.copyleaksService.sortScanResults(previews);
		});

		hiddenResults$.pipe(untilDestroy(this)).subscribe(ids => (this.hiddenResults = ids));
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(isMobile => (this.isMobile = isMobile));

		this.copyleaksService.onReportConfig$.pipe(untilDestroy(this)).subscribe(config => {
			this.checkAndAddOverlay(config);
		});
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
					this.resultsOverlayComponentInstance = this.vcr.createComponent(factory);
				});
			}
		} else {
			this.resultsOverlayComponentInstance = null;
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
