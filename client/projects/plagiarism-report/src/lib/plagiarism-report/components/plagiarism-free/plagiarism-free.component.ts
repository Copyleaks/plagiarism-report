import { Component } from '@angular/core';
import { IMAGES } from '../../assets/images';

@Component({
	selector: 'cr-plagiarism-free',
	template: `
		<img [src]="plagFreeImg | safe: 'url'" alt="Plagiarism free" />
		<label>Plagiarism Free</label>
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
export class PlagiarismFreeComponent {
	public readonly plagFreeImg = IMAGES.PLAGIARISM_FREE_PNG;
}
