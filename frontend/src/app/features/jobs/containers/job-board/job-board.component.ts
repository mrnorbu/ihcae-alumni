import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, Filter, MapPin, Clock, Building, DollarSign, Briefcase, Plus, ChevronRight, LogIn } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { UserAuthStore } from '../../../../core/state/user-auth.store';

/**
 * Job Board Component
 * 
 * Main job board page displaying career opportunities for alumni.
 * Features job listings with search, filters, and application functionality.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-job-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Career Opportunities</h1>
          <p class="text-neutral-600">Discover exciting job opportunities from IHCAE alumni and partners</p>
        </div>

        <!-- Search and Filters Card -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search Input -->
            <div class="md:col-span-2">
              <label class="input-label flex items-center gap-2">
                <lucide-icon [img]="searchIcon" [size]="16"></lucide-icon>
                Search Jobs
              </label>
              <div class="relative">
                <input
                  [(ngModel)]="filters().search"
                  type="text"
                  class="input-field pl-10"
                  placeholder="Search by title, company, or keywords..."
                />
                <lucide-icon
                  [img]="searchIcon"
                  [size]="18"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                ></lucide-icon>
              </div>
            </div>

            <!-- Location Filter -->
            <div>
              <label class="input-label flex items-center gap-2">
                <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                Location
              </label>
              <select [(ngModel)]="filters().location" class="input-field">
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
                <option value="himachal">Himachal Pradesh</option>
                <option value="international">International</option>
              </select>
            </div>

            <!-- Job Type Filter -->
            <div>
              <label class="input-label flex items-center gap-2">
                <lucide-icon [img]="briefcaseIcon" [size]="14"></lucide-icon>
                Job Type
              </label>
              <select [(ngModel)]="filters().jobType" class="input-field">
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div *ngIf="hasActiveFilters()" class="mt-4 pt-4 border-t border-neutral-200">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-neutral-600">Active filters:</span>
              <span *ngIf="filters().search" class="badge badge-primary">Search: "{{ filters().search }}"</span>
              <span *ngIf="filters().location" class="badge badge-primary">Location: {{ filters().location }}</span>
              <span *ngIf="filters().jobType" class="badge badge-primary">Type: {{ filters().jobType }}</span>
              <button (click)="clearFilters()" class="text-xs text-primary-600 hover:text-primary-700 underline">
                Clear all
              </button>
            </div>
          </div>
        </div>

        <!-- Job Listings -->
        <div class="space-y-4 mb-8">
          <div *ngFor="let job of getFilteredJobs()" class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <!-- Job Title and Company -->
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-neutral-900">{{ job.title }}</h3>
                  <span class="badge badge-success">{{ job.type }}</span>
                </div>
                
                <div class="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="buildingIcon" [size]="14"></lucide-icon>
                    {{ job.company }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                    {{ job.location }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="dollarSignIcon" [size]="14"></lucide-icon>
                    {{ job.salary }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                    {{ job.postedDate }}
                  </div>
                </div>

                <!-- Job Description -->
                <p class="text-neutral-700 mb-4 line-clamp-2">{{ job.description }}</p>

                <!-- Skills/Tags -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span *ngFor="let skill of job.skills" class="badge badge-outline text-xs">
                    {{ skill }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col gap-2 ml-4">
                <!-- For authenticated users -->
                <ng-container *ngIf="authState.isAuthenticated">
                  <button class="btn-primary btn-sm">
                    Apply Now
                  </button>
                  <button class="btn-outline btn-sm">
                    View Details
                  </button>
                </ng-container>
                
                <!-- For public users -->
                <ng-container *ngIf="!authState.isAuthenticated">
                  <button routerLink="/login" class="btn-primary btn-sm">
                    <lucide-icon [img]="loginIcon" [size]="14"></lucide-icon>
                    Sign In to Apply
                  </button>
                  <button class="btn-outline btn-sm">
                    View Details
                  </button>
                </ng-container>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="getFilteredJobs().length === 0" class="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <lucide-icon [img]="briefcaseIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">No jobs found</h3>
          <p class="text-neutral-600 mb-6 max-w-md mx-auto">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
          <button (click)="clearFilters()" class="btn-primary">Clear All Filters</button>
        </div>

        <!-- Post Job CTA -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-2">Have a job opportunity?</h3>
              <p class="text-primary-100">Share career opportunities with the IHCAE alumni community</p>
            </div>
            <!-- Show different CTAs based on auth status -->
            <ng-container *ngIf="authState.isAuthenticated">
              <button class="btn-white">
                <lucide-icon [img]="plusIcon" [size]="18"></lucide-icon>
                Post a Job
              </button>
            </ng-container>
            <ng-container *ngIf="!authState.isAuthenticated">
              <button routerLink="/login" class="btn-white">
                <lucide-icon [img]="loginIcon" [size]="18"></lucide-icon>
                Sign In to Post Jobs
              </button>
            </ng-container>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class JobBoardComponent implements OnInit {
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
  searchIcon = Search;
  mapPinIcon = MapPin;
  briefcaseIcon = Briefcase;
  buildingIcon = Building;
  dollarSignIcon = DollarSign;
  clockIcon = Clock;
  plusIcon = Plus;
  loginIcon = LogIn;

  // Filters
  filters = signal({
    search: '',
    location: '',
    jobType: ''
  });

  // Dummy job data
  jobs = signal([
    {
      id: 1,
      title: 'Adventure Tourism Manager',
      company: 'Himalayan Adventures Ltd.',
      location: 'Shimla, Himachal Pradesh',
      type: 'Full Time',
      salary: '₹8-12 LPA',
      postedDate: '2 days ago',
      description: 'Lead adventure tourism operations in the Himalayas. Manage trekking expeditions, eco-tourism initiatives, and sustainable tourism practices.',
      skills: ['Tourism Management', 'Leadership', 'Sustainability', 'Himalayan Geography']
    },
    {
      id: 2,
      title: 'Environmental Conservation Specialist',
      company: 'Wildlife Conservation Society',
      location: 'Remote',
      type: 'Contract',
      salary: '₹6-10 LPA',
      postedDate: '1 week ago',
      description: 'Work on conservation projects in the Indian Himalayas. Research and implement sustainable environmental practices.',
      skills: ['Environmental Science', 'Research', 'Conservation', 'Field Work']
    },
    {
      id: 3,
      title: 'Mountain Guide',
      company: 'Peak Adventures',
      location: 'Manali, Himachal Pradesh',
      type: 'Full Time',
      salary: '₹5-8 LPA',
      postedDate: '3 days ago',
      description: 'Lead mountain expeditions and provide expert guidance for trekking and mountaineering activities.',
      skills: ['Mountaineering', 'First Aid', 'Navigation', 'Risk Management']
    },
    {
      id: 4,
      title: 'Eco-Tourism Consultant',
      company: 'Green Tourism Solutions',
      location: 'Delhi',
      type: 'Part Time',
      salary: '₹4-6 LPA',
      postedDate: '5 days ago',
      description: 'Consult on sustainable tourism practices and help businesses implement eco-friendly initiatives.',
      skills: ['Consulting', 'Sustainability', 'Tourism', 'Business Development']
    },
    {
      id: 5,
      title: 'Adventure Sports Instructor',
      company: 'Thrill Seekers Academy',
      location: 'Rishikesh, Uttarakhand',
      type: 'Full Time',
      salary: '₹3-5 LPA',
      postedDate: '1 week ago',
      description: 'Train and instruct students in various adventure sports including rock climbing, rafting, and paragliding.',
      skills: ['Adventure Sports', 'Teaching', 'Safety', 'Physical Fitness']
    }
  ]);

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authStore.state$.subscribe(state => {
      this.authState = {
        isAuthenticated: state.isAuthenticated,
        user: state.user
      };
    });
  }

  getFilteredJobs() {
    const filters = this.filters();
    let filteredJobs = this.jobs();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      filteredJobs = filteredJobs.filter(job => 
        job.type.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    return filteredJobs;
  }

  hasActiveFilters(): boolean {
    const filters = this.filters();
    return !!(filters.search || filters.location || filters.jobType);
  }

  clearFilters() {
    this.filters.set({
      search: '',
      location: '',
      jobType: ''
    });
  }
}
