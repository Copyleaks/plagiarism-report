import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class IconRegistryService {
	constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {}

	init() {
		/** help_outline icon */
		this.iconRegistry.addSvgIconLiteral('help_outline', this.sanitizer.bypassSecurityTrustHtml(this.help_outline));

		/** share icon */
		this.iconRegistry.addSvgIconLiteral('share', this.sanitizer.bypassSecurityTrustHtml(this.share));

		/** save_alt icon */
		this.iconRegistry.addSvgIconLiteral('save_alt', this.sanitizer.bypassSecurityTrustHtml(this.save_alt));

		/** settings icon */
		this.iconRegistry.addSvgIconLiteral('settings', this.sanitizer.bypassSecurityTrustHtml(this.settings));

		/** launch icon */
		this.iconRegistry.addSvgIconLiteral('launch', this.sanitizer.bypassSecurityTrustHtml(this.launch));

		/** arrow_downward icon */
		this.iconRegistry.addSvgIconLiteral('arrow_downward', this.sanitizer.bypassSecurityTrustHtml(this.arrow_downward));

		/** arrow_upward icon */
		this.iconRegistry.addSvgIconLiteral('arrow_upward', this.sanitizer.bypassSecurityTrustHtml(this.arrow_upward));

		/** format_align_left icon */
		this.iconRegistry.addSvgIconLiteral(
			'format_align_left',
			this.sanitizer.bypassSecurityTrustHtml(this.format_align_left)
		);

		/** format_align_right icon */
		this.iconRegistry.addSvgIconLiteral(
			'format_align_right',
			this.sanitizer.bypassSecurityTrustHtml(this.format_align_right)
		);

		/** zoom_in icon */
		this.iconRegistry.addSvgIconLiteral('zoom_in', this.sanitizer.bypassSecurityTrustHtml(this.zoom_in));

		/** zoom_out icon */
		this.iconRegistry.addSvgIconLiteral('zoom_out', this.sanitizer.bypassSecurityTrustHtml(this.zoom_out));

		/** title icon */
		this.iconRegistry.addSvgIconLiteral('title', this.sanitizer.bypassSecurityTrustHtml(this.title));

		/** insert_photo icon */
		this.iconRegistry.addSvgIconLiteral('insert_photo', this.sanitizer.bypassSecurityTrustHtml(this.insert_photo));

		/** close icon */
		this.iconRegistry.addSvgIconLiteral('close', this.sanitizer.bypassSecurityTrustHtml(this.close));

		/** close_black_color icon */
		this.iconRegistry.addSvgIconLiteral(
			'close_black_color',
			this.sanitizer.bypassSecurityTrustHtml(this.close_black_color)
		);

		/** filter_list icon */
		this.iconRegistry.addSvgIconLiteral('filter_list', this.sanitizer.bypassSecurityTrustHtml(this.filter_list));

		/** filter_list_color_red icon */
		this.iconRegistry.addSvgIconLiteral(
			'filter_list_color_red',
			this.sanitizer.bypassSecurityTrustHtml(this.filter_list_color_red)
		);

		/** arrow_drop_down icon */
		this.iconRegistry.addSvgIconLiteral(
			'arrow_drop_down',
			this.sanitizer.bypassSecurityTrustHtml(this.arrow_drop_down)
		);

		/** first_page icon */
		this.iconRegistry.addSvgIconLiteral('first_page', this.sanitizer.bypassSecurityTrustHtml(this.first_page));

		/** first_page_disabled icon */
		this.iconRegistry.addSvgIconLiteral(
			'first_page_disabled',
			this.sanitizer.bypassSecurityTrustHtml(this.first_page_disabled)
		);

		/** chevron_left icon */
		this.iconRegistry.addSvgIconLiteral('chevron_left', this.sanitizer.bypassSecurityTrustHtml(this.chevron_left));

		/** chevron_left_disabled icon */
		this.iconRegistry.addSvgIconLiteral(
			'chevron_left_disabled',
			this.sanitizer.bypassSecurityTrustHtml(this.chevron_left_disabled)
		);

		/** chevron_right icon */
		this.iconRegistry.addSvgIconLiteral('chevron_right', this.sanitizer.bypassSecurityTrustHtml(this.chevron_right));

		/** chevron_right_disabled icon */
		this.iconRegistry.addSvgIconLiteral(
			'chevron_right_disabled',
			this.sanitizer.bypassSecurityTrustHtml(this.chevron_right_disabled)
		);

		/** last_page icon */
		this.iconRegistry.addSvgIconLiteral('last_page', this.sanitizer.bypassSecurityTrustHtml(this.last_page));

		/** last_page_disabled icon */
		this.iconRegistry.addSvgIconLiteral(
			'last_page_disabled',
			this.sanitizer.bypassSecurityTrustHtml(this.last_page_disabled)
		);

		/** more_vert icon */
		this.iconRegistry.addSvgIconLiteral('more_vert', this.sanitizer.bypassSecurityTrustHtml(this.more_vert));

		/** expand_less icon */
		this.iconRegistry.addSvgIconLiteral('expand_less', this.sanitizer.bypassSecurityTrustHtml(this.expand_less));

		/** expand_more icon */
		this.iconRegistry.addSvgIconLiteral('expand_more', this.sanitizer.bypassSecurityTrustHtml(this.expand_more));
	}

	/** help_outline icon */
	help_outline = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
    </svg>
  `;

	/** help_outline icon */
	share = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
  `;

	/** save_alt icon */
	save_alt = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <path d="M0 0h24v24H0z" fill="none"/><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
    </svg>
  `;

	/** settings icon */
	settings = `
    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <g>
        <path d="M0,0h24v24H0V0z" fill="none"/>
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </g>
    </svg>
  `;

	/** launch icon */
	launch = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
    </svg>
  `;

	/** arrow_downward icon */
	arrow_downward = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
      </svg>
  `;

	/** arrow_upward icon */
	arrow_upward = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
    </svg>
  `;

	/** arrow_upward icon */
	format_align_left = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
    </svg>
  `;

	/** arrow_upward icon */
	format_align_right = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
    </svg>
  `;

	/** zoom_in icon */
	zoom_in = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
    </svg>
  `;

	/** zoom_out icon */
	zoom_out = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
    </svg>
  `;

	/** title icon */
	title = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666"><path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M5 4v3h5.5v12h3V7H19V4z"/>
    </svg>
  `;

	/** insert_photo icon */
	insert_photo = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666"><path d="M0 0h24v24H0z" fill="none"/>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
  `;

	/** close icon */
	close = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;

	/** close icon black color */
	close_black_color = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;

	/** filter_list icon */
	filter_list = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  `;

	/** filter_list icon with red color */
	filter_list_color_red = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#f44336">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  `;

	/** arrow_drop_down icon with red color */
	arrow_drop_down = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  `;

	/** first_page icon */
	first_page = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M24 0v24H0V0h24z" fill="none" opacity=".87"/>
		<path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/>
	</svg>
  `;

	/** first_page icon disabled */
	first_page_disabled = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#00000042">
		<path d="M24 0v24H0V0h24z" fill="none" opacity=".87"/>
		<path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/>
	</svg>
  `;

	/** chevron_left icon */
	chevron_left = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M0 0h24v24H0V0z" fill="none"/>
		<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
	</svg>
  `;

	/** chevron_left icon disabled */
	chevron_left_disabled = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#00000042">
		<path d="M0 0h24v24H0V0z" fill="none"/>
		<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
	</svg>
  `;

	/** chevron_right icon */
	chevron_right = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M0 0h24v24H0V0z" fill="none"/>
		<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
	</svg> 
  `;

	/** chevron_right icon disabled */
	chevron_right_disabled = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#00000042">
		<path d="M0 0h24v24H0V0z" fill="none"/>
		<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
	</svg> 
  `;

	/** last_page icon */
	last_page = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/>
		<path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/>
	</svg> 
  `;

	/** last_page icon disabled */
	last_page_disabled = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#00000042">
		<path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/>
		<path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/>
	</svg> 
  `;

	/** more_vert icon */
	more_vert = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M0 0h24v24H0V0z" fill="none"/>
		<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
	</svg>
  `;

	expand_less = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M0 0h24v24H0V0z" fill="none"/>
		<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/>
	</svg>
	`;

	expand_more = `
	<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
		<path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
		<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
	</svg>
	`;
}
