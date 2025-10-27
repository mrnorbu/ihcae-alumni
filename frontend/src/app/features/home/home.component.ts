import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserAuthStore } from '../../core/state/user-auth.store';
import { HeaderComponent, FooterComponent } from '../../shared/components';
import { 
  LucideAngularModule, 
  Mountain, 
  Heart, 
  Globe, 
  ArrowRight, 
  Newspaper, 
  Briefcase, 
  ChevronDown,
  Sparkles,
  Users,
  Award,
  Calendar,
  MapPin,
  Clock
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white">
      <app-header></app-header>

      <!-- Hero Section - Compact -->
      <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0">
          <img src="images/home.jpg" alt="Mountain Climbing Expedition" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/40"></div>
        </div>

        <!-- Hero Content -->
        <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <div class="max-w-3xl mx-auto">
            <h1 class="text-4xl md:text-6xl font-sans text-white font-bold mb-5 leading-tight">
              IHCAE Alumni Network
            </h1>
            <p class="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
              Where Adventure Meets Purpose. Connect, Explore, and Lead the Future of Sustainable Tourism.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a 
                routerLink="/register" 
                class="btn-primary btn-lg inline-flex items-center gap-2 shadow-xl hover:shadow-2xl"
              >
                <span>Join Our Community</span>
                <lucide-icon [img]="arrowIcon" [size]="18"></lucide-icon>
              </a>
              <a 
                href="#about" 
                class="btn-outline btn-lg text-white border-white/40 hover:bg-white/10 hover:border-white/60 backdrop-blur-sm inline-flex items-center gap-2"
              >
                <span>Explore Our Mission</span>
                <lucide-icon [img]="chevronIcon" [size]="18"></lucide-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <lucide-icon [img]="chevronIcon" [size]="24"></lucide-icon>
        </div>
      </section>

      <!-- News Section - Compact -->
      <section id="news" class="section-compact bg-white">
        <div class="container-compact">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 mb-3">
              <lucide-icon [img]="newsIcon" [size]="24" class="text-primary-600"></lucide-icon>
              <h2 class="text-3xl font-sans text-neutral-900 font-bold">
                Latest News & Stories
              </h2>
            </div>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              Stay updated with achievements, conservation efforts, and adventures from our global alumni community.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- News Card 1 -->
            <article class="card hover:shadow-lg transition-all group">
              <div class="h-40 rounded-lg overflow-hidden mb-4">
                <img src="images/news1.jpg" alt="Kanchenjunga Cleanup Initiative" class="w-full h-full object-cover">
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-primary">Conservation</span>
                  <span class="text-xs text-neutral-500">Dec 15, 2024</span>
                </div>
                <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  Kanchenjunga Cleanup Initiative
                </h3>
                <p class="text-sm text-neutral-600 leading-relaxed">
                  Alumni-led project removes 2 tons of waste from Kanchenjunga Base Camp, setting new standards for sustainable mountaineering in Sikkim.
                </p>
              </div>
            </article>

            <!-- News Card 2 -->
            <article class="card hover:shadow-lg transition-all group">
              <div class="h-40 rounded-lg overflow-hidden mb-4">
                <img src="images/new2.jpg" alt="Sikkim Alumni Summit 2024" class="w-full h-full object-cover">
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-success">Community</span>
                  <span class="text-xs text-neutral-500">Dec 12, 2024</span>
                </div>
                <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  Sikkim Alumni Summit 2024
                </h3>
                <p class="text-sm text-neutral-600 leading-relaxed">
                  Over 200 alumni from the Eastern Himalayas gathered in Gangtok to share experiences and plan future conservation projects.
                </p>
              </div>
            </article>

            <!-- News Card 3 -->
            <article class="card hover:shadow-lg transition-all group">
              <div class="h-40 rounded-lg overflow-hidden mb-4">
                <img src="images/new3.jpg" alt="First All-Female Team Summits" class="w-full h-full object-cover">
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-warning">Achievement</span>
                  <span class="text-xs text-neutral-500">Dec 10, 2024</span>
                </div>
                <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  First All-Female Team Summits
                </h3>
                <p class="text-sm text-neutral-600 leading-relaxed">
                  IHCAE graduates lead historic Kanchenjunga expedition, demonstrating leadership skills and technical expertise.
                </p>
              </div>
            </article>
          </div>

          <div class="text-center mt-8">
            <a 
              routerLink="/news-events" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>Read All News & Events</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Events Section - Compact -->
      <section id="events" class="section-compact bg-neutral-50">
        <div class="container-compact">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 mb-3">
              <lucide-icon [img]="calendarIcon" [size]="24" class="text-primary-600"></lucide-icon>
              <h2 class="text-3xl font-sans text-neutral-900 font-bold">
                Upcoming Events
              </h2>
            </div>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              Join our upcoming events and connect with the IHCAE community.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Event 1 -->
            <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="calendarIcon" [size]="20" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2">Annual Alumni Reunion 2024</h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                    <span>Mar 15, 2024</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span class="truncate">IHCAE Campus, Sikkim</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-primary-600 font-medium">150 attendees</span>
                    <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Register →</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event 2 -->
            <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="mountainIcon" [size]="20" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2">Mountain Safety Workshop</h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                    <span>Feb 20, 2024</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span class="truncate">Training Center, Manali</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-primary-600 font-medium">30 attendees</span>
                    <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Register →</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event 3 -->
            <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="globeIcon" [size]="20" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2">Eco-Tourism Conference 2024</h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                    <span>Apr 10, 2024</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span class="truncate">Conference Hall, Gangtok</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-primary-600 font-medium">200 attendees</span>
                    <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Register →</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event 4 -->
            <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="awardIcon" [size]="20" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2">Adventure Sports Competition</h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                    <span>May 5, 2024</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span class="truncate">Adventure Sports Complex</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-primary-600 font-medium">75 attendees</span>
                    <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Register →</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event 5 -->
            <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="usersIcon" [size]="20" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2">Conservation Workshop</h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                    <span>Jun 12, 2024</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span class="truncate">Wildlife Sanctuary, Sikkim</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-primary-600 font-medium">45 attendees</span>
                    <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Register →</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event 6 -->
            <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-teal-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="heartIcon" [size]="20" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2">Sustainable Tourism Summit</h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                    <span>Jul 18, 2024</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span class="truncate">Hotel Mount View, Gangtok</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-primary-600 font-medium">120 attendees</span>
                    <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">Register →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <a 
              routerLink="/news-events" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Events</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Jobs Section - Compact -->
      <section id="jobs" class="section-compact bg-neutral-50">
        <div class="container-compact">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 mb-3">
              <lucide-icon [img]="briefcaseIcon" [size]="24" class="text-primary-600"></lucide-icon>
              <h2 class="text-3xl font-sans text-neutral-900 font-bold">
                Explore Jobs
              </h2>
            </div>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover exciting opportunities in adventure tourism, mountain guiding, and conservation across the Himalayas.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Job Card 1 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="mountainIcon" [size]="20" class="text-primary-600"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900">Senior Mountain Guide</h3>
                    <p class="text-sm text-neutral-600">Sikkim Adventure Tours</p>
                  </div>
                </div>
                <span class="badge badge-success text-xs">Full-time</span>
              </div>
              <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                Lead high-altitude expeditions in the Eastern Himalayas. Requires advanced certification and 5+ years of guiding experience.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-primary-600">Gangtok, Sikkim</span>
                <a 
                  routerLink="/jobs" 
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>

            <!-- Job Card 2 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="heartIcon" [size]="20" class="text-success-600"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900">Eco-Tourism Coordinator</h3>
                    <p class="text-sm text-neutral-600">Sikkim Conservation Foundation</p>
                  </div>
                </div>
                <span class="badge badge-info text-xs">Contract</span>
              </div>
              <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                Develop sustainable tourism programs that benefit local communities while protecting Sikkim's mountain ecosystems.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-primary-600">Gangtok, Sikkim</span>
                <a 
                  routerLink="/jobs" 
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <a 
              routerLink="/jobs" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Opportunities</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Success Stories Section - Compact -->
      <section id="success-stories" class="section-compact bg-neutral-50">
        <div class="container-compact">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 mb-3">
              <lucide-icon [img]="awardIcon" [size]="24" class="text-primary-600"></lucide-icon>
              <h2 class="text-3xl font-sans text-neutral-900 font-bold">
                Alumni Success Stories
              </h2>
            </div>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover inspiring journeys and achievements of our alumni community.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Success Story 1 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="mountainIcon" [size]="24" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-neutral-900 mb-2">From Student to Mountain Guide</h3>
                  <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                    Rajesh Kumar overcame challenges to become a certified mountain guide, now leading expeditions across the Himalayas.
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-primary-600">Career Achievement</span>
                    <a 
                      routerLink="/success-stories" 
                      class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Read Story →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success Story 2 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-success-400 to-info-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="heartIcon" [size]="24" class="text-white"></lucide-icon>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-neutral-900 mb-2">Conservation Success</h3>
                  <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                    Priya Sharma led a conservation project that increased snow leopard population by 30% in the region.
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-primary-600">Conservation Work</span>
                    <a 
                      routerLink="/success-stories" 
                      class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Read Story →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <a 
              routerLink="/success-stories" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Success Stories</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- CTA Section - Compact -->
      <section class="py-16 bg-gradient-brand relative overflow-hidden">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl md:text-4xl font-sans text-white font-bold mb-4">
            Ready to Start Your Adventure Tourism Career?
          </h2>
          <p class="text-lg text-white/90 mb-6 leading-relaxed">
            Join hundreds of alumni making a difference in adventure tourism, mountain guiding, and conservation across Sikkim and the Eastern Himalayas.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              routerLink="/register" 
              class="btn-primary btn-lg bg-white hover:bg-neutral-100 text-primary-700 inline-flex items-center gap-2 shadow-xl"
            >
              <span>Join the Network</span>
              <lucide-icon [img]="arrowIcon" [size]="18"></lucide-icon>
            </a>
            <a 
              routerLink="/login" 
              class="btn-outline btn-lg text-white border-white/40 hover:bg-white/10 hover:border-white/60 backdrop-blur-sm"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  private authStore = inject(UserAuthStore);

  // Lucide icons
  readonly mountainIcon = Mountain;
  readonly heartIcon = Heart;
  readonly globeIcon = Globe;
  readonly arrowIcon = ArrowRight;
  readonly newsIcon = Newspaper;
  readonly briefcaseIcon = Briefcase;
  readonly chevronIcon = ChevronDown;
  readonly sparklesIcon = Sparkles;
  readonly usersIcon = Users;
  readonly awardIcon = Award;
  readonly calendarIcon = Calendar;
  readonly mapPinIcon = MapPin;
  readonly clockIcon = Clock;
}
