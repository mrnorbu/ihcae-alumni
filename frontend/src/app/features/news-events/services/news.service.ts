import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  NewsArticle,
  NewsArticleSummary,
  NewsCategory,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
  SubmitContentRequest,
} from '../models';
import type { PaginatedResult } from '../../../shared/models';

/**
 * Service for news operations.
 * Handles news articles, success stories, and categories.
 */
@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/news`;
  private readonly managementApiUrl = `${environment.apiUrl}/api/v1/news/management`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Gets a paginated list of published news articles.
   * Supports filtering by category and search.
   */
  getPublishedArticles(
    page: number = 1,
    pageSize: number = 10,
    categoryId?: string,
    search?: string
  ): Observable<PaginatedResult<NewsArticleSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResult<NewsArticleSummary>>(this.apiUrl, { params });
  }

  /**
   * Gets a single published news article by ID.
   * Increments view count.
   */
  getArticleById(id: string): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Gets a paginated list of published success stories.
   */
  getSuccessStories(
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResult<NewsArticleSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<NewsArticleSummary>>(`${this.apiUrl}/success-stories`, { params });
  }

  /**
   * Gets all news categories.
   */
  getCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Creates a new news article (Admin/ContentCreator only).
   * Admin can publish directly, ContentCreator submits for review.
   */
  createArticle(request: CreateNewsArticleRequest): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(this.managementApiUrl, request);
  }

  /**
   * Updates an existing news article (Admin/ContentCreator only).
   * Must be the owner or admin.
   */
  updateArticle(id: string, request: UpdateNewsArticleRequest): Observable<NewsArticle> {
    return this.http.put<NewsArticle>(`${this.managementApiUrl}/${id}`, request);
  }

  /**
   * Deletes a news article (Admin/ContentCreator only).
   * Must be the owner or admin.
   */
  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.managementApiUrl}/${id}`);
  }

  /**
   * Submits news or a success story (Alumni only).
   * Content will be pending review.
   */
  submitContent(request: SubmitContentRequest): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.managementApiUrl}/submit`, request);
  }

  /**
   * Gets pending articles for admin review (Admin only).
   */
  getPendingArticles(
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResult<NewsArticleSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<NewsArticleSummary>>(`${this.managementApiUrl}/pending`, { params });
  }

  /**
   * Approves a pending article (Admin only).
   * Changes status to published.
   */
  approveArticle(id: string): Observable<void> {
    return this.http.post<void>(`${this.managementApiUrl}/${id}/approve`, {});
  }

  /**
   * Rejects a pending article (Admin only).
   * Sends email notification with reason.
   */
  rejectArticle(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.managementApiUrl}/${id}/reject`, { reason });
  }

  /**
   * Gets articles created by the current user.
   */
  getMyArticles(): Observable<NewsArticleSummary[]> {
    return this.http.get<NewsArticleSummary[]>(`${this.managementApiUrl}/my-articles`);
  }

  /**
   * Gets articles for console management.
   */
  getManagementArticles(): Observable<NewsArticleSummary[]> {
    return this.http.get<NewsArticleSummary[]>(this.managementApiUrl);
  }
}
