import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Mail, Phone, Globe, Instagram, Facebook } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <!-- Footer - Full Width -->
    <footer class="bg-neutral-900 text-white py-8 md:py-10 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <!-- Brand Column -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-3">
              <img class="h-12 w-auto" src="images/logo.png" alt="IHCAE Sikkim Logo">
              <div>
                <h3 class="text-lg font-bold">IHCAE Alumni Network</h3>
                <p class="text-xs text-neutral-400">Sikkim, India</p>
              </div>
            </div>
            <p class="text-sm text-neutral-400 leading-relaxed mb-3 max-w-md">
              Connecting adventure enthusiasts, eco-tourism professionals, and mountain lovers across the Eastern Himalayas. 
              Building a sustainable future through education and conservation.
            </p>
            <div class="flex gap-3">
              <a href="https://ihcaesikkim.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center transition-colors" title="Official Website">
                <lucide-icon [img]="globeIcon" [size]="16" class="text-neutral-300"></lucide-icon>
              </a>
              <a href="https://www.instagram.com/ihcae__sikkim/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center transition-colors" title="Instagram">
                <lucide-icon [img]="instagramIcon" [size]="16" class="text-neutral-300"></lucide-icon>
              </a>
              <a href="https://www.facebook.com/ihcaesikkimofficial" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center transition-colors" title="Facebook">
                <lucide-icon [img]="facebookIcon" [size]="16" class="text-neutral-300"></lucide-icon>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-sm font-semibold mb-3 text-white">Quick Links</h4>
            <ul class="space-y-2">
              <li><a routerLink="/contact" class="text-sm text-neutral-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a routerLink="/news-events" class="text-sm text-neutral-400 hover:text-white transition-colors">News & Events</a></li>
              <li><a routerLink="/register" class="text-sm text-neutral-400 hover:text-white transition-colors">Join Network</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-sm font-semibold mb-3 text-white">Contact</h4>
            <ul class="space-y-2">
              <li class="flex items-start gap-2 text-sm text-neutral-400">
                <lucide-icon [img]="mapIcon" [size]="16" class="text-neutral-500 flex-shrink-0 mt-0.5"></lucide-icon>
                <span>Chemchey, Namchi, Sikkim</span>
              </li>
              <li class="flex items-center gap-2 text-sm text-neutral-400">
                <lucide-icon [img]="mailIcon" [size]="16" class="text-neutral-500 flex-shrink-0"></lucide-icon>
                <a href="mailto:sikkimihcae@gmail.com" class="hover:text-white transition-colors">sikkimihcae&#64;gmail.com</a>
              </li>
              <li class="flex items-center gap-2 text-sm text-neutral-400">
                <lucide-icon [img]="phoneIcon" [size]="16" class="text-neutral-500 flex-shrink-0"></lucide-icon>
                <span>+91 93392 56495</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-5 border-t border-neutral-800">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="text-xs text-neutral-500 mx-auto sm:mx-0">
              © 2026 IHCAE Alumni Network. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {
  // Lucide icons
  readonly mapIcon = MapPin;
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly globeIcon = Globe;
  readonly instagramIcon = Instagram;
  readonly facebookIcon = Facebook;
}
