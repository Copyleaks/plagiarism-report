import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { CopyleaksReportOptions } from '../../models/ResultsSettings';
import { ReportService } from '../../services/report.service';
import { truthy } from '../../utils/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';
import { DirectionService } from '../../services/direction.service';

@Component({
	selector: 'cr-options-dialog',
	templateUrl: './options-dialog.component.html',
	styleUrls: ['./options-dialog.component.scss'],
})
export class OptionsDialogComponent implements OnInit, OnDestroy {
	translations: CopyleaksTranslations;
	constructor(
		private translatesService: CopyleaksTranslateService,
		private dialogRef: MatDialogRef<OptionsDialogComponent>,
		public directionService: DirectionService,
		@Inject(MAT_DIALOG_DATA) public reportService: ReportService
	) {}

	public options: CopyleaksReportOptions;
	/**
	 * Closes the dialog while indicating whether to save changes or not.
	 */
	close(save?: boolean) {
		this.dialogRef.close(save);
	}
	/**
	 * Life-cycle method
	 * subscribe to:
	 * - current report settings ( clone it)
	 * - dialog events
	 */
	ngOnInit() {
		this.translations = this.translatesService.translations;
		this.reportService.options$.pipe(untilDestroy(this), take(1)).subscribe(options => (this.options = { ...options }));
		this.dialogRef
			.beforeClosed()
			.pipe(truthy())
			.subscribe(() => this.reportService.configure({ options: this.options }));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
