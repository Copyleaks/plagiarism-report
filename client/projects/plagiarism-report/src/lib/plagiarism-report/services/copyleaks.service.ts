import { Injectable } from '@angular/core';
import {
	CompleteResult,
	NewResult,
	ScanResult,
	ScanSource,
	ResultPreview,
	ResultItem,
	CopyleaksReportConfig,
} from '../models';
import {
	COMPLETE_RESULT_VALIDATION_ERROR,
	NEW_RESULT_VALIDATION_ERROR,
	SCAN_RESULT_VALIDATION_ERROR,
	SCAN_SOURCE_VALIDATION_ERROR,
	VERSION_VALIDATION_ERROR,
	DEFAULT_REPORT_CONFIG,
} from '../utils/constants';

import { Subject, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
//import { exit } from 'process';

@Injectable()
export class CopyleaksService {
	private readonly _complete$ = new Subject<CompleteResult>();
	private readonly _preview$ = new Subject<ResultPreview>();
	private readonly _source$ = new Subject<ScanSource>();
	private readonly _results$ = new Subject<ResultItem[]>();
	private readonly _progress$ = new Subject<number>();
	private readonly _config$ = new BehaviorSubject<CopyleaksReportConfig>({ ...DEFAULT_REPORT_CONFIG });
	private readonly _destroy$ = new Subject();
	private readonly _filteredResultsIds$ = new Subject<string[]>();
	private readonly _scoreUpdate$ = new Subject<number>();
	private readonly _totalResults$ = new Subject<number>();

	public readonly onCompleteResult$ = this._complete$.asObservable();
	public readonly onResultPreview$ = this._preview$.asObservable();
	public readonly onScanSource$ = this._source$.asObservable();
	public readonly onResultItems$ = this._results$.asObservable();
	public readonly onProgress$ = this._progress$.asObservable();
	public readonly onReportConfig$ = this._config$.asObservable();
	public readonly onTotalResultsChange$ = this._totalResults$.asObservable();
	public readonly filteredResultsIds$ = this._filteredResultsIds$.asObservable();
	public readonly scoreUpdate$ = this._scoreUpdate$.asObservable();

	// Delete result by Id
	public readonly onDeleteResultById$ = new Subject<string>();
	public readonly onDeleteProccessFinish$ = new Subject<CompleteResult>();

	public readonly onDestroy$ = this._destroy$.asObservable();
	//private readonly cssError = 'font-weight: bold;color:blue;';
	/**
	 * set total results (optional)
	 * @param totalResults scan total results amount
	 */
	public setTotalResults(totalResults: number) {
		this._totalResults$.next(totalResults);
	}

	/**
	 * Init/Set the filtered results.
	 * @param ids a list of results ids to be filtered.
	 * @param newAggregatedScore updated score after filter.
	 */
	public setFilteredResultsIds(ids: string[], newAggregatedScore: number) {
		this._filteredResultsIds$.next(ids);
		this._scoreUpdate$.next(newAggregatedScore);
	}

	/**
	 * Delete result by id.
	 * @param resultId deleted result id
	 * @returns updated complete result after deletion
	 */
	public async deleteResultById(resultId: string) {
		return new Promise<CompleteResult>((resolve, reject) => {
			this.onDeleteProccessFinish$.pipe(take(1)).subscribe(
				res => resolve(res),
				err => reject(err)
			);
			this.onDeleteResultById$.next(resultId);
		});
	}

	/**
	 * Insert the completion result of a scan to the report.
	 * @see https://api.copyleaks.com/documentation/v3/webhooks/completed
	 * @param result the completed result
	 */
	public pushCompletedResult(result: CompleteResult) {
		if (!this.isCompleteResult(result)) {
			this.showExtendedError(COMPLETE_RESULT_VALIDATION_ERROR, result);
			return;
		}
		this._complete$.next(result);
	}

	private showExtendedError(type, userResult) {
		console.error(
			type.errorText,
			'\nActual supplied argument:\n',
			userResult,
			'\nExpected argument should look like:\n',
			type.completeResult,
			'\nFor more info, visit ' + type.visitUrl
		);
	}
	/**
	 * Insert an incoming new scan result to the report.
	 * @see https://api.copyleaks.com/documentation/v3/webhooks/new-result
	 * @param result the new result
	 */
	public pushNewResult(result: NewResult) {
		if (!this.isNewResult(result)) {
			this.showExtendedError(NEW_RESULT_VALIDATION_ERROR, result);
			return;
		}
		[...result.internet, ...result.database, ...result.batch, ...result.repositories].forEach(prev => {
			this._preview$.next(prev);
		});
	}

	/**
	 * Insert the downloaded source you scanned to the report.
	 * @see https://api.copyleaks.com/documentation/v3/downloads/source
	 * @param source the downloaded source
	 */
	public pushDownloadedSource(source: ScanSource) {
		if (!this.isCorrectVersion(source)) {
			this.showExtendedError(VERSION_VALIDATION_ERROR, source);
			return;
		}
		if (!this.isScanSource(source)) {
			this.showExtendedError(SCAN_SOURCE_VALIDATION_ERROR, source);
			return;
		}
		this._source$.next(source);
	}

	/**
	 * Insert one or more downloaded scan result to the report.
	 * @see https://api.copyleaks.com/documentation/v3/downloads/result
	 * @param results one or more ResultItem object containing the result and the id of the result
	 */
	public pushScanResult(results: ResultItem[] | ResultItem) {
		results = [].concat(results);
		for (const { id, result } of results) {
			if (typeof id !== 'string') {
				throw new Error(`Argument "id" must be a string`);
			}
			if (result != null && !this.isScanResult(result)) {
				this.showExtendedError(SCAN_RESULT_VALIDATION_ERROR, result);
				return;
			}
		}
		this._results$.next(results);
	}

	/**
	 * Change the progress percentage in the report manualy
	 * @param progress an integer between 0 ~ 100
	 */
	public setProgress(progress: number) {
		this._progress$.next(progress);
	}

	/**
	 * change the report's configuration
	 * This function is used to sort the displayed results, you can add your own custom sort by overriding this function
	 * @param previews the displayed results
	 */
	public sortScanResults(previews: ResultPreview[]): ResultPreview[] {
		return previews.sort((a, b) => b.matchedWords - a.matchedWords);
	}

	/**
	 * change the report's configuration
	 * allows passing partial configuration that will be complemented by the default configuration
	 * @param config the complete/partial configuration object
	 */
	public setConfig(config: CopyleaksReportConfig) {
		this._config$.next({ ...config });
	}

	/**
	 * This method will cause the `destroy$` observable to emit
	 */
	public notifyDestroy() {
		this._destroy$.next();
		this.setFilteredResultsIds([], null);
	}

	// Simple object validation
	private isCompleteResult = (o: CompleteResult) => o && !!o.scannedDocument && !!o.results;
	private isScanSource = (o: ScanSource) => o && !!o.metadata && !!o.text && !!o.version;
	private isScanResult = (o: ScanResult) => o && !!o.text && !!o.statistics && !!o.version;
	private isNewResult = (o: NewResult) => o && !!o.internet && !!o.database && !!o.batch;
	private isCorrectVersion = (o: ScanResult | ScanSource) => o && o.version === 3;
}
