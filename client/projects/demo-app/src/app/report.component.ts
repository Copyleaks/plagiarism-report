/* tslint:disable */
import { ChangeDetectorRef, Component, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	CopyleaksReportComponent,
	CopyleaksReportConfig,
	CopyleaksService,
} from 'projects/plagiarism-report/src/public-api';
import { forkJoin, from, interval, zip } from 'rxjs';
import { delay, map, retry, take, takeUntil } from 'rxjs/operators';
import { ResultsService } from './results.service';

@Component({
	selector: 'app-report',
	template: `
		<cr-copyleaks-report
			[config]="config"
			(download)="log($event)"
			(share)="log($event)"
			(configChange)="onConfigChange($event)"
		></cr-copyleaks-report>
	`,
	styles: [
		`
			:host {
				width: 100%;
				max-height: 100%;
				overflow-y: auto;
				display: flex;
				position: relative;
			}
		`,
	],
})
export class ReportComponent implements OnInit {
	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private copyleaksService: CopyleaksService,
		private resultsService: ResultsService,
		private cd: ChangeDetectorRef
	) {}

	log = console.log;

	@ViewChildren(CopyleaksReportComponent)
	report: CopyleaksReportComponent;

	config: CopyleaksReportConfig = {
		share: true,
		download: true,
		disableSuspectBackButton: false,
		contentMode: 'text',
	};

	onConfigChange(config: CopyleaksReportConfig) {
		this.router.navigate([], {
			queryParams: {
				suspectId: config.suspectId,
				sourcePage: config.sourcePage,
				suspectPage: config.suspectPage,
				contentMode: config.contentMode,
				viewMode: config.viewMode,
			},
		});
	}

	ngOnInit() {
		const config = {} as CopyleaksReportConfig;
		for (const key in this.activatedRoute.snapshot.queryParams) {
			config[key] = this.activatedRoute.snapshot.queryParams[key];
		}
		if (config.sourcePage) {
			config.sourcePage = Number(config.sourcePage);
		}
		if (config.suspectPage) {
			config.suspectPage = Number(config.suspectPage);
		}
		if (this.activatedRoute.snapshot.params.scanId) {
			config.scanId = this.activatedRoute.snapshot.params.scanId;
		}
		if (this.activatedRoute.snapshot.queryParams.suspectId) {
			config.viewMode = 'one-to-one';
		}
		this.config = { ...this.config, ...config };
		this.cd.detectChanges();
		this.simulateSync(config.scanId);
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
							.subscribe(data => this.copyleaksService.pushScanResult(item.id, data));
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
							.subscribe(data => this.copyleaksService.pushScanResult(item.id, data));
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
							.subscribe(data => this.copyleaksService.pushScanResult(item.id, data));
					});
			});
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
			this.copyleaksService.pushCompletedResult(meta);
			const { internet, database, batch } = meta.results;
			const requests = [...internet, ...database, ...batch].map(item =>
				this.resultsService.newResult(meta.scannedDocument.scanId, item.id).pipe(
					takeUntil(destroy$),
					retry(5),
					map(result => this.copyleaksService.pushScanResult(item.id, result))
				)
			);
			forkJoin(requests).subscribe();
		});
	}
}
