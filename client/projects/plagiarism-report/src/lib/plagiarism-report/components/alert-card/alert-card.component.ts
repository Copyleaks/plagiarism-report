import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { CompleteResultNotificationAlert, CompleteResultNotificationAlertSeverity, MatchType } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { EReportViewModel, ViewModeService } from '../../services/view-mode.service';
import { ALERTS } from '../../utils/constants';

@Component({
	selector: 'cr-alert-card',
	templateUrl: './alert-card.component.html',
	styleUrls: ['./alert-card.component.scss'],
})
export class AlertCardComponent implements OnDestroy {
	@Input() alert: CompleteResultNotificationAlert;
	@Output() afterToggleError = new EventEmitter();
	severity = CompleteResultNotificationAlertSeverity;
	alertsConstants = ALERTS;
	get isSelected() {
		return this.viewModeService?.selectedAlert?.code === this.alert?.code;
	}
	constructor(
		private viewModeService: ViewModeService,
		private highlightService: HighlightService,
		private reportService: ReportService,
		private matchsService: MatchService
	) {}
	/**
	 * this function will select an alert
	 */
	toggleAlertPreview(alert: CompleteResultNotificationAlert) {
		if (this.isSelected) {
			this.viewModeService.selectedAlert = null;
		} else {
			this.viewModeService.selectedAlert = alert;
		}
		this.reportService.configure({ contentMode: 'text' });
		setTimeout(() => {
			this.viewModeService.changeViewMode$(EReportViewModel.Alerts);

			this.matchsService.originalTextMatches$
				.pipe(
					untilDestroy(this),
					take(1),
					filter(
						m => m.filter(mat => mat.filter(match => match.match.type !== MatchType.none).length !== 0).length !== 0
					)
				)
				.subscribe(_ => {
					this.highlightService.jump(true);
				});

			if (this.afterToggleError) {
				this.afterToggleError.emit();
			}
		}, 100);
	}
	/**
	 * life cycel method
	 * required for untilDestored
	 */
	ngOnDestroy() {}
}
