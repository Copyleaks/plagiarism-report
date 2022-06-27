import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'cls-spinner',
	templateUrl: './spinner.component.html',
	styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent implements OnInit {
	@Input() width = '100px';
	@Input() color = '#17a1ff';
	constructor() {}

	ngOnInit() {}
}
