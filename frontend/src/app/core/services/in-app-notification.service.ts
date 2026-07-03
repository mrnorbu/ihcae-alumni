import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { InAppNotification, PaginatedResult } from '../../shared/models';

/**
 * Service for managing server-side, database-backed in-app notifications.
 * Tracks unread count and recent notifications, exposing them via BehaviorSubjects.
 */
@Injectable({
  providedIn: 'root'
})
export class InAppNotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/notifications`;

  private readonly _notifications = new BehaviorSubject<InAppNotification[]>([]);
  public readonly notifications$: Observable<InAppNotification[]> = this._notifications.asObservable();

  private readonly _unreadCount = new BehaviorSubject<number>(0);
  public readonly unreadCount$: Observable<number> = this._unreadCount.asObservable();

  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves a paginated list of notifications for the current user.
   */
  getNotifications(page: number = 1, pageSize: number = 20): Observable<PaginatedResult<InAppNotification>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<InAppNotification>>(this.apiUrl, { params }).pipe(
      tap(result => {
        // Update local state if it's the first page
        if (page === 1) {
          this._notifications.next(result.items);
        }
      })
    );
  }

  /**
   * Loads the current unread notifications count from the server.
   */
  loadUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`).pipe(
      tap(count => this._unreadCount.next(count))
    );
  }

  /**
   * Loads the first page of notifications and updates local cache.
   */
  loadRecentNotifications(): Observable<PaginatedResult<InAppNotification>> {
    return this.getNotifications(1, 10).pipe(
      tap(() => this.loadUnreadCount().subscribe())
    );
  }

  /**
   * Marks a specific notification as read.
   */
  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Update local state: mark item read and decrement count
        const current = this._notifications.value;
        const index = current.findIndex(n => n.id === id);
        if (index !== -1 && !current[index].isRead) {
          const updated = [...current];
          updated[index] = { ...updated[index], isRead: true };
          this._notifications.next(updated);
          this._unreadCount.next(Math.max(0, this._unreadCount.value - 1));
        }
      })
    );
  }

  /**
   * Marks all notifications for the current user as read.
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        // Update local state: mark all items as read and clear unread count
        const current = this._notifications.value;
        const updated = current.map(n => ({ ...n, isRead: true }));
        this._notifications.next(updated);
        this._unreadCount.next(0);
      })
    );
  }
}
