import { Component, OnInit } from '@angular/core';
import { IMAGES } from '../../assets/images';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';

@Component({
	selector: 'cr-plagiarism-free',
	templateUrl: `./plagiarism-free.component.html`,
	styleUrls: ['./plagiarism-free.component.scss']
})
export class PlagiarismFreeComponent implements OnInit {
	public readonly plagFreeImg = IMAGES.PLAGIARISM_FREE_PNG;
	translations: CopyleaksTranslations;
	constructor(private translateService: CopyleaksTranslateService) { }
	/**
	 * init translation on componenet init
	 */
	ngOnInit() {
		this.translations = this.translateService.translations;
	}
}
