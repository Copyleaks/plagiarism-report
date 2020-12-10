import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsDialogComponent } from '../notifications-dialog/notifications-dialog.component';
import { ReportService } from '../../services/report.service';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { filter } from 'rxjs/operators';
import { CompleteResultNotificationAlertSeverity } from '../../models';
import { EReportViewModel, ViewModeService } from '../../services/view-mode.service';
import { BehaviorSubject } from 'rxjs';
@Component({
	selector: 'cr-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
	public severity: CompleteResultNotificationAlertSeverity;
	public severities = CompleteResultNotificationAlertSeverity;
	public currentViewMode$: BehaviorSubject<EReportViewModel>;
	public eReportViewModel = EReportViewModel;
	@Output() severityChange = new EventEmitter<CompleteResultNotificationAlertSeverity>();
	constructor(
		private matDialog: MatDialog,
		private viewModeService: ViewModeService,
		private reportService: ReportService
	) {}
	/**
	 * Life-cycle method
	 */
	ngOnInit() {
		this.currentViewMode$ = this.viewModeService.reportViewMode$;
		this.reportService.completeResult$
			.pipe(
				untilDestroy(this),
				filter(c => !!c.notifications && !!c.notifications.alerts && !!c.notifications.alerts.length)
			)
			.subscribe(completeResult => {
				const alertSeverities = completeResult.notifications.alerts.map(s => +s.severity);
				this.severity = Math.max(...alertSeverities);
				this.severityChange.emit(this.severity);
			});
	}
	/**
	 * shows the notification dialogs with the alerts
	 */
	showNotificationsDialog() {
		this.matDialog.open(NotificationsDialogComponent, {
			autoFocus: false,
			maxWidth: '500px',
			data: this.reportService,
		});
	}
	/**
	 * change view to alerts view
	 */
	toggleView() {
		if (this.viewModeService.reportViewMode$.value !== EReportViewModel.Alerts) {
			this.reportService.configure({ viewMode: 'one-to-many' });
			this.viewModeService.changeViewMode$(EReportViewModel.Alerts);
		} else {
			this.viewModeService.changeViewMode$(EReportViewModel.ScanningResult);
		}
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
