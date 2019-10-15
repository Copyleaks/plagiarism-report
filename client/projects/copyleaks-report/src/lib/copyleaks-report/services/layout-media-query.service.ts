import { Injectable } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class LayoutMediaQueryService {
	private _isMobile = new BehaviorSubject<boolean>(false);
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
