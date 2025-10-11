import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

/**
 * Interface for email verification API response.
 * Defines the structure of the response received from the backend verification endpoint.
 */
interface VerificationResponse {
  success: boolean;  // Whether the verification was successful
  message: string;  // Human-readable message describing the result
}

/**
 * Email Verification Component
 * 
 * This component handles the email verification process for new user registrations.
 * It displays different states based on the verification result and provides
 * appropriate actions for users to take next.
 * 
 * Features:
 * - Displays verification status (loading, success, error)
 * - Handles verification token validation
 * - Provides options to request new verification email
 * - Redirects users to appropriate pages after verification
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header component for consistent navigation -->
      <app-header></app-header>
      
      <!-- Main verification content area -->
      <div class="pt-20 pb-16 bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <!-- Verification status header with dynamic icon and messaging -->
          <div class="text-center">
            <!-- Dynamic status icon with appropriate colors -->
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full" 
                 [ngClass]="{
                   'bg-green-100': verificationStatus() === 'success',
                   'bg-red-100': verificationStatus() === 'error',
                   'bg-yellow-100': verificationStatus() === 'loading'
                 }">
              <!-- Loading spinner for verification in progress -->
              <svg *ngIf="verificationStatus() === 'loading'" class="animate-spin h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <!-- Success checkmark icon -->
              <svg *ngIf="verificationStatus() === 'success'" class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <!-- Error X icon -->
              <svg *ngIf="verificationStatus() === 'error'" class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <!-- Dynamic title based on verification status -->
            <h2 class="mt-6 text-3xl font-display text-gray-900">
              {{ getTitle() }}
            </h2>
            <!-- Dynamic message based on verification status -->
            <p class="mt-2 text-sm text-gray-600">
              {{ getMessage() }}
            </p>
          </div>

          <!-- Success state: Show confirmation and next steps -->
          <div *ngIf="verificationStatus() === 'success'" class="mt-8 space-y-4">
            <!-- Success notification card -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <!-- Success icon -->
                  <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">
                    Email Verified Successfully!
                  </h3>
                  <div class="mt-2 text-sm text-green-700">
                    <p>Your email address has been verified. You can now:</p>
                    <!-- List of available features after verification -->
                    <ul class="mt-2 list-disc list-inside space-y-1">
                      <li>Access all features of the alumni network</li>
                      <li>Participate in discussions and forums</li>
                      <li>Connect with other alumni members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action buttons for successful verification -->
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Primary action: Sign in to account -->
              <button
                (click)="goToLogin()"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In to Your Account
              </button>
              <!-- Secondary action: Return to home -->
              <button
                (click)="goToHome()"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>

          <!-- Error state: Show error details and recovery options -->
          <div *ngIf="verificationStatus() === 'error'" class="mt-8 space-y-4">
            <!-- Error notification card -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <!-- Warning icon -->
                  <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    Verification Failed
                  </h3>
                  <div class="mt-2 text-sm text-red-700">
                    <!-- Display specific error message -->
                    <p>{{ errorMessage() }}</p>
                    <!-- Common reasons for verification failure -->
                    <p class="mt-2">This could happen if:</p>
                    <ul class="mt-1 list-disc list-inside space-y-1">
                      <li>The verification link has expired (24 hours)</li>
                      <li>The link has already been used</li>
                      <li>The link is invalid or corrupted</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action buttons for failed verification -->
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Primary action: Request new verification email -->
              <button
                (click)="requestNewVerification()"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                [disabled]="isRequestingNew()"
              >
                <!-- Loading spinner for request in progress -->
                <span *ngIf="isRequestingNew()" class="mr-2">
                  <svg class="animate-spin h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isRequestingNew() ? 'Sending...' : 'Request New Verification Email' }}
              </button>
              <!-- Secondary action: Return to home -->
              <button
                (click)="goToHome()"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>

          <!-- Loading state: Show verification in progress -->
          <div *ngIf="verificationStatus() === 'loading'" class="mt-8">
            <div class="text-center">
              <p class="text-gray-500">Verifying your email address...</p>
              <p class="text-sm text-gray-400 mt-2">This may take a few moments</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer component for consistent layout -->
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class EmailVerificationComponent implements OnInit {
  // Dependency injection using Angular 20's inject() function
  private route = inject(ActivatedRoute);        // Access to route parameters and query strings
  private router = inject(Router);               // Navigation service
  private http = inject(HttpClient);             // HTTP client for API calls
  private notificationService = inject(NotificationService); // Notification service for user feedback

  // Reactive state management using Angular signals
  verificationStatus = signal<'loading' | 'success' | 'error'>('loading'); // Current verification state
  errorMessage = signal<string>('');             // Error message to display to user
  isRequestingNew = signal<boolean>(false);      // Loading state for new verification request

  /**
   * Component initialization lifecycle hook.
   * Extracts the verification token from URL query parameters and initiates verification.
   */
  ngOnInit() {
    // Extract verification token from URL query parameters
    const token = this.route.snapshot.queryParams['token'];
    
    // Validate token presence
    if (!token) {
      this.verificationStatus.set('error');
      this.errorMessage.set('No verification token provided.');
      return;
    }

    // Proceed with email verification
    this.verifyEmail(token);
  }

  /**
   * Verifies the email address using the provided token.
   * Makes an API call to the backend verification endpoint and updates the UI accordingly.
   * 
   * @param token - The verification token from the email link
   */
  private async verifyEmail(token: string) {
    try {
      // Make API call to verify email
      const response = await this.http.post<VerificationResponse>(
        `${environment.apiUrl}/api/v1/emailverification/verify?token=${encodeURIComponent(token)}`,
        {}
      ).toPromise();

      // Handle successful verification
      if (response?.success) {
        this.verificationStatus.set('success');
        this.notificationService.showSuccess('Email Verified', 'Your email has been successfully verified!');
      } else {
        // Handle verification failure
        this.verificationStatus.set('error');
        this.errorMessage.set(response?.message || 'Verification failed. Please try again.');
      }
    } catch (error: unknown) {
      // Handle API errors
      console.error('Email verification error:', error);
      this.verificationStatus.set('error');
      const errorMessage = error && typeof error === 'object' && 'error' in error 
        ? (error as any).error?.message 
        : 'An error occurred during verification. Please try again.';
      this.errorMessage.set(errorMessage || 'An error occurred during verification. Please try again.');
    }
  }

  /**
   * Requests a new verification email for the user.
   * Currently redirects to registration page as we don't have user email context.
   * In a full implementation, this would require the user's email address.
   */
  async requestNewVerification() {
    this.isRequestingNew.set(true);
    
    try {
      // For now, we'll redirect to registration page
      // In a real implementation, we'd need the user's email to resend verification
      this.notificationService.showInfo(
        'Request New Verification', 
        'Please contact support or try registering again to receive a new verification email.'
      );
      
      // Redirect to registration after a short delay
      setTimeout(() => {
        this.router.navigate(['/register']);
      }, 2000);
    } catch (error: unknown) {
      // Handle errors in requesting new verification
      console.error('Request new verification error:', error);
      this.notificationService.showError(
        'Request Failed', 
        'Unable to request new verification email. Please try again later.'
      );
    } finally {
      // Reset loading state
      this.isRequestingNew.set(false);
    }
  }

  /**
   * Navigates to the login page.
   * Called when user wants to sign in after successful verification.
   */
  goToLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Navigates to the home page.
   * Called when user wants to return to the main site.
   */
  goToHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Returns the appropriate title based on the current verification status.
   * 
   * @returns The title string to display
   */
  getTitle(): string {
    switch (this.verificationStatus()) {
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'loading':
      default:
        return 'Verifying Email...';
    }
  }

  /**
   * Returns the appropriate message based on the current verification status.
   * 
   * @returns The message string to display
   */
  getMessage(): string {
    switch (this.verificationStatus()) {
      case 'success':
        return 'Your email address has been successfully verified. You can now access all features of the IHCAE Alumni Network.';
      case 'error':
        return 'We encountered an issue while verifying your email address.';
      case 'loading':
      default:
        return 'Please wait while we verify your email address.';
    }
  }
}
