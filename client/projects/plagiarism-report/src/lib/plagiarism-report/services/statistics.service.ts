import { Injectable, OnDestroy } from '@angular/core';
import { asyncScheduler, BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, switchMap, throttleTime } from 'rxjs/operators';
import { untilDestroy } from '../../shared/operators/untilDestroy';
import { CompleteResult, CopyleaksReportOptions, ReportStatistics, ResultItem } from '../models';
import * as helpers from '../utils/statistics';
import { ReportService } from './report.service';

@Injectable()
export class StatisticsService implements OnDestroy {
	private _statistics = new BehaviorSubject<ReportStatistics>(undefined);
	private completeResultStats = null;
	constructor(reportService: ReportService) {
		const { completeResult$, results$, filteredResults$, suspectId$, suspect$, options$ } = reportService;
		const importantOptions$ = options$.pipe(
			untilDestroy(this),
			distinctUntilChanged(
				(prev, next) =>
					prev.showIdentical === next.showIdentical &&
					prev.showMinorChanges === next.showMinorChanges &&
					prev.showRelated === next.showRelated
			)
		);
		const suspectOrResults$ = suspectId$.pipe(switchMap(id => (id ? suspect$.pipe(map(x => [x])) : filteredResults$)));
		combineLatest([suspectOrResults$, completeResult$, results$, suspectId$, importantOptions$])
			.pipe(
				untilDestroy(this),
				throttleTime(100, asyncScheduler, { trailing: true, leading: false })
			)
			.subscribe(([filtered, meta, results, suspectId, options]) =>
				this.retreiveStatistics(results, filtered, meta, !!suspectId, options)
			);
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
	retreiveStatistics(
		results: ResultItem[],
		filteredResults: ResultItem[],
		completeResult: CompleteResult,
		suspect: boolean,
		options: CopyleaksReportOptions
	) {
		const { batch, internet, database } = completeResult.results;
		const totalResults = batch.length + internet.length + database.length;
		const showAll = options.showIdentical && options.showMinorChanges && options.showRelated;
		if (results.length < totalResults || (totalResults === filteredResults.length && showAll)) {
			this.completeResultStats = this.completeResultStats || {
				identical: completeResult.results.score.identicalWords,
				relatedMeaning: completeResult.results.score.relatedMeaningWords,
				minorChanges: completeResult.results.score.minorChangedWords,
				omittedWords: completeResult.scannedDocument.totalExcluded,
				total: completeResult.scannedDocument.totalWords,
			};
			if (!suspect) {
				this._statistics.next(this.completeResultStats);
			}
		} else {
			this._statistics.next(helpers.calculateStatistics(completeResult, filteredResults, options));
		}
	}

	/** dtor */
	ngOnDestroy() {
		this._statistics.complete();
	}
}
