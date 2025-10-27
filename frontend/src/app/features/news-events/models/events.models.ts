/**
 * Events-related models and interfaces for the IHCAE Alumni Network application.
 */

import { AuthorDto } from '../../../shared/models';
import { ContentStatus } from './news.models';

/**
 * Registration status enumeration for event registrations.
 */
export enum RegistrationStatus {
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Waitlist = 'Waitlist'
}

/**
 * Event category model.
 */
export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Event summary for list views.
 */
export interface EventSummary {
  id: string;
  title: string;
  category?: EventCategory;
  location: string;
  eventDate: Date;
  eventEndDate?: Date;
  thumbnailUrl?: string;
  capacity?: number;
  status: ContentStatus;
  publishedAt?: Date;
  registrationCount: number;
  availableSpots?: number;
}

/**
 * Full event details.
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  category?: EventCategory;
  location: string;
  eventDate: Date;
  eventEndDate?: Date;
  imageUrl?: string;
  thumbnailUrl?: string;
  capacity?: number;
  registrationDeadline?: Date;
  createdBy: AuthorDto;
  status: ContentStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  registrationCount: number;
  availableSpots?: number;
}

/**
 * Request model for creating an event.
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  categoryId?: string;
  location: string;
  eventDate: Date;
  eventEndDate?: Date;
  imageUrl?: string;
  thumbnailUrl?: string;
  capacity?: number;
  registrationDeadline?: Date;
  publish: boolean;
}

/**
 * Request model for updating an event.
 */
export interface UpdateEventRequest {
  title: string;
  description: string;
  categoryId?: string;
  location: string;
  eventDate: Date;
  eventEndDate?: Date;
  imageUrl?: string;
  thumbnailUrl?: string;
  capacity?: number;
  registrationDeadline?: Date;
  publish: boolean;
}

/**
 * Event registration model.
 */
export interface EventRegistration {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: Date;
  status: RegistrationStatus;
  isAuthenticatedUser: boolean;
}

/**
 * Request model for registering for an event.
 */
export interface RegisterForEventRequest {
  name: string;
  email: string;
  phone?: string;
}
