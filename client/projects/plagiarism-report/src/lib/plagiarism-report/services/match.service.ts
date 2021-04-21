import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, skip, take, takeUntil } from 'rxjs/operators';
import { untilDestroy } from '../../shared/operators/untilDestroy';
import { CopyleaksReportOptions, Match, ResultItem, ScanSource, SlicedMatch } from '../models';
import { ALERTS } from '../utils/constants';
import * as helpers from '../utils/match-helpers';
import { truthy } from '../utils/operators';
import { ReportService } from './report.service';
import { EReportViewModel, ViewModeService } from './view-mode.service';

/**
 * Service that calculates the matches highlight positions with respect to the view and content mode.
 * It exposes some observable streams that you can subscribe to and get the newest relevant calculations.
 */
@Injectable()
export class MatchService implements OnDestroy {
	private _sourceTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
	private _sourceHtmlMatches = new BehaviorSubject<Match[]>(null);
	private _suspectTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
	private _suspectHtmlMatches = new BehaviorSubject<Match[]>(null);
	private _originalTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
	private _originalHtmlMatches = new BehaviorSubject<Match[]>(null);

	constructor(private reportService: ReportService, private viewModeService: ViewModeService) {
		const { source$, filteredResults$, options$, previews$, hiddenResults$ } = this.reportService;
		const { reportViewMode$ } = this.viewModeService;

		// listen to suspect changes and process one-to-one matches
		combineLatest([this.onSuspectChange$, options$.pipe(distinctUntilChanged()), source$])
			.pipe(untilDestroy(this))
			.subscribe(([result, options, source]) => this.processOneToOneMatches(result, options, source));

		// this.onSuspectChange$.pipe(take(1),untilDestroy(this))

		// listen to changes in settings and filtered results
		// const throttledResults$ = filteredResults$.pipe(
		// 	untilDestroy(this),
		// 	throttleTime(5000, asyncScheduler, { leading: false, trailing: true })
		// );
		let _timeout;
		/**
		 * We want to process oneToMany results when:
		 * * once the source is ready
		 * * every time the filteredResults$ observable updates
		 * * every time the options object has changed
		 * * report view mode change
		 */
		combineLatest([filteredResults$, previews$, hiddenResults$, options$, source$, reportViewMode$])
			.pipe(untilDestroy(this))
			.subscribe(([results, previews, hiddenResults, options, source, viewMode]) => {
				if (_timeout) {
					clearTimeout(_timeout);
				}
				if (viewMode === EReportViewModel.Alerts) {
					this.processAlertMatches(options, source);
				} else {
					_timeout = setTimeout(
						() => {
							this.processOneToManyMatches(results, options, source);
						},
						results.length === previews.length - hiddenResults.length ? 0 : 5000
					);
				}
			});
	}

	private get onSourceFirstTextMode$() {
		return this.reportService.contentMode$.pipe(
			untilDestroy(this),
			filter(content => content === 'text'),
			take(1)
		);
	}

	private get onSourceFirstHtmlMode$() {
		const { contentMode$, source$ } = this.reportService;
		return combineLatest([contentMode$, source$]).pipe(
			untilDestroy(this),
			filter(([content, source]) => content === 'html' && source.html && !!source.html.value),
			take(1)
		);
	}
	private get onSourceContentModeChange$() {
		return this.reportService.contentMode$.pipe(
			untilDestroy(this),
			map(content => content),
			distinctUntilChanged()
		);
	}
	private get onSuspectContentModeChange$() {
		return this.reportService.contentMode$.pipe(
			untilDestroy(this),
			map(content => content),
			distinctUntilChanged()
		);
	}
	private get onSuspectFirstTextMode$() {
		return this.reportService.contentMode$.pipe(
			untilDestroy(this),
			filter(content => content === 'text'),
			take(1)
		);
	}
	private get onSuspectFirstHtmlMode$() {
		const { contentMode$, suspectResult$: suspect$ } = this.reportService;
		return combineLatest([contentMode$, suspect$]).pipe(
			untilDestroy(this),
			filter(([content, suspect]) => content === 'html' && suspect && suspect.result && !!suspect.result.html.value),
			take(1)
		);
	}
	private get onSuspectChange$() {
		return this.reportService.suspectResult$.pipe(untilDestroy(this), truthy(), distinctUntilChanged());
	}

	private get onNewSuspect$() {
		return this.onSuspectChange$.pipe(untilDestroy(this), skip(1));
	}

	/** Emits matches that are relevant to source text one-to-one mode */
	public get sourceTextMatches$() {
		return this._sourceTextMatches.asObservable().pipe(truthy());
	}

	/** Emits matches that are relevant to source html one-to-one mode */
	public get sourceHtmlMatches$() {
		return this._sourceHtmlMatches.asObservable().pipe(untilDestroy(this), truthy());
	}

	/** Emits matches that are relevant to suspect text one-to-one mode */
	public get suspectTextMatches$() {
		return this._suspectTextMatches.asObservable().pipe(untilDestroy(this), truthy());
	}

	/** Emits matches that are relevant to suspect html one-to-one mode */
	public get suspectHtmlMatches$() {
		return this._suspectHtmlMatches.asObservable().pipe(untilDestroy(this), truthy());
	}

	/** Emits matches that are relevant to source text one-to-many mode */
	public get originalTextMatches$() {
		return this._originalTextMatches.asObservable().pipe(untilDestroy(this), truthy());
	}

	/** Emits matches that are relevant to source html one-to-many mode */
	public get originalHtmlMatches$() {
		return this._originalHtmlMatches.asObservable().pipe(untilDestroy(this), truthy());
	}

	/**
	 * Process matches on the `one-to-one` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param item the result to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private processOneToOneMatches(item: ResultItem, settings: CopyleaksReportOptions, source: ScanSource) {
		if (source.html && source.html.value && !(item.result.html && item.result.html.value)) {
			// case where source has html but suspect doesnt
			this.onSourceFirstTextMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
				const text = helpers.processSourceText(item, settings, source);
				this._sourceTextMatches.next(text);
			});
			this.onSourceFirstHtmlMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
				const html = helpers.processSourceHtml(item, settings, source);
				this._sourceHtmlMatches.next(html);
			});

			this.onSuspectContentModeChange$.pipe(takeUntil(this.onNewSuspect$)).subscribe(mode => {
				const text = helpers.processSuspectText(item, settings, mode === 'text');
				this._suspectTextMatches.next(text);
			});
		} else if (!(source.html && source.html.value) && item.result.html && item.result.html.value) {
			// case where suspect has html but source doesnt
			this.onSuspectFirstTextMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
				const text = helpers.processSuspectText(item, settings);
				this._suspectTextMatches.next(text);
			});
			this.onSuspectFirstHtmlMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
				const html = helpers.processSuspectHtml(item, settings);
				this._suspectHtmlMatches.next(html);
			});
			this.onSourceContentModeChange$.pipe(takeUntil(this.onNewSuspect$)).subscribe(mode => {
				const text = helpers.processSourceText(item, settings, source, mode === 'text');
				this._sourceTextMatches.next(text);
			});
		} else {
			this.onSourceFirstTextMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
				setTimeout(() => {
					const text = helpers.processSourceText(item, settings, source);
					this._sourceTextMatches.next(text);
				});
				setTimeout(() => {
					const text = helpers.processSuspectText(item, settings);
					this._suspectTextMatches.next(text);
				});
			});
			this.onSourceFirstHtmlMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
				setTimeout(() => {
					const html = helpers.processSourceHtml(item, settings, source);
					this._sourceHtmlMatches.next(html);
				});
				setTimeout(() => {
					const html = helpers.processSuspectHtml(item, settings);
					this._suspectHtmlMatches.next(html);
				});
			});
		}
	}

	/**
	 * Process matches on the `one-to-many` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param results the results to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private processOneToManyMatches(results: ResultItem[], settings: CopyleaksReportOptions, source: ScanSource) {
		this.onSourceFirstTextMode$.subscribe(() => {
			const text = helpers.processSourceText(results, settings, source);
			if (text) {
				this._originalTextMatches.next(text);
			}
		});
		this.onSourceFirstHtmlMode$.subscribe(() => {
			const html = helpers.processSourceHtml(results, settings, source);
			if (html) {
				this._originalHtmlMatches.next(html);
			}
		});
	}

	/**
	 * Process matches on the `suspected-character-replacement` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private processAlertMatches(settings: CopyleaksReportOptions, source: ScanSource) {
		this.onSourceFirstTextMode$.subscribe(() => {
			let text: SlicedMatch[][];
			if (this.viewModeService?.selectedAlert?.code === ALERTS.SUSPECTED_CHARACTER_REPLACEMENT_CODE) {
				text = helpers.processSuspectedCharacterMatches(source, this.viewModeService.selectedAlert);
			} else {
				text = helpers.processSourceText([], settings, source);
			}
			if (text) {
				this._originalTextMatches.next(text);
			}
		});
		this.onSourceFirstHtmlMode$.subscribe(() => {
			const html = helpers.processSourceHtml([], settings, source);
			if (html) {
				this._originalHtmlMatches.next(html);
			}
		});
	}

	/**
	 * dtor
	 */
	ngOnDestroy() {
		this._sourceTextMatches && this._sourceTextMatches.complete();
		this._sourceHtmlMatches && this._sourceHtmlMatches.complete();
		this._suspectTextMatches && this._suspectTextMatches.complete();
		this._suspectHtmlMatches && this._suspectHtmlMatches.complete();
		this._originalTextMatches && this._originalTextMatches.complete();
		this._originalHtmlMatches && this._originalHtmlMatches.complete();
	}
}
