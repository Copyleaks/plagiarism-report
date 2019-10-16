import { animate, animateChild, group, query, state, style, transition, trigger, stagger } from '@angular/animations';

/** animation for fading element ina and out */
export const fadeIn = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0 }),
		group([animate(200, style({ opacity: 1 })), query('@fade', animateChild(), { optional: true })]),
	]),
	state(':leave', style({ display: 'none' })),
]);

/** The animation used to transition between one-to-many and one-to-one views  */
export const expandAnimation = trigger('expandRight', [
	state(
		'one-to-many',
		style({
			maxWidth: '30%',
		})
	),
	state(
		'one-to-one',
		style({
			maxWidth: '50%',
		})
	),
	transition('one-to-one <=> one-to-many', [group([query('@fade', animateChild()), animate(200)])]),
]);

/** animation for fading list items in and out within a list */
export const listFade = trigger('listFade', [
	transition('* => *', [
		style({ opacity: 1 }),
		query(':enter', style({ opacity: 0 }), { optional: true }),
		query(':enter', stagger(500, [animate(300, style({ opacity: 1 }))]), {
			optional: true,
		}),
	]),
]);
