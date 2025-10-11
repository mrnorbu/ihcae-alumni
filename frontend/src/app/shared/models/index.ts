/**
 * Shared data models for the IHCAE Alumni Network application.
 * These interfaces represent the data structures used throughout the application.
 */

/**
 * User model representing an authenticated user in the system.
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  roles: string[];
}

/**
 * User status enumeration.
 */
export enum UserStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Suspended = 'Suspended'
}

/**
 * Authentication request model for login.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication request model for registration.
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Authentication response model.
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

/**
 * Registration response model.
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  status: string;
}

/**
 * Alumni database record model.
 */
export interface AlumniRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course?: string;
  graduationYear?: number;
  phone?: string;
  location?: string;
  matchedUserId?: string;
  importedAt: Date;
}

/**
 * Paginated result model for API responses.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Error response model for API errors.
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: Date;
}

/**
 * API configuration model.
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

/**
 * Notification model for toast messages.
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

/**
 * Search filter model for directory and other searchable content.
 */
export interface SearchFilter {
  query?: string;
  course?: string;
  graduationYear?: number;
  location?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Alumni profile model for detailed alumni information.
 */
export interface AlumniProfile {
  userId: string;
  course?: string;
  graduationYear?: number;
  currentJob?: string;
  currentCompany?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: SocialLinks;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Social media links model.
 */
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

/**
 * Forum post model.
 */
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  topicId: string;
  topicName: string;
  createdAt: Date;
  updatedAt: Date;
  repliesCount: number;
  likesCount: number;
  isPinned: boolean;
}

/**
 * Forum topic model.
 */
export interface ForumTopic {
  id: string;
  name: string;
  description?: string;
  postsCount: number;
  createdAt: Date;
}

/**
 * Job posting model.
 */
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  salaryRange?: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postedById: string;
  postedByName: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

/**
 * Success story model.
 */
export interface SuccessStory {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  isApproved: boolean;
}
