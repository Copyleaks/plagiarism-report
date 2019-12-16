import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportComponent, EmptyComponent } from './report.component';

/** Routes for router module */
const routes: Routes = [
	{
		path: 'empty',
		component: EmptyComponent,
	},
	{
		path: ':scanId',
		component: ReportComponent,
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'martina',
	},
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class RoutingModule {}