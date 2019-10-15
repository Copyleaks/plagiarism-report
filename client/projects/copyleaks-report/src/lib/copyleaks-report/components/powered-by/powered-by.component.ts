import { Component, OnInit, HostBinding } from '@angular/core';
import { logoSvg } from '../../assets/images';

@Component({
	selector: 'cr-powered-by',
	templateUrl: './powered-by.component.html',
	styleUrls: ['./powered-by.component.scss'],
})
export class PoweredByComponent {
	readonly logo = logoSvg;
}
