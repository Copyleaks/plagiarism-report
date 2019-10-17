import { Component, OnInit } from '@angular/core';

// import results_json from 'projects/demo-app/examples/results.json';
import { ResultsService } from './results.service';
import { tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { CopyleakService } from 'projects/plagiarism-report/src/public-api';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	readonly scanId = 'martina';
	progress = 0;
	constructor(private service: CopyleakService, private results: ResultsService) {}
	ngOnInit(): void {
		this.mockFromServer();
	}
	mockFromServer() {
		this.results.completeResult(this.scanId).subscribe(meta => {
			this.service.pushCompletedResult(meta);
			this.results.downloadedSource(meta.scannedDocument.scanId).subscribe(source => {
				this.service.pushDownloadedSource(source);
			});
			const { internet, database, batch } = meta.results;
			const requests = [...internet, ...database, ...batch].map((item, i, { length }) =>
				this.results.newResult(meta.scannedDocument.scanId, item.id).pipe(
					tap(result => {
						this.service.pushScanResult(item.id, result);
						this.progress += 100 * (1 / length);
						this.service.setProgress(Math.min(Math.ceil(this.progress), 100));
					})
				)
			);
			forkJoin(requests).subscribe(() => this.service.done());
		});
	}
}
