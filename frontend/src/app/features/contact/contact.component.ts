import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mail, Phone, MapPin, Globe, ArrowUpRight, Compass } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../shared/components';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 flex flex-col">
      <app-header></app-header>

      <!-- Main Content Area -->
      <main class="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
          
          <!-- Hero Section Header -->
          <div class="mb-12 text-center lg:text-left">
            <h1 class="text-4xl font-bold text-neutral-900 tracking-tight mb-3">
              Contact Us
            </h1>
            <p class="text-base text-neutral-600 max-w-2xl font-normal leading-relaxed">
              Have questions about the IHCAE Alumni network, verifying status, or registration? Get in touch with our operations desk at Chemchey, Sikkim.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            <!-- Contact Details Grid (3 columns wide) -->
            <div class="lg:col-span-3 space-y-6">
              
              <!-- Address Card -->
              <div class="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4">
                <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="mapPinIcon" class="text-primary-700" [size]="22"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Campus Location</h3>
                  <p class="text-base font-bold text-neutral-900 mb-1">IHCAE Sikkim Campus</p>
                  <p class="text-sm text-neutral-600 leading-relaxed font-normal">
                    Chemchey, P.O. Damthang,<br>
                    District Namchi, Sikkim – 737126, India
                  </p>
                </div>
              </div>

              <!-- Phone Card -->
              <div class="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4">
                <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="phoneIcon" class="text-primary-700" [size]="22"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Phone Helpline</h3>
                  <p class="text-base font-bold text-neutral-900 mb-1">Administrative Desk</p>
                  <a href="tel:+919339256495" class="text-sm font-bold text-primary-650 hover:text-primary-750 hover:underline transition-colors block">
                    +91 93392 56495
                  </a>
                  <p class="text-xs text-neutral-500 mt-1">Available during standard office hours (Mon-Sat).</p>
                </div>
              </div>

              <!-- Email Card -->
              <div class="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4">
                <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="mailIcon" class="text-primary-700" [size]="22"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Email Inquiries</h3>
                  <p class="text-base font-bold text-neutral-900 mb-1">Official Correspondences</p>
                  <div class="space-y-1.5 mt-1">
                    <a href="mailto:sikkimihcae@gmail.com" class="text-sm font-semibold text-primary-650 hover:text-primary-750 hover:underline transition-colors block">
                      sikkimihcae&#64;gmail.com
                    </a>
                    <a href="mailto:ihcaesikkimofficial@gmail.com" class="text-sm font-semibold text-primary-650 hover:text-primary-750 hover:underline transition-colors block">
                      ihcaesikkimofficial&#64;gmail.com
                    </a>
                  </div>
                </div>
              </div>

            </div>

            <!-- Official Portal CTA (2 columns wide) -->
            <div class="lg:col-span-2">
              <div class="bg-primary-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-primary-900">
                <!-- Decorative Glow Overlay -->
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,107,184,0.2)_0%,transparent_60%)]"></div>
                
                <div class="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <!-- Compass Accent Icon -->
                    <div class="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                      <lucide-icon [img]="compassIcon" class="text-primary-300 animate-pulse" [size]="24"></lucide-icon>
                    </div>
                    
                    <h2 class="text-2xl font-bold mb-4 leading-tight">
                      Explore Official IHCAE Sikkim Courses
                    </h2>
                    
                    <p class="text-sm text-primary-200/90 leading-relaxed mb-6 font-normal">
                      Discover mountaineering courses, eco-tourism training programs, adventure expeditions, and search & rescue guidelines directly on our main portal.
                    </p>
                  </div>

                  <a href="https://ihcaesikkim.com/" target="_blank" rel="noopener noreferrer" 
                    class="inline-flex items-center justify-center gap-2 w-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-6 py-3.5 rounded-2xl shadow transition-all duration-200 hover:scale-[1.02]">
                    <span>Visit Main Website</span>
                    <lucide-icon [img]="arrowIcon" [size]="16" class="text-neutral-900"></lucide-icon>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class ContactComponent {
  // Lucide icons
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly mapPinIcon = MapPin;
  readonly globeIcon = Globe;
  readonly arrowIcon = ArrowUpRight;
  readonly compassIcon = Compass;
}
