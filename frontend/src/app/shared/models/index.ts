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
  phone: string;
  course: string;
  batch: string;
  location?: string;
  bio?: string;
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
 * Tag model for categorizing content.
 */
export interface TagDto {
  id: number;
  name: string;
  slug: string;
  usageCount: number;
}

/**
 * Top user model for forum engagement.
 */
export interface TopUserDto {
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  totalLikes: number;
  postCount: number;
}

/**
 * Author information for forum posts and topics.
 */
export interface AuthorDto {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

/**
 * Forum post model with nested replies.
 */
export interface PostDto {
  id: string;
  content: string;
  author: AuthorDto;
  parentPostId?: string;
  parentAuthor?: AuthorDto;  // Author of the parent post (for "replying to" context)
  createdAt: Date;
  updatedAt?: Date;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  replies: PostDto[];
}

/**
 * Topic summary for topic list.
 */
export interface TopicSummaryDto {
  id: string;
  title: string;
  createdBy: AuthorDto;
  postCount: number;
  lastReplyAt?: Date;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  totalLikes: number;
  mainPostId: string;
  isMainPostLikedByCurrentUser: boolean;
  preview?: string;
  tags: TagDto[];
}

/**
 * Topic detail with all posts.
 */
export interface TopicDetailDto {
  id: string;
  title: string;
  createdBy: AuthorDto;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  posts: PostDto[];
  tags: TagDto[];
}

/**
 * Request to create a new topic.
 */
export interface CreateTopicRequest {
  title: string;
  content: string;
  tags?: string[]; // Optional list of tag names (max 5)
}

/**
 * Request to create a new post/reply.
 */
export interface CreatePostRequest {
  content: string;
  parentPostId?: string;
}

/**
 * Request to update a post (admin only).
 */
export interface UpdatePostRequest {
  content: string;
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

/**
 * In-App Notification model from the database backend.
 */
export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string; // 'Reply' | 'Moderation' | 'System'
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

