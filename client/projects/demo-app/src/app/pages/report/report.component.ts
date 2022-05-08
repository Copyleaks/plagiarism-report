/* tslint:disable */
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	CopyleaksReportConfig,
	DEFAULT_REPORT_CONFIG,
	ResultItem,
	CopyleaksTranslateService,
	CopyleaksTranslations,
	CopyleaksService,
} from 'projects/plagiarism-report/src/public-api';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { ResultsService } from '../../results.service';
import { untilDestroy } from 'projects/plagiarism-report/src/lib/shared/operators/untilDestroy';
import { distinctUntilChanged, takeUntil, retry, take, map, catchError, delay } from 'rxjs/operators';
import deepEqual from 'deep-equal';
import { zip, from, interval, of, forkJoin } from 'rxjs';
import { ScanResultComponent } from '../../components/scan-result/scan-result.component';
import { ReportScanSummeryComponent } from '../../components/report-scan-summery/report-scan-summery.component';

const USE_CUSTOM_RESULT_COMPONENT = false;

// import * as IntroJs from "intro.js";
@Component({
	selector: 'app-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, OnDestroy {
	public config: CopyleaksReportConfig = {
		share: true,
		help: true,
		download: true,
		disableSuspectBackButton: false,
		contentMode: 'text',
		resultCardActions: [
			{
				name: 'Action 1',
				action: result => console.log(result),
			},
			{
				name: 'Action 2',
				action: result => console.log(result),
			},
		],
		// resultsOverlayComponent: ReportResultsOverlayComponent
	};
	introJS: any;
	preoprtiesExpanded: boolean = true;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private resultsService: ResultsService,
		private reportTranslationsSvc: CopyleaksTranslateService,
		private copyleaksService: CopyleaksService
	) {}

	ngOnInit() {
		// this.copyleaksService.setTotalResults(200);

		// this.translateReport();
		const config = this.configFromQuery(this.activatedRoute.snapshot.queryParamMap);
		const query = this.queryFromConfig(config);
		this.router.navigate([], {
			queryParams: query,
			replaceUrl: true,
		});
		this.activatedRoute.queryParamMap
			.pipe(untilDestroy(this), distinctUntilChanged(deepEqual))
			.subscribe(params => this.onQueryChange(params));

		this.simulateSync(this.activatedRoute.snapshot.paramMap.get('scanId'));

		// For overriding result sorting
		// this.copyleaksService.sortScanResults = (previews) => {
		// 	return previews.sort((a, b) => a.matchedWords - b.matchedWords);
		// }
	}

	translateReport() {
		const translates: CopyleaksTranslations = {
			PLAGIARISM_FREE: 'PLAGIARISM_FREE_T',
			SCAN_PROPERTIES_SECTION: {
				TITLE: 'SCAN_PROPERTIES_T',
				SCANNING: {
					PROGRESS: 'PROGRESS_T',
					DONE: 'DONE_T',
					LOADING: 'LOADING_T',
					SCANNED: 'SCANNED_T',
				},
				RESULTS_FOUND: 'RESULTS_FOUND_T',
				RESULTS_FOUND_TOOLTIP: 'RESULTS_FOUND_TOOLTIP_T',
				SIMILAR_WORDS: 'SIMILAR_WORDS',
				SIMILAR_WORDS_TOOPTIP: 'SIMILAR_WORDS_TOOPTIP',
				MATCH: 'MATCH_T',
				ACTIONS: {
					HELP: 'HELP_T',
					SHARE: 'SHARE_T',
					DOWNLOAD: 'DOWNLOAD_T',
					SETTINGS: 'SETTINGS_T',
				},
			},
			SUBMITTED_TEXT_SECTION: {
				TITLE: 'SUBMITTED_TEXT_TITLE',
			},
			SUSPECT_SECTION: {
				TITLE: 'SUSPECT_TITLE',
			},
			RESULTS_SECTION: {
				TITLE: 'RESULTS_TITLE_T',
				FILTER_TOOLTIP: 'FILTER_TOOLTIP_T',
				FILTERED_RESULTS_TOOLTIP: 'FILTERED_RESULTS_TOOLTIP_T',
				CLEAR_FILTER: 'CLEAR_FILTER_T',
			},
			RESULT_CARD: {
				ACTIONS: {
					EXCLUDE: 'EXCLUDE_T',
				},
				SIMILAR_WORDS: 'SIMILAR_WORDS_T',
				BATCH_RESULT_TOOLTIP: 'BATCH_RESULT_TOOLTIP_T',
				INTERNAL_DATABASE_RESULT_TOOLTIP: 'INTERNAL_DATABASE_RESULT_TOOLTIP_T',
				INTERNET_RESULT_TOOLTIP: 'INTERNET_RESULT_TOOLTIP_T',
				REPOSITORY_RESULT_TOOLTIP: 'REPOSITORY_RESULT_TOOLTIP_T',
				RESULT_ERROR: 'RESULT_ERROR_T',
			},
			FILTER_DIALOG: {
				TITLE: 'TITLE_T',
				CHECK_ALL: 'CHECK_ALL_T',
				UNCHECK_ALL: 'UNCHECK_ALL_T',
				SEARCH_PLACHOLDER: 'SEARCH_PLACHOLDER_T',
			},
			RESULTS_SETTINGS_DIALOG: {
				TITLE: 'TITLE_T',
				SHOW_TOP_100_RESULT: 'SHOW_TOP_100_RESULT_T',
				SET_DEFAULT: 'SET_DEFAULT_T',
			},
			SCAN_SETTINGS: {
				OMITTED: {
					QUOTATIONS: 'QUOTATIONS_T',
					REFERENCES: 'REFERENCES_T',
					CITATIONS: 'CITATIONS_T',
					HTML_TEMPLATES: 'HTML_TEMPLATES_T',
					TABLES_OF_CONTENT: 'TABLES_OF_CONTENT_T',
					SOURCE_CODE_COMMENTS: 'SOURCE_CODE_COMMENTS_T',
					SENSITIVE_DATA: 'SENSITIVE_DATA_T',
					PARTIAL_SCAN: 'PARTIAL_SCAN',
				},
			},
			TIME_AGO: {
				FEW_SECONDS_AGO: 'FEW_SECONDS_AGO_T',
				MINUTE_AGO: 'MINUTE_AGO_T',
				MINUTES_AGO: 'MINUTES_AGO_T',
				HOUR_AGO: 'HOUR_AGO_T',
				HOURS_AGO: 'HOURS_AGO_T',
				DAY_AGO: 'DAY_AGO_T',
				DAYS_AGO: 'DAYS_AGO_T',
				MONTH_AGO: 'MONTH_AGO_T',
				MONTHS_AGO: 'MONTHS_AGO_T',
				YEAR_AGO: 'YEAR_AGO_T',
				YEARS_AGO: 'YEARS_AGO_T',
			},
			SHARED: {
				ACTIONS: {
					CLOSE: 'CLOSE_T',
					SWITCH_TO_TEXTUAL_MODE: 'SWITCH_TO_TEXTUAL_MODE_T',
					SWITCH_TO_RICH_TEXT_MODE: 'SWITCH_TO_RICH_TEXT_MODE_T',
					GO_TO_NEXT_MATCH: 'GO_TO_NEXT_MATCH_T',
					GO_TO_PREV_MATCH: 'GO_TO_PREV_MATCH_T',
					ALIGN_LEFT: 'ALIGN_LEFT_T',
					ALIGN_RIGHT: 'ALIGN_RIGHT_T',
					DECREASE_FONT_SIZE: 'DECREASE_FONT_SIZE_T',
					INCREASE_FONT_SIZE: 'INCREASE_FONT_SIZE_T',
					NEXT_PAGE: 'NEXT_PAGE_T',
					LAST_PAGE: 'LAST_PAGE_T',
					PREV_PAGE: 'PREV_PAGE_T',
					FIRST_PAGE: 'FIRST_PAGE_T',
				},
				WORDS: 'WORDS_T',
				MATCH_TYPES: {
					ORIGINAL: 'ORIGINAL_T',
					IDENTICAL: 'IDENTICAL_T',
					IDENTICAL_TOOLTIP: 'IDENTICAL_TOOLTIP_T',
					MINOR_CHANGES: 'MINOR_CHANGES_T',
					MINOR_CHANGES_TOOLTIP: 'MINOR_CHANGES_TOOLTIP_T',
					RELATED_MEANING: 'RELATED_MEANING_T',
					RELATED_MEANING_TOOLTIP: 'RELATED_MEANING_TOOLTIP_T',
					OMITTED_WORDS: 'OMITTED_WORDS_T',
					OMITTED_WORDS_TOOLTIP: 'OMITTED_WORDS_TOOLTIP_T',
					OMITTED_MATCH_TOOLTIP_TEXT: 'OMITTED_MATCH_TOOLTIP_TEXT_T',
				},
				SAVE: 'SAVE_T',
				POWERED_BY: 'POWERED_BY_T',
				OF: 'OF_T',
			},
		};

		this.reportTranslationsSvc.setTranslations(translates);
	}

	onQueryChange(params: ParamMap) {
		const config = this.configFromQuery(params);
		if (!deepEqual(config, this.config)) {
			this.config = config;
		}
	}

	onConfigChange(config: CopyleaksReportConfig) {
		if (deepEqual(this.config, config)) {
			return;
		}
		const query = this.queryFromConfig(config);
		this.router.navigate([], {
			queryParams: query,
			queryParamsHandling: 'merge',
		});
	}

	configFromQuery(queryParamMap: ParamMap): CopyleaksReportConfig {
		const keys = ['suspectId', 'viewMode', 'contentMode', 'sourcePage', 'suspectPage'];
		const config = {} as CopyleaksReportConfig;
		for (const key of keys) {
			config[key] = queryParamMap.get(key) || config[key];
		}
		return { ...this.config, ...config };
	}

	queryFromConfig(config: CopyleaksReportConfig): Params {
		const keys = ['suspectId', 'viewMode', 'contentMode', 'sourcePage', 'suspectPage'];
		const query = {};
		for (const key of keys) {
			query[key] = config[key] || DEFAULT_REPORT_CONFIG[key];
		}
		return query;
	}

	/**
	 * simulate a real time feed of scan results for a given scan id
	 */
	simulateRealtime(scanId: string) {
		const { onDestroy$: destroy$ } = this.copyleaksService;
		this.resultsService
			.downloadedSource(scanId)
			.pipe(
				takeUntil(destroy$),
				// delay(5000),
				retry(3)
			)
			.subscribe(source => this.copyleaksService.pushDownloadedSource(source));

		this.resultsService
			.completeResult(scanId)
			.pipe(
				takeUntil(destroy$),
				// delay(5000),
				retry(3)
			)
			.subscribe(result => this.copyleaksService.pushCompletedResult(result));

		this.resultsService
			.completeResult(scanId)
			.pipe(
				takeUntil(destroy$)
				// delay(5000)
			)
			.subscribe(({ results }) => {
				zip(from(results.internet), interval(500))
					.pipe(takeUntil(destroy$), take(results.internet.length))
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [item], database: [], batch: [], repositories: [] });
						this.resultsService
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.copyleaksService.pushScanResult({ id: item.id, result: data }));
					});

				zip(from(results.database), interval(500))
					.pipe(takeUntil(destroy$), take(results.database.length))
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [], database: [item], batch: [], repositories: [] });
						this.resultsService
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.copyleaksService.pushScanResult({ id: item.id, result: data }));
					});

				zip(from(results.batch), interval(500))
					.pipe(takeUntil(destroy$), take(results.batch.length))
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [], database: [], batch: [item], repositories: [] });
						this.resultsService
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.copyleaksService.pushScanResult({ id: item.id, result: data }));
					});

				zip(from(results.repositories), interval(500))
					.pipe(takeUntil(destroy$), take(results.repositories.length))
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [], database: [], batch: [], repositories: [item] });
						this.resultsService
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.copyleaksService.pushScanResult({ id: item.id, result: data }));
					});
			});
	}

	useResultComponent() {
		// return (Math.floor(Math.random() * (1000 - 0 + 1) + 0)) % 2 == 0;
		return false;
	}

	/**
	 * This method simulates a synchronous scan results feed
	 * - feed complete result and source result
	 * - wait for all results
	 * - tell service youre done
	 */
	simulateSync(scanId: string) {
		const { onDestroy$: destroy$ } = this.copyleaksService;
		const completeResult$ = this.resultsService.completeResult(scanId).pipe(takeUntil(destroy$), delay(5000), retry(3));
		const downloadedSource$ = this.resultsService.downloadedSource(scanId).pipe(takeUntil(destroy$), retry(3));
		downloadedSource$.subscribe(source => this.copyleaksService.pushDownloadedSource(source));
		completeResult$.subscribe(meta => {
			if (
				meta.scannedDocument.expectedCredits != null &&
				meta.scannedDocument.expectedCredits != meta.scannedDocument.credits
			) {
				this.config = {
					...this.config,
					scanSummaryComponent: ReportScanSummeryComponent,
				};
			}

			meta.results.batch = meta.results.batch.map(r => ({
				...r,
				component: USE_CUSTOM_RESULT_COMPONENT ? ScanResultComponent : null,
			}));
			meta.results.internet = meta.results.internet.map(r => ({
				...r,
				component: USE_CUSTOM_RESULT_COMPONENT ? ScanResultComponent : null,
			}));
			meta.results.database = meta.results.database.map(r => ({
				...r,
				component: USE_CUSTOM_RESULT_COMPONENT ? ScanResultComponent : null,
			}));
			meta.results.repositories =
				meta.results.repositories &&
				meta.results.repositories.map(r => ({
					...r,
					component: USE_CUSTOM_RESULT_COMPONENT ? ScanResultComponent : null,
				}));

			this.copyleaksService.pushCompletedResult(meta);

			// watch for score change
			this.copyleaksService.scoreUpdate$
				.pipe(untilDestroy(this), takeUntil(this.copyleaksService.onDestroy$), distinctUntilChanged())
				.subscribe(score => {
					console.log(score);
				});

			// watch for results filter change
			this.copyleaksService.filteredResultsIds$
				.pipe(untilDestroy(this), takeUntil(this.copyleaksService.onDestroy$), distinctUntilChanged())
				.subscribe(ids => {
					if (meta.filters && meta.filters.resultIds && meta.filters.resultIds.length) {
						for (const id of meta.filters.resultIds) {
							if (!ids.includes(id)) {
								meta.filters.resultIds = meta.filters.resultIds.filter(fid => fid != id);
								this.resultsService
									.newResult(meta.scannedDocument.scanId, id)
									.pipe(
										takeUntil(destroy$),
										retry(5),
										// delay(5000),
										map(
											result =>
												({
													id: id,
													result: { ...result, component: this.useResultComponent() ? ScanResultComponent : null },
												} as ResultItem)
										),
										catchError(() => of({ id: id, result: null }))
									)
									.subscribe(res => {
										this.copyleaksService.pushScanResult(res);
									});
							}
						}
					}
				});

			const { internet, database, batch, repositories } = meta.results;
			const requests = [
				...internet,
				...database,
				...batch,
				...(repositories && repositories.length ? repositories : []),
			]
				.filter(
					res =>
						!(meta.filters && meta.filters.resultIds && meta.filters.resultIds.length) ||
						!meta.filters.resultIds.includes(res.id)
				)
				.map(item =>
					this.resultsService.newResult(meta.scannedDocument.scanId, item.id).pipe(
						takeUntil(destroy$),
						retry(5),
						// delay(5000),
						map(
							result =>
								({
									id: item.id,
									result: { ...result, component: this.useResultComponent() ? ScanResultComponent : null },
								} as ResultItem)
						),
						catchError(() => of({ id: item.id, result: null }))
					)
				);
			forkJoin(requests).subscribe(items => {
				this.copyleaksService.pushScanResult(items);
			});
		});
		// completeResult$.subscribe(meta => {
		// 	this.copyleaksService.pushCompletedResult(meta);
		// 	const { internet, database, batch } = meta.results;
		// 	const requests = [...internet, ...database, ...batch].map(item =>
		// 		this.resultsService.newResult(meta.scannedDocument.scanId, item.id).pipe(
		// 			takeUntil(destroy$),
		// 			retry(5),
		// 			map(result => this.copyleaksService.pushScanResult({ id: item.id, result }))
		// 		)
		// 	);
		// 	forkJoin(requests).subscribe();
		// });
	}

	onBtnClick(event: any) {
		console.log(event);
	}

	upgradePlan(recommendedPagesAmount: number) {
		console.log(`upgrade plan, recommendedPagesAmount:${recommendedPagesAmount}`);
	}

	help() {
		// this.introJS = IntroJs();

		if (this.introJS) {
			this.introJS.removeHints();
			this.introJS.refresh();

			var options = [
				{
					element: document.getElementById('cr-hint-go-to-next-match'),
					hint: 'INTROJS.REPORT_HINTS.GO_TO_NEXT_MATCH',
					hintPosition: 'top-right',
				},
				{
					element: document.getElementById('cr-hint-toggle-content'),
					hint: 'INTROJS.REPORT_HINTS.TOGGLE_CONTENT',
					hintPosition: 'top-right',
				},
				{
					element: document.getElementById('cr-hint-results-filter-list'),
					hint: 'INTROJS.REPORT_HINTS.RESULTS_FILTER_LIST',
					hintPosition: 'top-right',
				},
				{
					element: document.getElementById('cr-hint-results-card'),
					hint: 'INTROJS.REPORT_HINTS.RESULTS_CARD',
					hintPosition: 'top-left',
				},
			];

			if (this.preoprtiesExpanded) {
				options.push(
					{
						element: document.getElementById('cr-hint-results-found'),
						hint: 'INTROJS.REPORT_HINTS.RESULTS_FOUND',
						hintPosition: 'top-middle',
					},
					{
						element: document.getElementById('cr-hint-identical'),
						hint: 'INTROJS.REPORT_HINTS.IDENTICAL',
						hintPosition: 'middle-middle',
					},
					{
						element: document.getElementById('cr-hint-results-score'),
						hint: 'The aggregate score is a percentage based on all of the results compared to the submitted text',
						hintPosition: 'middle-right',
					}
				);
			}

			this.introJS.setOptions({
				tooltipClass: 'copyleaks-intro-tooltip',
				hints: options,
			});
			this.introJS.showHints();
		}
	}

	onPropertiesExpandChange(expanded: boolean) {
		this.preoprtiesExpanded = expanded;
		if (this.introJS) {
			setTimeout(() => {
				this.help();
			}, 300);
		}
	}

	ngOnDestroy() {}
}
