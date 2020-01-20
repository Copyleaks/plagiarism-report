import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { PageChangeEvent } from '../../../mat-pagination/mat-pagination.component';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { MatchType, SlicedMatch } from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { ContentMode, DirectionMode } from '../../models/CopyleaksReportConfig';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { fadeIn } from '../../utils/animations';
import { MAX_TEXT_ZOOM, MIN_TEXT_ZOOM, TEXT_FONT_SIZE_UNIT } from '../../utils/constants';
import { truthy } from '../../utils/operators';

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
		private matchService: MatchService
	) {}
	readonly MatchType = MatchType;
	public isMobile = false;
	public zoom = 1;
	public direction: DirectionMode = 'ltr';
	public currentPage = 1;
	public textMatches: SlicedMatch[][];
	public suspect: ScanResult;
	public contentMode: ContentMode;
	public disableBackButton = true;
	public get hasHtml(): boolean {
		return this.suspect && this.suspect.html && !!this.suspect.html.value;
	}

	public get isHtml(): boolean {
		return this.contentMode === 'html';
	}

	get pages(): number[] {
		return this.suspect.text.pages.startPosition;
	}

	/**
	 * toggles between `text` and `html` content mode
	 */
	toggleContent() {
		this.reportService.configure({ contentMode: this.isHtml ? 'text' : 'html' });
	}

	/**
	 * exits one-to-one mode and goes to one-to-many mode
	 */
	goBack() {
		this.reportService.configure({ viewMode: 'one-to-many', suspectId: null });
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
	 * Handle a page event from `cr-mat-paginator` component
	 * Pass the `PageChangeEvent` to `ReportService`
	 * @param event the page event containing page data
	 */
	onPage(event: PageChangeEvent) {
		this.reportService.configure({ suspectPage: +event.currentPage });
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
		const { suspect$, contentMode$, suspectPage$, onlyOneToOne$ } = this.reportService;
		suspect$
			.pipe(
				untilDestroy(this),
				truthy()
			)
			.subscribe(item => {
				this.suspect = item.result;
				suspectPage$.pipe(untilDestroy(this)).subscribe(page => (this.currentPage = +page));
			});

		combineLatest([contentMode$, suspect$])
			.pipe(untilDestroy(this))
			.subscribe(
				([mode, suspect]) =>
					(this.contentMode =
						mode === 'html' && suspect && suspect.result && suspect.result.html.value ? 'html' : 'text')
			);

		onlyOneToOne$.pipe(untilDestroy(this)).subscribe(disable => (this.disableBackButton = disable));
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
		this.matchService.suspectTextMatches$.pipe(untilDestroy(this)).subscribe(matches => (this.textMatches = matches));
	}
	/**
	 * life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
