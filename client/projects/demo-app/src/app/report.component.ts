/* tslint:disable */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import deepEqual from 'deep-equal';
import { untilDestroy } from 'projects/plagiarism-report/src/lib/shared/operators/untilDestroy';
import {
	CopyleaksReportConfig,
	CopyleaksService,
	DEFAULT_REPORT_CONFIG,
	ResultItem,
} from 'projects/plagiarism-report/src/public-api';
import { forkJoin, from, interval, zip, of } from 'rxjs';
import { delay, distinctUntilChanged, map, retry, take, takeUntil, catchError } from 'rxjs/operators';
import { ResultsService } from './results.service';
import { ScanResultComponent } from './components/scan-result/scan-result.component';

@Component({
	selector: 'app-report',
	template: `
		<cr-copyleaks-report
			[config]="config"
			(configChange)="onConfigChange($event)"
			(help)="onBtnClick($event)"
			(share)="onBtnClick($event)"
			(download)="onBtnClick($event)"
		></cr-copyleaks-report>
	`,
	styles: [
		`
			:host {
				min-height: 100%;
				display: contents;
			}
		`,
	],
})
export class ReportComponent implements OnInit, OnDestroy {
	public config: CopyleaksReportConfig = {
		share: true,
		help: true,
		download: true,
		disableSuspectBackButton: false,
		contentMode: 'text',
	};

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private copyleaksService: CopyleaksService,
		private resultsService: ResultsService
	) { }

	ngOnInit() {
		const config = this.configFromQuery(this.activatedRoute.snapshot.queryParamMap);
		const query = this.queryFromConfig(config);
		this.router.navigate([], {
			queryParams: query,
			replaceUrl: true,
		});
		this.activatedRoute.queryParamMap
			.pipe(
				untilDestroy(this),
				distinctUntilChanged(deepEqual)
			)
			.subscribe(params => this.onQueryChange(params));

		this.simulateSync(this.activatedRoute.snapshot.paramMap.get('scanId'));

		// For overriding result sorting
		// this.copyleaksService.sortScanResults = (previews) => {
		// 	return previews.sort((a, b) => a.matchedWords - b.matchedWords);
		// }


		// for filter watch and init
		// this.copyleaksService.setFilteredResultsIds(["7e6afb5b02", "66f40ab6c4", "4529c2be00", "c6efe92177", "dc8634951f"]);
		// this.copyleaksService.filteredResultsIds$.pipe(untilDestroy(this), distinctUntilChanged()).subscribe(ids => console.log(ids));

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
				delay(5000),
				retry(3)
			)
			.subscribe(source => this.copyleaksService.pushDownloadedSource(source));

		this.resultsService
			.completeResult(scanId)
			.pipe(
				takeUntil(destroy$),
				delay(5000),
				retry(3)
			)
			.subscribe(result => this.copyleaksService.pushCompletedResult(result));

		this.resultsService
			.completeResult(scanId)
			.pipe(
				takeUntil(destroy$),
				delay(5000)
			)
			.subscribe(({ results }) => {
				zip(from(results.internet), interval(500))
					.pipe(
						takeUntil(destroy$),
						take(results.internet.length)
					)
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [item], database: [], batch: [] });
						this.resultsService
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.copyleaksService.pushScanResult({ id: item.id, result: data }));
					});

				zip(from(results.database), interval(500))
					.pipe(
						takeUntil(destroy$),
						take(results.database.length)
					)
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [], database: [item], batch: [] });
						this.resultsService
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.copyleaksService.pushScanResult({ id: item.id, result: data }));
					});

				zip(from(results.batch), interval(500))
					.pipe(
						takeUntil(destroy$),
						take(results.batch.length)
					)
					.subscribe(([item]) => {
						this.copyleaksService.pushNewResult({ internet: [], database: [], batch: [item] });
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
		const completeResult$ = this.resultsService.completeResult(scanId).pipe(
			takeUntil(destroy$),
			retry(3)
		);
		const downloadedSource$ = this.resultsService.downloadedSource(scanId).pipe(
			takeUntil(destroy$),
			retry(3)
		);
		downloadedSource$.subscribe(source => this.copyleaksService.pushDownloadedSource(source));
		completeResult$.subscribe(meta => {
			meta.results.batch = meta.results.batch.map(r => ({ ...r, component: ScanResultComponent }))
			// meta.results.internet = meta.results.internet.map(r => ({ ...r, component: ScanResultComponent }))
			meta.results.database = meta.results.database.map(r => ({ ...r, component: ScanResultComponent }))

			this.copyleaksService.pushCompletedResult(meta);
			const { internet, database, batch } = meta.results;
			const requests = [...internet, ...database, ...batch].map(item =>
				this.resultsService.newResult(meta.scannedDocument.scanId, item.id).pipe(
					takeUntil(destroy$),
					retry(5),
					delay(10000),
					map(result => ({ id: item.id, result: { ...result, component: this.useResultComponent() ? ScanResultComponent : null } } as ResultItem)),
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
	ngOnDestroy() { }
}

@Component({
	selector: 'app-empty',
	template: ``,
})
export class EmptyComponent {
	constructor() { }
}
