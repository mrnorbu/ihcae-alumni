# IHCAE Alumni App - CLAUDE.md

## 1. Project Overview
IHCAE Alumni Network platform, a monolithic repository (monorepo) application utilizing Angular 21 for the frontend and .NET 10 for the backend, supported by a MySQL database.

## 2. Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 21.2.13, Tailwind 3.4, Lucide Icons |
| **Backend** | .NET 10, ASP.NET Core Web API |
| **Database** | MySQL via Entity Framework Core 9 (Pomelo) |
| **Security** | JWT + Refresh Tokens, BCrypt |
| **Other** | Serilog (Logging), ImageSharp, Swashbuckle (Swagger) |

## 3. Dev Commands
**Backend (.NET 10):**
- **Run API:** `cd backend/IHCAE.Api && dotnet run watch`
- **Build API:** `cd backend/IHCAE.Api && dotnet build`
- **Run Tests:** `cd backend/IHCAE.Api.IntegrationTests && dotnet test`
- **EF Migrations:** `dotnet ef migrations add <Name> -p Shared/Data/AppDbContext.cs`

**Frontend (Angular 21):**
- **Run UI:** `cd frontend && npm start` or `ng serve`
- **Build UI:** `cd frontend && npm run build`
- **Install deps:** `cd frontend && npm install`

## 4. Architecture
- **Backend:** Organized into feature-based vertical slices (`Features/Auth`, `Features/Forums`).
- **Frontend:** Standalone components with lazy loaded routes. State management is handled via `UserAuthStore` (BehaviorSubject). API calls are intercepted by a JWT interceptor.

## 5. Key Conventions
- **Naming:** PascalCase for backend files (e.g. `UserRepository.cs`), kebab-case for frontend files (e.g. `alumni-card.component.ts`).
- **API Routes:** Pattern is `/api/v1/[feature]`.
- **DTOs:** Request/Response models always use `Request`, `Response`, or `Dto` suffixes.
- **Pagination:** Uses a standard paginated response pattern for list endpoints.
- **Errors:** Standardized `ErrorResponse` shape across the API.

## 6. Database
- **Provider:** MySQL.
- **Configuration:** Fluent API configuration located within `AppDbContext`.
- **Migrations:** Managed in `Shared/Data/Migrations/`.
- **Seeding:** Handled by `SeedDataService` on application startup.

## 7. Common Tasks
- **Adding a Backend Feature:**
  1. Create a new folder under `Features/[Name]`.
  2. Create `Models/Entities` and `Models/DTOs`.
  3. Create `Services/` and interface.
  4. Create `Controllers/[Name]Controller.cs`.
  5. Register service in `Program.cs`.
- **Adding a Frontend Feature:**
  1. Generate component: `ng g c features/[name]`.
  2. Create a service to connect to the backend.
  3. Add route to `app.routes.ts`.
- **Creating a Migration:**
  1. Add/update entity in `Models/Entities`.
  2. Add `DbSet` to `AppDbContext`.
  3. Run `dotnet ef migrations add [Name]`.
  4. Run `dotnet run` (startup script applies `EnsureCreated`).

## 8. Project Status
- Epic 1 (Foundation/Auth): 100%
- Epic 2 (Directory): 100%
- Epic 3 (Forums): 100%
- Epic 4 (News/Events): 100%
- Epic 5 (Success Stories): ~85%
- Epic 6 (Job Board): ~10% (UI Stub only)
- Epic 7 (Resume Builder): ~10% (UI Stub only)
- Epic 8 (Admin Dashboards): ~45%

## 9. Known Issues / Tech Debt
- SMTP credentials stored in `appsettings.json`.
- `bin/`, `obj/`, and `publish/` directories tracked in source control.
- Empty `layout/` directory in frontend.
- Duplicate `content-management` features.
- Incomplete automated test coverage.

---

# Architecture & Folder Structure Recommendations

## Backend Recommendations
1. **Extract Admin service layer** — `AdminController` and `UserManagementController` contain business logic; create `Features/Admin/Services/AdminService.cs` and consolidate overlapping endpoints.
2. **Standardize data access** — 8 of 9 features use `DbContext` directly, only Auth uses a repository pattern. We recommend removing the `UserRepository` for consistency.
3. **Add test project** — `backend/IHCAE.Api.IntegrationTests/` added with xUnit, targeting Auth initially.
4. **Untrack bin/obj/publish** — Need to run `git rm -r --cached` on those directories.
5. **Move secrets** — JWT key and SMTP password should be moved out of `appsettings.json` into user-secrets or environment variables.
6. **Add PasswordReset DTOs** — Create `Features/PasswordReset/Models/DTOs/`.

## Frontend Recommendations
1. **Delete empty `layout/` directory** — header/footer already live in `shared/components/`.
2. **Resolve content-management duplication** — Keep `features/content-management/` as canonical, remove or merge `features/admin/content-management/`.
3. **Restructure admin routes as child routes** — Apply `AdminGuard` once at parent, enable shared admin layout.
4. **Add barrel exports** — Incrementally add `index.ts` to feature folders.
5. **Scaffold Job Board and Resume Builder services** — Connect existing stub components to real services.

## Cross-Cutting
1. **Environment config templates** — Create `.template` files showing required keys without values.
2. **Testing strategy** — Phased: backend integration tests → frontend service tests → component tests.
3. **Auto-generate frontend types** — Consider using NSwag/openapi-generator from the Swagger spec (low priority).

### Proposed Improved Folder Structure

**Backend:**
```
backend/
├── IHCAE.Api/
│   ├── Program.cs
│   ├── Features/
│   │   ├── Auth/          (Controllers/, Models/{DTOs,Entities}/, Services/)
│   │   ├── Admin/         (Controllers/, Models/DTOs/, Services/)  ← add Services
│   │   ├── Alumni/        (Models/, Services/)
│   │   ├── Directory/     (Controllers/, Models/DTOs/, Services/)
│   │   ├── Profile/       (Controllers/, Models/DTOs/, Services/)
│   │   ├── EmailVerification/ (Controllers/, Models/Entities/, Services/)
│   │   ├── PasswordReset/ (Controllers/, Models/{DTOs,Entities}/, Services/)  ← add DTOs
│   │   ├── Forums/        (Controllers/, Models/{DTOs,Entities}/, Services/)
│   │   ├── News/          (Controllers/, Models/{DTOs,Entities}/, Services/)
│   │   ├── Events/        (Controllers/, Models/{DTOs,Entities}/, Services/)
│   │   ├── Jobs/          (Controllers/, Models/{DTOs,Entities}/, Services/)  ← NEW
│   │   └── ResumeBuilder/ (Controllers/, Models/{DTOs,Entities}/, Services/)  ← NEW
│   └── Shared/            (unchanged)
├── IHCAE.Api.IntegrationTests/
│   └── Features/ (mirrors main project)
```

**Frontend:**
```
frontend/src/app/
├── app.ts, app.config.ts, app.routes.ts
├── core/          (guards/, interceptors/, services/, state/)
├── features/
│   ├── auth/      (login/, register/, ..., services/)
│   ├── admin/     (dashboard/, users/, alumni/, content-review/, forum-moderation/)
│   │              ← remove duplicate content-management, use shared one
│   ├── home/, dashboard/, profile/, directory/, forums/
│   ├── news-events/, success-stories/
│   ├── content-management/   ← canonical version for all roles
│   ├── jobs/      (containers/, services/, models/)  ← add services + models
│   └── resume-builder/ (containers/, services/, models/)  ← add services + models
├── shared/        (components/, models/, services/, directives/, pipes/)
                   ← DELETE layout/ directory
```
