/**
 * Environment configuration for the IHCAE Alumni Network application.
 * Contains API endpoints and other environment-specific settings.
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5041', // Backend API URL
  appName: 'IHCAE Alumni Network',
  version: '1.0.0',
  
  // API Configuration
  apiTimeout: 30000, // 30 seconds
  
  // Feature Flags
  features: {
    enableAnalytics: false,
    enableDebugMode: true,
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
    uploadUrl: 'http://localhost:5000/api/v1/files/upload'
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
