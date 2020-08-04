import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsDialogComponent } from '../notifications-dialog/notifications-dialog.component';
enum NotificationType {
	Error,
	Warning,
	Info
}
@Component({
	selector: 'cr-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
	public type = NotificationType.Error;
	notificationType = NotificationType;
	constructor(private matDialog: MatDialog) { }
	ngOnInit() {
		this.showNotificationsDialog();
	}
	showNotificationsDialog() {
		this.matDialog.open(NotificationsDialogComponent, {
			autoFocus: false
		})
	}
}
