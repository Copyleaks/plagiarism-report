import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportComponent } from './report.component';

/** Routes for router module */
const routes: Routes = [
	{
		path: ':scanId/:suspectId',
		component: ReportComponent,
	},
	{
		path: ':scanId',
		component: ReportComponent,
	},
	{
		path: '',
		component: ReportComponent,
	},
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class RoutingModule {}
