import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'appImageUrl',
  standalone: true
})
export class AppImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'images/news1.jpg'; // fallback layout placeholder
    
    // If it's already an absolute URL or data URL, return it as is
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
      return value;
    }
    
    const baseUrl = environment.apiUrl.endsWith('/') 
      ? environment.apiUrl.slice(0, -1) 
      : environment.apiUrl;
      
    const relativePath = value.startsWith('/') ? value : `/${value}`;
    return `${baseUrl}${relativePath}`;
  }
}
