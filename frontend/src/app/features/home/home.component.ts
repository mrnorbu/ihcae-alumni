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
  MessageCircle
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
              Conquer Peaks,
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-secondary-200">
                Preserve Nature
              </span>
            </h1>
            <p class="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
              Join the International Himalayan Conservation and Adventure Education (IHCAE) Alumni Network. 
              Connect with fellow mountaineers, eco-tourism professionals, and conservation champions from Sikkim.
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

      <!-- About Section - Compact -->
      <section id="about" class="section-compact bg-neutral-50">
        <div class="container-compact">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-sans text-neutral-900 font-bold mb-3">
              Adventure Meets Conservation
            </h2>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              IHCAE Sikkim trains the next generation of mountain guides, eco-tourism professionals, and environmental stewards across the Himalayas.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Mountaineering -->
            <div class="card-lg hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [img]="mountainIcon" [size]="24" class="text-primary-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-3">Himalayan Mountaineering</h3>
              <p class="text-neutral-600 leading-relaxed text-sm">
                Master technical climbing skills, safety protocols, and leadership in the majestic peaks of Sikkim and the Eastern Himalayas.
              </p>
            </div>

            <!-- Eco-Tourism -->
            <div class="card-lg hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [img]="heartIcon" [size]="24" class="text-success-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-3">Sikkim Eco-Tourism</h3>
              <p class="text-neutral-600 leading-relaxed text-sm">
                Develop responsible tourism practices that protect Sikkim's fragile mountain ecosystems while supporting local communities.
              </p>
            </div>

            <!-- Conservation -->
            <div class="card-lg hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [img]="globeIcon" [size]="24" class="text-info-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-3">Himalayan Conservation</h3>
              <p class="text-neutral-600 leading-relaxed text-sm">
                Champion conservation initiatives, climate action, and biodiversity protection in the Eastern Himalayas.
              </p>
            </div>
          </div>
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
              <div class="h-40 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [img]="sparklesIcon" [size]="40" class="text-white/80"></lucide-icon>
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
              <div class="h-40 bg-gradient-to-br from-success-400 to-info-500 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [img]="usersIcon" [size]="40" class="text-white/80"></lucide-icon>
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
              <div class="h-40 bg-gradient-to-br from-warning-400 to-warning-600 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [img]="awardIcon" [size]="40" class="text-white/80"></lucide-icon>
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
              routerLink="/register" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>Join Network to Read More</span>
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
                Career Opportunities
              </h2>
            </div>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover exciting opportunities in Himalayan mountaineering, eco-tourism, and conservation.
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
                  routerLink="/register" 
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
                  routerLink="/register" 
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <a 
              routerLink="/register" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Opportunities</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Community Forums Section - Compact -->
      <section id="forums" class="section-compact bg-white">
        <div class="container-compact">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 mb-3">
              <lucide-icon [img]="forumIcon" [size]="24" class="text-primary-600"></lucide-icon>
              <h2 class="text-3xl font-sans text-neutral-900 font-bold">
                Community Forums
              </h2>
            </div>
            <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
              Connect with fellow alumni, share experiences, and discuss topics ranging from mountaineering techniques to conservation efforts.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Forum Card 1 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="mountainIcon" [size]="20" class="text-primary-600"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900">Mountaineering</h3>
                    <p class="text-sm text-neutral-600">Technical discussions</p>
                  </div>
                </div>
                <span class="badge badge-primary text-xs">Active</span>
              </div>
              <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                Share climbing techniques, route conditions, and safety protocols for Himalayan expeditions.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-primary-600">12 topics today</span>
                <a 
                  routerLink="/forums" 
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Join Discussion →
                </a>
              </div>
            </div>

            <!-- Forum Card 2 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="heartIcon" [size]="20" class="text-success-600"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900">Conservation</h3>
                    <p class="text-sm text-neutral-600">Environmental action</p>
                  </div>
                </div>
                <span class="badge badge-success text-xs">Hot</span>
              </div>
              <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                Discuss conservation projects, climate initiatives, and sustainable tourism practices.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-primary-600">8 topics today</span>
                <a 
                  routerLink="/forums" 
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Join Discussion →
                </a>
              </div>
            </div>

            <!-- Forum Card 3 -->
            <div class="card hover:shadow-lg transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="usersIcon" [size]="20" class="text-info-600"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900">Alumni Stories</h3>
                    <p class="text-sm text-neutral-600">Personal experiences</p>
                  </div>
                </div>
                <span class="badge badge-info text-xs">Popular</span>
              </div>
              <p class="text-sm text-neutral-600 mb-3 leading-relaxed">
                Share your adventures, career milestones, and memorable experiences from your time at IHCAE.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-primary-600">15 topics today</span>
                <a 
                  routerLink="/forums" 
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Join Discussion →
                </a>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <a 
              routerLink="/forums" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>Explore All Forums</span>
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
            Ready to Begin Your Himalayan Adventure?
          </h2>
          <p class="text-lg text-white/90 mb-6 leading-relaxed">
            Join hundreds of alumni making a difference in mountaineering, conservation, and sustainable tourism across Sikkim and the Eastern Himalayas.
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
  readonly forumIcon = MessageCircle;
}
