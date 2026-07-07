import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Data model for user profile
 */
export interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  batch?: string;
  course?: string;
  bio?: string;
  jobTitle?: string;
  location?: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Request model for updating profile
 */
export interface UpdateProfileRequest {
  bio?: string;
  jobTitle?: string;
  location?: string;
  course?: string;
  batch?: string;
  phone?: string;
}

/**
 * Response model for profile updates
 */
export interface UpdateProfileResponse {
  message: string;
  profile: ProfileData;
}

/**
 * Response model for profile image upload
 */
export interface UploadImageResponse {
  message: string;
  imageUrl: string;
  thumbnailUrl?: string;
  success?: boolean;
}

/**
 * Service for managing user profile operations.
 * Handles profile data retrieval, updates, and image uploads.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/profile`;

  /**
   * Gets the current user's complete profile.
   * 
   * @returns Observable of profile data
   */
  getMyProfile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.apiUrl}/me`);
  }

  /**
   * Updates the current user's profile information.
   * 
   * @param data Profile update request data
   * @returns Observable of update response with updated profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.put<UpdateProfileResponse>(`${this.apiUrl}/me`, data);
  }

  /**
   * Uploads a profile image for the current user.
   * 
   * @param file The image file to upload
   * @returns Observable of upload response with image URL
   */
  uploadProfileImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadImageResponse>(`${this.apiUrl}/me/image`, formData);
  }
}

