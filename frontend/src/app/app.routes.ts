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
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      { path: '', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'content-review', loadComponent: () => import('./features/admin/content-review/content-review.component').then(m => m.ContentReviewComponent) },
      { path: 'alumni', loadComponent: () => import('./features/admin/alumni-management/alumni-management.component').then(m => m.AlumniManagementComponent) },
      { path: 'forums', loadComponent: () => import('./features/admin/forum-moderation/forum-moderation.component').then(m => m.ForumModerationComponent) },
      { path: 'content', loadComponent: () => import('./features/admin/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent), data: { feature: 'Content Management' } },
      { path: 'analytics', loadComponent: () => import('./features/admin/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent), data: { feature: 'Analytics' } },
      { path: 'settings', loadComponent: () => import('./features/admin/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent), data: { feature: 'Settings' } },
    ]
  },
  {
    path: 'forums',
    loadComponent: () => import('./features/forums/containers/modern-forum-list/modern-forum-list.component').then(m => m.ModernForumListComponent),
    canActivate: [AlumniGuard]
  },
  {
    path: 'forums/topics/:id',
    loadComponent: () => import('./features/forums/containers/forum-thread-detail/forum-thread-detail.component').then(m => m.ForumThreadDetailComponent),
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
    path: 'news/:id',
    loadComponent: () => import('./features/news-events/containers/news-detail/news-detail.component').then(m => m.NewsDetailComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/news-events/containers/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: 'events/:id/register',
    loadComponent: () => import('./features/news-events/containers/event-registration/event-registration.component').then(m => m.EventRegistrationComponent)
  },
  {
    path: 'content-management',
    loadComponent: () => import('./features/content-management/content-management.component').then(m => m.ContentManagementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'submit-success-story',
    loadComponent: () => import('./features/news-events/containers/submit-success-story/submit-success-story.component').then(m => m.SubmitSuccessStoryComponent),
    canActivate: [AlumniGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
