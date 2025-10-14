import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/email-verification/email-verification.component').then(m => m.EmailVerificationComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/containers/my-profile/my-profile.component').then(m => m.MyProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'directory',
    loadComponent: () => import('./features/directory/containers/directory-page/directory-page.component').then(m => m.DirectoryPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'alumni/:userId',
    loadComponent: () => import('./features/directory/containers/alumni-detail-page/alumni-detail-page.component').then(m => m.AlumniDetailPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'forums',
    loadComponent: () => import('./features/forums/containers/forum-list/forum-list.component').then(m => m.ForumListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'forums/create',
    loadComponent: () => import('./features/forums/components/create-topic/create-topic.component').then(m => m.CreateTopicComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
