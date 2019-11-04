import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CompleteResult, ReportStatistics, ResultItem } from '../models';
import { ReportService } from './report.service';
import { untilDestroy } from '../../shared/operators/untilDestroy';
import * as helpers from '../utils/statistics';
@Injectable()
export class StatisticsService implements OnDestroy {
	private _statistics = new BehaviorSubject<ReportStatistics>(undefined);
	private completeResultStats = null;
	constructor(reportService: ReportService) {
		const { completeResult$, results$, filteredResults$, suspectId$, suspect$ } = reportService;
		const suspectOrResults$ = suspectId$.pipe(switchMap(id => (id ? suspect$.pipe(map(x => [x])) : filteredResults$)));
		combineLatest([suspectOrResults$, completeResult$, results$])
			.pipe(untilDestroy(this))
			.subscribe(([filtered, meta, results]) => this.retreiveStatistics(results, filtered, meta));
	}

	public get statistics$() {
		return this._statistics.asObservable();
	}

	/**
	 * Reterieve the statistics for the currently visible results,
	 * if all results are visible use the statistic section from the `completeResult`
	 * otherwise calculate the statistics using `filteredResults`
	 * @param results all the scan results
	 * @param filteredResults the currently visible results
	 * @param completeResult the complete result
	 */
	retreiveStatistics(results: ResultItem[], filteredResults: ResultItem[], completeResult: CompleteResult) {
		const { batch, internet, database } = completeResult.results;
		const totalResults = batch.length + internet.length + database.length;
		if (results.length < totalResults || totalResults === filteredResults.length) {
			this.completeResultStats = this.completeResultStats || {
				identical: completeResult.results.score.identicalWords,
				relatedMeaning: completeResult.results.score.relatedMeaningWords,
				minorChanges: completeResult.results.score.minorChangedWords,
				omittedWords: completeResult.scannedDocument.totalExcluded,
				total: completeResult.scannedDocument.totalWords,
			};
			this._statistics.next(this.completeResultStats);
		} else {
			this._statistics.next(helpers.calculateStatistics(completeResult, filteredResults));
		}
	}

	/** dtor */
	ngOnDestroy() {
		this._statistics.complete();
	}
}
