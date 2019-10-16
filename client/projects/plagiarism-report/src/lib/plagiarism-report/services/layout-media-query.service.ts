import { Injectable } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class LayoutMediaQueryService {
	constructor(private mediaObserver: MediaObserver) {}
	public get isMobile$() {
		return this.mediaObserver.asObservable().pipe(
			map(changes => changes.map(ch => ch.mqAlias)),
			map(queries => queries.includes('xs') || queries.includes('sm')),
			distinctUntilChanged()
		);
	}
	public get mediaAliases$(): Observable<string[]> {
		return this.mediaObserver.asObservable().pipe(map(changes => changes.map(ch => ch.mqAlias)));
	}
	public isActive = this.mediaObserver.isActive;
}
