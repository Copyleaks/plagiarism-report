import { Component, OnInit } from '@angular/core';
import { IMAGES } from '../../assets/images';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';

@Component({
	selector: 'cr-plagiarism-free',
	template: `
		<img [src]="plagFreeImg | safe: 'url'" alt="Plagiarism free" />
		<label>{{translations?.PLAGIARISM_FREE || 'Plagiarism Free'}}</label>
	`,
	styles: [
		`
			:host {
				display: flex;
				flex-flow: column nowrap;
				place-items: center center;
			}
			img {
				width: 50%;
			}
			label {
				margin-top: -1em;
				font-size: 1.5em;
			}
		`,
	],
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
