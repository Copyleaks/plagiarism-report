import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, find, map, switchMap, take, toArray } from 'rxjs/operators';
import {
	CompleteResult,
	ContentMode,
	CopyleaksReportConfig,
	Match,
	ReportDownloadEvent,
	ReportShareEvent,
	ReportStatistics,
	ResultItem,
	ResultPreview,
	ResultsSettings,
	ScanResult,
	ScanSource,
	ViewMode,
} from '../models';
import { COPYLEAKS_CONFIG_INJECTION_TOKEN, REPORT_SERVICE } from '../utils/constants';
import { truthy } from '../utils/operators';

/** The default report settings */
const DEFAULT_SETTINGS: ResultsSettings = {
	showPageSources: false,
	showOnlyTopResults: true,
	showRelated: true,
	showIdentical: true,
	showMinorChanges: true,
	setAsDefault: false,
};

@Injectable({
	providedIn: 'root',
})
export class ReportService {
	private readonly _metadata = new BehaviorSubject<CompleteResult>(undefined);
	private readonly _source = new BehaviorSubject<ScanSource>(undefined);
	private readonly _suspectId = new BehaviorSubject<string>(undefined);
	private readonly _progress = new BehaviorSubject<number>(0);
	private readonly _viewMode = new BehaviorSubject<ViewMode>('one-to-many');
	private readonly _contentMode = new BehaviorSubject<ContentMode>(this.config.contentMode);
	private readonly _hiddenResults = new BehaviorSubject<string[]>([]);
	private readonly _settings = new BehaviorSubject<ResultsSettings>(undefined);
	private readonly _download = new BehaviorSubject<boolean>(this.config.download);
	private readonly _share = new BehaviorSubject<boolean>(this.config.share);
	private readonly _downloadClick = new Subject<ReportDownloadEvent>();
	private readonly _shareClick = new Subject<ReportShareEvent>();
	private readonly _previews = new ReplaySubject<ResultPreview>();
	private readonly _jump = new Subject<boolean>();
	private readonly _results = new ReplaySubject<ResultItem>();

	private readonly _sourceSelectedMatch = new Subject<Match>();
	private readonly _suspectSelectedMatch = new Subject<Match>();
	private readonly _originalSelectedMatch = new Subject<Match>();

	private readonly _statistics = new BehaviorSubject<ReportStatistics>(undefined);

	constructor(@Inject(COPYLEAKS_CONFIG_INJECTION_TOKEN) public config?: CopyleaksReportConfig) {
		const settings = JSON.parse(localStorage.getItem(REPORT_SERVICE.RESULTS_SETTINGS_KEY)) || DEFAULT_SETTINGS;
		this.setSettings(settings);
	}

	public jump$ = this._jump.asObservable();
	public statistics$ = this._statistics.asObservable();
	public originalSelectedMatch$ = this._originalSelectedMatch.asObservable();
	public sourceSelectedMatch$ = this._sourceSelectedMatch.asObservable();
	public suspectSelectedMatch$ = this._suspectSelectedMatch.asObservable();

	public suspect$: Observable<ResultItem> = this._suspectId
		.asObservable()
		.pipe(switchMap(id => (id ? this.results$.pipe(find(res => res.id === id)) : of(null))));
	public metadata$ = this._metadata.asObservable().pipe(
		truthy(),
		take(1)
	);
	public source$ = this._source.asObservable().pipe(
		truthy(),
		take(1)
	);

	public suspectId$ = this._suspectId.asObservable();
	public progress$ = this._progress.asObservable();
	public viewMode$ = this._viewMode.asObservable().pipe(distinctUntilChanged());
	public contentMode$ = this._contentMode.asObservable().pipe(distinctUntilChanged());
	public hiddenResults$ = this._hiddenResults.asObservable().pipe(distinctUntilChanged());
	public settings$ = this._settings.asObservable().pipe(truthy());
	public download$ = this._download.asObservable().pipe(distinctUntilChanged());
	public share$ = this._share.asObservable().pipe(distinctUntilChanged());
	public downloadClick$ = this._downloadClick.asObservable();
	public shareClick$ = this._shareClick.asObservable();
	public results$ = this._results.asObservable();
	public previews$ = this.metadata$.pipe(
		map(({ results }): ResultPreview[] => [...results.internet, ...results.database, ...results.batch])
	);

	public filteredPreviews$ = combineLatest([this.previews$, this.hiddenResults$]).pipe(
		map(([results, ids]) => results.filter(result => !ids.includes(result.id)))
	);
	public filteredResults$ = combineLatest([this.results$.pipe(toArray()), this.hiddenResults$]).pipe(
		map(([results, ids]) => results.filter(result => !ids.includes(result.id)))
	);

	/**
	 * Pushes a new match as the match selected in the source text/html
	 * @param match the selected match
	 */
	public setSourceSelectedMatch(match: Match) {
		this._sourceSelectedMatch.next(match);
	}
	/**
	 * Pushes a new match as the match selected in the suspect text/html
	 * @param match the selected match
	 */
	public setSuspectSelectedMatch(match: Match) {
		this._suspectSelectedMatch.next(match);
	}
	/**
	 * Pushes a new match as the match selected in the original text/html
	 * @param match the selected match
	 */
	public setOriginalSelectedMatch(match: Match) {
		this._originalSelectedMatch.next(match);
	}

	/**
	 * Pushes a new complete result that contains the report `metadata` and updates the metadata observer.
	 * @param metedata the complete result object
	 */
	public setMetadata(metedata: CompleteResult) {
		metedata.results.internet.forEach(preview => this.addPreview(preview));
		metedata.results.database.forEach(preview => this.addPreview(preview));
		metedata.results.batch.forEach(preview => this.addPreview(preview));
		this._metadata.next(metedata);
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
		if (progress !== 100 && !this._progress.isStopped) {
			this._progress.next(progress);
		}
		if (progress === 100 && !this._progress.isStopped) {
			this._progress.next(progress);
			this._progress.complete();
			// this._source.complete();
		}
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
	 * Pushes new `settings` to the settings observer.
	 * if `setAsDefault` is set to true, these settings will be saved to localStorage
	 * @param settings the updated settings
	 */
	public setSettings(settings: ResultsSettings) {
		if (settings.setAsDefault) {
			localStorage.setItem(REPORT_SERVICE.RESULTS_SETTINGS_KEY, JSON.stringify(settings));
		} else {
			localStorage.removeItem(REPORT_SERVICE.RESULTS_SETTINGS_KEY);
		}
		this._settings.next(settings);
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
		this._previews.next(preview);
	}

	/**
	 * Pushes a new `result` to the results observer
	 * @param id the id of the result
	 * @param result the result
	 */
	public addDownloadedResult(id: string, result: ScanResult) {
		this._results.next({ id, result });
	}

	/**
	 * This method should be called when feeding report objects is complete.
	 * it will basically complete the source and results observers
	 */
	public done() {
		this._source.complete();
		this._results.complete();
	}

	/**
	 * Pushes a new jump into the jump observer, indicating a jump to the `next` or previous match
	 * @param next `true` if jumping to next match, `false` if jumping to previous match
	 */
	public jump(next: boolean) {
		this._jump.next(next);
	}
}
