/**
 * Production environment configuration for the IHCAE Alumni Network application.
 * Contains production-specific settings and API endpoints.
 */

export const environment = {
  production: true,
  apiUrl: 'https://ihcae.argiasolutions.website', // Production API URL
  appName: 'IHCAE Alumni Network',
  version: '1.0.0',
  
  // API Configuration
  apiTimeout: 30000, // 30 seconds
  
  // Feature Flags
  features: {
    enableAnalytics: true,
    enableDebugMode: false,
    enableMockData: false
  },
  
  // External Services
  googleAnalytics: {
    trackingId: 'GA_TRACKING_ID' // Replace with actual GA tracking ID
  },
  
  // File Upload Configuration
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadUrl: 'https://ihcae.argiasolutions.website/api/v1/files/upload'
  },
  
  // Pagination Defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  
  // Notification Configuration
  notifications: {
    defaultDuration: 5000, // 5 seconds
    maxNotifications: 5
  }
};
