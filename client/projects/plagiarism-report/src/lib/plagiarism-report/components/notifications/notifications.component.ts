import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsDialogComponent } from '../notifications-dialog/notifications-dialog.component';
import { ReportService } from '../../services/report.service';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { filter } from 'rxjs/operators';
import { CompleteResultNotificationAlertSeverity } from '../../models';
@Component({
	selector: 'cr-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
	public severity: CompleteResultNotificationAlertSeverity;
	public severities = CompleteResultNotificationAlertSeverity;
	constructor(private matDialog: MatDialog, private reportService: ReportService) { }
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
				const alertSeverities = completeResult.notifications.alerts.map(s => +s.severity);
				this.severity = Math.max(...alertSeverities);
			});
	}
	/**
 	* shows the notification dialogs with the alerts
 	*/
	showNotificationsDialog() {
		this.matDialog.open(NotificationsDialogComponent, {
			autoFocus: false,
			maxWidth: '500px',
			data: this.reportService
		})
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() { }
}
