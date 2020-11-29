import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CompleteResultNotificationAlert, CompleteResultNotificationAlertSeverity } from '../models';
import { ReportService } from './report.service';

export enum EReportViewModel {
	ScanningResult,
	Alerts,
}

@Injectable()
export class ViewModeService implements OnDestroy {
	private readonly _reportViewMode$ = new BehaviorSubject<EReportViewModel>(EReportViewModel.ScanningResult);
	private _selectedAlert: CompleteResultNotificationAlert;
	private _unsub = new Subject();
	get reportViewMode$() {
		return this._reportViewMode$;
	}
	get selectedAlert() {
		return this._selectedAlert;
	}
	set selectedAlert(alert: CompleteResultNotificationAlert) {
		this._selectedAlert = alert;
	}
	constructor(private reportService: ReportService) {
		this.reportService.completeResult$
			.pipe(
				takeUntil(this._unsub),
				filter(c => !!c.notifications && !!c.notifications.alerts && !!c.notifications.alerts.length)
			)
			.subscribe(completeResult => {
				const alertSeverities = completeResult.notifications.alerts.map(s => +s.severity);
				const severity = Math.max(...alertSeverities);
				if (
					severity === CompleteResultNotificationAlertSeverity.High ||
					severity === CompleteResultNotificationAlertSeverity.VeryHigh
				) {
					this._reportViewMode$.next(EReportViewModel.Alerts);
				}
			});
	}
	/**
	 * change the view of the report
	 * @param mode view mode
	 */
	changeViewMode$(mode: EReportViewModel) {
		this._reportViewMode$.next(mode);
	}

	/**
	 * unsubscribe from observalbes on destroy
	 */
	ngOnDestroy() {
		this._reportViewMode$.unsubscribe();
	}
}
