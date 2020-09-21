import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompleteResultNotificationAlert } from '../models';
import { ReportService } from './report.service';

export enum EReportViewModel {
	ScanningResult,
	SuspectedCharacterReplacement
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
	constructor(private reportService: ReportService) { }
	/**
	 * change the view of the report
	 * @param mode view mode
	 */
	changeViewMode$(mode: EReportViewModel, sourcePage = 0) {
		if (sourcePage <= 0) {
			sourcePage = 1
		}
		if (mode === EReportViewModel.SuspectedCharacterReplacement) {
			this.reportService.configure({
				contentMode: 'text'
			});
		} else {
			this.selectedAlert = undefined;
		}
		this._reportViewMode$.next(mode);
	}
}
