import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
	name: 'safe',
})
export class SafePipe implements PipeTransform {
	constructor(protected sanitizer: DomSanitizer) {}
	/**
	 * A pipe to bypass the security trust for some `content` of some `type`
	 * @param content the `content` to declare safe
	 * @param type the the `type` of content
	 */
	public transform(content: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
		switch (type) {
			case 'html':
				return this.sanitizer.bypassSecurityTrustHtml(content);
			case 'style':
				return this.sanitizer.bypassSecurityTrustStyle(content);
			case 'script':
				return this.sanitizer.bypassSecurityTrustScript(content);
			case 'url':
				return this.sanitizer.bypassSecurityTrustUrl(content);
			case 'resourceUrl':
				return this.sanitizer.bypassSecurityTrustResourceUrl(content);
			default:
				throw new Error(`Invalid safe type specified: ${type}`);
		}
	}
}
