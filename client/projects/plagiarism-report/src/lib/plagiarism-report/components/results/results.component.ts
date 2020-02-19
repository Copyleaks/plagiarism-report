import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { combineLatest } from 'rxjs';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { Match, ResultPreview } from '../../models';
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
	constructor(
		private copyleaksService: CopyleaksService,
		private reportService: ReportService,
		private dialogService: MatDialog,
		private layoutService: LayoutMediaQueryService,
		private highlightService: HighlightService,
		private cd: ChangeDetectorRef
	) { }

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
	ngOnDestroy() { }
}
