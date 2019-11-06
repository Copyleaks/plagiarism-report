import { Component, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	CopyleaksService,
	CopyleaksReportComponent,
	CopyleaksReportConfig,
} from 'projects/plagiarism-report/src/public-api';
import { ResultsService } from './results.service';
import { takeUntil, retry, take, map, delay } from 'rxjs/operators';

import { zip, from, interval, forkJoin } from 'rxjs';
import { Location } from '@angular/common';

@Component({
	selector: 'app-report',
	template: `
		<cr-copyleaks-report [config]="config" (configChange)="onConfigChange($event)"></cr-copyleaks-report>
	`,
	styles: [
		`
			:host {
				width: 100%;
				height: 100%;
				display: flex;
				padding: 1em;
				box-sizing: border-box;
				position: relative;
			}
		`,
	],
})
export class ReportComponent {
	constructor(
		private location: Location,
		private route: ActivatedRoute,
		private service: CopyleaksService,
		private results: ResultsService
	) {
		this.route.params.subscribe(({ scanId, suspectId }) => {
			console.log('hey');
			if (suspectId) {
				this.config.viewMode = 'one-to-one';
				this.config.suspectId = suspectId;
			}
			if (scanId) {
				this.config.scanId = scanId;
				this.simulateSync(scanId);
			}
		});
	}

	@ViewChildren(CopyleaksReportComponent)
	report: CopyleaksReportComponent;

	config: CopyleaksReportConfig = {
		share: false,
		download: false,
		contentMode: 'text',
	};

	/** on config change handler */
	onConfigChange(config: CopyleaksReportConfig) {
		if (this.config.suspectId !== config.suspectId) {
			this.location.go(`${config.scanId}/${config.suspectId || ''}`);
		}
	}
	/** simulate a real time feed of scan results for a given scan id */
	simulateRealtime(scanId: string) {
		const { onDestroy$: destroy$ } = this.service;
		this.results
			.downloadedSource(scanId)
			.pipe(
				takeUntil(destroy$),
				retry(3)
			)
			.subscribe(source => this.service.pushDownloadedSource(source));

		this.results
			.completeResult(scanId)
			.pipe(
				takeUntil(destroy$),
				delay(5000),
				retry(3)
			)
			.subscribe(result => this.service.pushCompletedResult(result));

		this.results
			.completeResult(scanId)
			.pipe(takeUntil(destroy$))
			.subscribe(({ results }) => {
				zip(from(results.internet), interval(500))
					.pipe(
						takeUntil(destroy$),
						take(results.internet.length)
					)
					.subscribe(([item]) => {
						this.service.pushNewResult({ internet: [item], database: [], batch: [] });
						this.results
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.service.pushScanResult(item.id, data));
					});

				zip(from(results.database), interval(500))
					.pipe(
						takeUntil(destroy$),
						take(results.database.length)
					)
					.subscribe(([item]) => {
						this.service.pushNewResult({ internet: [], database: [item], batch: [] });
						this.results
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.service.pushScanResult(item.id, data));
					});

				zip(from(results.batch), interval(500))
					.pipe(
						takeUntil(destroy$),
						take(results.batch.length)
					)
					.subscribe(([item]) => {
						this.service.pushNewResult({ internet: [], database: [], batch: [item] });
						this.results
							.newResult(scanId, item.id)
							.pipe(takeUntil(destroy$))
							.subscribe(data => this.service.pushScanResult(item.id, data));
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
		const { onDestroy$: destroy$ } = this.service;
		const completeResult$ = this.results.completeResult(scanId).pipe(
			takeUntil(destroy$),
			retry(3)
		);
		const downloadedSource$ = this.results.downloadedSource(scanId).pipe(
			takeUntil(destroy$),
			retry(3)
		);
		downloadedSource$.subscribe(source => this.service.pushDownloadedSource(source));
		completeResult$.subscribe(meta => {
			this.service.pushCompletedResult(meta);
			const { internet, database, batch } = meta.results;
			const requests = [...internet, ...database, ...batch].map(item =>
				this.results.newResult(meta.scannedDocument.scanId, item.id).pipe(
					takeUntil(destroy$),
					retry(5),
					map(result => this.service.pushScanResult(item.id, result))
				)
			);
			forkJoin(requests).subscribe();
		});
	}
}
