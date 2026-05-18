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
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
    
      <!-- Main Content -->
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Back Button -->
        <div class="mb-6">
          <button routerLink="/jobs" class="btn-outline">
            ← Back to Jobs
          </button>
        </div>
    
        <!-- Job Header -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-neutral-900 mb-2">{{ job().title }}</h1>
              <div class="flex items-center gap-4 text-neutral-600 mb-4">
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="buildingIcon" [size]="16"></lucide-icon>
                  {{ job().company }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="mapPinIcon" [size]="16"></lucide-icon>
                  {{ job().location }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="dollarSignIcon" [size]="16"></lucide-icon>
                  {{ job().salary }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="clockIcon" [size]="16"></lucide-icon>
                  {{ job().postedDate }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge badge-success">{{ job().type }}</span>
                <span class="badge badge-info">{{ job().experience }}</span>
              </div>
            </div>
            <div class="ml-6">
              <button class="btn-primary btn-lg">
                Apply Now
              </button>
            </div>
          </div>
        </div>
    
        <!-- Job Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Job Description -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-neutral-900 mb-4">Job Description</h2>
              <div class="prose max-w-none">
                <p class="text-neutral-700 mb-4">{{ job().description }}</p>
                <h3 class="text-md font-semibold text-neutral-900 mb-2">Key Responsibilities:</h3>
                <ul class="list-disc list-inside text-neutral-700 mb-4">
                  @for (responsibility of job().responsibilities; track responsibility) {
                    <li>{{ responsibility }}</li>
                  }
                </ul>
                <h3 class="text-md font-semibold text-neutral-900 mb-2">Requirements:</h3>
                <ul class="list-disc list-inside text-neutral-700">
                  @for (requirement of job().requirements; track requirement) {
                    <li>{{ requirement }}</li>
                  }
                </ul>
              </div>
            </div>
    
            <!-- Company Information -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-neutral-900 mb-4">About {{ job().company }}</h2>
              <p class="text-neutral-700">{{ job().companyDescription }}</p>
            </div>
          </div>
    
          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Application Form -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Apply for this position</h3>
    
              <!-- For authenticated users -->
              @if (authState.isAuthenticated) {
                <form class="space-y-4">
                  <div>
                    <label class="input-label">Full Name</label>
                    <input type="text" class="input-field" placeholder="Your full name">
                  </div>
                  <div>
                    <label class="input-label">Email Address</label>
                    <input type="email" class="input-field" placeholder="your.email@example.com">
                  </div>
                  <div>
                    <label class="input-label">Phone Number</label>
                    <input type="tel" class="input-field" placeholder="+91 98765 43210">
                  </div>
                  <div>
                    <label class="input-label">Cover Letter</label>
                    <textarea rows="4" class="input-field-lg" placeholder="Tell us why you're interested in this position..."></textarea>
                  </div>
                  <div>
                    <label class="input-label">Resume/CV</label>
                    <input type="file" class="input-field" accept=".pdf,.doc,.docx">
                  </div>
                  <button type="submit" class="btn-primary w-full">
                    Submit Application
                  </button>
                </form>
              }
    
              <!-- For public users -->
              @if (!authState.isAuthenticated) {
                <div class="text-center py-8">
                  <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <lucide-icon [img]="loginIcon" [size]="24" class="text-primary-600"></lucide-icon>
                  </div>
                  <h4 class="text-lg font-semibold text-neutral-900 mb-2">Sign In Required</h4>
                  <p class="text-neutral-600 mb-6">
                    You need to sign in to apply for this position. Create an account to start your application.
                  </p>
                  <div class="space-y-3">
                    <button routerLink="/login" class="btn-primary w-full">
                      <lucide-icon [img]="loginIcon" [size]="16"></lucide-icon>
                      Sign In to Apply
                    </button>
                    <button routerLink="/register" class="btn-outline w-full">
                      Create Account
                    </button>
                  </div>
                </div>
              }
            </div>
    
            <!-- Job Details -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Job Details</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-neutral-600">Job Type:</span>
                  <span class="font-medium">{{ job().type }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Experience:</span>
                  <span class="font-medium">{{ job().experience }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Salary:</span>
                  <span class="font-medium">{{ job().salary }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Location:</span>
                  <span class="font-medium">{{ job().location }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Posted:</span>
                  <span class="font-medium">{{ job().postedDate }}</span>
                </div>
              </div>
            </div>
    
            <!-- Skills Required -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Required Skills</h3>
              <div class="flex flex-wrap gap-2">
                @for (skill of job().skills; track skill) {
                  <span class="badge badge-outline">
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
