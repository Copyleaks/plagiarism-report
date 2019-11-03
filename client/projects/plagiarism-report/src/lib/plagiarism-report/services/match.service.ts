import { Injectable, OnDestroy } from '@angular/core';
import { asyncScheduler, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, skip, take, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';
import { CopyleaksReportOptions, Match, ResultItem, ScanSource, SlicedMatch } from '../models';
import * as helpers from '../utils/match-helpers';
import { truthy } from '../utils/operators';
import { ReportService } from './report.service';
import { untilDestroy } from '../../shared/operators/untilDestroy';

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

	constructor(private reportService: ReportService) {
		const { source$, filteredResults$, options$ } = this.reportService;
		// listen to suspect changes and process one-to-one matches
		this.onSuspectChange$
			.pipe(
				untilDestroy(this),
				withLatestFrom(options$, source$)
			)
			.subscribe(params => this.processOneToOneMatches(...params));

		// listen to changes in settings and filtered results
		filteredResults$
			.pipe(
				untilDestroy(this),
				throttleTime(5000, asyncScheduler, { leading: false, trailing: true }),
				withLatestFrom(options$, source$)
			)
			.subscribe(params => this.processOneToManyMatches(...params));
	}

	private get onFirstTextMode$() {
		return this.reportService.contentMode$.pipe(
			untilDestroy(this),
			filter(mode => mode === 'text'),
			take(1)
		);
	}

	private get onFirstHtmlMode$() {
		return this.reportService.contentMode$.pipe(
			untilDestroy(this),
			filter(mode => mode === 'html'),
			take(1)
		);
	}

	private get onSuspectChange$() {
		return this.reportService.suspect$.pipe(
			untilDestroy(this),
			truthy(),
			distinctUntilChanged()
		);
	}

	private get onNewSuspect$() {
		return this.onSuspectChange$.pipe(
			untilDestroy(this),
			skip(1)
		);
	}

	/** Emits matches that are relevant to source text one-to-one mode */
	public get sourceTextMatches$() {
		return this._sourceTextMatches.asObservable().pipe(truthy());
	}

	/** Emits matches that are relevant to source html one-to-one mode */
	public get sourceHtmlMatches$() {
		return this._sourceHtmlMatches.asObservable().pipe(
			untilDestroy(this),
			truthy()
		);
	}

	/** Emits matches that are relevant to suspect text one-to-one mode */
	public get suspectTextMatches$() {
		return this._suspectTextMatches.asObservable().pipe(
			untilDestroy(this),
			truthy()
		);
	}

	/** Emits matches that are relevant to suspect html one-to-one mode */
	public get suspectHtmlMatches$() {
		return this._suspectHtmlMatches.asObservable().pipe(
			untilDestroy(this),
			truthy()
		);
	}

	/** Emits matches that are relevant to source text one-to-many mode */
	public get originalTextMatches$() {
		return this._originalTextMatches.asObservable().pipe(
			untilDestroy(this),
			truthy()
		);
	}

	/** Emits matches that are relevant to source html one-to-many mode */
	public get originalHtmlMatches$() {
		return this._originalHtmlMatches.asObservable().pipe(
			untilDestroy(this),
			truthy()
		);
	}

	/**
	 * Process matches on the `one-to-one` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param item the result to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private processOneToOneMatches(item: ResultItem, settings: CopyleaksReportOptions, source: ScanSource) {
		this.onFirstTextMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
			setTimeout(() => {
				const text = helpers.processSourceText(item, settings, source);
				if (text) {
					this._sourceTextMatches.next(text);
				}
			});
			setTimeout(() => {
				const text = helpers.processSuspectText(item, settings);
				if (text) {
					this._suspectTextMatches.next(text);
				}
			});
		});
		this.onFirstHtmlMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
			setTimeout(() => {
				const html = helpers.processSourceHtml(item, settings, source);
				if (html) {
					this._sourceHtmlMatches.next(html);
				}
			});
			setTimeout(() => {
				if (!item.result.html.value) {
					return;
				}
				const html = helpers.processSuspectHtml(item, settings);
				if (html) {
					this._suspectHtmlMatches.next(html);
				}
			});
		});
	}

	/**
	 * Process matches on the `one-to-many` view mode
	 * will calculate the matches when showing `text` or `html` for the first time
	 * @param results the results to calculate matches from
	 * @param settings the report settings
	 * @param source  the scan source
	 */
	private processOneToManyMatches(results: ResultItem[], settings: CopyleaksReportOptions, source: ScanSource) {
		this.onFirstTextMode$.subscribe(() => {
			const text = helpers.processSourceText(results, settings, source);
			if (text) {
				this._originalTextMatches.next(text);
			}
		});
		this.onFirstHtmlMode$.subscribe(() => {
			const html = helpers.processSourceHtml(results, settings, source);
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
