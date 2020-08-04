import { Component, OnInit } from '@angular/core';
import { CompleteResultNotification, CompleteResultNotificationAlertSeverity } from '../../models';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'cr-notifications-dialog',
	templateUrl: './notifications-dialog.component.html',
	styleUrls: ['./notifications-dialog.component.scss']
})
export class NotificationsDialogComponent implements OnInit {
	notification: CompleteResultNotification;
	severity = CompleteResultNotificationAlertSeverity;
	constructor(dialogRef: MatDialogRef<NotificationsDialogComponent>) {
		dialogRef.addPanelClass('copyleaks-report-dialog');
	}
	ngOnInit() {
		this.notification = {
			alerts: [
				{
					code: 'repository-scan-failed',
					title: 'Shiba Inu',
					message: 'The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.',
					helpLink: null,
					severity: 1,
					additionalData: '{"repositoryId":"a","repositoryName":"a"}'
				},
				{
					code: 'repository-index-failed',
					title: 'Not able to Index Against Repository',
					message: 'You do not have permission to index against `a` or the repository does not exists.',
					helpLink: null,
					severity: 2,
					additionalData: '{"repositoryId":"a","repositoryName":"a"}'
				},
				{
					code: 'repository-index-failed',
					title: 'Not able to Index Against Repository',
					message: 'You do not have permission to index against `a` or the repository does not exists.',
					helpLink: null,
					severity: 3,
					additionalData: '{"repositoryId":"a","repositoryName":"a"}'
				},
				{
					code: 'repository-index-failed',
					title: 'Not able to Index Against Repository',
					message: 'You do not have permission to index against `a` or the repository does not exists.',
					helpLink: null,
					severity: 4,
					additionalData: '{"repositoryId":"a","repositoryName":"a"}'
				}
			]
		}
	}

}
