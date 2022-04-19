import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Routes for router module */
const routes: Routes = [
	{
		path: 'demo1',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: 'demo2',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: 'main',
		loadChildren: () => import(`./pages/main-page/main-page-routing.module`).then(mod => mod.MainPageRoutingModule),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'demo1/default',
	},
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class RoutingModule {}
