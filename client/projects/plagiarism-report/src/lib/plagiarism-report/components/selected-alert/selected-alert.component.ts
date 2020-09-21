import { Component, OnInit } from '@angular/core';
import { CompleteResultNotificationAlert } from '../../models';
import { EReportViewModel, ViewModeService } from '../../services/view-mode.service';

@Component({
	selector: 'cr-selected-alert',
	templateUrl: './selected-alert.component.html',
	styleUrls: ['./selected-alert.component.scss']
})
export class SelectedAlertComponent implements OnInit {
	alert: CompleteResultNotificationAlert;
	constructor(private viewModeService: ViewModeService) { }
	/**
	 * Life-cycle method
	 */
	ngOnInit() {
		this.alert = this.viewModeService.selectedAlert;
	}
	/**
	 * hide alerts and go back to scanning mode
	 */
	hideAlerts() {
		this.viewModeService.changeViewMode$(EReportViewModel.ScanningResult);
	}
}
