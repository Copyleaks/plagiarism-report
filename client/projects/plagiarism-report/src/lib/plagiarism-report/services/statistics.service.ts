import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { untilDestroy } from '../../shared/operators/untilDestroy';
import { ReportStatistics, CompleteResult, ResultItem, CopyleaksReportOptions } from '../models';
import * as helpers from '../utils/statistics';
import { ReportService } from './report.service';
import { distinct } from '../utils/operators';

@Injectable()
export class StatisticsService implements OnDestroy {
	private _statistics = new BehaviorSubject<ReportStatistics>(undefined);
	constructor(reportService: ReportService) {
		const {
			completeResult$,
			results$,
			viewMode$,
			filteredResults$,
			suspectResult$: suspect$,
			options$,
		} = reportService;
		combineLatest([completeResult$, suspect$, options$, viewMode$])
			.pipe(
				untilDestroy(this),
				filter(([, suspect, , viewMode]) => viewMode === 'one-to-one' && !!suspect)
			)
			.subscribe(([completeResult, suspect, options]) =>
				this.retreiveOneToOneStatistics(completeResult, suspect, options)
			);
		combineLatest([completeResult$, results$, filteredResults$, options$, viewMode$])
			.pipe(
				untilDestroy(this),
				filter(([, , , , viewMode]) => viewMode === 'one-to-many')
			)
			.subscribe(([completeResult, results, filteredResults, options]) => {
				this.retreieveOneToManyStatistics(completeResult, results, filteredResults, options);
			});
	}

	public statistics$ = this._statistics.asObservable().pipe(distinct());
	/**
	 * Retreive statistics for a one-to-one comparison using the complete result, suspect, and report options
	 * @param completeResult The complete result - contains the count of total words and excluded words in the document
	 * @param suspect the currently viewed suspect Result
	 * @param options the current report options
	 */
	retreiveOneToOneStatistics(completeResult: CompleteResult, suspect: ResultItem, options: CopyleaksReportOptions) {
		this._statistics.next({
			identical: options.showIdentical ? suspect.result.statistics.identical : 0,
			relatedMeaning: options.showRelated ? suspect.result.statistics.relatedMeaning : 0,
			minorChanges: options.showMinorChanges ? suspect.result.statistics.minorChanges : 0,
			omittedWords: completeResult.scannedDocument.totalExcluded,
			total: completeResult.scannedDocument.totalWords,
		});
	}

	/**
	 * Retreive statistics for a one-to-many comparison using the complete result, results,filtered results, and report options
	 * @param completeResult the complete result
	 * @param results list of result items containing all the results from the current scan
	 * @param filteredResults list of results filtered by user settings, will be the same as `results` when no filter applied
	 * @param options the current report options
	 */
	retreieveOneToManyStatistics(
		completeResult: CompleteResult,
		results: ResultItem[],
		filteredResults: ResultItem[],
		options: CopyleaksReportOptions
	) {
		const totalResults =
			(completeResult.results.repositories && completeResult.results.repositories.length
				? completeResult.results.repositories.length
				: 0) +
			completeResult.results.batch.length +
			completeResult.results.internet.length +
			completeResult.results.database.length;
		const showAll = options.showIdentical && options.showMinorChanges && options.showRelated;
		const missingAggregated = totalResults !== 0 && completeResult.results.score.aggregatedScore === 0;
		let stats: ReportStatistics;
		if (
			(!completeResult.filters || !completeResult.filters.resultIds || !completeResult.filters.resultIds.length) &&
			(results.length !== totalResults || (totalResults === filteredResults.length && showAll && !missingAggregated))
		) {
			// * if results are still loading  or no results are fitlered while all match types are visible
			// * we can use the complete result stats without heavy calculations
			stats = {
				identical: completeResult.results.score.identicalWords,
				relatedMeaning: completeResult.results.score.relatedMeaningWords,
				minorChanges: completeResult.results.score.minorChangedWords,
				omittedWords: completeResult.scannedDocument.totalExcluded,
				total: completeResult.scannedDocument.totalWords,
			};
		} else {
			stats = helpers.calculateStatistics(completeResult, filteredResults, options);
		}
		this._statistics.next(stats);
	}

	/** dtor */
	ngOnDestroy() {
		this._statistics.complete();
	}
}
