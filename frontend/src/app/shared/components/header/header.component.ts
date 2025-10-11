import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Sticky Navigation - Compact -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-200" 
         [class.shadow-md]="scrolled">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 flex-shrink-0">
            <img class="h-10 w-auto" src="images/logo.png" alt="IHCAE Sikkim Logo">
            <div class="hidden md:block">
              <h1 class="text-lg font-bold text-neutral-900 leading-tight">IHCAE Alumni</h1>
              <p class="text-xs text-neutral-600">Sikkim, India</p>
            </div>
          </a>
          
          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center gap-6">
            <a href="#about" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">About</a>
            <a href="#news" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">News</a>
            <a href="#jobs" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">Careers</a>
            <a href="#contact" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">Contact</a>
          </div>

          <!-- CTA Buttons -->
          <div class="hidden lg:flex items-center gap-2">
            <a 
              routerLink="/login" 
              class="btn-ghost text-sm"
            >
              Sign In
            </a>
            <a 
              routerLink="/register" 
              class="btn-primary btn-sm"
            >
              Join Network
            </a>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            (click)="toggleMobileMenu()"
            class="lg:hidden p-2 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <lucide-icon [img]="mobileMenuOpen ? xIcon : menuIcon" [size]="20" class="text-neutral-700"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="mobileMenuOpen" class="lg:hidden border-t border-neutral-200 bg-white">
        <div class="px-4 py-3 space-y-1">
          <a href="#about" (click)="toggleMobileMenu()" class="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">About</a>
          <a href="#news" (click)="toggleMobileMenu()" class="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">News</a>
          <a href="#jobs" (click)="toggleMobileMenu()" class="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">Careers</a>
          <a href="#contact" (click)="toggleMobileMenu()" class="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">Contact</a>
          <div class="pt-3 space-y-2">
            <a routerLink="/login" (click)="toggleMobileMenu()" class="block btn-outline w-full text-center">Sign In</a>
            <a routerLink="/register" (click)="toggleMobileMenu()" class="block btn-primary w-full text-center">Join Network</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class HeaderComponent {
  scrolled = false;
  mobileMenuOpen = false;
  
  // Lucide icons
  readonly menuIcon = Menu;
  readonly xIcon = X;

  constructor() {
    // Listen for scroll events to add shadow to header
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled = window.scrollY > 10;
      });
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
