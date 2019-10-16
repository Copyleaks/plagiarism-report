import { filter } from 'rxjs/operators';
/**
 * An rxjs operator that filters any value that is evaluated to true.
 */
export const truthy = <T>() => filter<T>(value => !!value);

/**
 * An rxjs operator that filters any array that has one or more elements.
 */
export const notEmpty = <T extends { length: number }>() => filter<T>(value => !!value.length);
