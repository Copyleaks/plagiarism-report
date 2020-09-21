import { Component, EventEmitter, Input, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { CompleteResultNotificationAlert, CompleteResultNotificationAlertSeverity, MatchType } from '../../models';
import { MatchService } from '../../services/match.service';
import { EReportViewModel, ViewModeService } from '../../services/view-mode.service';
import { ALERTS } from '../../utils/constants';

@Component({
	selector: 'cr-alert-card',
	templateUrl: './alert-card.component.html',
	styleUrls: ['./alert-card.component.scss']
})
export class AlertCardComponent {
	@Input() alert: CompleteResultNotificationAlert;
	@Output() afterToggleError = new EventEmitter();
	severity = CompleteResultNotificationAlertSeverity;
	alertsConstants = ALERTS;
	get isSelected() {
		return this.viewModeService?.selectedAlert?.code === this.alert?.code;
	}
	constructor(private matchService: MatchService, private viewModeService: ViewModeService) { }
	/**
	 * this function will change the view of the report depanding on the selected alert
	 */
	toggleError(alert: CompleteResultNotificationAlert) {
		if (this.isSelected) {
			this.viewModeService.changeViewMode$(EReportViewModel.ScanningResult);
		} else {
			this.viewModeService.selectedAlert = alert;
			if (alert.code === ALERTS.SUSPECTED_CHARACTER_REPLACEMENT_CODE) {
				this.matchService.originalTextMatches$
					.pipe(take(1))
					.subscribe(text => {
						const sourcePage = text.findIndex(r => r.filter(s => s.match.type !== MatchType.none).length) + 1
						this.viewModeService.changeViewMode$(EReportViewModel.SuspectedCharacterReplacement, sourcePage);
					})
			}
		}
		if (this.afterToggleError) {
			this.afterToggleError.emit();
		}
	}
}
