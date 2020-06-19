import { Component, ContentChildren, OnDestroy, OnInit, QueryList } from '@angular/core';
import { PageChangeEvent } from '../../../mat-pagination/mat-pagination.component';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { CompleteResult, ExcludeReason, Match, MatchType, ScanSource, SlicedMatch } from '../../models';
import { ContentMode, DirectionMode, ViewMode } from '../../models/CopyleaksReportConfig';
import { HighlightService } from '../../services/highlight.service';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { fadeIn } from '../../utils/animations';
import { EXCLUDE_MESSAGE, MAX_TEXT_ZOOM, MIN_TEXT_ZOOM, TEXT_FONT_SIZE_UNIT } from '../../utils/constants';
import { MatchComponent } from '../match/match.component';

import { switchMapTo, distinctUntilChanged } from 'rxjs/operators';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';

@Component({
	selector: 'cr-original',
	templateUrl: './original.component.html',
	styleUrls: ['./original.component.scss'],
	animations: [fadeIn],
})
export class OriginalComponent implements OnInit, OnDestroy {
	translations: CopyleaksTranslations;
	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private matchService: MatchService,
		private highlightService: HighlightService,
		private translationService: CopyleaksTranslateService
	) { }
	get pages(): number[] {
		return this.source && this.source.text.pages.startPosition;
	}
	public readonly MatchType = MatchType;
	public readonly ExcludeReason = ExcludeReason;
	public EXCLUDE_MESSAGE = EXCLUDE_MESSAGE;
	public zoom = 1;
	public direction: DirectionMode = 'ltr';

	@ContentChildren(MatchComponent, { descendants: true })
	matchItems: QueryList<MatchComponent>;
	mqPriority: number;
	viewMode: ViewMode;
	completeResult: CompleteResult;
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
		this.reportService.configure({ contentMode: this.isHtml ? 'text' : 'html' });
	}

	/**
	 * Jump to next match click handler.
	 * @param next if `true` jump to next match, otherwise jumpt to previous match
	 */
	onJumpToNextMatchClick(next: boolean = true) {
		this.highlightService.jump(next);
	}

	/**
	 * executes when a `MatPaginationComponent` emits the page event
	 */
	onPage(event: PageChangeEvent) {
		this.reportService.configure({ sourcePage: +event.currentPage });
		this.highlightService.clear();
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
		this.translations = this.translationService.translations;
		if (this.translations && this.translations.SCAN_SETTINGS && this.translations.SCAN_SETTINGS.OMITTED) {
			this.EXCLUDE_MESSAGE = {
				1: this.translations.SCAN_SETTINGS.OMITTED.QUOTATIONS,
				2: this.translations.SCAN_SETTINGS.OMITTED.REFERENCES,
				5: this.translations.SCAN_SETTINGS.OMITTED.HTML_TEMPLATES,
				6: this.translations.SCAN_SETTINGS.OMITTED.TABLES_OF_CONTENT,
				7: this.translations.SCAN_SETTINGS.OMITTED.SOURCE_CODE_COMMENTS,
				8: this.translations.SCAN_SETTINGS.OMITTED.SENSITIVE_DATA,
			}
		}
		const { completeResult$, source$, viewMode$, contentMode$, sourcePage$ } = this.reportService;
		const { originalTextMatches$, sourceTextMatches$, originalHtmlMatches$, sourceHtmlMatches$ } = this.matchService;
		completeResult$.pipe(untilDestroy(this)).subscribe(completeResult => (this.completeResult = completeResult));
		source$.pipe(untilDestroy(this)).subscribe(source => {
			this.source = source;
			sourcePage$.pipe(untilDestroy(this)).subscribe(page => (this.currentPage = +page));
		});

		viewMode$.pipe(untilDestroy(this)).subscribe(viewMode => (this.viewMode = viewMode));
		viewMode$
			.pipe(
				untilDestroy(this),
				distinctUntilChanged(),
				switchMapTo(source$)
			)
			.subscribe(source => {
				if (!source.html || !source.html.value) {
					this.reportService.configure({ contentMode: 'text' });
				}
			});

		contentMode$.pipe(untilDestroy(this)).subscribe(content => (this.contentMode = content));
		originalTextMatches$.pipe(untilDestroy(this)).subscribe(matches => (this.originalTextMatches = matches));
		sourceTextMatches$.pipe(untilDestroy(this)).subscribe(matches => (this.sourceTextMatches = matches));
		originalHtmlMatches$.pipe(untilDestroy(this)).subscribe(matches => (this.originalHtmlMatches = matches));
		sourceHtmlMatches$.pipe(untilDestroy(this)).subscribe(matches => (this.sourceHtmlMatches = matches));
		this.layoutService.mediaAliases$.pipe(untilDestroy(this)).subscribe(queries => (this.activeMediaQueries = queries));
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() { }
}
