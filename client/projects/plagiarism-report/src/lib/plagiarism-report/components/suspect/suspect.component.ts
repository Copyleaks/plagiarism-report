import { Component, OnDestroy, OnInit } from '@angular/core';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { MatchType, SlicedMatch } from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { ContentMode, DirectionMode } from '../../models/CopyleaksReportConfig';
import { HighlightService } from '../../services/highlight.service';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { ReportService } from '../../services/report.service';
import { fadeIn } from '../../utils/animations';
import { truthy } from '../../utils/operators';
import { TEXT_FONT_SIZE_UNIT, MAX_TEXT_ZOOM, MIN_TEXT_ZOOM } from '../../utils/constants';
import { MatchService } from '../../services/match.service';

@Component({
	selector: 'cr-suspect',
	templateUrl: './suspect.component.html',
	styleUrls: ['./suspect.component.scss'],
	animations: [fadeIn],
})
export class SuspectComponent implements OnInit, OnDestroy {
	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private matchService: MatchService,
		private highlightService: HighlightService
	) {}
	readonly MatchType = MatchType;
	public isMobile = false;
	public zoom = 1;
	public direction: DirectionMode = 'ltr';
	public currentPage = 1;
	public matches: SlicedMatch[][];
	public suspect: ScanResult;
	public content: ContentMode;

	public get hasHtml(): boolean {
		return this.suspect && this.suspect.html && !!this.suspect.html.value;
	}

	public get isHtml(): boolean {
		return this.content === 'html';
	}

	get pages(): number[] {
		return this.suspect.text.pages.startPosition;
	}

	/**
	 * toggles between `text` and `html` content mode
	 */
	toggleContent() {
		this.reportService.setContentMode(this.isHtml ? 'text' : 'html');
	}

	/**
	 * exits one-to-one mode and goes to one-to-many mode
	 */
	goBack() {
		this.reportService.setSuspectId(null);
		this.matchService.setSourceTextMatch(null);
		this.matchService.setSourceHtmlMatch(null);
		this.matchService.setSuspectTextMatch(null);
		this.matchService.setSuspectHtmlMatch(null);
		this.reportService.setViewMode('one-to-many');
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number
	 */
	decreaseFontSize(amount: number = TEXT_FONT_SIZE_UNIT) {
		this.zoom = Math.max(this.zoom - amount, MIN_TEXT_ZOOM);
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number
	 */
	increaseFontSize(amount: number = TEXT_FONT_SIZE_UNIT) {
		this.zoom = Math.min(this.zoom + amount, MAX_TEXT_ZOOM);
	}

	/**
	 * life-cycle method
	 * Subscribe to:
	 * - suspect changes
	 * - content mode changes
	 * - matches changes
	 * - mobile layout changes
	 */
	ngOnInit() {
		const { suspect$, contentMode$ } = this.reportService;
		suspect$
			.pipe(
				untilDestroy(this),
				truthy()
			)
			.subscribe(item => (this.suspect = item.result));
		contentMode$.pipe(untilDestroy(this)).subscribe(mode => (this.content = mode));
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
		this.highlightService.suspectTextMatches$.pipe(untilDestroy(this)).subscribe(matches => (this.matches = matches));
	}
	/**
	 * life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
