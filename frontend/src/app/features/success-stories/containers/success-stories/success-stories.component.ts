import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Star, Calendar, MapPin, Award, Plus, Eye, Edit, Trash2, User } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';

/**
 * Success Stories Component
 * 
 * Showcase page displaying alumni success stories and achievements.
 * Features story submissions, filtering, and detailed story views.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-success-stories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Alumni Success Stories</h1>
          <p class="text-neutral-600">Celebrating the achievements and journeys of our IHCAE alumni community</p>
        </div>

        <!-- Featured Story -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow p-8 mb-8 text-white">
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <lucide-icon [img]="starIcon" [size]="32" class="text-white"></lucide-icon>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold mb-2">Featured Story</h2>
              <h3 class="text-xl font-semibold mb-3">{{ featuredStory().title }}</h3>
              <p class="text-primary-100 mb-4 line-clamp-3">{{ featuredStory().excerpt }}</p>
              <div class="flex items-center gap-4 text-sm text-primary-100">
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="userIcon" [size]="14"></lucide-icon>
                  {{ featuredStory().author }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
                  {{ featuredStory().date }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="awardIcon" [size]="14"></lucide-icon>
                  {{ featuredStory().category }}
                </div>
              </div>
            </div>
            <button class="btn-white">
              Read Full Story
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="input-label">Search Stories</label>
              <input
                [(ngModel)]="filters().search"
                type="text"
                class="input-field"
                placeholder="Search by title, author, or keywords..."
              />
            </div>

            <!-- Category Filter -->
            <div>
              <label class="input-label">Category</label>
              <select [(ngModel)]="filters().category" class="input-field">
                <option value="">All Categories</option>
                <option value="career">Career Achievement</option>
                <option value="adventure">Adventure & Exploration</option>
                <option value="conservation">Conservation Work</option>
                <option value="entrepreneurship">Entrepreneurship</option>
                <option value="education">Education & Research</option>
                <option value="community">Community Service</option>
              </select>
            </div>

            <!-- Year Filter -->
            <div>
              <label class="input-label">Year</label>
              <select [(ngModel)]="filters().year" class="input-field">
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Stories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div *ngFor="let story of getFilteredStories()" class="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <!-- Story Image -->
            <div class="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center">
              <lucide-icon [img]="awardIcon" [size]="48" class="text-primary-600"></lucide-icon>
            </div>
            
            <!-- Story Content -->
            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-primary">{{ story.category }}</span>
                <span class="badge badge-outline">{{ story.year }}</span>
              </div>
              
              <h3 class="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{{ story.title }}</h3>
              <p class="text-neutral-600 mb-4 line-clamp-3">{{ story.excerpt }}</p>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-neutral-500">
                  <lucide-icon [img]="userIcon" [size]="14"></lucide-icon>
                  {{ story.author }}
                </div>
                <div class="flex items-center gap-2 text-sm text-neutral-500">
                  <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
                  {{ story.date }}
                </div>
              </div>
              
              <div class="mt-4">
                <button class="btn-outline w-full">
                  <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                  Read Story
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="getFilteredStories().length === 0" class="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <lucide-icon [img]="awardIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">No stories found</h3>
          <p class="text-neutral-600 mb-6 max-w-md mx-auto">
            Try adjusting your search criteria or check back later for new success stories.
          </p>
          <button (click)="clearFilters()" class="btn-primary">Clear All Filters</button>
        </div>

        <!-- Submit Story CTA -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">Share Your Success Story</h3>
              <p class="text-neutral-600">Inspire others by sharing your achievements and journey</p>
            </div>
            <button class="btn-primary">
              <lucide-icon [img]="plusIcon" [size]="18"></lucide-icon>
              Submit Story
            </button>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class SuccessStoriesComponent implements OnInit {
  // Icons
  starIcon = Star;
  calendarIcon = Calendar;
  userIcon = User;
  awardIcon = Award;
  plusIcon = Plus;
  eyeIcon = Eye;

  // Filters
  filters = signal({
    search: '',
    category: '',
    year: ''
  });

  // Featured story
  featuredStory = signal({
    id: 1,
    title: 'From Student to Mountain Guide: A Journey of Perseverance',
    excerpt: 'How I overcame challenges to become a certified mountain guide and now lead expeditions across the Himalayas, inspiring others to pursue their dreams in adventure tourism.',
    author: 'Rajesh Kumar',
    date: 'December 2024',
    category: 'Career Achievement'
  });

  // Dummy stories data
  stories = signal([
    {
      id: 1,
      title: 'From Student to Mountain Guide: A Journey of Perseverance',
      excerpt: 'How I overcame challenges to become a certified mountain guide and now lead expeditions across the Himalayas.',
      author: 'Rajesh Kumar',
      date: 'Dec 2024',
      category: 'Career Achievement',
      year: '2024'
    },
    {
      id: 2,
      title: 'Conservation Success: Protecting Himalayan Wildlife',
      excerpt: 'Leading a successful conservation project that increased snow leopard population by 30% in our region.',
      author: 'Priya Sharma',
      date: 'Nov 2024',
      category: 'Conservation Work',
      year: '2024'
    },
    {
      id: 3,
      title: 'Building Sustainable Tourism in Remote Villages',
      excerpt: 'Founded an eco-tourism company that provides sustainable income to 50+ families in remote Himalayan villages.',
      author: 'Amit Singh',
      date: 'Oct 2024',
      category: 'Entrepreneurship',
      year: '2024'
    },
    {
      id: 4,
      title: 'First Indian Woman to Summit Mount Everest',
      excerpt: 'Achieved the dream of summiting Everest and now trains other women in mountaineering.',
      author: 'Sunita Devi',
      date: 'Sep 2024',
      category: 'Adventure & Exploration',
      year: '2024'
    },
    {
      id: 5,
      title: 'Research Breakthrough in Climate Change Adaptation',
      excerpt: 'Published groundbreaking research on how Himalayan communities adapt to climate change.',
      author: 'Dr. Vikram Joshi',
      date: 'Aug 2024',
      category: 'Education & Research',
      year: '2024'
    },
    {
      id: 6,
      title: 'Community Development Through Adventure Sports',
      excerpt: 'Established adventure sports training centers that have trained over 500 youth in remote areas.',
      author: 'Ravi Thakur',
      date: 'Jul 2024',
      category: 'Community Service',
      year: '2024'
    }
  ]);

  ngOnInit() {
    // Initialize component
  }

  getFilteredStories() {
    const filters = this.filters();
    let filteredStories = this.stories();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredStories = filteredStories.filter(story => 
        story.title.toLowerCase().includes(searchLower) ||
        story.author.toLowerCase().includes(searchLower) ||
        story.excerpt.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredStories = filteredStories.filter(story => 
        story.category === filters.category
      );
    }

    if (filters.year) {
      filteredStories = filteredStories.filter(story => 
        story.year === filters.year
      );
    }

    return filteredStories;
  }

  clearFilters() {
    this.filters.set({
      search: '',
      category: '',
      year: ''
    });
  }
}
