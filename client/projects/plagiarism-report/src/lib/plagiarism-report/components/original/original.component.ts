import { Component, ContentChildren, OnDestroy, OnInit, QueryList } from '@angular/core';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { logoSvg } from '../../assets/images';
import { CompleteResult, ExcludeReason, Match, MatchType, ScanSource, SlicedMatch } from '../../models';
import { ContentMode, DirectionMode, ViewMode } from '../../models/CopyleaksReportConfig';
import { HighlightService } from '../../services/highlight.service';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { TextMarkService } from '../../services/text-mark.service';
import { fadeIn } from '../../utils/animations';
import { EXCLUDE_MESSAGE, MAX_TEXT_ZOOM, MIN_TEXT_ZOOM, TEXT_FONT_SIZE_UNIT } from '../../utils/constants';
import { MatchComponent } from '../match/match.component';

@Component({
	selector: 'cr-original',
	templateUrl: './original.component.html',
	styleUrls: ['./original.component.scss'],
	animations: [fadeIn],
})
export class OriginalComponent implements OnInit, OnDestroy {
	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private highlightService: HighlightService,
		private matchService: MatchService,
		private markService: TextMarkService
	) {}
	get pages(): number[] {
		return this.source && this.source.text.pages.startPosition;
	}
	public readonly MatchType = MatchType;
	public readonly ExcludeReason = ExcludeReason;
	public readonly EXCLUDE_MESSAGE = EXCLUDE_MESSAGE;
	public readonly copyleaksB64: string = logoSvg;
	public zoom = 1;
	public direction: DirectionMode = 'ltr';
	public working = false;
	@ContentChildren(MatchComponent, { descendants: true })
	matchItems: QueryList<MatchComponent>;
	mqPriority: number;
	viewMode: ViewMode;
	metadata: CompleteResult;
	source: ScanSource;
	contentMode: ContentMode;
	activeMediaQueries: string[] = [];
	highlightedSource: string;
	currentPage = 1;
	originalTextMatches: SlicedMatch[][];
	sourceTextMatches: SlicedMatch[][];
	originalHtmlMatches: Match[];
	sourceHtmlMatches: Match[];

	/**
	 * get the current text matches while considering the current view mode
	 */
	get textMatches() {
		return this.isOneToMany ? this.originalTextMatches : this.sourceTextMatches;
	}

	/**
	 * get the current html matches while considering the current view mode
	 */
	get htmlMatches() {
		return this.isOneToMany ? this.originalHtmlMatches : this.sourceHtmlMatches;
	}

	/**
	 * `true` if the current view mode is `one-to-many` and `false` if `one-to-one`
	 */
	get isOneToMany(): boolean {
		return this.viewMode === 'one-to-many';
	}

	/**
	 * `true` if the current content mode is `html` and `false` if `text`
	 */
	get isHtml(): boolean {
		return this.contentMode === 'html';
	}

	/**
	 * `true` if the source document has an `html` section
	 */
	get hasHtml(): boolean {
		return this.source && this.source.html && !!this.source.html.value;
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number between 0.5 and 4
	 */
	decreaseFontSize(amount: number = TEXT_FONT_SIZE_UNIT) {
		this.zoom = Math.max(this.zoom - amount, MIN_TEXT_ZOOM);
	}

	/**
	 * updates the font size of the suspect text.
	 * @param amount a decimal number between 0.5 and 4
	 */
	increaseFontSize(amount: number = TEXT_FONT_SIZE_UNIT) {
		this.zoom = Math.min(this.zoom + amount, MAX_TEXT_ZOOM);
	}
	/**
	 * toggles between `text` and `html` content mode
	 */
	toggleContent() {
		this.reportService.setContentMode(this.isHtml ? 'text' : 'html');
		this.matchService.setSourceHtmlMatch(null);
		this.matchService.setSourceTextMatch(null);
	}

	/**
	 * Jump to next match click handler.
	 * @param next if `true` jump to next match, otherwise jumpt to previous match
	 */
	onJumpToNextMatchClick(next: boolean = true) {
		if (!this.isHtml) {
			this.markService.jump(next);
		} else {
			this.reportService.jump(next);
		}
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - report metadata and source document
	 * - view mode and content mode changes
	 * - matches from highlight service
	 * - layout changes
	 */
	ngOnInit() {
		const { metadata$, source$, viewMode$, contentMode$ } = this.reportService;
		const {
			originalTextMatches$,
			sourceTextMatches$,
			originalHtmlMatches$,
			sourceHtmlMatches$,
			working$,
		} = this.highlightService;

		metadata$.pipe(untilDestroy(this)).subscribe(val => (this.metadata = val));
		source$.pipe(untilDestroy(this)).subscribe(val => (this.source = val));
		viewMode$.pipe(untilDestroy(this)).subscribe(val => (this.viewMode = val));
		contentMode$.pipe(untilDestroy(this)).subscribe(val => (this.contentMode = val));
		originalTextMatches$.pipe(untilDestroy(this)).subscribe(val => (this.originalTextMatches = val));
		sourceTextMatches$.pipe(untilDestroy(this)).subscribe(val => (this.sourceTextMatches = val));
		originalHtmlMatches$.pipe(untilDestroy(this)).subscribe(val => (this.originalHtmlMatches = val));
		sourceHtmlMatches$.pipe(untilDestroy(this)).subscribe(val => (this.sourceHtmlMatches = val));
		working$.pipe(untilDestroy(this)).subscribe(val => (this.working = val));
		this.layoutService.mediaAliases$.pipe(untilDestroy(this)).subscribe(val => (this.activeMediaQueries = val));
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
