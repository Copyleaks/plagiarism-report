import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, asyncScheduler } from 'rxjs';
import {
	map,
	switchMap,
	bufferTime,
	debounce,
	debounceTime,
	tap,
	throttle,
	throttleTime,
	sampleTime,
	takeUntil,
	mapTo,
	switchMapTo,
	withLatestFrom,
} from 'rxjs/operators';
import {
	ComparisonKey,
	CompleteResult,
	Match,
	MatchType,
	ReportStatistics,
	ResultItem,
	SubjectResultKey,
} from '../models';
import { ReportService } from './report.service';
import { truthy, falsey } from '../utils/operators';

/**
 * Higher order function that returns a function that extracts Match Intervals from a Result
 * @param type name of the match type to extract ( identical | minorChanges | relatedMeaning)
 * @param subject name of the subject to extract from ( source | suspected)
 */
const createWordIntervalsFrom = (type: ComparisonKey, subject: SubjectResultKey) => ({ result }: ResultItem) => {
	const { starts, lengths } = result.text.comparison[type][subject].words;
	return starts.map(
		(start, i): Match => ({
			start,
			end: start + lengths[i] + 1,
			type: MatchType[type],
		})
	);
};

/**
 * merge consecutive intervals based on start and end index
 * while prioritizing type ( lower is better )
 * this function assumes all intervals are non-distinct (has no gaps)
 */
const mergeWordIntervals = (matches: Match[]): Match[] =>
	matches.reduce((joined: Match[], next: Match) => {
		if (joined.length === 0) {
			joined.push(next);
			return joined;
		}
		const prev = joined[joined.length - 1];

		// equal points
		// [---p---]
		// [---n---]
		if (prev.end === next.end && prev.start === next.start) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, type: next.type };
			}
		}
		// same start inclusion
		// [---p---]  or
		// [--n--]
		else if (next.start === prev.start && next.end < prev.end) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = next;
				joined.push({ ...prev, start: next.start });
			}
		}
		// same end inclusion
		// [---p---]
		// 	[--n--]
		else if (prev.end === next.end && prev.start < next.start) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.start };
				joined.push(next);
			}
		}
		// complete inclusion
		// [---p---]
		// [--n--]
		else if (prev.start < next.start && next.end < prev.end) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.start };
				joined.push(next);
				joined.push({ ...prev, start: next.end });
			}
		}
		// intersecting or adjacent
		// [---p---]      or [---p---]
		//     [---n---]              [---n---]
		else if (next.start > prev.start && next.end > prev.end) {
			if (next.type === prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.end };
			} else if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.start };
				joined.push(next);
			} else if (next.type > prev.type) {
				joined.push({ ...next, start: prev.end });
			}
		}
		// same start
		// [--p--]
		// [---n---]
		else if (prev.start === next.start && prev.end < next.end) {
			if (next.type <= prev.type) {
				joined[joined.length - 1] = next;
			} else {
				joined.push({ ...next, start: prev.end });
			}
		} else {
			joined.push(next);
		}
		return joined;
	}, []);

/**
 * split an array of matches into nests where each nest is distinct and nested items are all overlapped
 * @param matches the matches to split
 */
const findNests = (matches: Match[]): Match[][] => {
	if (matches.length === 0) {
		return [[]];
	}
	matches.sort((a, b) => a.start - b.start || a.end - b.end || a.type - b.type);
	const nests: Match[][] = [[matches[0]]];
	let nestFurthestEnd = matches[0].end;
	for (const interval of matches) {
		if (interval.start > nestFurthestEnd) {
			nests.push([interval]);
			nestFurthestEnd = interval.end;
		} else {
			nests[nests.length - 1].push(interval);
			nestFurthestEnd = Math.max(nestFurthestEnd, interval.end);
		}
	}
	return nests;
};

@Injectable({
	providedIn: 'root',
})
export class StatisticsService {
	private readonly _statistics = new BehaviorSubject<ReportStatistics>(undefined);
	public statistics$ = this._statistics.asObservable();

	constructor(reportService: ReportService) {
		const { completeResult$, filteredResults$, suspectId$, suspect$ } = reportService;
		suspectId$
			.pipe(
				switchMap(id => (id ? suspect$.pipe(map(x => [x])) : filteredResults$)),
				withLatestFrom(completeResult$)
			)
			.subscribe(([results, meta]) => {
				const { batch, internet, database } = meta.results;
				if (batch.length + database.length + internet.length === results.length) {
					this._statistics.next({
						identical: meta.results.score.identicalWords,
						relatedMeaning: meta.results.score.relatedMeaningWords,
						minorChanges: meta.results.score.minorChangedWords,
						omittedWords: meta.scannedDocument.totalExcluded,
						total: meta.scannedDocument.totalWords,
					});
				} else {
					this._statistics.next(this.calculateStatistics(meta, results));
				}
			});
	}
	/**
	 * calculate statistics out of a list of the currently visible `results`
	 * @param metadata the report metadata
	 * @param results the results to calculate statistics from
	 */
	calculateStatistics(metadata: CompleteResult, results: ResultItem[]): ReportStatistics {
		const { totalWords, totalExcluded } = metadata.scannedDocument;
		const identical = results.flatMap(createWordIntervalsFrom('identical', 'source'));
		const minorChanges = results.flatMap(createWordIntervalsFrom('minorChanges', 'source'));
		const relatedMeaning = results.flatMap(createWordIntervalsFrom('relatedMeaning', 'source'));
		const withOutoverlaps = this.mergeWords([...relatedMeaning, ...minorChanges, ...identical]);
		const identicalCount = withOutoverlaps
			.filter(match => match.type === MatchType.identical)
			.reduce((total, elem) => {
				return total + (elem.end - elem.start);
			}, 0);
		const minorChangesCount = withOutoverlaps
			.filter(match => match.type === MatchType.minorChanges)
			.reduce((total, elem) => {
				return total + (elem.end - elem.start);
			}, 0);
		const relatedMeaningCount = withOutoverlaps
			.filter(match => match.type === MatchType.relatedMeaning)
			.reduce((total, elem) => {
				return total + (elem.end - elem.start);
			}, 0);
		return {
			identical: identicalCount,
			relatedMeaning: relatedMeaningCount,
			minorChanges: minorChangesCount,
			omittedWords: totalExcluded,
			total: totalWords,
		};
	}
	/**
	 * merge overlapping matches in a list of matches
	 * @param matches the list of matches
	 */
	mergeWords(matches: Match[]): Match[] {
		return findNests(matches).reduce((all, nest) => all.concat(mergeWordIntervals(nest)), []);
	}
}
