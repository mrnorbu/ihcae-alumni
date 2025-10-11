import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../../shared/models';

/**
 * Notification service for managing global toast/snackbar notifications.
 * Provides a centralized way to display notifications throughout the application.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  /**
   * Private BehaviorSubject holding the current notifications.
   */
  private readonly _notifications = new BehaviorSubject<Notification[]>([]);

  /**
   * Public readonly Observable exposing the notifications.
   * Components can subscribe to this to display notifications.
   */
  public readonly notifications$: Observable<Notification[]> = this._notifications.asObservable();

  /**
   * Gets the current notifications synchronously.
   * @returns Current array of notifications
   */
  public get currentNotifications(): Notification[] {
    return this._notifications.value;
  }

  /**
   * Shows a success notification.
   * @param title The notification title
   * @param message The notification message
   * @param duration Optional duration in milliseconds (default: 5000)
   */
  public showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  /**
   * Shows an error notification.
   * @param title The notification title
   * @param message The notification message
   * @param duration Optional duration in milliseconds (default: 7000)
   */
  public showError(title: string, message: string, duration: number = 7000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  /**
   * Shows a warning notification.
   * @param title The notification title
   * @param message The notification message
   * @param duration Optional duration in milliseconds (default: 6000)
   */
  public showWarning(title: string, message: string, duration: number = 6000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  /**
   * Shows an info notification.
   * @param title The notification title
   * @param message The notification message
   * @param duration Optional duration in milliseconds (default: 5000)
   */
  public showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  /**
   * Shows a custom notification.
   * @param notification The notification object
   */
  public showNotification(notification: Notification): void {
    this.addNotification(notification);
  }

  /**
   * Removes a notification by ID.
   * @param id The notification ID to remove
   */
  public removeNotification(id: string): void {
    const notifications = this._notifications.value.filter(n => n.id !== id);
    this._notifications.next(notifications);
  }

  /**
   * Clears all notifications.
   */
  public clearAll(): void {
    this._notifications.next([]);
  }

  /**
   * Adds a notification to the list.
   * Limits the number of notifications to prevent overcrowding.
   * @param notification The notification to add
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this._notifications.value;
    
    // Limit to maximum 5 notifications at once
    const maxNotifications = 5;
    let notifications = [...currentNotifications, notification];
    
    // If we exceed the limit, remove the oldest notifications
    if (notifications.length > maxNotifications) {
      notifications = notifications.slice(-maxNotifications);
    }
    
    this._notifications.next(notifications);

    // Auto-remove notification after duration if specified
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Generates a unique ID for notifications.
   * @returns A unique string ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Shows a notification for API errors.
   * @param error The error response
   */
  public showApiError(error: any): void {
    let title = 'Error';
    let message = 'An unexpected error occurred';

    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    this.showError(title, message);
  }

  /**
   * Shows a notification for successful operations.
   * @param operation The operation that succeeded
   */
  public showSuccessMessage(operation: string): void {
    this.showSuccess('Success', `${operation} completed successfully`);
  }
}
