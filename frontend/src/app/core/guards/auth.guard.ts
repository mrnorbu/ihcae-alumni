import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserAuthStore } from '../state/user-auth.store';

/**
 * Authentication guard.
 * Protects routes from unauthenticated access.
 * Redirects to login page if user is not authenticated.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  /**
   * Initializes the authentication guard.
   * @param authStore The authentication store service
   * @param router The Angular router service
   */
  constructor(
    private authStore: UserAuthStore,
    private router: Router
  ) {}

  /**
   * Determines if a route can be activated.
   * @param route The activated route snapshot
   * @param state The router state snapshot
   * @returns Observable<boolean> indicating if the route can be activated
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authStore.state$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          return true;
        } else {
          // Redirect to login page with return URL
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }
      })
    );
  }
}

/**
 * Admin guard.
 * Protects admin routes from non-admin users.
 * Requires both authentication and admin role.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  /**
   * Initializes the admin guard.
   * @param authStore The authentication store service
   * @param router The Angular router service
   */
  constructor(
    private authStore: UserAuthStore,
    private router: Router
  ) {}

  /**
   * Determines if an admin route can be activated.
   * @param route The activated route snapshot
   * @param state The router state snapshot
   * @returns Observable<boolean> indicating if the route can be activated
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authStore.state$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && authState.user) {
          // Check if user has admin role
          if (authState.user.roles.includes('Admin')) {
            return true;
          } else {
            // Redirect to unauthorized page
            this.router.navigate(['/unauthorized']);
            return false;
          }
        } else {
          // Redirect to login page
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }
      })
    );
  }
}

/**
 * Alumni guard.
 * Protects alumni-specific routes from non-alumni users.
 * Requires both authentication and alumni role.
 */
@Injectable({
  providedIn: 'root'
})
export class AlumniGuard implements CanActivate {
  
  /**
   * Initializes the alumni guard.
   * @param authStore The authentication store service
   * @param router The Angular router service
   */
  constructor(
    private authStore: UserAuthStore,
    private router: Router
  ) {}

  /**
   * Determines if an alumni route can be activated.
   * @param route The activated route snapshot
   * @param state The router state snapshot
   * @returns Observable<boolean> indicating if the route can be activated
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authStore.state$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && authState.user) {
          // Check if user has alumni role
          if (authState.user.roles.includes('Alumni')) {
            return true;
          } else {
            // Redirect to unauthorized page or dashboard
            this.router.navigate(['/dashboard']);
            return false;
          }
        } else {
          // Redirect to login page
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }
      })
    );
  }
}

/**
 * Guest guard.
 * Prevents authenticated users from accessing guest-only pages (like login/register).
 * Redirects authenticated users to the dashboard.
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  /**
   * Initializes the guest guard.
   * @param authStore The authentication store service
   * @param router The Angular router service
   */
  constructor(
    private authStore: UserAuthStore,
    private router: Router
  ) {}

  /**
   * Determines if a guest route can be activated.
   * @param route The activated route snapshot
   * @param state The router state snapshot
   * @returns Observable<boolean> indicating if the route can be activated
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authStore.state$.pipe(
      take(1),
      map(authState => {
        if (!authState.isAuthenticated) {
          return true;
        } else {
          // Redirect authenticated users to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}
