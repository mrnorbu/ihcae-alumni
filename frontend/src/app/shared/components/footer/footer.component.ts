import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Mail, Phone, Twitter, Linkedin, Facebook } from 'lucide-angular';

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
              <a href="#" class="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center transition-colors">
                <lucide-icon [img]="twitterIcon" [size]="16" class="text-neutral-300"></lucide-icon>
              </a>
              <a href="#" class="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center transition-colors">
                <lucide-icon [img]="linkedinIcon" [size]="16" class="text-neutral-300"></lucide-icon>
              </a>
              <a href="#" class="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center transition-colors">
                <lucide-icon [img]="facebookIcon" [size]="16" class="text-neutral-300"></lucide-icon>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-sm font-semibold mb-3 text-white">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="#about" class="text-sm text-neutral-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#news" class="text-sm text-neutral-400 hover:text-white transition-colors">News & Stories</a></li>
              <li><a routerLink="/register" class="text-sm text-neutral-400 hover:text-white transition-colors">Join Network</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-sm font-semibold mb-3 text-white">Contact</h4>
            <ul class="space-y-2">
              <li class="flex items-start gap-2 text-sm text-neutral-400">
                <lucide-icon [img]="mapIcon" [size]="16" class="text-neutral-500 flex-shrink-0 mt-0.5"></lucide-icon>
                <span>Gangtok, Sikkim, India</span>
              </li>
              <li class="flex items-center gap-2 text-sm text-neutral-400">
                <lucide-icon [img]="mailIcon" [size]="16" class="text-neutral-500 flex-shrink-0"></lucide-icon>
                <a href="mailto:info@ihcae-alumni.com" class="hover:text-white transition-colors">info@ihcae-alumni.com</a>
              </li>
              <li class="flex items-center gap-2 text-sm text-neutral-400">
                <lucide-icon [img]="phoneIcon" [size]="16" class="text-neutral-500 flex-shrink-0"></lucide-icon>
                <span>+91-XXXX-XXXXXX</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-5 border-t border-neutral-800">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="text-xs text-neutral-500">
              © 2024 IHCAE Alumni Network. All rights reserved.
            </p>
            <div class="flex gap-4 text-xs text-neutral-500">
              <a href="#" class="hover:text-neutral-300 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" class="hover:text-neutral-300 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" class="hover:text-neutral-300 transition-colors">Cookie Policy</a>
            </div>
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
  readonly twitterIcon = Twitter;
  readonly linkedinIcon = Linkedin;
  readonly facebookIcon = Facebook;
}
