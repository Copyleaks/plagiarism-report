/* tslint:disable */
import { MatchJumpEvent, MatchSelectEvent, PostMessageEvent } from '../../models';

/**
 * document ready event handler
 * @param fn the callback to execute when the document is ready
 */
function onDocumentReady(fn: any) {
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		setTimeout(fn, 1);
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

/**
 * Callback to execute when the document is ready
 */
function ready() {
	let current: HTMLSpanElement;
	let matches: HTMLSpanElement[];
	let isPdf = document.querySelector('meta[content="pdf2htmlEX"]') !== null;
	(window as any).addEventListener('message', onMessageFromParent);
	init();

	/**
	 * Initialization code, will execute before emitting iframe-ready event
	 */
	function init() {
		Array.from(document.links).forEach(x => (x.href = 'javascript:void(0)')); // disable links
		matches = Array.from(document.querySelectorAll('span[match]'));
		matches.forEach(elem => {
			elem.addEventListener('click', onMatchClick);
			elem.addEventListener('mouseenter', onMatchHover);
			elem.addEventListener('mouseleave', onMatchHover);
		});

		document.querySelectorAll('span[exclude-partial-scan]').forEach(elem => {
			elem.addEventListener('click', () => messageParent({ type: 'upgrade-plan' }));
			elem.addEventListener('mouseenter', onMatchHover);
			elem.addEventListener('mouseleave', onMatchHover);
		});
	}

	/**
	 * Message event handler
	 */
	function onMessageFromParent(nativeEvent) {
		if (nativeEvent.source !== (window as any).parent) {
			return;
		}
		const event = nativeEvent.data as PostMessageEvent;
		switch (event.type) {
			case 'match-select':
				handleBroadcastMatchSelect(event);
				break;
			case 'match-jump':
				onMatchJump(event);
				break;
			default:
				console.error('unknown event in frame', nativeEvent);
		}
	}

	/**
	 * handle a broadcasted `match-select` event
	 * @param event the match select event
	 */
	function handleBroadcastMatchSelect(event: MatchSelectEvent) {
		const elem = document.querySelector<HTMLSpanElement>(`span[match][data-index='${event.index}']`);
		if (!elem && event.index !== -1) {
			messageParent({ type: 'match-warn' });
		}
		onMatchSelect(elem, true); // should not rebroadcast
	}

	/**
	 * Event handler for a `MatchJumpEvent` that is fired when the user clicks the
	 * go to next/prev match buttons
	 */
	function onMatchJump(event: MatchJumpEvent) {
		if (!current) {
			onMatchSelect(matches[0]);
			return;
		}
		const first = matches[0];
		const last = matches[matches.length - 1];
		if ((current === first && !event.forward) || (current === last && event.forward)) {
			return;
		}

		const currentIndex = matches.indexOf(current);
		const nextIndex = currentIndex + (event.forward ? 1 : -1);

		onMatchSelect(matches[nextIndex]);
	}

	/**
	 * Emits an event to the parent window using PostMessage API
	 * @param event the event content to emit
	 */
	function messageParent(event: PostMessageEvent) {
		(window as any).parent.postMessage(event, '*');
	}

	/**
	 * Event handler for the default click event of a match
	 * @param event the default mouse event object
	 */
	function onMatchClick(event: MouseEvent) {
		const elem = event.target as HTMLSpanElement;
		onMatchSelect(elem);
	}

	/**
	 * Execute the logic of a match selection.
	 * - highlight `elem` and message the parent window about it
	 * - if an element is allready highlighted turn it off and highlight `elem`
	 * @param elem the selected element
	 */
	function onMatchSelect(elem: HTMLSpanElement, broadcast: boolean = false): void {
		if (!broadcast && current === elem) {
			current.toggleAttribute('on', false);
			current = null;
			messageParent({ type: 'match-select', index: -1 });
			return;
		}
		if (!broadcast && current) {
			current.toggleAttribute('on', false);
		}
		current = elem;
		current.toggleAttribute('on', true);
		if (isPdf) {
			elem.closest('.pc').classList.add('opened');
		}
		current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		messageParent({ type: 'match-select', index: +current.dataset.index });
	}

	/**
	 * Event handler for the default `mouseenter` or `mouseleave` event
	 * @param event the default mouse event object
	 */
	function onMatchHover(event: MouseEvent): void {
		const elem = event?.target as HTMLSpanElement;
		elem?.classList?.toggle('hover');
	}
}

export default `(${onDocumentReady.toString()})(${ready.toString()})`;
