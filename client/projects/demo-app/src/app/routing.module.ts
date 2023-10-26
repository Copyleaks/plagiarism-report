import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Routes for router module */
const routes: Routes = [
	{
		path: 'demo1/report',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: 'demo2/report',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: 'demo3/report',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'demo1/report/bundle',
	},
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class RoutingModule {}
