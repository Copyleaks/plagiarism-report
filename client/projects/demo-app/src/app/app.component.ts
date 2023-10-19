// tslint:disable
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
	constructor(private _router: Router) {}
	ngOnInit() {}
	navigate(path: string) {
		this._router.navigate([path]);
	}
}
