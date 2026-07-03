import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, Filter, MapPin, Clock, Building, DollarSign, Briefcase, Plus, ChevronRight, LogIn } from 'lucide-angular';
import { HeaderComponent, FooterComponent, CustomSelectComponent, SelectOption } from '../../../../shared/components';
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
  imports: [FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule, CustomSelectComponent],
  template: `
    <div class="min-h-screen bg-white page-fade-in">
      <app-header></app-header>
    
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-6 pb-4 border-b border-neutral-200/60">
          <h1 class="text-2xl font-bold text-neutral-900 mb-1 tracking-tight">Career Opportunities</h1>
          <p class="text-sm text-neutral-500">Discover exciting job opportunities from IHCAE alumni and partners</p>
        </div>
    
        <!-- Search and Filters -->
        <div class="border-b border-neutral-200/60 pb-5 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search Input -->
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-neutral-600 mb-1">
                Search Jobs
              </label>
              <div class="relative">
                <input
                  [ngModel]="filters().search"
                  (ngModelChange)="updateSearch($event)"
                  type="text"
                  class="input-field pl-12"
                  placeholder="Search by title, company, or keywords..."
                  />
                <lucide-icon
                  [img]="searchIcon"
                  [size]="16"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                ></lucide-icon>
              </div>
            </div>

            <!-- Location Filter -->
            <div>
              <label class="block text-xs font-semibold text-neutral-600 mb-1">
                Location
              </label>
              <app-custom-select
                [options]="locationOptions"
                [ngModel]="filters().location"
                (ngModelChange)="updateLocation($event)"
                placeholder="All Locations"
              ></app-custom-select>
            </div>
    
            <!-- Job Type Filter -->
            <div>
              <label class="block text-xs font-semibold text-neutral-600 mb-1">
                Job Type
              </label>
              <app-custom-select
                [options]="jobTypeOptions"
                [ngModel]="filters().jobType"
                (ngModelChange)="updateJobType($event)"
                placeholder="All Types"
              ></app-custom-select>
            </div>
          </div>
    
          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="mt-4 pt-4 border-t border-neutral-200">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs text-neutral-500">Active filters:</span>
                @if (filters().search) {
                  <span class="badge badge-primary">Search: "{{ filters().search }}"</span>
                }
                @if (filters().location) {
                  <span class="badge badge-primary">Location: {{ filters().location }}</span>
                }
                @if (filters().jobType) {
                  <span class="badge badge-primary">Type: {{ filters().jobType }}</span>
                }
                <button (click)="clearFilters()" class="text-xs text-primary-600 hover:text-primary-700 underline">
                  Clear all
                </button>
              </div>
            </div>
          }
        </div>
    
        <!-- Job Listings -->
        <div class="mb-8">
          @for (job of getFilteredJobs(); track job) {
            <div class="py-4 border-b border-neutral-200/60 hover:bg-neutral-50/30 px-2 rounded-lg transition-colors group">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="flex-1 min-w-0" [routerLink]="['/jobs', job.id]" class="cursor-pointer">
                  <!-- Job Title and Company -->
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 class="text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug">{{ job.title }}</h3>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">{{ job.type }}</span>
                  </div>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mb-2.5">
                    <div class="flex items-center gap-1.5">
                      <lucide-icon [img]="buildingIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span>{{ job.company }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <lucide-icon [img]="mapPinIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span>{{ job.location }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <lucide-icon [img]="dollarSignIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span>{{ job.salary }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <lucide-icon [img]="clockIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span>{{ job.postedDate }}</span>
                    </div>
                  </div>
                  <!-- Job Description -->
                  <p class="text-sm text-neutral-600 mb-3 leading-relaxed line-clamp-2">{{ job.description }}</p>
                  <!-- Skills/Tags -->
                  <div class="flex items-center gap-1.5 flex-wrap">
                    @for (skill of job.skills; track skill) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 text-xs text-neutral-600">
                        {{ skill }}
                      </span>
                    }
                  </div>
                </div>
                <!-- Action Buttons -->
                <div class="flex items-center gap-2 md:self-center flex-shrink-0">
                  <!-- For authenticated users -->
                  @if (authState.isAuthenticated) {
                    <button class="btn-primary btn-sm whitespace-nowrap">
                      Apply
                    </button>
                  }
                  <!-- For public users -->
                  @if (!authState.isAuthenticated) {
                    <button routerLink="/login" class="btn-primary btn-sm whitespace-nowrap inline-flex items-center gap-1">
                      <lucide-icon [img]="loginIcon" [size]="12"></lucide-icon>
                      Sign In to Apply
                    </button>
                  }
                  <button class="btn-outline btn-sm whitespace-nowrap" [routerLink]="['/jobs', job.id]">
                    Details
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
    
        <!-- Empty State -->
        @if (getFilteredJobs().length === 0) {
          <div class="py-12 text-center">
            <lucide-icon [img]="briefcaseIcon" [size]="36" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
            <h3 class="text-base font-bold text-neutral-900 mb-1">No jobs found</h3>
            <p class="text-xs text-neutral-500 mb-4 max-w-xs mx-auto">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <button (click)="clearFilters()" class="btn-outline btn-sm">Clear All Filters</button>
          </div>
        }
    
        <!-- Post Job CTA -->
        <div class="bg-primary-950 p-6 rounded-lg text-white">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-bold mb-0.5">Have a job opportunity?</h3>
              <p class="text-xs text-primary-200">Share career opportunities with the IHCAE alumni community</p>
            </div>
            <!-- Show different CTAs based on auth status -->
            @if (authState.isAuthenticated) {
              <button class="btn-primary bg-white hover:bg-neutral-100 text-primary-950 font-medium btn-sm whitespace-nowrap inline-flex items-center gap-1.5">
                <lucide-icon [img]="plusIcon" [size]="14"></lucide-icon>
                Post a Job
              </button>
            }
            @if (!authState.isAuthenticated) {
              <button routerLink="/login" class="btn-primary bg-white hover:bg-neutral-100 text-primary-950 font-medium btn-sm whitespace-nowrap inline-flex items-center gap-1.5">
                <lucide-icon [img]="loginIcon" [size]="14"></lucide-icon>
                Sign In to Post
              </button>
            }
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

  locationOptions: SelectOption[] = [
    { label: 'All Locations', value: '' },
    { label: 'Remote', value: 'remote' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Himachal Pradesh', value: 'himachal' },
    { label: 'International', value: 'international' }
  ];

  jobTypeOptions: SelectOption[] = [
    { label: 'All Types', value: '' },
    { label: 'Full Time', value: 'full-time' },
    { label: 'Part Time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
    { label: 'Freelance', value: 'freelance' }
  ];

  // Filters
  filters = signal({
    search: '',
    location: '',
    jobType: ''
  });

  updateSearch(term: string) {
    this.filters.update(f => ({ ...f, search: term }));
  }

  updateLocation(loc: string) {
    this.filters.update(f => ({ ...f, location: loc }));
  }

  updateJobType(type: string) {
    this.filters.update(f => ({ ...f, jobType: type }));
  }

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
