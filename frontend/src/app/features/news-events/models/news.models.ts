/**
 * News-related models and interfaces for the IHCAE Alumni Network application.
 */

import { AuthorDto } from '../../../shared/models';

/**
 * Content status enumeration for news articles and events.
 */
export enum ContentStatus {
  Draft = 'Draft',
  PendingReview = 'PendingReview',
  Published = 'Published'
}

/**
 * News category model.
 */
export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

/**
 * News article summary for list views.
 */
export interface NewsArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category: NewsCategory;
  author: AuthorDto;
  thumbnailUrl?: string;
  status: ContentStatus;
  rejectionReason?: string;
  publishedAt?: Date;
  createdAt: Date;
  viewCount: number;
}

/**
 * Full news article details.
 */
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: NewsCategory;
  author: AuthorDto;
  imageUrl?: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  rejectionReason?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  viewCount: number;
}

/**
 * Request model for creating a news article.
 */
export interface CreateNewsArticleRequest {
  title: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  publish: boolean;
}

/**
 * Request model for updating a news article.
 */
export interface UpdateNewsArticleRequest {
  title: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  publish: boolean;
}

/**
 * Request model for alumni to submit news articles or success stories.
 */
export interface SubmitContentRequest {
  title: string;
  content: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  categorySlug?: string;
}
