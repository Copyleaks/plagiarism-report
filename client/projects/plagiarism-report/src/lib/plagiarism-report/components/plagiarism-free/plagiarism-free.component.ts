import { Component, OnInit } from '@angular/core';
import { IMAGES } from '../../assets/images';
import { CompleteResultNotificationAlertSeverity } from '../../models';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';

@Component({
	selector: 'cr-plagiarism-free',
	templateUrl: `./plagiarism-free.component.html`,
	styleUrls: ['./plagiarism-free.component.scss'],
})
export class PlagiarismFreeComponent implements OnInit {
	public readonly plagFreeImg = IMAGES.PLAGIARISM_FREE_PNG;
	public translations: CopyleaksTranslations;
	public isHighNotificationSeverity = false;

	constructor(private translateService: CopyleaksTranslateService) {}
	/**
	 * init translation on componenet init
	 */
	ngOnInit() {
		this.translations = this.translateService.translations;
	}

	/**
	 * wil be notified on notifications severity change
	 * @param severity latest notifications severity
	 */
	onNotificationSeverityChange(severity: CompleteResultNotificationAlertSeverity) {
		setTimeout(() => {
			this.isHighNotificationSeverity =
				severity === CompleteResultNotificationAlertSeverity.High ||
				severity === CompleteResultNotificationAlertSeverity.VeryHigh;
		});
	}
}
