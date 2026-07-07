import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  Event,
  EventSummary,
  EventCategory,
  CreateEventRequest,
  UpdateEventRequest,
  EventRegistration,
  RegisterForEventRequest,
} from '../models';
import type { PaginatedResult } from '../../../shared/models';

/**
 * Service for events operations.
 * Handles events, registrations, and categories.
 */
@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/events`;
  private readonly managementApiUrl = `${environment.apiUrl}/api/v1/events/management`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Gets a paginated list of upcoming published events.
   * Supports filtering by category, location, and date range.
   */
  getUpcomingEvents(
    page: number = 1,
    pageSize: number = 10,
    categoryId?: number,
    location?: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<PaginatedResult<EventSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    if (location) {
      params = params.set('location', location);
    }

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }

    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<PaginatedResult<EventSummary>>(this.apiUrl, { params });
  }

  /**
   * Gets a single published event by slug.
   */
  getEventBySlug(slug: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/slug/${slug}`);
  }

  /**
   * Gets a single event by ID (useful for editing).
   */
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  /**
   * Registers for an event (no auth required).
   * If authenticated, user data is pre-filled.
   */
  registerForEvent(eventId: number, request: RegisterForEventRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventId}/register`, request);
  }

  /**
   * Checks if the current user is already registered for an event.
   */
  checkIfRegistered(eventId: number, email: string): Observable<boolean> {
    let params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.apiUrl}/${eventId}/check-registration`, { params });
  }

  /**
   * Gets the number of available spots for an event.
   */
  getAvailableSpots(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${eventId}/available-spots`);
  }

  /**
   * Gets all event categories.
   */
  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Creates a new event (Admin/ContentCreator only).
   * Admin can publish directly, ContentCreator submits for review.
   */
  createEvent(request: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(this.managementApiUrl, request);
  }

  /**
   * Updates an existing event (Admin/ContentCreator only).
   * Must be the owner or admin.
   */
  updateEvent(id: number, request: UpdateEventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.managementApiUrl}/${id}`, request);
  }

  /**
   * Deletes an event (Admin/ContentCreator only).
   * Must be the owner or admin. Cannot delete if registrations exist.
   */
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.managementApiUrl}/${id}`);
  }

  /**
   * Gets pending events for admin review (Admin only).
   */
  getPendingEvents(
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResult<EventSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<EventSummary>>(`${this.managementApiUrl}/pending`, { params });
  }

  /**
   * Approves a pending event (Admin only).
   * Changes status to published.
   */
  approveEvent(id: number): Observable<void> {
    return this.http.post<void>(`${this.managementApiUrl}/${id}/approve`, {});
  }

  /**
   * Rejects a pending event (Admin only).
   * Sends email notification with reason.
   */
  rejectEvent(id: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.managementApiUrl}/${id}/reject`, { reason });
  }

  /**
   * Gets registrations for an event (Admin only).
   */
  getEventRegistrations(
    eventId: number,
    page: number = 1,
    pageSize: number = 50
  ): Observable<PaginatedResult<EventRegistration>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<EventRegistration>>(`${this.apiUrl}/${eventId}/registrations`, { params });
  }

  /**
   * Exports event registrations to CSV (Admin only).
   */
  exportRegistrationsCsv(eventId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${eventId}/registrations/export`, {
      responseType: 'blob'
    });
  }

  /**
   * Gets events for console management.
   */
  getManagementEvents(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(this.managementApiUrl);
  }
}
