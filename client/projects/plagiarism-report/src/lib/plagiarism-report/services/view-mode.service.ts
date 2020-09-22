import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompleteResultNotificationAlert } from '../models';

export enum EReportViewModel {
	ScanningResult,
	Alerts
}

@Injectable()
export class ViewModeService {
	private readonly _reportViewMode$ = new BehaviorSubject<EReportViewModel>(EReportViewModel.ScanningResult);
	private _selectedAlert: CompleteResultNotificationAlert;
	get reportViewMode$() {
		return this._reportViewMode$;
	}
	get selectedAlert() {
		return this._selectedAlert;
	}
	set selectedAlert(alert: CompleteResultNotificationAlert) {
		this._selectedAlert = alert;
	}
	constructor() { }
	/**
	 * change the view of the report
	 * @param mode view mode
	 */
	changeViewMode$(mode: EReportViewModel) {
		this._reportViewMode$.next(mode);
	}
}
