# Forum Filtering, Sorting, and Search Features

## Overview
The forum now includes comprehensive filtering, sorting, and search capabilities to help users find relevant discussions quickly.

## Features Implemented

### 1. Search Functionality
- **Location**: Top-right of the filter bar
- **Functionality**: Searches through topic titles and post content
- **Usage**: Type your query and press Enter or click the Search button
- **Clear**: Click the X icon in the search box or the filter badge

### 2. Sort Options
- **Most Recent** (default): Shows newest topics first
- **Oldest First**: Shows oldest topics first
- **Most Popular**: Sorts by total likes across all posts
- **Most Discussed**: Sorts by number of posts/replies

### 3. Filter by Tag/Topic
- **Location**: Topic dropdown in the filter bar
- **Functionality**: Filter discussions by specific tags
- **Usage**: Click the Topic dropdown and select a tag
- **Clear**: Select "Clear Filter" from the dropdown or click the filter badge

### 4. Filter by Author
- **Trigger Points**:
  - Click on any author name in thread cards
  - Click on any user in the "Top Users" sidebar
- **Functionality**: Shows only topics created by the selected author
- **Display**: Top Users now show both topic count and like count
- **Clear**: Click the X on the author filter badge

### 5. Filter by Topic from Sidebar
- **Location**: "Active Topics" section in the right sidebar
- **Functionality**: Click any topic/tag to filter discussions
- **Usage**: Click on any topic name (e.g., #sidebar, #questions)
- **Clear**: Click the X on the tag filter badge or select "Clear Filter" from Topic dropdown

### 5. Active Filters Display
- Shows all currently active filters as badges below the filter bar
- Each badge can be individually removed by clicking its X button
- "Clear all" button removes all filters at once

## API Endpoints

### GET /api/v1/forums/topics
Enhanced with new query parameters:

```
GET /api/v1/forums/topics?page=1&pageSize=20&sortBy=recent&search=query&authorId=guid&tags=tag1,tag2
```

**Parameters**:
- `page` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 20)
- `sortBy` (string): Sort order - "recent", "oldest", "popular", "mostdiscussed" (default: "recent")
- `search` (string, optional): Search query for titles and content
- `authorId` (guid, optional): Filter by author user ID
- `tags` (string, optional): Comma-separated list of tags

## Backend Implementation

### ForumService.cs
- Updated `GetTopicsAsync` method to accept new parameters
- Added search filtering using LIKE queries
- Added author filtering
- Implemented dynamic sorting based on sortBy parameter
- Maintains pinned topics at the top regardless of sort order

### ForumController.cs
- Updated `GetTopics` endpoint to accept new query parameters
- Passes parameters to service layer

## Frontend Implementation

### ForumService (frontend)
- Updated `getTopics` method signature to accept new parameters
- Builds query parameters dynamically based on provided values

### ModernForumListComponent
- Added state properties for filters and sorting
- Implemented methods:
  - `onSearch()`: Triggers search
  - `clearSearch()`: Clears search query
  - `onSortChange()`: Changes sort order
  - `filterByAuthor()`: Filters by author
  - `clearAuthorFilter()`: Removes author filter
  - `filterByTag()`: Filters by tag
  - `clearTagFilter()`: Removes tag filter
  - `clearAllFilters()`: Removes all filters
  - `getSortLabel()`: Returns human-readable sort label

### ModernThreadCardComponent
- Added `authorClick` event emitter
- Made author names clickable with hover effects
- Emits author ID and name when clicked

### ModernForumSidebarComponent
- Added `userClick` event emitter
- Made user names in "Top Users" clickable
- Emits user ID and name when clicked

## User Experience

### Visual Feedback
- Active filters are highlighted with blue background
- Filter badges show what's currently active
- Hover effects on clickable elements
- Smooth transitions for all interactions

### Workflow Examples

**Example 1: Find posts by a specific user**
1. Click on the user's name in any thread card or in the Top Users sidebar
2. The forum filters to show only that user's topics
3. An "Author: [Name]" badge appears below the filter bar

**Example 2: Search for specific content**
1. Type your search query in the search box
2. Press Enter or click Search
3. Results show topics matching your query in titles or content
4. A "Search: [query]" badge appears

**Example 3: Find popular discussions about a topic**
1. Click the Topic dropdown and select a tag
2. Click the Sort dropdown and select "Most Popular"
3. See the most-liked discussions for that topic
4. Both filters show as badges

**Example 4: Clear all filters**
1. Click "Clear all" button below the filter bar
2. All filters are removed and the view resets to default

## Technical Notes

- All filtering happens server-side for performance
- Pagination resets to page 1 when filters change
- Filters are combined with AND logic (all must match)
- Tags use OR logic (match any of the selected tags)
- Search uses case-insensitive LIKE queries
- Pinned topics always appear first regardless of sort order
