import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { ResultPreview } from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { ReportService } from '../../services/report.service';
import { truthy } from '../../utils/operators';

@Component({
	selector: 'cr-result-card',
	templateUrl: './result-card.component.html',
	styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit {
	@HostBinding('class.mat-elevation-z3')
	public readonly elevation = true;
	@Input()
	public preview: ResultPreview;
	public result: ScanResult;
	public loading = true;
	constructor(private reportService: ReportService) {}

	/**
	 * Card click handler, will update the suspect id and switch to one-to-one view mode
	 */
	onTitleClick() {
		this.reportService.configure({ viewMode: 'one-to-one', suspectId: this.preview.id });
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - the scan result associated with this card
	 */
	ngOnInit() {
		if (this.preview) {
			this.reportService.results$
				.pipe(
					map(results => results.find(res => res.id === this.preview.id)),
					truthy(),
					take(1)
				)
				.subscribe(({ result }) => (this.result = result) && (this.loading = false));
		}
	}
}
