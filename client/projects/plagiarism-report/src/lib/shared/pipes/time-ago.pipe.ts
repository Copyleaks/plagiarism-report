import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import {
	CopyleaksTranslateService,
	CopyleaksTranslations,
} from '../../plagiarism-report/services/copyleaks-translate.service';
@Pipe({
	name: 'timeAgo',
	pure: false,
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
	private timer: number;
	private translates: CopyleaksTranslations;
	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private ngZone: NgZone,
		translateService: CopyleaksTranslateService
	) {
		this.translates = translateService.translations;
	}
	/**
	 * A pipe to transform a date string into a human readable string in the format of `X time ago`
	 * While updating that string as time goes by
	 * @param value date string
	 */
	transform(value: string) {
		this.removeTimer();
		const d = new Date(value);
		const now = new Date();
		const seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
		const timeToUpdate = Number.isNaN(seconds) ? 1000 : this.getSecondsUntilUpdate(seconds) * 1000;
		this.timer = this.ngZone.runOutsideAngular(() => {
			if (typeof window !== 'undefined') {
				return (window as any).setTimeout(() => {
					this.ngZone.run(() => this.changeDetectorRef.markForCheck());
				}, timeToUpdate);
			}
			return null;
		});
		const minutes = Math.round(Math.abs(seconds / 60));
		const hours = Math.round(Math.abs(minutes / 60));
		const days = Math.round(Math.abs(hours / 24));
		const months = Math.round(Math.abs(days / 30.416));
		const years = Math.round(Math.abs(days / 365));
		const timeAgoTranslates = this.translates ? this.translates.TIME_AGO : null;
		if (Number.isNaN(seconds)) {
			return '';
		} else if (seconds <= 45) {
			return timeAgoTranslates && timeAgoTranslates.FEW_SECONDS_AGO
				? timeAgoTranslates.FEW_SECONDS_AGO
				: 'a few seconds ago';
		} else if (seconds <= 90) {
			return timeAgoTranslates && timeAgoTranslates.MINUTE_AGO ? timeAgoTranslates.MINUTE_AGO : 'a minute ago';
		} else if (minutes <= 45) {
			return (
				minutes +
				' ' +
				(timeAgoTranslates && timeAgoTranslates.MINUTES_AGO ? timeAgoTranslates.MINUTES_AGO : 'minutes ago')
			);
		} else if (minutes <= 90) {
			return timeAgoTranslates && timeAgoTranslates.HOUR_AGO ? timeAgoTranslates.HOUR_AGO : 'an hour ago';
		} else if (hours <= 22) {
			return (
				hours + ' ' + (timeAgoTranslates && timeAgoTranslates.HOURS_AGO ? timeAgoTranslates.HOURS_AGO : 'hours ago')
			);
		} else if (hours <= 36) {
			return timeAgoTranslates && timeAgoTranslates.DAY_AGO ? timeAgoTranslates.DAY_AGO : 'a day ago';
		} else if (days <= 25) {
			return days + ' ' + (timeAgoTranslates && timeAgoTranslates.DAYS_AGO ? timeAgoTranslates.DAYS_AGO : 'days ago');
		} else if (days <= 45) {
			return timeAgoTranslates && timeAgoTranslates.MONTH_AGO ? timeAgoTranslates.MONTH_AGO : 'a month ago';
		} else if (days <= 345) {
			return (
				months + ' ' + (timeAgoTranslates && timeAgoTranslates.MONTHS_AGO ? timeAgoTranslates.MONTHS_AGO : 'months ago')
			);
		} else if (days <= 545) {
			return timeAgoTranslates && timeAgoTranslates.YEAR_AGO ? timeAgoTranslates.YEAR_AGO : 'a year ago';
		} else {
			return (
				years + ' ' + (timeAgoTranslates && timeAgoTranslates.YEARS_AGO ? timeAgoTranslates.YEARS_AGO : 'years ago')
			);
		}
	}
	/** OnDestroy */
	ngOnDestroy(): void {
		this.removeTimer();
	}
	/** clear the pipe timer */
	private removeTimer() {
		if (this.timer) {
			(window as any).clearTimeout(this.timer);
			this.timer = null;
		}
	}
	/** Returns the number of seconds to wait untill next update based on elapsed seconds */
	private getSecondsUntilUpdate(seconds: number) {
		const min = 60;
		const hr = min * 60;
		const day = hr * 24;
		if (seconds < min) {
			// less than 1 min, update every 2 secs
			return 2;
		} else if (seconds < hr) {
			// less than an hour, update every 30 secs
			return 30;
		} else if (seconds < day) {
			// less then a day, update every 5 mins
			return 300;
		} else {
			// update every hour
			return 3600;
		}
	}
}
