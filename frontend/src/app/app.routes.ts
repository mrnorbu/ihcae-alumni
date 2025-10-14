import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard, AlumniGuard } from './core/guards/auth.guard';

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
    loadComponent: () => import('./features/directory/containers/modern-directory-page/modern-directory-page.component').then(m => m.ModernDirectoryPageComponent),
    canActivate: [AlumniGuard]
  },
  {
    path: 'alumni/:userId',
    loadComponent: () => import('./features/directory/containers/alumni-detail-page/alumni-detail-page.component').then(m => m.AlumniDetailPageComponent),
    canActivate: [AlumniGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/content',
    loadComponent: () => import('./features/admin/content-management/content-management.component').then(m => m.ContentManagementComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/alumni',
    loadComponent: () => import('./features/admin/alumni-management/alumni-management.component').then(m => m.AlumniManagementComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/forums',
    loadComponent: () => import('./features/admin/forum-moderation/forum-moderation.component').then(m => m.ForumModerationComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'forums',
    loadComponent: () => import('./features/forums/containers/modern-forum-list/modern-forum-list.component').then(m => m.ModernForumListComponent),
    canActivate: [AlumniGuard]
  },
  {
    path: 'jobs',
    loadComponent: () => import('./features/jobs/containers/job-board/job-board.component').then(m => m.JobBoardComponent)
  },
  {
    path: 'jobs/:jobId',
    loadComponent: () => import('./features/jobs/containers/job-detail/job-detail.component').then(m => m.JobDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'success-stories',
    loadComponent: () => import('./features/success-stories/containers/success-stories/success-stories.component').then(m => m.SuccessStoriesComponent),
    canActivate: [AlumniGuard]
  },
  {
    path: 'resume-builder',
    loadComponent: () => import('./features/resume-builder/containers/resume-builder/resume-builder.component').then(m => m.ResumeBuilderComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'news-events',
    loadComponent: () => import('./features/news-events/containers/news-events/news-events.component').then(m => m.NewsEventsComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
