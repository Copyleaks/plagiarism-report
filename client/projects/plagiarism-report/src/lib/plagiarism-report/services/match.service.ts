import { Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, skip, take, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';
import { CopyleaksReportOptions, Match, ResultItem, ScanSource, SlicedMatch } from '../models';
import * as helpers from '../utils/match-helpers';
import { truthy } from '../utils/operators';
import { ReportService } from './report.service';

/**
 * Service that calculates the matches highlight positions with respect to the view and content mode.
 * It exposes some observable streams that you can subscribe to and get the newest relevant calculations.
 */
@Injectable({
	providedIn: 'root',
})
export class MatchService {
	constructor(private reportService: ReportService) {}
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
	private _sourceTextMatches: BehaviorSubject<SlicedMatch[][]>;
	private _sourceHtmlMatches: BehaviorSubject<Match[]>;
	private _suspectTextMatches: BehaviorSubject<SlicedMatch[][]>;
	private _suspectHtmlMatches: BehaviorSubject<Match[]>;
	private _originalTextMatches: BehaviorSubject<SlicedMatch[][]>;
	private _originalHtmlMatches: BehaviorSubject<Match[]>;

	/** An initialization method for reseting the state */
	public initialize() {
		this._sourceTextMatches && this._sourceTextMatches.complete();
		this._sourceTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
		this._sourceHtmlMatches && this._sourceHtmlMatches.complete();
		this._sourceHtmlMatches = new BehaviorSubject<Match[]>(null);
		this._suspectTextMatches && this._suspectTextMatches.complete();
		this._suspectTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
		this._suspectHtmlMatches && this._suspectHtmlMatches.complete();
		this._suspectHtmlMatches = new BehaviorSubject<Match[]>(null);
		this._originalTextMatches && this._originalTextMatches.complete();
		this._originalTextMatches = new BehaviorSubject<SlicedMatch[][]>(null);
		this._originalHtmlMatches && this._originalHtmlMatches.complete();
		this._originalHtmlMatches = new BehaviorSubject<Match[]>(null);

		const { source$, filteredResults$, options$ } = this.reportService;
		// listen to suspect changes and process one-to-one matches
		this.onSuspectChange$
			.pipe(withLatestFrom(options$, source$))
			.subscribe(params => this.processOneToOneMatches(...params));

		// listen to changes in settings and filtered results
		filteredResults$
			.pipe(
				throttleTime(5000, asyncScheduler, { leading: false, trailing: true }),
				withLatestFrom(options$, source$)
			)
			.subscribe(params => this.processOneToManyMatches(...params));
	}
	/** Emits matches that are relevant to source text one-to-one mode */
	public get sourceTextMatches$() {
		return this._sourceTextMatches.asObservable().pipe(truthy());
	}
	/** Emits matches that are relevant to source html one-to-one mode */
	public get sourceHtmlMatches$() {
		return this._sourceHtmlMatches.asObservable().pipe(truthy());
	}
	/** Emits matches that are relevant to suspect text one-to-one mode */
	public get suspectTextMatches$() {
		return this._suspectTextMatches.asObservable().pipe(truthy());
	}
	/** Emits matches that are relevant to suspect html one-to-one mode */
	public get suspectHtmlMatches$() {
		return this._suspectHtmlMatches.asObservable().pipe(truthy());
	}
	/** Emits matches that are relevant to source text one-to-many mode */
	public get originalTextMatches$() {
		return this._originalTextMatches.asObservable().pipe(truthy());
	}
	/** Emits matches that are relevant to source html one-to-many mode */
	public get originalHtmlMatches$() {
		return this._originalHtmlMatches.asObservable().pipe(truthy());
	}

	private processOneToOneMatches = (result: ResultItem, settings: CopyleaksReportOptions, source: ScanSource) => {
		this.onFirstTextMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
			setTimeout(() => {
				const text = helpers.processSourceText(result, settings, source);
				if (text) {
					this._sourceTextMatches.next(text);
				}
			});
			setTimeout(() => {
				const text = helpers.processSuspectText(result, settings);
				if (text) {
					this._suspectTextMatches.next(text);
				}
			});
		});
		this.onFirstHtmlMode$.pipe(takeUntil(this.onNewSuspect$)).subscribe(() => {
			setTimeout(() => {
				const html = helpers.processSourceHtml(result, settings, source);
				if (html) {
					this._sourceHtmlMatches.next(html);
				}
			});
			setTimeout(() => {
				const html = helpers.processSuspectHtml(result, settings);
				if (html) {
					this._suspectHtmlMatches.next(html);
				}
			});
		});
	};

	private processOneToManyMatches = (results: ResultItem[], settings: CopyleaksReportOptions, source: ScanSource) => {
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
