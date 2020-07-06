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

	public readonly onCompleteResult$ = this._complete$.asObservable();
	public readonly onResultPreview$ = this._preview$.asObservable();
	public readonly onScanSource$ = this._source$.asObservable();
	public readonly onResultItems$ = this._results$.asObservable();
	public readonly onProgress$ = this._progress$.asObservable();
	public readonly onReportConfig$ = this._config$.asObservable();
	public readonly filteredResultsIds$ = this._filteredResultsIds$.asObservable();
	public readonly onDestroy$ = this._destroy$.asObservable();

	/**
	 * Init/Set the filtered results.
	 * @param ids a list of results ids to be filtered.
	 */
	setFilteredResultsIds(ids: string[]) {
		this._filteredResultsIds$.next(ids);
	}

	/**
	 * Insert the completion result of a scan to the report.
	 * @see https://api.copyleaks.com/documentation/v3/webhooks/completed
	 * @param result the completed result
	 */
	pushCompletedResult(result: CompleteResult) {
		if (!this.isCompleteResult(result)) {
			throw new Error(COMPLETE_RESULT_VALIDATION_ERROR);
		}
		this._complete$.next(result);
	}

	/**
	 * Insert an incoming new scan result to the report.
	 * @see https://api.copyleaks.com/documentation/v3/webhooks/new-result
	 * @param result the new result
	 */
	public pushNewResult(result: NewResult) {
		if (!this.isNewResult(result)) {
			throw new Error(NEW_RESULT_VALIDATION_ERROR);
		}
		this._preview$.next(result.internet[0] || result.database[0] || result.batch[0] || result.repositories[0]);
	}

	/**
	 * Insert the downloaded source you scanned to the report.
	 * @see https://api.copyleaks.com/documentation/v3/downloads/source
	 * @param source the downloaded source
	 */
	pushDownloadedSource(source: ScanSource) {
		if (!this.isCorrectVersion(source)) {
			throw new Error(VERSION_VALIDATION_ERROR);
		}
		if (!this.isScanSource(source)) {
			throw new Error(SCAN_SOURCE_VALIDATION_ERROR);
		}
		this._source$.next(source);
	}
	/**
	 * Insert one or more downloaded scan result to the report.
	 * @see https://api.copyleaks.com/documentation/v3/downloads/result
	 * @param results one or more ResultItem object containing the result and the id of the result
	 */
	pushScanResult(results: ResultItem[] | ResultItem) {
		results = [].concat(results);
		for (const { id, result } of results) {
			if (typeof id !== 'string') {
				throw new Error(`Argument "id" must be a string`);
			}
			if (result != null && !this.isScanResult(result)) {
				throw new Error(SCAN_RESULT_VALIDATION_ERROR);
			}
		}
		this._results$.next(results);
	}

	/**
	 * Change the progress percentage in the report manualy
	 * @param progress an integer between 0 ~ 100
	 */
	setProgress(progress: number) {
		this._progress$.next(progress);
	}

	/**
	 * change the report's configuration
	 * This function is used to sort the displayed results, you can add your own custom sort by overriding this function
	 * @param previews the displayed results
	 */
	sortScanResults(previews: ResultPreview[]): ResultPreview[] {
		return previews.sort((a, b) => b.matchedWords - a.matchedWords);
	}

	/**
	 * change the report's configuration
	 * allows passing partial configuration that will be complemented by the default configuration
	 * @param config the complete/partial configuration object
	 */
	setConfig(config: CopyleaksReportConfig) {
		this._config$.next({ ...config });
	}

	/**
	 * This method will cause the `destroy$` observable to emit
	 */
	notifyDestroy() {
		this._destroy$.next();
		this.setFilteredResultsIds([]);
	}

	// Simple object validation
	private isCompleteResult = (o: CompleteResult) => o && !!o.scannedDocument && !!o.results;
	private isScanSource = (o: ScanSource) => o && !!o.metadata && !!o.text && !!o.version;
	private isScanResult = (o: ScanResult) => o && !!o.text && !!o.statistics && !!o.version;
	private isNewResult = (o: NewResult) => o && !!o.internet && !!o.database && !!o.batch;
	private isCorrectVersion = (o: ScanResult | ScanSource) => o && o.version === 3;
}
