import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Routes for router module */
const routes: Routes = [
	{
		path: 'example1',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: 'example2',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'example1/martina',
	},
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class RoutingModule { }
