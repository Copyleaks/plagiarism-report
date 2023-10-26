import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { CompleteResultNotification } from '../../models';
import { ReportService } from '../../services/report.service';
import { EReportViewModel, ViewModeService } from '../../services/view-mode.service';
import { ALERTS } from '../../utils/constants';

@Component({
	selector: 'cr-alerts',
	templateUrl: './alerts.component.html',
	styleUrls: ['./alerts.component.scss'],
})
export class AlertsComponent implements OnInit, OnDestroy {
	notification: CompleteResultNotification;
	get selectedAlert() {
		return this.viewModeService?.selectedAlert;
	}
	constructor(private reportService: ReportService, private viewModeService: ViewModeService) {}
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
				this.notification = JSON.parse(JSON.stringify(completeResult.notifications));
				if (this.notification) {
					this.notification.alerts = this.notification.alerts.filter(n => n.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED);
				}
			});
	}
	/**
	 * hide alerts and go back to scanning mode
	 */
	hideAlerts() {
		this.viewModeService.changeViewMode$(EReportViewModel.ScanningResult);
	}
	/**
	 * Life-cycle method
	 * required by untilDestory
	 */
	ngOnDestroy() {}
}
