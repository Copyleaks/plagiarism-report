import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CompleteResultNotification } from '../../models';
import { ReportService } from '../../services/report.service';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { filter } from 'rxjs/operators';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'cr-notifications-dialog',
	templateUrl: './notifications-dialog.component.html',
	styleUrls: ['./notifications-dialog.component.scss'],
})
export class NotificationsDialogComponent implements OnInit, OnDestroy {
	notification: CompleteResultNotification;
	constructor(private matDialog: MatDialog, @Inject(MAT_DIALOG_DATA) private reportService: ReportService) {}
	/**
	 * Life-cycle method
	 */
	ngOnInit() {
		this.reportService.completeResult$
			.pipe(
				untilDestroy(this),
				filter(c => !!c.notifications && !!c.notifications.alerts && !!c.notifications.alerts.length)
			)
			.subscribe(completeResult => {
				this.notification = completeResult.notifications;
			});
	}
	/**
	 * close dialog
	 */
	closeDialog() {
		this.matDialog.closeAll();
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
