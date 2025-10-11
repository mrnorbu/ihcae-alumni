import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserAuthStore } from '../state/user-auth.store';

/**
 * JWT HTTP Interceptor function.
 * Automatically attaches the JWT token to outgoing API requests.
 * Handles token expiration and redirects to login when unauthorized.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(UserAuthStore);
  const router = inject(Router);

  // Get the current token from the auth store
  const token = authStore.currentToken;
  
  // Clone the request and add the Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized responses
      if (error.status === 401) {
        // Clear authentication state
        authStore.clearAuthState();
        
        // Redirect to login page if not already there
        if (router.url !== '/login') {
          router.navigate(['/login'], { 
            queryParams: { returnUrl: router.url } 
          });
        }
      }
      
      // Handle 403 Forbidden responses
      if (error.status === 403) {
        // Redirect to unauthorized page or show error message
        router.navigate(['/unauthorized']);
      }

      // Re-throw the error for components to handle
      return throwError(() => error);
    })
  );
};
