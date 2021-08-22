import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { IMAGES } from '../../assets/images';
import { CompleteResultNotificationAlertSeverity, ResultItem } from '../../models';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';
import { ReportService } from '../../services/report.service';

@Component({
	selector: 'cr-plagiarism-free',
	templateUrl: `./plagiarism-free.component.html`,
	styleUrls: ['./plagiarism-free.component.scss'],
})
export class PlagiarismFreeComponent implements OnInit {
	public readonly plagFreeImg = IMAGES.PLAGIARISM_FREE_PNG;
	public translations: CopyleaksTranslations;
	public isHighNotificationSeverity = false;
	public results$: Observable<ResultItem[]>;

	constructor(private translateService: CopyleaksTranslateService, private reportService: ReportService) {}
	/**
	 * init translation on componenet init
	 */
	ngOnInit() {
		this.translations = this.translateService.translations;
		this.results$ = this.reportService.results$;
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
