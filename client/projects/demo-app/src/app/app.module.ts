import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoutingModule } from './routing.module';
import { MatIconModule, MatButtonModule, MatListModule } from '@angular/material';
import { ScanResultComponent } from './components/scan-result/scan-result.component';

@NgModule({
	declarations: [
		AppComponent,
		ScanResultComponent],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		FlexLayoutModule,
		RoutingModule,
		MatListModule,
		MatIconModule,
		MatButtonModule,
		MatListModule
	],
	providers: [],
	bootstrap: [AppComponent],
	entryComponents: [ScanResultComponent]
})
export class AppModule { }
