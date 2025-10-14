import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Clock, Users, Plus, Eye, Edit, Trash2, Newspaper, CalendarDays, Sparkles, Award, Building, Users2, BookOpen, Mountain } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';

/**
 * News & Events Component
 * 
 * Public news and events page displaying institute updates and upcoming events.
 * Features event registration and news article reading functionality.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-news-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">News & Events</h1>
          <p class="text-neutral-600">Stay updated with IHCAE news and upcoming events</p>
        </div>

        <!-- Featured Event -->
        <div class="bg-white rounded-lg shadow-lg border border-neutral-200 p-8 mb-8">
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <lucide-icon [img]="calendarIcon" [size]="32" class="text-primary-600"></lucide-icon>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold mb-2 text-neutral-900">Featured Event</h2>
              <h3 class="text-xl font-semibold mb-3 text-neutral-900">{{ featuredEvent().title }}</h3>
              <p class="text-neutral-600 mb-4 line-clamp-3">{{ featuredEvent().description }}</p>
              <div class="flex items-center gap-4 text-sm text-neutral-600">
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="calendarDaysIcon" [size]="14"></lucide-icon>
                  {{ featuredEvent().date }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                  {{ featuredEvent().location }}
                </div>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                  {{ featuredEvent().attendees }} attendees
                </div>
              </div>
            </div>
            <button class="btn-primary">
              Register Now
            </button>
          </div>
        </div>

        <!-- Content Tabs -->
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="border-b border-neutral-200">
            <nav class="flex space-x-8 px-6">
              <button 
                (click)="setActiveTab('news')"
                [class.tab-active]="activeTab() === 'news'"
                [class.tab-inactive]="activeTab() !== 'news'"
                class="py-4 px-1 border-b-2 font-medium text-sm">
                <lucide-icon [img]="newspaperIcon" [size]="18" class="mr-2"></lucide-icon>
                News ({{ news().length }})
              </button>
              <button 
                (click)="setActiveTab('events')"
                [class.tab-active]="activeTab() === 'events'"
                [class.tab-inactive]="activeTab() !== 'events'"
                class="py-4 px-1 border-b-2 font-medium text-sm">
                <lucide-icon [img]="calendarIcon" [size]="18" class="mr-2"></lucide-icon>
                Events ({{ events().length }})
              </button>
            </nav>
          </div>

          <!-- News Tab Content -->
          <div *ngIf="activeTab() === 'news'" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div *ngFor="let article of news(); let i = index" class="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <!-- Article Image -->
                <div class="h-48 flex items-center justify-center" [ngClass]="getNewsGradient(i)">
                  <lucide-icon [img]="getNewsIcon(article.category)" [size]="48" class="text-white/80"></lucide-icon>
                </div>
                
                <!-- Article Content -->
                <div class="p-6">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="badge badge-primary">{{ article.category }}</span>
                    <span class="text-xs text-neutral-500">{{ article.date }}</span>
                  </div>
                  
                  <h3 class="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{{ article.title }}</h3>
                  <p class="text-neutral-600 mb-4 line-clamp-3">{{ article.excerpt }}</p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm text-neutral-500">
                      <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                      {{ article.readTime }} min read
                    </div>
                    <button class="btn-outline btn-sm">
                      <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Events Tab Content -->
          <div *ngIf="activeTab() === 'events'" class="p-6">
            <div class="space-y-6">
              <div *ngFor="let event of events()" class="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold text-neutral-900">{{ event.title }}</h3>
                      <span class="badge badge-success">{{ event.type }}</span>
                    </div>
                    
                    <div class="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                      <div class="flex items-center gap-1">
                        <lucide-icon [img]="calendarDaysIcon" [size]="14"></lucide-icon>
                        {{ event.date }}
                      </div>
                      <div class="flex items-center gap-1">
                        <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                        {{ event.time }}
                      </div>
                      <div class="flex items-center gap-1">
                        <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                        {{ event.location }}
                      </div>
                      <div class="flex items-center gap-1">
                        <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                        {{ event.attendees }} registered
                      </div>
                    </div>

                    <p class="text-neutral-700 mb-4 line-clamp-2">{{ event.description }}</p>

                    <div class="flex items-center gap-2 flex-wrap">
                      <span *ngFor="let tag of event.tags" class="badge badge-outline text-xs">
                        {{ tag }}
                      </span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 ml-6">
                    <button class="btn-primary btn-sm">
                      Register Now
                    </button>
                    <button class="btn-outline btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Newsletter Signup -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">Stay Updated</h3>
              <p class="text-neutral-600">Subscribe to our newsletter for the latest news and events</p>
            </div>
            <div class="flex gap-2">
              <input type="email" class="input-field" placeholder="Enter your email">
              <button class="btn-primary">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class NewsEventsComponent implements OnInit {
  // Icons
  calendarIcon = Calendar;
  mapPinIcon = MapPin;
  clockIcon = Clock;
  usersIcon = Users;
  plusIcon = Plus;
  eyeIcon = Eye;
  editIcon = Edit;
  trashIcon = Trash2;
  newspaperIcon = Newspaper;
  calendarDaysIcon = CalendarDays;
  sparklesIcon = Sparkles;
  awardIcon = Award;
  buildingIcon = Building;
  users2Icon = Users2;
  bookOpenIcon = BookOpen;
  mountainIcon = Mountain;

  // Active tab
  activeTab = signal('news');

  // Featured event
  featuredEvent = signal({
    id: 1,
    title: 'Annual Alumni Reunion 2024',
    description: 'Join us for the biggest alumni gathering of the year! Connect with fellow graduates, share experiences, and celebrate the IHCAE community.',
    date: 'March 15, 2024',
    location: 'IHCAE Campus, Himachal Pradesh',
    attendees: 150
  });

  // News articles
  news = signal([
    {
      id: 1,
      title: 'IHCAE Launches New Adventure Tourism Program',
      excerpt: 'The institute introduces a comprehensive program focusing on sustainable adventure tourism practices in the Himalayas.',
      category: 'Program Updates',
      date: 'Dec 10, 2024',
      readTime: 5
    },
    {
      id: 2,
      title: 'Alumni Success: Mountain Guide Certification Program',
      excerpt: 'Three alumni successfully completed the advanced mountain guide certification program and are now leading expeditions.',
      category: 'Alumni News',
      date: 'Dec 8, 2024',
      readTime: 3
    },
    {
      id: 3,
      title: 'Conservation Project Update: Snow Leopard Protection',
      excerpt: 'Our ongoing conservation efforts have resulted in a 30% increase in snow leopard sightings in the region.',
      category: 'Conservation',
      date: 'Dec 5, 2024',
      readTime: 4
    },
    {
      id: 4,
      title: 'New Research Center Opens at IHCAE',
      excerpt: 'The institute inaugurates a state-of-the-art research center dedicated to Himalayan ecology and tourism studies.',
      category: 'Facilities',
      date: 'Dec 3, 2024',
      readTime: 6
    },
    {
      id: 5,
      title: 'Student Exchange Program with International Universities',
      excerpt: 'IHCAE partners with universities in Nepal and Bhutan for student exchange programs in adventure tourism.',
      category: 'Partnerships',
      date: 'Nov 28, 2024',
      readTime: 4
    },
    {
      id: 6,
      title: 'Winter Adventure Sports Training Begins',
      excerpt: 'The annual winter training program for adventure sports instructors kicks off with 25 participants.',
      category: 'Training',
      date: 'Nov 25, 2024',
      readTime: 3
    }
  ]);

  // Events
  events = signal([
    {
      id: 1,
      title: 'Annual Alumni Reunion 2024',
      description: 'Join us for the biggest alumni gathering of the year! Connect with fellow graduates, share experiences, and celebrate the IHCAE community.',
      date: 'March 15, 2024',
      time: '10:00 AM - 6:00 PM',
      location: 'IHCAE Campus, Himachal Pradesh',
      type: 'Reunion',
      attendees: 150,
      tags: ['Networking', 'Social', 'Alumni']
    },
    {
      id: 2,
      title: 'Mountain Safety Workshop',
      description: 'Learn essential safety protocols and emergency response techniques for mountain expeditions.',
      date: 'February 20, 2024',
      time: '9:00 AM - 4:00 PM',
      location: 'Training Center, Manali',
      type: 'Workshop',
      attendees: 30,
      tags: ['Safety', 'Training', 'Mountaineering']
    },
    {
      id: 3,
      title: 'Eco-Tourism Conference 2024',
      description: 'Industry leaders discuss sustainable tourism practices and environmental conservation in the Himalayas.',
      date: 'April 10, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Conference Hall, Shimla',
      type: 'Conference',
      attendees: 200,
      tags: ['Sustainability', 'Industry', 'Networking']
    },
    {
      id: 4,
      title: 'Adventure Sports Competition',
      description: 'Annual competition featuring rock climbing, rappelling, and orienteering challenges.',
      date: 'May 5, 2024',
      time: '8:00 AM - 6:00 PM',
      location: 'Adventure Sports Complex',
      type: 'Competition',
      attendees: 75,
      tags: ['Sports', 'Competition', 'Adventure']
    }
  ]);

  ngOnInit() {
    // Initialize component
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  getNewsGradient(index: number): string {
    const gradients = [
      'bg-gradient-to-br from-blue-400 to-purple-500',
      'bg-gradient-to-br from-emerald-400 to-cyan-500',
      'bg-gradient-to-br from-amber-400 to-orange-500',
      'bg-gradient-to-br from-pink-400 to-rose-500',
      'bg-gradient-to-br from-indigo-400 to-blue-500',
      'bg-gradient-to-br from-teal-400 to-green-500'
    ];
    return gradients[index % gradients.length];
  }

  getNewsIcon(category: string): any {
    const iconMap: { [key: string]: any } = {
      'Program Updates': this.sparklesIcon,
      'Alumni News': this.awardIcon,
      'Conservation': this.mountainIcon,
      'Facilities': this.buildingIcon,
      'Partnerships': this.users2Icon,
      'Training': this.bookOpenIcon,
      'default': this.newspaperIcon
    };
    return iconMap[category] || iconMap['default'];
  }
}
