import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that filters a list of data according to some **whitelist** information
 */
@Pipe({
	name: 'whitelist',
})
export class WhitelistPipe implements PipeTransform {
	/**
	 * Filter a list according to a whitelist data, and possible a key to compare by
	 * @param value an array of items
	 * @param key the key to compare the items by, if missing, use shallow comparison
	 * @param whitelist the whitelist data to filter by
	 */
	public transform(value: any[], key: string, whitelist: any[]) {
		if (!whitelist || whitelist.length === 0) {
			return value;
		}
		return (value || []).filter(item => whitelist.includes(key ? item[key] : item));
	}
}
