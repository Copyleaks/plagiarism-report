// tslint:disable
import { Component, OnInit } from '@angular/core';
enum EViewMode {
	Dashboard,
	Fullscreen,
}
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	eViewMode = EViewMode;
	viewMode = EViewMode.Dashboard;
	constructor() {}
	ngOnInit() {}
}
