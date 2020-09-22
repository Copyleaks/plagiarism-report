import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './main-page.component';

// tslint:disable-next-line: completed-docs
const routes: Routes = [
	{
		path: '',
		component: MainPageComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MainPageRoutingModule { }
