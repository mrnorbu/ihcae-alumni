import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, FileText, Download, Eye, User, Mail, Phone, MapPin, Calendar, Award, Briefcase, GraduationCap, Save } from 'lucide-angular';
import { HeaderComponent, FooterComponent, CustomSelectComponent, SelectOption } from '../../../../shared/components';

/**
 * Resume Builder Component
 * 
 * Simple profile-based resume builder for job applicants.
 * Extends user profile with professional information for job applications.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule, CustomSelectComponent],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
    
      <!-- Main Content -->
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Professional Profile</h1>
          <p class="text-neutral-600">Build your professional profile for job applications</p>
        </div>
    
        <!-- Profile Form -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-neutral-900">Profile Information</h2>
            <div class="flex gap-2">
              <button class="btn-outline btn-sm">
                <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                Preview
              </button>
              <button class="btn-primary btn-sm">
                <lucide-icon [img]="saveIcon" [size]="16"></lucide-icon>
                Save Profile
              </button>
            </div>
          </div>
    
          <!-- Personal Information -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="userIcon" [size]="18"></lucide-icon>
              Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="input-label">First Name</label>
                <input [(ngModel)]="profile().firstName" type="text" class="input-field" placeholder="John">
              </div>
              <div>
                <label class="input-label">Last Name</label>
                <input [(ngModel)]="profile().lastName" type="text" class="input-field" placeholder="Doe">
              </div>
              <div>
                <label class="input-label">Email</label>
                <input [(ngModel)]="profile().email" type="email" class="input-field" placeholder="john.doe@example.com">
              </div>
              <div>
                <label class="input-label">Phone</label>
                <input [(ngModel)]="profile().phone" type="tel" class="input-field" placeholder="+91 98765 43210">
              </div>
              <div class="md:col-span-2">
                <label class="input-label">Address</label>
                <input [(ngModel)]="profile().address" type="text" class="input-field" placeholder="123 Main Street, City, State">
              </div>
            </div>
          </div>
    
          <!-- Professional Summary -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="fileTextIcon" [size]="18"></lucide-icon>
              Professional Summary
            </h3>
            <textarea
              [(ngModel)]="profile().summary"
              rows="4"
              class="input-field-lg"
              placeholder="Write a brief summary of your professional background and career objectives...">
            </textarea>
          </div>
    
          <!-- Current Role -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="briefcaseIcon" [size]="18"></lucide-icon>
              Current Role
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="input-label">Job Title</label>
                <input [(ngModel)]="profile().currentRole.title" type="text" class="input-field" placeholder="Trekking Guide">
              </div>
              <div>
                <label class="input-label">Company</label>
                <input [(ngModel)]="profile().currentRole.company" type="text" class="input-field" placeholder="Himalayan Expeditions">
              </div>
              <div>
                <label class="input-label">Start Date</label>
                <input [(ngModel)]="profile().currentRole.startDate" type="text" class="input-field" placeholder="Jan 2020">
              </div>
              <div>
                <label class="input-label">Location</label>
                <input [(ngModel)]="profile().currentRole.location" type="text" class="input-field" placeholder="Delhi, India">
              </div>
            </div>
            <div class="mt-4">
              <label class="input-label">Job Description</label>
              <textarea [(ngModel)]="profile().currentRole.description" rows="3" class="input-field-lg" placeholder="Describe your current role and key responsibilities..."></textarea>
            </div>
          </div>
    
          <!-- Education -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="graduationCapIcon" [size]="18"></lucide-icon>
              Education
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="input-label">Degree</label>
                <input [(ngModel)]="profile().education.degree" type="text" class="input-field" placeholder="Bachelor of Technology">
              </div>
              <div>
                <label class="input-label">Institution</label>
                <input [(ngModel)]="profile().education.institution" type="text" class="input-field" placeholder="University Name">
              </div>
              <div>
                <label class="input-label">Graduation Year</label>
                <input [(ngModel)]="profile().education.graduationYear" type="text" class="input-field" placeholder="2020">
              </div>
              <div>
                <label class="input-label">Field of Study</label>
                <input [(ngModel)]="profile().education.field" type="text" class="input-field" placeholder="Computer Science">
              </div>
            </div>
          </div>
    
          <!-- Skills -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="awardIcon" [size]="18"></lucide-icon>
              Skills & Expertise
            </h3>
            <div class="flex flex-wrap gap-2 mb-4">
              @for (skill of profile().skills; track skill) {
                <span class="badge badge-primary">
                  {{ skill }}
                </span>
              }
            </div>
            <div class="flex gap-2">
              <input [(ngModel)]="newSkill" type="text" class="input-field flex-1" placeholder="Add a skill...">
              <button (click)="addSkill()" class="btn-outline">
                Add
              </button>
            </div>
          </div>
    
          <!-- Career Objectives -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="fileTextIcon" [size]="18"></lucide-icon>
              Career Objectives
            </h3>
            <textarea
              [(ngModel)]="profile().careerObjectives"
              rows="3"
              class="input-field-lg"
              placeholder="What are your career goals and what type of opportunities are you looking for?">
            </textarea>
          </div>
    
          <!-- Availability -->
          <div class="mb-8 overflow-visible">
            <h3 class="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <lucide-icon [img]="calendarIcon" [size]="18"></lucide-icon>
              Availability
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="input-label">Preferred Job Type</label>
                <app-custom-select
                  [(ngModel)]="profile().availability.jobType"
                  [options]="jobTypeOptions"
                  placeholder="Select job type"
                ></app-custom-select>
              </div>
              <div>
                <label class="input-label">Preferred Location</label>
                <app-custom-select
                  [(ngModel)]="profile().availability.location"
                  [options]="locationOptions"
                  placeholder="Select location"
                ></app-custom-select>
              </div>
            </div>
          </div>
    
          <!-- Action Buttons -->
          <div class="flex gap-4 justify-end">
            <button class="btn-outline">
              <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
              Preview Profile
            </button>
            <button class="btn-primary">
              <lucide-icon [img]="saveIcon" [size]="16"></lucide-icon>
              Save Profile
            </button>
          </div>
        </div>
    
        <!-- Profile Preview Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-neutral-900 mb-4">Profile Preview</h3>
          <div class="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
            <div class="text-center text-neutral-500">
              <lucide-icon [img]="eyeIcon" [size]="48" class="mx-auto mb-2"></lucide-icon>
              <p>Your profile preview will appear here</p>
              <p class="text-sm">Fill in the information above to see preview</p>
            </div>
          </div>
        </div>
      </div>
    
      <app-footer></app-footer>
    </div>
    `,
  styles: []
})
export class ResumeBuilderComponent implements OnInit {
  // Icons
  fileTextIcon = FileText;
  downloadIcon = Download;
  eyeIcon = Eye;
  userIcon = User;
  mailIcon = Mail;
  phoneIcon = Phone;
  mapPinIcon = MapPin;
  calendarIcon = Calendar;
  awardIcon = Award;
  briefcaseIcon = Briefcase;
  graduationCapIcon = GraduationCap;
  saveIcon = Save;

  newSkill = '';

  jobTypeOptions: SelectOption[] = [
    { label: 'Full Time', value: 'full-time' },
    { label: 'Part Time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
    { label: 'Freelance', value: 'freelance' }
  ];

  locationOptions: SelectOption[] = [
    { label: 'Remote', value: 'remote' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Himachal Pradesh', value: 'himachal' },
    { label: 'Any Location', value: 'any' }
  ];

  // Profile data
  profile = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    currentRole: {
      title: '',
      company: '',
      startDate: '',
      location: '',
      description: ''
    },
    education: {
      degree: '',
      institution: '',
      graduationYear: '',
      field: ''
    },
    skills: ['Leadership', 'Project Management', 'Communication'],
    careerObjectives: '',
    availability: {
      jobType: '',
      location: ''
    }
  });

  ngOnInit() {
    // Initialize component
  }

  addSkill() {
    if (this.newSkill.trim()) {
      const current = this.profile();
      current.skills.push(this.newSkill.trim());
      this.profile.set({ ...current });
      this.newSkill = '';
    }
  }
}
