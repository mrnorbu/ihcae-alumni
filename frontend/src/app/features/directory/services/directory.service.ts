import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Alumni card data for directory listing.
 * Contains essential information needed for directory grid display.
 * Used in alumni directory listings and search results.
 */
export interface AlumniCard {
  /** Unique identifier for the alumnus */
  id: string;
  /** First name of the alumnus */
  firstName: string;
  /** Last name of the alumnus */
  lastName: string;
  /** URL to the alumnus's profile image */
  profileImageUrl?: string;
  /** Year the alumnus graduated from IHCAE */
  graduationYear?: number;
  /** Batch/Year the alumnus graduated from IHCAE (Backend DTO compatibility) */
  batch?: string;
  /** Course/program the alumnus completed at IHCAE */
  course?: string;
  /** Current job title or position */
  jobTitle?: string;
  /** Current location (city, state, country) */
  location?: string;
  /** Email address of the alumnus */
  email: string;
}

/**
 * Detailed alumni profile data for individual profile pages.
 * Contains comprehensive information including contact details.
 * Used for the alumni detail page with quick action buttons.
 */
export interface AlumniDetail {
  /** Unique identifier for the alumnus */
  id: string;
  /** First name of the alumnus */
  firstName: string;
  /** Last name of the alumnus */
  lastName: string;
  /** Email address for contact purposes */
  email: string;
  /** Phone number for contact purposes */
  phone?: string;
  /** URL to the alumnus's profile image */
  profileImageUrl?: string;
  /** Year the alumnus graduated from IHCAE */
  graduationYear?: number;
  /** Batch/Year the alumnus graduated from IHCAE (Backend DTO compatibility) */
  batch?: string;
  /** Course/program the alumnus completed at IHCAE */
  course?: string;
  /** Personal biography or description */
  bio?: string;
  /** Current job title or position */
  jobTitle?: string;
  /** Current location (city, state, country) */
  location?: string;
  /** Date when the alumnus joined the platform */
  createdAt: string;
}

/**
 * Paginated result wrapper for API responses.
 * Contains the data items and pagination metadata.
 */
export interface PaginatedResult<T> {
  /** Array of items for the current page */
  items: T[];
  /** Total number of items across all pages */
  totalCount: number;
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Directory filter parameters for search and filtering.
 * Used to construct query parameters for the directory API.
 */
export interface DirectoryFilters {
  /** Optional search term for name or email filtering */
  search?: string;
  /** Optional course filter (e.g., "Advanced Mountaineering") */
  course?: string;
  /** Optional graduation year filter (e.g., 2020) */
  graduationYear?: number;
  /** Optional batch filter */
  batch?: string;
  /** Page number (1-based, default: 1) */
  page?: number;
  /** Number of records per page (default: 20) */
  pageSize?: number;
}

/**
 * Service for alumni directory operations.
 * Handles directory listing, search, filtering, and alumni detail retrieval.
 * Provides methods for browsing alumni and accessing detailed profile information.
 * 
 * Features:
 * - Paginated alumni directory with search and filtering
 * - Detailed alumni profile retrieval
 * - Convenience methods for filter options
 * - Error handling and type safety
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/alumni`;

  /**
   * Gets a paginated, filtered list of approved alumni for the directory.
   * Supports search by name/email and filtering by course/graduation year.
   * Only returns approved alumni members for security.
   * 
   * @param filters Optional filters for search, course, graduation year, and pagination
   * @returns Observable of paginated alumni cards
   */
  getAlumniDirectory(filters: DirectoryFilters = {}): Observable<PaginatedResult<AlumniCard>> {
    // Build query parameters from filters
    let params = new HttpParams();

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.course) {
      params = params.set('course', filters.course);
    }
    if (filters.graduationYear) {
      params = params.set('batch', filters.graduationYear.toString());
    }
    if (filters.batch) {
      params = params.set('batch', filters.batch);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }

    // Make HTTP GET request to alumni directory endpoint
    return this.http.get<PaginatedResult<AlumniCard>>(this.apiUrl, { params });
  }

  /**
   * Gets detailed information for a specific alumnus.
   * Returns comprehensive profile data including contact information.
   * Used for the alumni detail page with quick action buttons.
   * 
   * @param userId The unique identifier of the alumnus
   * @returns Observable of detailed alumni information
   */
  getAlumniDetail(userId: string): Observable<AlumniDetail> {
    return this.http.get<AlumniDetail>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Convenience method to get all available courses from the directory.
   * Extracts unique courses by querying a large page of results.
   */
  getAvailableCourses(): Observable<string[]> {
    return new Observable(observer => {
      // Fetch a large page to get all courses
      this.getAlumniDirectory({ pageSize: 100 }).subscribe({
        next: (result) => {
          // Extract unique courses from results
          const courses = new Set<string>();
          result.items.forEach(alumni => {
            if (alumni.course) {
              courses.add(alumni.course);
            }
          });
          // Return sorted array of unique courses
          observer.next(Array.from(courses).sort());
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Convenience method to get graduation years available in the directory.
   * Extracts unique graduation years by querying a large page of results.
   */
  getAvailableYears(): Observable<number[]> {
    return new Observable(observer => {
      // Fetch a large page to get all graduation years
      this.getAlumniDirectory({ pageSize: 100 }).subscribe({
        next: (result) => {
          // Extract unique graduation years from results
          const years = new Set<number>();
          result.items.forEach(alumni => {
            if (alumni.graduationYear) {
              years.add(alumni.graduationYear);
            }
          });
          // Return sorted array of unique years (newest first)
          observer.next(Array.from(years).sort((a, b) => b - a));
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Convenience method to get distinct batch values available in the directory.
   * Extracts unique batch strings by querying a large page of results.
   */
  getAvailableBatches(): Observable<string[]> {
    return new Observable(observer => {
      this.getAlumniDirectory({ pageSize: 100 }).subscribe({
        next: (result) => {
          const batches = new Set<string>();
          result.items.forEach(alumni => {
            if (alumni.batch) {
              batches.add(alumni.batch);
            }
          });
          // Return sorted array of unique batches (newest first)
          observer.next(Array.from(batches).sort().reverse());
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}

