import { Component } from '@angular/core';

enum EViewMode { Dashboard, Fullscreen }

// tslint:disable: completed-docs
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	eViewMode = EViewMode;
	viewMode = EViewMode.Fullscreen;
	constructor() { }
}
