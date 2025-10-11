import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { UserAuthStore } from './core/state/user-auth.store';
import { NotificationService } from './core/services/notification.service';

/**
 * Main application component.
 * Initializes authentication state and provides the main app structure.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, NgClass],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  /**
   * Application title signal.
   */
  protected readonly title = signal('IHCAE Alumni Network');

  /**
   * Authentication state observable.
   */
  public authState$!: Observable<any>;

  /**
   * Notifications observable.
   */
  public notifications$!: Observable<any>;

  /**
   * Initializes the application component.
   * @param authStore The authentication store service
   * @param notificationService The notification service
   */
  constructor(
    private authStore: UserAuthStore,
    public notificationService: NotificationService
  ) {}

  /**
   * Initializes the component.
   * Restores authentication state from localStorage.
   */
  ngOnInit(): void {
    // Initialize observables
    this.authState$ = this.authStore.state$;
    this.notifications$ = this.notificationService.notifications$;
    
    // Initialize authentication state from localStorage
    this.authStore.initializeFromStorage();
  }
}
