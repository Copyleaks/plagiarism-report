import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
// tslint:disable: completed-docs
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	constructor(private router: Router) {}
	paths = ['martina', 'empty', 'fae7ed26-db8d-456b-a835-efaeaf8509da', 'empty'];
	index = 0;

	@HostListener('window:dblclick')
	switchRoute() {
		this.index = (this.index + 1) % 4;
		this.router.navigate([this.paths[this.index]]);
	}
}
