import { filter, scan, distinctUntilChanged } from 'rxjs/operators';
import deepEqual from 'deep-equal';

/**
 * An rxjs operator that filters any value that is evaluated to true.
 */
export const truthy = <T>() => filter<T>(value => !!value);

/**
 * An rxjs operator that filters any value that is evaluated to false.
 */
export const falsey = <T>() => filter<T>(value => !value);

/**
 * An rxjs operator that filters any array that has one or more elements.
 */
export const notEmpty = <T extends { length: number }>() => filter<T>(value => !!value.length);

/**
 * An rxjs operator that will accumulate items to an array
 */
export const accumulate = <T>() => scan<T, T[]>((acc: T[], curr: T | T[]) => acc.concat(curr), []);

/**
 * An rxjs operator that will filter deeply equal sequential items
 */
export const distinct = <T>() => distinctUntilChanged<T>(deepEqual);
