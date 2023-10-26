import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CompleteResult, CompleteResultNotificationAlert } from '../models';
import { ReportService } from './report.service';
import { ALERTS } from '../utils/constants';

export enum EReportViewModel {
	ScanningResult,
	Alerts,
	AIView,
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
				if (this.reportService.isPlagiarismEnabled()) {
					const hasAlerts = completeResult.notifications?.alerts?.filter(
						s => s.code != ALERTS.SUSPECTED_AI_TEXT_DETECTED
					).length;

					const hasResults =
						!!completeResult.results?.batch?.length ||
						!!completeResult.results?.internet?.length ||
						!!completeResult.results?.database?.length ||
						!!completeResult.results?.repositories?.length;

					if (hasAlerts && !hasResults) {
						this._reportViewMode$.next(EReportViewModel.Alerts);
					}
				} else if (this.reportService.isAiDetectionEnabled()) {
					this.showAIAlertView(completeResult);
				}
			});
	}

	showAIAlertView(completeResult: CompleteResult) {
		this.reportService.configure({ contentMode: 'text' });

		const aiAlert = completeResult.notifications?.alerts?.find(s => s.code == ALERTS.SUSPECTED_AI_TEXT_DETECTED);

		if (aiAlert) {
			this._selectedAlert = aiAlert;
		}

		this._reportViewMode$.next(EReportViewModel.AIView);
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
