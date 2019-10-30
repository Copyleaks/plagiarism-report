import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import {
	CompleteResult,
	ContentMode,
	CopyleaksReportConfig,
	CopyleaksReportOptions,
	ReportDownloadEvent,
	ReportShareEvent,
	ReportStatistics,
	ResultItem,
	ResultPreview,
	ScanResult,
	ScanSource,
	ViewMode,
} from '../models';
import { COPYLEAKS_CONFIG_INJECTION_TOKEN, DEFAULT_REPORT_CONFIG, REPORT_SERVICE } from '../utils/constants';
import { truthy } from '../utils/operators';

/**
 * Get the user's report options from localstorage
 */
const settingsFromLocalStorage = JSON.parse(localStorage.getItem(REPORT_SERVICE.RESULTS_SETTINGS_KEY));

@Injectable({
	providedIn: 'root',
})
export class ReportService {
	/** scans api items state */
	private _completeResult: BehaviorSubject<CompleteResult>;
	private _source: BehaviorSubject<ScanSource>;
	private _previews: BehaviorSubject<ResultPreview[]>;
	private _results: BehaviorSubject<ResultItem[]>;

	/** report display state */
	private _viewMode: BehaviorSubject<ViewMode>;
	private _contentMode: BehaviorSubject<ContentMode>;
	private _suspectId: BehaviorSubject<string>;
	private _share: BehaviorSubject<boolean>;
	private _download: BehaviorSubject<boolean>;
	private _progress: BehaviorSubject<number>;
	private _statistics: BehaviorSubject<ReportStatistics>;

	/** settings state */
	private _hiddenResults: BehaviorSubject<string[]>;
	private _options: BehaviorSubject<CopyleaksReportOptions>;

	/** user event emitters */
	private _downloadClick = new Subject<ReportDownloadEvent>();
	private _shareClick = new Subject<ReportShareEvent>();

	constructor(@Optional() @Inject(COPYLEAKS_CONFIG_INJECTION_TOKEN) private _config?: CopyleaksReportConfig) {}

	/**
	 * An initialization method for reseting the state
	 */
	public initialize() {
		this._completeResult && this._completeResult.complete();
		this._completeResult = new BehaviorSubject<CompleteResult>(null);
		this._source && this._source.complete();
		this._source = new BehaviorSubject<ScanSource>(null);
		this._previews && this._previews.complete();
		this._previews = new BehaviorSubject<ResultPreview[]>([]);
		this._results && this._results.complete();
		this._results = new BehaviorSubject<ResultItem[]>([]);

		this._viewMode && this._viewMode.complete();
		this._viewMode = new BehaviorSubject<ViewMode>(this.config.viewMode);
		this._contentMode && this._contentMode.complete();
		this._contentMode = new BehaviorSubject<ContentMode>(this.config.contentMode);
		this._suspectId && this._suspectId.complete();
		this._suspectId = new BehaviorSubject<string>(null);
		this._share && this._share.complete();
		this._share = new BehaviorSubject<boolean>(this.config.share);
		this._download && this._download.complete();
		this._download = new BehaviorSubject<boolean>(this.config.download);
		this._progress && this._progress.complete();
		this._progress = new BehaviorSubject<number>(null);
		this._statistics && this._statistics.complete();
		this._statistics = new BehaviorSubject<ReportStatistics>(null);

		this._hiddenResults && this._hiddenResults.complete();
		this._hiddenResults = new BehaviorSubject<string[]>([]);
		this._options && this._options.complete();
		this._options = new BehaviorSubject<CopyleaksReportOptions>(settingsFromLocalStorage || this.config.options);

		combineLatest([this.source$, this.completeResult$])
			.pipe(take(1))
			.subscribe(() => this._progress.next(100));
	}

	public get statistics$() {
		return this._statistics.asObservable();
	}

	public get suspect$(): Observable<ResultItem> {
		return this._suspectId.asObservable().pipe(switchMap(id => (id ? this.findResultById$(id) : of(null))));
	}

	public get completeResult$() {
		return this._completeResult.asObservable().pipe(
			truthy(),
			take(1)
		);
	}

	public get source$() {
		return this._source.asObservable().pipe(
			truthy(),
			take(1)
		);
	}

	public get suspectId$() {
		return this._suspectId.asObservable();
	}

	public get progress$() {
		return this._progress.asObservable();
	}

	public get viewMode$() {
		return this._viewMode.asObservable().pipe(distinctUntilChanged());
	}

	public get contentMode$() {
		return this._contentMode.asObservable().pipe(distinctUntilChanged());
	}

	public get hiddenResults$() {
		return this._hiddenResults.asObservable().pipe(distinctUntilChanged());
	}

	public get options$() {
		return this._options.asObservable().pipe(truthy());
	}

	public get download$() {
		return this._download.asObservable().pipe(distinctUntilChanged());
	}

	public get share$() {
		return this._share.asObservable().pipe(distinctUntilChanged());
	}

	public get downloadClick$() {
		return this._downloadClick.asObservable();
	}

	public get shareClick$() {
		return this._shareClick.asObservable();
	}

	public get results$() {
		return this._results.asObservable();
	}

	public get previews$() {
		return this._previews.asObservable();
	}

	public get filteredPreviews$() {
		return combineLatest([this.previews$, this.hiddenResults$]).pipe(
			map(([results, ids]) => results.filter(result => !ids.includes(result.id)))
		);
	}

	public get filteredResults$() {
		return combineLatest([this.results$, this.hiddenResults$]).pipe(
			map(([results, ids]) => results.filter(result => !ids.includes(result.id)))
		);
	}

	/**
	 * Get the report config, can be a config provided by client, or a default config.
	 */
	public get config() {
		return this._config || DEFAULT_REPORT_CONFIG;
	}

	/**
	 * Retrieves the result item with the given id
	 * @param id the result id to find
	 */
	public findResultById(id: string) {
		return this._results.value.find(res => res.id === id);
	}

	/**
	 * Get an observable of some result by id
	 * The observable completes after emitting the result
	 * @param id the result id
	 */
	public findResultById$(id: string) {
		return this._results.pipe(
			map(results => results.find(res => res.id === id)),
			truthy(),
			take(1)
		);
	}

	/**
	 * Pushes a new complete result that contains the report `metadata` and updates the metadata observer.
	 * @param completeResult the complete result object
	 */
	public setCompleteResult(completeResult: CompleteResult) {
		const { internet, database, batch } = completeResult.results;
		const previews = [...internet, ...database, ...batch];
		previews.sort((a, b) => a.matchedWords - b.matchedWords).forEach(preview => this.addPreview(preview));
		this._previews.next(previews);
		this._completeResult.next(completeResult);
	}

	/**
	 * Pushes a new scan `source` to the source observer
	 * @param source the scanned document source
	 */
	public setSource(source: ScanSource) {
		this._source.next(source);

		/** Switch to text in case no html exists */
		if (source && !source.html && this._contentMode.value === 'html') {
			this._contentMode.next('text');
		}
	}

	/**
	 * Pushes a new `id` to the suspect id observer
	 * @param id the suspect result id
	 */
	public setSuspectId(id: string) {
		this._suspectId.next(id);
	}

	/**
	 * Pushes a new number to the `progress` observer
	 * Should be a positive integer between 0 and 100;
	 * if `progress` is equal to 100 then the progress observer will complete.
	 * (This behaviour might change in the future)
	 * @param progress the progress to display
	 */
	public setProgress(progress: number) {
		this._progress.next(progress);
	}

	/**
	 * Pushes a new `mode` to the view mode observer
	 * @param mode the view mode to display
	 */
	public setViewMode(mode: ViewMode) {
		this._viewMode.next(mode);
	}

	/**
	 * Pushes a new `mode` to the content mode observer
	 * @param mode the content mode to present
	 */
	public setContentMode(mode: ContentMode) {
		this._contentMode.next(mode);
	}

	/**
	 * Pushes a new list of `ids` to the hidden results observer
	 * @param ids the ids to hide
	 */
	public setHiddenResults(ids: string[]) {
		this._hiddenResults.next(ids);
	}

	/**
	 * Pushes new `options` to the options observer.
	 * if `setAsDefault` is set to true, these options will be saved to localStorage
	 * @param options the updated options
	 */
	public setOptions(options: CopyleaksReportOptions) {
		if (options.setAsDefault) {
			localStorage.setItem(REPORT_SERVICE.RESULTS_SETTINGS_KEY, JSON.stringify(options));
		} else {
			localStorage.removeItem(REPORT_SERVICE.RESULTS_SETTINGS_KEY);
		}

		this._options.next(options);
	}

	/**
	 * Sets whether the download button should be visible or not
	 * @param visible if `true` share button will be visible
	 */
	public setDownload(visible: boolean) {
		this._download.next(visible);
	}

	/**
	 * Sets whether the share button should be visible or not
	 * @param visible if `true` share button will be visible
	 */
	public setShare(visible: boolean) {
		this._share.next(visible);
	}

	/**
	 * Pushes a new `event` to the download-click observer, indicating the download button was clicked
	 * @param event the download click event
	 */
	public downloadBtnClicked(event: ReportDownloadEvent) {
		this._downloadClick.next(event);
	}

	/**
	 * Pushes a new `event` to the share-click observer, indicating the share button was clicked
	 * @param event the share click event
	 */
	public shareBtnClicked(event: ReportShareEvent) {
		this._shareClick.next(event);
	}

	/**
	 * Push a new `preview` of a result to the previews observer
	 * @param preview the preview to push next
	 */
	public addPreview(preview: ResultPreview) {
		if (!this._completeResult.value && !this._previews.value.find(p => p.id === preview.id)) {
			this._previews.next([...this._previews.value, preview]);
		}
	}

	/**
	 * Pushes a new `result` to the results observer
	 * @param id the id of the result
	 * @param result the result
	 */
	public addDownloadedResult(id: string, result: ScanResult) {
		if (!this._results.value.find(r => r.id === id)) {
			this._results.next([...this._results.value, { id, result }]);
		}
	}

	/**
	 * This method should be called when feeding report objects is complete.
	 * it will basically complete the source and results observers
	 */
	public done() {
		this._results.complete();
	}
}
