import { AfterViewChecked, Component, HostListener, OnInit, ViewChildren } from '@angular/core';
import {
	CopyleaksReportComponent,
	CopyleaksService,
	CopyleaksReportConfig,
} from 'projects/plagiarism-report/src/public-api';
import { forkJoin, from, interval, zip } from 'rxjs';
import { delay, map, retry, take, takeUntil } from 'rxjs/operators';
import { ResultsService } from './results.service';

/* tslint:disable */

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewChecked {
	public scanIds = ['feline-friends', 'martina'];
	public show = true;

	constructor(private service: CopyleaksService, private results: ResultsService) {}

	config: CopyleaksReportConfig = {
		share: false,
		download: false,
		viewMode: 'one-to-many',
		contentMode: 'html',
		//suspectId: '0d580af5ea',
	};

	@HostListener('dblclick')
	changeReport() {
		this.show = false;
		this.scanIds = this.scanIds.reverse();
		setTimeout(() => {
			this.show = true;
			this.simulateRealtime(this.currentScanId);
		}, 2000);
	}

	public get currentScanId() {
		return this.scanIds[1];
	}

	@ViewChildren(CopyleaksReportComponent)
	report: CopyleaksReportComponent;

	ngOnInit() {
		this.simulateRealtime(this.currentScanId);
	}

	ngAfterViewChecked(): void {}

	simulateRealtime(scanId: string) {
		const { destroy$ } = this.service;
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
		const { destroy$ } = this.service;
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
