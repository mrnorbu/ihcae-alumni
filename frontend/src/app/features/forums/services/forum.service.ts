import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  TopicSummaryDto,
  TopicDetailDto,
  PostDto,
  CreateTopicRequest,
  CreatePostRequest,
  UpdatePostRequest,
  PaginatedResult,
  TagDto,
  TopUserDto,
} from '../../../shared/models';

/**
 * Service for forum operations.
 * Handles topics, posts, and likes.
 */
@Injectable({
  providedIn: 'root',
})
export class ForumService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/forums`;
  private readonly adminApiUrl = `${environment.apiUrl}/api/v1/admin/forums`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Gets a paginated list of discussion topics.
   * Returns topics sorted by pinned status and recent activity.
   * Supports filtering by tags, search, author, and sorting.
   */
  getTopics(
    page: number = 1, 
    pageSize: number = 20, 
    tags?: string[], 
    search?: string, 
    authorId?: string, 
    sortBy: string = 'recent'
  ): Observable<PaginatedResult<TopicSummaryDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy);

    // Add tags filter if provided
    if (tags && tags.length > 0) {
      params = params.set('tags', tags.join(','));
    }

    // Add search filter if provided
    if (search) {
      params = params.set('search', search);
    }

    // Add author filter if provided
    if (authorId) {
      params = params.set('authorId', authorId);
    }

    return this.http.get<PaginatedResult<TopicSummaryDto>>(`${this.apiUrl}/topics`, { params });
  }

  /**
   * Gets a single topic with all its posts.
   * Includes nested replies and like information.
   */
  getTopicById(topicId: string): Observable<TopicDetailDto> {
    return this.http.get<TopicDetailDto>(`${this.apiUrl}/topics/${topicId}`);
  }

  /**
   * Creates a new discussion topic.
   * Automatically creates the first post with the provided content.
   */
  createTopic(request: CreateTopicRequest): Observable<TopicDetailDto> {
    return this.http.post<TopicDetailDto>(`${this.apiUrl}/topics`, request);
  }

  /**
   * Creates a new post or reply in a topic.
   * Set parentPostId in request to create a nested reply.
   */
  createPost(topicId: string, request: CreatePostRequest): Observable<PostDto> {
    return this.http.post<PostDto>(`${this.apiUrl}/topics/${topicId}/posts`, request);
  }

  /**
   * Likes a post.
   * User can only like a post once.
   */
  likePost(postId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/posts/${postId}/like`, {});
  }

  /**
   * Unlikes a post.
   * Removes the user's like from the post.
   */
  unlikePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}/like`);
  }

  /**
   * Deletes a topic (Admin only).
   * Cascades to delete all posts within the topic.
   */
  deleteTopic(topicId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/topics/${topicId}`);
  }

  /**
   * Deletes a post (Admin only).
   * Also deletes all nested replies.
   */
  deletePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/posts/${postId}`);
  }

  /**
   * Updates a post (Admin only).
   * Used for content moderation.
   */
  updatePost(postId: string, request: UpdatePostRequest): Observable<PostDto> {
    return this.http.put<PostDto>(`${this.adminApiUrl}/posts/${postId}`, request);
  }

  /**
   * Searches for tags by name (autocomplete).
   * Used for tag suggestions when creating topics.
   */
  searchTags(query: string, limit: number = 10): Observable<TagDto[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<TagDto[]>(`${this.apiUrl}/tags/search`, { params });
  }

  /**
   * Gets the most popular tags by usage count.
   * Used for displaying trending tags and tag suggestions.
   */
  getPopularTags(limit: number = 20): Observable<TagDto[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TagDto[]>(`${this.apiUrl}/tags/popular`, { params });
  }

  /**
   * Gets top users by engagement (likes received).
   * Used for displaying top contributors in the sidebar.
   */
  getTopUsers(limit: number = 5): Observable<TopUserDto[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopUserDto[]>(`${this.apiUrl}/top-users`, { params });
  }

  /**
   * Gets posts for a specific topic.
   * Returns all posts in the topic including replies.
   */
  getTopicPosts(topicId: string): Observable<PostDto[]> {
    return this.getTopicById(topicId).pipe(
      map(topic => topic.posts)
    );
  }

  /**
   * Creates a reply to a specific post.
   * Convenience method for creating nested replies.
   */
  createReply(topicId: string, postId: string, content: string): Observable<PostDto> {
    const request: CreatePostRequest = {
      content: content,
      parentPostId: postId
    };
    
    return this.createPost(topicId, request);
  }

  /**
   * Deletes own post (user can only delete their own posts).
   * Soft deletes the post.
   */
  deleteOwnPost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}`);
  }
}

