import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, skip, take, takeUntil, withLatestFrom, tap, switchMapTo } from 'rxjs/operators';
import { Match, ResultItem, ResultsSettings, SlicedMatch, ScanSource } from '../models';
import * as helpers from '../utils/highlight-helpers';
import { truthy } from '../utils/operators';
import { ReportService } from './report.service';

/**
 * Service that calculates the matches highlight positions with respect to the view and content mode.
 * It exposes some observable streams that you can subscribe to and get the newest relevant calculations.
 */
@Injectable({
	providedIn: 'root',
})
export class HighlightService {
	constructor(private reportService: ReportService) {
		const { source$, filteredResults$, settings$ } = reportService;

		// listen to suspect changes and process one-to-one matches
		this.onSuspectChange$
			.pipe(withLatestFrom(settings$, source$))
			.subscribe(params => this.processOneToOneMatches(...params));

		// listen to changes in settings and filtered results
		combineLatest([filteredResults$, settings$, source$])
			.pipe()
			.subscribe(params => this.processOneToManyMatches(...params));
	}
	private get onFirstTextMode$() {
		return this.reportService.contentMode$.pipe(
			filter(mode => mode === 'text'),
			take(1)
		);
	}
	private get onFirstHtmlMode$() {
		return this.reportService.contentMode$.pipe(
			filter(mode => mode === 'html'),
			take(1)
		);
	}
	private get onSuspectChange$() {
		return this.reportService.suspect$.pipe(
			truthy(),
			distinctUntilChanged()
		);
	}
	private get onNewSuspect$() {
		return this.onSuspectChange$.pipe(skip(1));
	}

	// using behavior subject for state management
	private _sourceTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
	private _sourceHtmlMatches = new BehaviorSubject<Match[]>(null);
	private _suspectTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
	private _suspectHtmlMatches = new BehaviorSubject<Match[]>(null);
	private _originalTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
	private _originalHtmlMatches = new BehaviorSubject<Match[]>(null);

	private _working = new BehaviorSubject<boolean>(false);

	/* Emits matches that are relevant to source text one-to-one mode */
	public sourceTextMatches$ = this._sourceTextMatches.asObservable().pipe(truthy());
	/* Emits matches that are relevant to source html one-to-one mode */
	public sourceHtmlMatches$ = this._sourceHtmlMatches.asObservable().pipe(truthy());
	/* Emits matches that are relevant to suspect text one-to-one mode */
	public suspectTextMatches$ = this._suspectTextMatches.asObservable().pipe(truthy());
	/* Emits matches that are relevant to suspect html one-to-one mode */
	public suspectHtmlMatches$ = this._suspectHtmlMatches.asObservable().pipe(truthy());
	/* Emits matches that are relevant to source text one-to-many mode */
	public originalTextMatches$ = this._originalTextMatches.asObservable().pipe(truthy());
	/* Emits matches that are relevant to source html one-to-many mode */
	public originalHtmlMatches$ = this._originalHtmlMatches.asObservable().pipe(truthy());
	/* Emits a boolean indication weather there are ongoing calculations */
	public working$ = this._working.asObservable().pipe(distinctUntilChanged());

	private processOneToOneMatches = (result: ResultItem, settings: ResultsSettings, source: ScanSource) => {
		this.onFirstTextMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
			setTimeout(() => {
				console.log('processing source text results');
				const text = helpers.processSourceText(result, settings, source);
				if (text) {
					this._sourceTextMatches.next(text);
				}
			});
			setTimeout(() => {
				console.log('processing suspect text results');
				const text = helpers.processSuspectText(result, settings);
				if (text) {
					this._suspectTextMatches.next(text);
				}
			});
		});
		this.onFirstHtmlMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
			setTimeout(() => {
				console.log('processing source html results');
				const html = helpers.processSourceHtml(result, settings, source);
				if (html) {
					this._sourceHtmlMatches.next(html);
				}
			});
			setTimeout(() => {
				console.log('processing suspect html results');
				const html = helpers.processSuspectHtml(result, settings);
				if (html) {
					this._suspectHtmlMatches.next(html);
				}
			});
		});
	};

	private processOneToManyMatches = (results: ResultItem[], settings: ResultsSettings, source: ScanSource) => {
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
	};
}
