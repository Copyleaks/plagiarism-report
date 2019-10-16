import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that takes a list of items and returns that list without duplicates
 */
@Pipe({ name: 'unique' })
export class UniquePipe implements PipeTransform {
	/**
	 * Filter an array of items, removing duplicates possible using a key to compare
	 * @param value the array of items
	 * @param key the key to compare by
	 */
	transform<T>(value: T[], key: string): T[] {
		const dict = value.reduce((prev, curr) => {
			prev[curr[key]] = curr;
			return prev;
		}, {});
		return Object.values(dict);
	}
}
