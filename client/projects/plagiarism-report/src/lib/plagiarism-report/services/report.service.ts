import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { untilDestroy } from '../../shared/operators/untilDestroy';
import { CompleteResult, CopyleaksReportConfig, ResultItem, ResultPreview, ScanSource } from '../models';
import { DEFAULT_REPORT_CONFIG } from '../utils/constants';
import { truthy } from '../utils/operators';
import { CopyleaksService } from './copyleaks.service';

/**
 * @todo implement saving options localstorage
 */
@Injectable()
export class ReportService implements OnDestroy {
	// * scans API items
	private _completeResult = new BehaviorSubject<CompleteResult>(null);
	private _source = new BehaviorSubject<ScanSource>(null);
	private _previews = new BehaviorSubject<ResultPreview[]>(null);
	private _results = new BehaviorSubject<ResultItem[]>([]);

	// * configurable state
	private _config = new BehaviorSubject<CopyleaksReportConfig>(DEFAULT_REPORT_CONFIG);
	private _progress = new BehaviorSubject<number>(null);
	private _hiddenResults = new BehaviorSubject<string[]>([]);

	// * Event emitters
	private _helpClick = new Subject<MouseEvent>();
	private _shareClick = new Subject<MouseEvent>();
	private _downloadClick = new Subject<MouseEvent>();
	private _configChange = new Subject<CopyleaksReportConfig>();

	constructor(private copyleaksService: CopyleaksService) {
		const {
			onCompleteResult$,
			onResultPreview$,
			onProgress$,
			onResultItem$,
			onScanSource$,
			onReportConfig$,
		} = copyleaksService;
		onCompleteResult$.pipe(untilDestroy(this)).subscribe(completeResult => this.setCompleteResult(completeResult));
		onResultPreview$.pipe(untilDestroy(this)).subscribe(preview => this.addPreview(preview));
		onProgress$.pipe(untilDestroy(this)).subscribe(progress => this.setProgress(progress));
		onResultItem$.pipe(untilDestroy(this)).subscribe(resultItem => this.addDownloadedResult(resultItem));
		onScanSource$.pipe(untilDestroy(this)).subscribe(source => this.setSource(source));
		onReportConfig$.pipe(untilDestroy(this)).subscribe(config => this.configure(config));
		this.config$.pipe(untilDestroy(this)).subscribe(config => this._configChange.next(config));
		combineLatest([this.source$, this.completeResult$])
			.pipe(
				untilDestroy(this),
				take(1)
			)
			.subscribe(() => this._progress.next(100));
	}

	public completeResult$: Observable<CompleteResult> = this._completeResult.asObservable().pipe(
		truthy(),
		take(1)
	);

	public source$ = this._source.asObservable().pipe(
		truthy(),
		take(1)
	);
	public progress$ = this._progress.asObservable();

	/** config observable */
	public config$ = this._config.asObservable();
	/** sub config observeables */
	public contentMode$ = this.config$.pipe(map(x => x.contentMode));
	public viewMode$ = this.config$.pipe(map(x => x.viewMode));
	public suspectId$ = this.config$.pipe(map(x => x.suspectId));
	public help$ = this.config$.pipe(map(x => x.help));
	public download$ = this.config$.pipe(map(x => x.download));
	public share$ = this.config$.pipe(map(x => x.share));
	public options$ = this.config$.pipe(map(x => x.options));
	public onlyOneToOne$ = this.config$.pipe(map(x => x.disableSuspectBackButton));
	public sourcePage$ = this.config$.pipe(map(x => x.sourcePage));
	public suspectPage$ = this.config$.pipe(map(x => x.suspectPage));
	public suspect$: Observable<ResultItem> = this.suspectId$.pipe(
		switchMap(id => (id ? this.findResultById$(id) : of(null)))
	);

	public hiddenResults$ = this._hiddenResults.asObservable().pipe(distinctUntilChanged());
	public results$ = this._results.asObservable().pipe(truthy());
	public previews$ = this._previews.asObservable().pipe(truthy());
	public filteredPreviews$ = combineLatest([this.previews$, this.hiddenResults$]).pipe(
		map(([results, ids]) => results.filter(result => !ids.includes(result.id)))
	);
	public filteredResults$ = combineLatest([this.results$, this.hiddenResults$]).pipe(
		map(([results, ids]) => results.filter(result => !ids.includes(result.id)))
	);

	public helpClick$ = this._helpClick.asObservable();
	public downloadClick$ = this._downloadClick.asObservable();
	public shareClick$ = this._shareClick.asObservable();
	public configChange$ = this._configChange.asObservable();

	/**
	 * Get an observable of some result by id
	 * The observable completes after emitting the result
	 * @param id the result id
	 */
	public findResultById$(id: string) {
		return this.results$.pipe(
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
		if (!completeResult.scannedDocument.creationTime.endsWith('Z')) {
			completeResult.scannedDocument.creationTime += 'Z';
		}
		this._completeResult.next(completeResult);
	}

	/**
	 * Pushes a new scan `source` to the source observer
	 * @param source the scanned document source
	 */
	public setSource(source: ScanSource) {
		this._source.next(source);
		/** Switch to text in case no html exists */
		if (source && (!source.html || !source.html.value) && this._config.value.contentMode === 'html') {
			this.configure({ contentMode: 'text' });
		}
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
	 * Pushes a new list of `ids` to the hidden results observer
	 * @param ids the ids to hide
	 */
	public setHiddenResults(ids: string[]) {
		this._hiddenResults.next(ids);
	}
	/**
	 * Pushes a new `event` to the help-click observer, indicating the help button was clicked
	 * @param event native click event
	 */
	public helpBtnClicked(event: MouseEvent) {
		this._helpClick.next(event);
	}
	/**
	 * Pushes a new `event` to the share-click observer, indicating the share button was clicked
	 * @param event native click event
	 */
	public shareBtnClicked(event: MouseEvent) {
		this._shareClick.next(event);
	}
	/**
	 * Pushes a new `event` to the download-click observer, indicating the download button was clicked
	 * @param event native click event
	 */
	public downloadBtnClicked(event: MouseEvent) {
		this._downloadClick.next(event);
	}

	/**
	 * Push a new `preview` of a result to the previews observer
	 * This function does nothing if the complete result is ready
	 * or if the preview was allready pushed
	 * @param preview the preview to push next
	 */
	public addPreview(preview: ResultPreview) {
		if (!this._completeResult.value && !(this._previews.value || []).find(p => p.id === preview.id)) {
			this._previews.next([...(this._previews.value || []), preview]);
		}
	}

	/**
	 * Pushes a new `result` to the results observer
	 * @param resultItem an object containing an id and a result
	 */
	public addDownloadedResult(resultItem: ResultItem) {
		if (!this._results.value.find(r => r.id === resultItem.id)) {
			this._results.next([...this._results.value, resultItem]);
		}
	}

	/**
	 * Edit the current state of the report using either a full or partial configuration object
	 * @param config the configuration object
	 */
	configure(config: CopyleaksReportConfig) {
		this._config.next(Object.assign(this._config.value, config));
	}

	/** Completes all subjects to prevent memory leak */
	public cleanup() {
		this._config.complete();
		this._completeResult.complete();
		this._source.complete();
		this._previews.complete();
		this._results.complete();
		this._progress.complete();
		this._hiddenResults.complete();
		this._downloadClick.complete();
		this._shareClick.complete();
		this._configChange.complete();
	}

	/** Clean all subjects and notify that the report has been destroyed */
	ngOnDestroy() {
		this.cleanup();
		this.copyleaksService.notifyDestroy();
	}
}
