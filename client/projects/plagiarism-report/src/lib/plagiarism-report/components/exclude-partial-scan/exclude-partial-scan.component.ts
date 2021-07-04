import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Match } from '../../models/Matches';
import { ReportService } from '../../services/report.service';

@Component({
	selector: 'span[cr-exclude-partial-scan]',
	styleUrls: ['./exclude-partial-scan.component.scss'],
	template: '<ng-content></ng-content>',
})
export class ExcludePartialScanComponent {
	constructor(public element: ElementRef<HTMLElement>, private reportService: ReportService) {}

	// tslint:disable-next-line:no-input-rename
	@Input('cr-exclude-partial-scan')
	public match: Match;

	/**
	 * emits the upgrade plan event
	 */
	@HostListener('click')
	public click() {
		this.reportService.upgradePlanEvent();
	}
}
