import { Component } from '@angular/core';
import { SVG } from '../../assets/images';

@Component({
	selector: 'cr-powered-by',
	templateUrl: './powered-by.component.html',
	styleUrls: ['./powered-by.component.scss'],
})
export class PoweredByComponent {
	readonly logo = SVG.LOGO;
}
