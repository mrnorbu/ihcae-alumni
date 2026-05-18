import os

path = 'src/app/features/dashboard/dashboard.component.ts'
with open(path, 'r') as f:
    content = f.read()

# Inject ProfileService
content = content.replace("import { DirectoryService } from '../directory/services/directory.service';", "import { DirectoryService } from '../directory/services/directory.service';\nimport { ProfileService, ProfileData } from '../profile/services/profile.service';")

# Add ProfileService injection
content = content.replace("private directoryService = inject(DirectoryService);", "private directoryService = inject(DirectoryService);\n  private profileService = inject(ProfileService);")

# Add showOnboardingWizard state
content = content.replace("user = signal<User | null>(null);", "user = signal<User | null>(null);\n  showOnboardingWizard = signal(false);\n  profileData = signal<ProfileData | null>(null);")

# Add onboarding wizard UI in the template, right before the footer
wizard_ui = """
      @if (showOnboardingWizard()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div class="p-6 sm:p-8">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <lucide-icon [img]="starIcon" [size]="24" class="text-green-600"></lucide-icon>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 mb-2">Welcome to IHCAE Alumni!</h2>
              <p class="text-slate-600 mb-6">Let's complete your profile so fellow alumni can connect with you. This will only take a moment.</p>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Current Job Title</label>
                  <input type="text" #jobInput class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="e.g. Software Engineer at Tech Corp">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                  <input type="text" #locationInput class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="e.g. Sikkim, India">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Short Bio</label>
                  <textarea #bioInput class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all h-24 resize-none" placeholder="Tell us a bit about what you're doing now..."></textarea>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button (click)="skipOnboarding()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Skip for now</button>
              <button (click)="saveOnboarding(jobInput.value, locationInput.value, bioInput.value)" class="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">Save Profile</button>
            </div>
          </div>
        </div>
      }
"""
content = content.replace("<app-footer></app-footer>", wizard_ui + "\n      <app-footer></app-footer>")

# Load profile data
load_dashboard_end = "this.isLoading.set(false);"
content = content.replace("this.isLoading.set(false);", "this.isLoading.set(false);\n        this.checkOnboarding();")

# Add checkOnboarding and saveOnboarding
methods = """
  checkOnboarding() {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileData.set(profile);
        if (!profile.jobTitle || !profile.location) {
          this.showOnboardingWizard.set(true);
        }
      }
    });
  }

  skipOnboarding() {
    this.showOnboardingWizard.set(false);
  }

  saveOnboarding(jobTitle: string, location: string, bio: string) {
    if (!jobTitle && !location) {
      this.skipOnboarding();
      return;
    }
    
    this.isLoading.set(true);
    this.profileService.updateProfile({ jobTitle, location, bio }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Profile Updated', 'Your profile is now complete!');
        this.showOnboardingWizard.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to update profile.');
        this.isLoading.set(false);
      }
    });
  }
"""
content = content.replace("logout() {", methods + "\n  logout() {")

with open(path, 'w') as f:
    f.write(content)
