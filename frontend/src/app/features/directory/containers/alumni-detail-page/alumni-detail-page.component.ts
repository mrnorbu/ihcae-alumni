import { Component, inject, OnInit, signal } from '@angular/core';

import { RouterModule, ActivatedRoute } from '@angular/router';
import { DirectoryService, AlumniDetail } from '../../services/directory.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import {
  LucideAngularModule,
  User,
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  RefreshCw
} from 'lucide-angular';

@Component({
  selector: 'app-alumni-detail-page',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-header></app-header>

      <div class="max-w-3xl mx-auto px-4 sm:px-5 pt-20 pb-8">

        <!-- Back button -->
        <button routerLink="/directory"
          class="inline-flex items-center gap-1.5 text-base text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <lucide-icon [img]="backIcon" [size]="15"></lucide-icon>
          Back to Directory
        </button>

        <!-- Loading -->
        @if (isLoading()) {
          <div class="bg-white border border-slate-100 rounded-xl p-10 text-center">
            <lucide-icon [img]="loadingIcon" [size]="24" class="animate-spin text-slate-300 mx-auto mb-2"></lucide-icon>
            <p class="text-base text-slate-500">Loading profile…</p>
          </div>
        }

        @if (!isLoading() && alumni()) {
          <div class="space-y-3">

            <!-- Profile header — flat white card, no gradient -->
            <div class="bg-white border border-slate-100 rounded-xl p-5">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div class="flex items-center sm:items-start gap-4 flex-1 min-w-0">
                  <!-- Avatar -->
                  <div class="w-16 h-16 rounded-full border-2 border-slate-100 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    @if (alumni()?.profileImageUrl && !isLucideIconUrl(alumni()!.profileImageUrl)) {
                      <img [src]="alumni()!.profileImageUrl" [alt]="alumni()!.firstName + ' ' + alumni()!.lastName" class="w-full h-full object-cover" />
                    }
                    @if (!alumni()?.profileImageUrl || isLucideIconUrl(alumni()!.profileImageUrl)) {
                      <lucide-icon [img]="userIcon" [size]="28" class="text-slate-400"></lucide-icon>
                    }
                  </div>
  
                  <!-- Name + info -->
                  <div class="flex-1 min-w-0">
                    <h1 class="text-xl font-bold text-slate-900 truncate">
                      {{ alumni()?.firstName }} {{ alumni()?.lastName }}
                    </h1>
                    @if (alumni()?.jobTitle) {
                      <p class="text-base text-slate-500 mt-0.5">{{ alumni()!.jobTitle }}</p>
                    }
                    @if (alumni()?.location) {
                      <p class="text-sm text-slate-400 mt-1 flex items-center gap-1">
                        <lucide-icon [img]="locationIcon" [size]="12"></lucide-icon>
                        {{ alumni()!.location }}
                      </p>
                    }
                  </div>
                </div>

                <!-- Contact actions -->
                <div class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 sm:pb-0 whitespace-nowrap hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  @if (alumni()?.email) {
                    <a [href]="'mailto:' + alumni()!.email"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors">
                      <lucide-icon [img]="mailIcon" [size]="13"></lucide-icon>
                      Email
                    </a>
                  }
                  @if (alumni()?.phone) {
                    <a [href]="'tel:' + alumni()!.phone"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors">
                      <lucide-icon [img]="phoneIcon" [size]="13"></lucide-icon>
                      Call
                    </a>
                  }
                  @if (alumni()?.phone) {
                    <a [href]="getWhatsAppLink()" target="_blank" rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <lucide-icon [img]="whatsappIcon" [size]="13"></lucide-icon>
                      WhatsApp
                    </a>
                  }
                </div>
              </div>
            </div>

            <!-- Education & Professional -->
            <div class="bg-white border border-slate-100 rounded-xl p-5">
              <h2 class="text-base font-semibold text-slate-900 mb-3">Education &amp; Professional</h2>
              <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                @if (alumni()?.course) {
                  <div>
                    <p class="text-sm text-slate-400 flex items-center gap-1 mb-0.5">
                      <lucide-icon [img]="gradIcon" [size]="12"></lucide-icon> Course
                    </p>
                    <p class="text-base text-slate-800">{{ alumni()!.course }}</p>
                  </div>
                }
                @if (alumni()?.graduationYear) {
                  <div>
                    <p class="text-sm text-slate-400 flex items-center gap-1 mb-0.5">
                      <lucide-icon [img]="calendarIcon" [size]="12"></lucide-icon> Graduation Year
                    </p>
                    <p class="text-base text-slate-800">{{ alumni()!.graduationYear }}</p>
                  </div>
                }
                @if (alumni()?.jobTitle) {
                  <div>
                    <p class="text-sm text-slate-400 flex items-center gap-1 mb-0.5">
                      <lucide-icon [img]="briefcaseIcon" [size]="12"></lucide-icon> Current Position
                    </p>
                    <p class="text-base text-slate-800">{{ alumni()!.jobTitle }}</p>
                  </div>
                }
                @if (alumni()?.location) {
                  <div>
                    <p class="text-sm text-slate-400 flex items-center gap-1 mb-0.5">
                      <lucide-icon [img]="locationIcon" [size]="12"></lucide-icon> Location
                    </p>
                    <p class="text-base text-slate-800">{{ alumni()!.location }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- About -->
            @if (alumni()?.bio) {
              <div class="bg-white border border-slate-100 rounded-xl p-5">
                <h2 class="text-base font-semibold text-slate-900 mb-2">About</h2>
                <p class="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">{{ alumni()!.bio }}</p>
              </div>
            }

            <!-- Contact -->
            <div class="bg-white border border-slate-100 rounded-xl p-5">
              <h2 class="text-base font-semibold text-slate-900 mb-3">Contact</h2>
              <div class="space-y-2">
                @if (alumni()?.email) {
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="mailIcon" [size]="13" class="text-slate-400 shrink-0"></lucide-icon>
                    <a [href]="'mailto:' + alumni()!.email" class="text-base text-green-700 hover:underline">{{ alumni()!.email }}</a>
                  </div>
                }
                @if (alumni()?.phone) {
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="phoneIcon" [size]="13" class="text-slate-400 shrink-0"></lucide-icon>
                    <a [href]="'tel:' + alumni()!.phone" class="text-base text-green-700 hover:underline">{{ alumni()!.phone }}</a>
                  </div>
                }
              </div>
            </div>

            <!-- Member since -->
            @if (alumni()?.createdAt) {
              <p class="text-center text-sm text-slate-400">Member since {{ formatDate(alumni()!.createdAt) }}</p>
            }

          </div>
        }

        <!-- Error state -->
        @if (!isLoading() && !alumni()) {
          <div class="bg-white border border-slate-100 rounded-xl p-10 text-center">
            <lucide-icon [img]="userIcon" [size]="36" class="text-slate-200 mx-auto mb-3"></lucide-icon>
            <p class="text-base font-semibold text-slate-700 mb-1">Alumni not found</p>
            <p class="text-sm text-slate-400 mb-4">This profile doesn't exist or has been removed.</p>
            <button routerLink="/directory" class="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              Back to Directory
            </button>
          </div>
        }

      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class AlumniDetailPageComponent implements OnInit {
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  alumni = signal<AlumniDetail | null>(null);
  isLoading = signal(true);

  readonly userIcon = User;
  readonly backIcon = ArrowLeft;
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly whatsappIcon = MessageCircle;
  readonly locationIcon = MapPin;
  readonly briefcaseIcon = Briefcase;
  readonly gradIcon = GraduationCap;
  readonly calendarIcon = Calendar;
  readonly loadingIcon = RefreshCw;

  isLucideIconUrl(url: string | undefined): boolean {
    if (!url) return true;
    return url.includes('lucide.dev/icons/') || url.includes('lucide.dev/icons/user.svg');
  }

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadAlumniDetail(Number(userId));
    } else {
      this.isLoading.set(false);
    }
  }

  loadAlumniDetail(userId: number) {
    this.isLoading.set(true);
    this.directoryService.getAlumniDetail(userId).subscribe({
      next: (alumni) => {
        this.alumni.set(alumni);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading alumni detail:', error);
        this.notificationService.showError('Error', 'Failed to load alumni profile');
        this.isLoading.set(false);
      }
    });
  }

  getWhatsAppLink(): string {
    const phone = this.alumni()?.phone;
    if (!phone) return '#';
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }

  formatDate(dateString: any): string {
    if (!dateString) return '';
    let d = typeof dateString === 'string' ? new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z') : new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(d);
  }
}
