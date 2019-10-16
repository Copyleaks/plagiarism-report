import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'search',
})
export class SearchPipe implements PipeTransform {
	/**
	 * A pipe to filter `items` based on one or more `keys` and a search `term`
	 * @param items the items to filter
	 * @param keys  comma seperated keys
	 * @param term text to search for
	 */
	public transform(items: any[], keys: string, term: string) {
		if (!term) {
			return items;
		}
		return (items || []).filter(item =>
			keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key]))
		);
	}
}
