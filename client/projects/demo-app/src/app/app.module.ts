import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CopyleaksReportModule, CopyleaksReportConfig } from 'projects/copyleaks-report/src/public-api';

const reportConfig: CopyleaksReportConfig = {
	contentMode: 'text',
	download: true,
	share: true,
};

@NgModule({
	declarations: [AppComponent],
	imports: [
		CommonModule,
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		FlexLayoutModule,
		CopyleaksReportModule.forRoot(reportConfig),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
