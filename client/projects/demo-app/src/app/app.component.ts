import { Component, HostListener, OnInit } from '@angular/core';
import { CopyleaksService } from 'projects/plagiarism-report/src/public-api';
import { forkJoin, from, zip, interval } from 'rxjs';
import { delay, retry, tap, take } from 'rxjs/operators';
import { ResultsService } from './results.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	readonly scanId = 'martina';
	progress = 0;
	public show = true;

	constructor(private service: CopyleaksService, private results: ResultsService) {}
	ngOnInit() {
		//this.simulateSync();
		this.simulateRealtime();
	}

	simulateRealtime() {
		this.results
			.downloadedSource(this.scanId)
			.pipe(
				delay(1000),
				retry(3)
			)
			.subscribe(source => this.service.pushDownloadedSource(source));

		this.results
			.completeResult(this.scanId)
			.pipe(
				delay(5000),
				retry(3)
			)
			.subscribe(result => this.service.pushCompletedResult(result));

		this.results.completeResult(this.scanId).subscribe(({ results }) => {
			zip(from(results.internet), interval(500).pipe(take(results.internet.length))).subscribe(([item]) => {
				this.service.pushNewResult({ internet: [item], database: [], batch: [] });
				setTimeout(() => {
					this.results.newResult(this.scanId, item.id).subscribe(data => this.service.pushScanResult(item.id, data));
				}, 1000);
			});

			zip(from(results.database), interval(500).pipe(take(results.database.length))).subscribe(([item]) => {
				this.service.pushNewResult({ internet: [], database: [item], batch: [] });
				setTimeout(() => {
					this.results.newResult(this.scanId, item.id).subscribe(data => this.service.pushScanResult(item.id, data));
				}, 1000);
			});

			zip(from(results.batch), interval(500).pipe(take(results.batch.length))).subscribe(([item]) => {
				this.service.pushNewResult({ internet: [], database: [], batch: [item] });
				setTimeout(() => {
					this.results.newResult(this.scanId, item.id).subscribe(data => this.service.pushScanResult(item.id, data));
				}, 1000);
			});
		});
	}
	/**
	 * This method simulates a synchronous scan results feed
	 * - feed complete result and source result
	 * - wait for all results
	 * - tell service youre done
	 */
	simulateSync() {
		const completeResult$ = this.results.completeResult(this.scanId).pipe(retry(3));
		const downloadedSource$ = this.results.downloadedSource(this.scanId).pipe(retry(3));
		downloadedSource$.subscribe(source => this.service.pushDownloadedSource(source));
		completeResult$.subscribe(meta => {
			this.service.pushCompletedResult(meta);
			const { internet, database, batch } = meta.results;
			const requests = [...internet, ...database, ...batch].map((item, i, { length }) =>
				this.results.newResult(meta.scannedDocument.scanId, item.id).pipe(
					retry(5),
					tap(result => {
						this.service.pushScanResult(item.id, result);
						this.progress += 100 * (1 / length);
						this.service.setProgress(Math.min(Math.ceil(this.progress), 100));
					})
				)
			);
			forkJoin(requests).subscribe();
		});
	}
}
