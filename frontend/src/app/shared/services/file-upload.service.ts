import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  imageUrl: string;
  thumbnailUrl: string;
  success: boolean;
  message: string;
}

/**
 * Service for uploading files to the backend.
 * Handles image uploads with automatic WebP conversion and thumbnail generation.
 */
@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/upload`;

  /**
   * Uploads a content image (for news, events, success stories).
   * The backend automatically converts to WebP and generates a thumbnail.
   * 
   * @param file The image file to upload
   * @param contentType Type of content: 'news', 'event', or 'story'
   * @returns Observable with image and thumbnail URLs
   */
  uploadContentImage(file: File, contentType: 'news' | 'event' | 'story' = 'news'): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', contentType);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/content-image`, formData);
  }

  /**
   * Uploads a profile image for the current user.
   * The backend automatically converts to WebP and resizes if needed.
   * 
   * @param file The image file to upload
   * @returns Observable with image URL
   */
  uploadProfileImage(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/profile-image`, formData);
  }
}
