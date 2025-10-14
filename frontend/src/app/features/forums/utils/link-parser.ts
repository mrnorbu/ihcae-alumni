import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Utility for converting plain text links to clickable HTML links.
 * Provides XSS protection through Angular's DomSanitizer.
 */
export class LinkParser {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Converts plain text URLs to clickable HTML links.
   * Supports http://, https://, and www. patterns.
   * 
   * @param text Plain text that may contain URLs
   * @returns Safe HTML with converted links
   */
  convertLinksToHtml(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');

    // URL regex pattern - matches http, https, and www URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    
    // Convert URLs to clickable links
    const htmlText = text.replace(urlRegex, (url) => {
      // Ensure protocol is present for www URLs
      const href = url.startsWith('http') ? url : `https://${url}`;
      
      // Create safe link with target="_blank" and rel="noopener noreferrer"
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 underline">${url}</a>`;
    });

    // Sanitize the HTML to prevent XSS attacks
    return this.sanitizer.bypassSecurityTrustHtml(htmlText);
  }

  /**
   * Converts plain text URLs to clickable HTML links (static method).
   * Use this when you don't have access to DomSanitizer instance.
   * 
   * @param text Plain text that may contain URLs
   * @returns HTML string with converted links (not sanitized)
   */
  static convertLinksToHtml(text: string): string {
    if (!text) return '';

    // URL regex pattern - matches http, https, and www URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    
    // Convert URLs to clickable links
    return text.replace(urlRegex, (url) => {
      // Ensure protocol is present for www URLs
      const href = url.startsWith('http') ? url : `https://${url}`;
      
      // Create link with target="_blank" and rel="noopener noreferrer"
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 underline">${url}</a>`;
    });
  }
}

/**
 * Standalone function for converting links to HTML.
 * Use this in components that don't need DomSanitizer.
 */
export function convertLinksToHtml(text: string): string {
  return LinkParser.convertLinksToHtml(text);
}
