import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { first, find, take } from 'rxjs/operators';

import { ScanResult } from '../../models/api-models/ScanResult';
import { ReportService } from '../../services/report.service';
import { ResultPreview } from '../../models';

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
	constructor(private reportService: ReportService) {}

	/**
	 * Card click handler, will update the suspect id and switch to one-to-one view mode
	 */
	onTitleClick() {
		this.reportService.setSuspectId(this.preview.id);
		this.reportService.setViewMode('one-to-one');
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
					find(result => result.id === this.preview.id),
					take(1)
				)
				.subscribe(result => (this.result = result.result));
		}
	}
}
