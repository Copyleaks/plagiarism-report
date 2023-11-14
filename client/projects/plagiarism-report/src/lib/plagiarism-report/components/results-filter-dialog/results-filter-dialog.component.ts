import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ResultPreview } from '../../models';
import { ReportService } from '../../services/report.service';
import { truthy } from '../../utils/operators';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';
import { DirectionService } from '../../services/direction.service';

@Component({
	selector: 'cr-results-filter-dialog',
	templateUrl: './results-filter-dialog.component.html',
	styleUrls: ['./results-filter-dialog.component.scss'],
})
export class ResultsFilterDialogComponent implements OnInit, OnDestroy {
	query = '';
	hidden: string[] = [];
	hiddenSubscription: Subscription;
	results: ResultPreview[];
	translations: CopyleaksTranslations;
	constructor(
		private translatesService: CopyleaksTranslateService,
		private dialogRef: MatDialogRef<ResultsFilterDialogComponent>,
		public directionService: DirectionService,
		@Inject(MAT_DIALOG_DATA) private reportSerivce: ReportService
	) {}

	/**
	 * Checks whether the hidden results contain a `result`
	 * @param result the result to test
	 */
	isHidden(result: ResultPreview): boolean {
		return this.hidden.includes(result.id);
	}

	/**
	 * Adds or removes the `result` from the hidden results list essentialy checks or unchecks it
	 * @param result the result to check/uncheck
	 */
	toggleResult(result: ResultPreview) {
		const index = this.hidden.indexOf(result.id);
		if (index > -1) {
			this.hidden.splice(index, 1);
		} else {
			this.hidden.push(result.id);
		}
	}
	/**
	 * Checks or unchecks all results
	 */
	checkAll() {
		if (this.hidden.length !== this.results.length) {
			this.hidden = [...this.results.map(r => r.id)];
		} else {
			this.hidden = [];
		}
	}

	/**
	 * Closes the dialog while indicating whether to `save` changes or not.
	 */
	close(save?: boolean) {
		this.dialogRef.close(save);
	}

	/**
	 * Saves the hidden results changes
	 */
	saveChanges() {
		this.reportSerivce.setHiddenResults(this.hidden);
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - result previews
	 * - user defined hidden results
	 * - dialog events
	 */
	ngOnInit() {
		this.translations = this.translatesService.translations;
		const { hiddenResults$, previews$ } = this.reportSerivce;
		previews$.pipe(untilDestroy(this)).subscribe(results => (this.results = results.reverse()));
		hiddenResults$.pipe(take(1)).subscribe(hidden => {
			this.hidden = [...hidden];
		});
		this.dialogRef
			.beforeClosed()
			.pipe(truthy())
			.subscribe(() => this.saveChanges());
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
