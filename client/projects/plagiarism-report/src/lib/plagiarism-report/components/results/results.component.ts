import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { combineLatest } from 'rxjs';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { Match, ResultPreview } from '../../models';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { fadeIn, listFade } from '../../utils/animations';
import { ResultsFilterDialogComponent } from '../results-filter-dialog/results-filter-dialog.component';
import { ResultsSettingsDialogComponent } from '../results-settings-dialog/results-settings-dialog.component';

@Component({
	selector: 'cr-results',
	templateUrl: './results.component.html',
	styleUrls: ['./results.component.scss'],
	animations: [fadeIn, listFade],
})
export class ResultsComponent implements OnInit, OnDestroy {
	constructor(
		private reportService: ReportService,
		private dialogService: MatDialog,
		private layoutService: LayoutMediaQueryService,
		private matchService: MatchService
	) {}

	@HostBinding('class.active') isActive = false;
	@HostBinding('class.mobile') isMobile = false;

	public previews: ResultPreview[];
	public focusedMatch: Match;
	public hiddenResults: string[] = [];

	public get visibleResults() {
		return this.focusedMatch.ids.filter(id => !this.hiddenResults.includes(id));
	}

	/**
	 * Displays the results filter dialog modal
	 */
	openFilterDialog() {
		this.dialogService.open(ResultsFilterDialogComponent, this.reportService.config.dialogConfig);
	}

	/**
	 * Displays the settings dialog modal
	 */
	openSettingsDialog() {
		this.dialogService.open(ResultsSettingsDialogComponent, this.reportService.config.dialogConfig);
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
		const { originalText$, originalHtml$ } = this.matchService;
		filteredPreviews$
			.pipe(untilDestroy(this))
			.subscribe(previews => (this.previews = previews.sort((a, b) => b.matchedWords - a.matchedWords)));

		combineLatest([originalText$, originalHtml$, contentMode$])
			.pipe(untilDestroy(this))
			.subscribe(([text, html, mode]) => (this.focusedMatch = mode === 'text' ? text && text.match : html));

		hiddenResults$.pipe(untilDestroy(this)).subscribe(ids => (this.hiddenResults = ids));
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(isMobile => (this.isMobile = isMobile));
	}

	/**
	 * Removes the focus of the currently focused match
	 */
	clearFocusedMatch() {
		this.matchService.setSourceHtmlMatch(null);
		this.matchService.setSourceTextMatch(null);
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
