import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Calendar, FileText, User, Building, MapPin, DollarSign, Clock, LogIn } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { UserAuthStore } from '../../../../core/state/user-auth.store';

/**
 * Job Detail Component
 * 
 * Detailed view of a specific job posting with application functionality.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white page-fade-in">
      <app-header></app-header>
    
      <!-- Main Content -->
      <div class="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        <!-- Back Button -->
        <div class="mb-5">
          <button routerLink="/jobs" class="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-700 transition-colors font-medium">
            &larr; Back to Jobs
          </button>
        </div>
    
        <!-- Job Header -->
        <div class="pb-6 mb-6 border-b border-neutral-200/60">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex-1">
              <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 mb-2 tracking-tight">{{ job().title }}</h1>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs md:text-sm text-neutral-500 mb-3">
                <div class="flex items-center gap-1.5">
                  <lucide-icon [img]="buildingIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                  <span>{{ job().company }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <lucide-icon [img]="mapPinIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                  <span>{{ job().location }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <lucide-icon [img]="dollarSignIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                  <span>{{ job().salary }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <lucide-icon [img]="clockIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                  <span>{{ job().postedDate }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">{{ job().type }}</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">{{ job().experience }}</span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <button class="btn-primary btn-sm whitespace-nowrap text-sm py-2 px-4">
                Apply Now
              </button>
            </div>
          </div>
        </div>
    
        <!-- Job Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content (Left Column) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Job Description -->
            <div class="pb-6 border-b border-neutral-200/60">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Job Description</h2>
              <div class="prose max-w-none text-sm text-neutral-600 leading-relaxed">
                <p class="mb-4">{{ job().description }}</p>
                
                <h3 class="text-sm font-bold text-neutral-800 mb-2">Key Responsibilities</h3>
                <ul class="list-disc list-inside space-y-1.5 mb-4 pl-1">
                  @for (responsibility of job().responsibilities; track responsibility) {
                    <li>{{ responsibility }}</li>
                  }
                </ul>
                
                <h3 class="text-sm font-bold text-neutral-800 mb-2">Requirements</h3>
                <ul class="list-disc list-inside space-y-1.5 pl-1">
                  @for (requirement of job().requirements; track requirement) {
                    <li>{{ requirement }}</li>
                  }
                </ul>
              </div>
            </div>
    
            <!-- Company Info -->
            <div class="pb-6">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">About {{ job().company }}</h2>
              <p class="text-sm text-neutral-600 leading-relaxed">{{ job().companyDescription }}</p>
            </div>
          </div>
    
          <!-- Sidebar (Right Column) -->
          <div class="space-y-6 lg:border-l lg:border-neutral-200/60 lg:pl-8">
            <!-- Application Form -->
            <div class="pb-6 border-b border-neutral-200/60 last:border-b-0">
              <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Apply for this position</h3>
    
              <!-- For authenticated users -->
              @if (authState.isAuthenticated) {
                <form class="space-y-3">
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
                    <input type="text" class="input-field py-2 px-3 text-sm rounded" placeholder="Your full name">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 mb-1">Email Address</label>
                    <input type="email" class="input-field py-2 px-3 text-sm rounded" placeholder="your.email@example.com">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 mb-1">Phone Number</label>
                    <input type="tel" class="input-field py-2 px-3 text-sm rounded" placeholder="+91 98765 43210">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 mb-1">Cover Letter</label>
                    <textarea rows="3" class="input-field py-2 px-3 text-sm rounded" placeholder="Tell us why you're interested..."></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 mb-1">Resume/CV</label>
                    <input type="file" class="input-field py-1.5 px-3 text-sm rounded file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200" accept=".pdf,.doc,.docx">
                  </div>
                  <button type="submit" class="btn-primary w-full btn-sm text-sm font-medium py-2">
                    Submit Application
                  </button>
                </form>
              }
    
              <!-- For public users -->
              @if (!authState.isAuthenticated) {
                <div class="text-center py-5 bg-neutral-50/50 rounded-lg px-4 border border-neutral-200/40">
                  <div class="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-2.5 text-neutral-600">
                    <lucide-icon [img]="loginIcon" [size]="16"></lucide-icon>
                  </div>
                  <h4 class="text-xs font-bold text-neutral-900 mb-1">Sign In Required</h4>
                  <p class="text-xs text-neutral-500 mb-3 leading-normal max-w-[220px] mx-auto">
                    You need to sign in to apply. Create an account to start your application.
                  </p>
                  <div class="space-y-2">
                    <button routerLink="/login" class="btn-primary w-full btn-sm text-xs py-2">
                      Sign In to Apply
                    </button>
                    <button routerLink="/register" class="btn-outline w-full btn-sm text-xs bg-white hover:bg-neutral-50 py-2">
                      Create Account
                    </button>
                  </div>
                </div>
              }
            </div>
    
            <!-- Job Summary Details -->
            <div class="pb-6 border-b border-neutral-200/60 last:border-b-0">
              <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Job Summary</h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between py-1 border-b border-neutral-100">
                  <span class="text-neutral-500">Job Type</span>
                  <span class="font-medium text-neutral-800 text-sm">{{ job().type }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-100">
                  <span class="text-neutral-500">Experience</span>
                  <span class="font-medium text-neutral-800 text-sm">{{ job().experience }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-100">
                  <span class="text-neutral-500">Salary</span>
                  <span class="font-medium text-neutral-800 text-sm">{{ job().salary }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-100">
                  <span class="text-neutral-500">Location</span>
                  <span class="font-medium text-neutral-800 text-sm">{{ job().location }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-100">
                  <span class="text-neutral-500">Posted</span>
                  <span class="font-medium text-neutral-800 text-sm">{{ job().postedDate }}</span>
                </div>
              </div>
            </div>
    
            <!-- Skills Required -->
            <div class="pb-6 border-b border-neutral-200/60 last:border-b-0">
              <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Required Skills</h3>
              <div class="flex flex-wrap gap-1.5">
                @for (skill of job().skills; track skill) {
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 text-xs text-neutral-600">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class JobDetailComponent implements OnInit {
  // Dependency injection
  private authStore = inject(UserAuthStore);
  
  // Authentication state
  authState: {
    isAuthenticated: boolean;
    user: any;
  } = {
    isAuthenticated: false,
    user: null
  };

  // Icons
  buildingIcon = Building;
  mapPinIcon = MapPin;
  dollarSignIcon = DollarSign;
  clockIcon = Clock;
  loginIcon = LogIn;

  // Dummy job data
  job = signal({
    id: 1,
    title: 'Adventure Tourism Manager',
    company: 'Himalayan Adventures Ltd.',
    location: 'Shimla, Himachal Pradesh',
    type: 'Full Time',
    salary: '₹8-12 LPA',
    postedDate: '2 days ago',
    experience: '3-5 years',
    description: 'We are seeking an experienced Adventure Tourism Manager to lead our operations in the beautiful Himalayas. This role involves managing trekking expeditions, eco-tourism initiatives, and implementing sustainable tourism practices.',
    responsibilities: [
      'Plan and execute adventure tourism programs',
      'Manage trekking expeditions and outdoor activities',
      'Develop sustainable tourism practices',
      'Train and supervise tour guides',
      'Ensure safety protocols are followed',
      'Maintain relationships with local communities'
    ],
    requirements: [
      'Bachelor\'s degree in Tourism Management or related field',
      '3-5 years experience in adventure tourism',
      'Strong leadership and communication skills',
      'Knowledge of Himalayan geography and culture',
      'First aid certification preferred',
      'Passion for sustainable tourism'
    ],
    skills: ['Tourism Management', 'Leadership', 'Sustainability', 'Himalayan Geography', 'First Aid', 'Communication'],
    companyDescription: 'Himalayan Adventures Ltd. is a leading adventure tourism company specializing in sustainable mountain experiences. We have been operating in the Himalayas for over 15 years, offering authentic and responsible tourism experiences.'
  });

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authStore.state$.subscribe(state => {
      this.authState = {
        isAuthenticated: state.isAuthenticated,
        user: state.user
      };
    });
  }
}
