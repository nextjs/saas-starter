# Sunlighten - Partner Storage - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                     (Next.js Frontend)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Spaces     │  │  File Upload │  │  File List   │        │
│  │  Selection   │  │     Page     │  │     Page     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ File Details │  │   Members    │  │    Admin     │        │
│  │     Page     │  │     Page     │  │  Dashboard   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                        API LAYER                                │
│                  (Next.js API Routes)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Authentication & Authorization                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  JWT-based auth │ Space access checks │ Role permissions  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Spaces API                                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  /api/spaces                      - List user's spaces    │ │
│  │  /api/spaces/[slug]               - Space details         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Upload API                                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  /api/spaces/[slug]/upload/presign  - Get upload URL     │ │
│  │  /api/spaces/[slug]/upload/complete - Confirm upload     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Files API                                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  /api/spaces/[slug]/files           - List files         │ │
│  │  /api/spaces/[slug]/files/[id]      - File details/delete│ │
│  │  /api/spaces/[slug]/files/[id]/download - Get download URL││
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Members API                                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  /api/spaces/[slug]/members         - Manage members     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Admin API                                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  /api/admin/spaces                  - Manage all spaces  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
               │                          │
      ┌────────┴────────┐        ┌───────┴────────┐
      │                 │        │                │
      │  S3 Integration │        │  Database ORM  │
      │   (AWS SDK)     │        │   (Drizzle)    │
      │                 │        │                │
      └────────┬────────┘        └───────┬────────┘
               │                          │
               │                          │
      ┌────────┴────────┐        ┌───────┴────────┐
      │                 │        │                │
      │    AWS S3       │        │   PostgreSQL   │
      │                 │        │    Database    │
      │  ┌───────────┐  │        │                │
      │  │ uploads/  │  │        │  ┌──────────┐  │
      │  │ ├─blau... │  │        │  │ users    │  │
      │  │ ├─mark... │  │        │  │ teams    │  │
      │  │ └─...     │  │        │  │ uploads  │  │
      │  └───────────┘  │        │  │ activity │  │
      │                 │        │  └──────────┘  │
      └─────────────────┘        └────────────────┘
```

---

## File Upload Flow

```
┌─────────┐
│ Browser │
│ (User)  │
└────┬────┘
     │
     │ 1. Select file & fill metadata form
     │    (description, version, changelog, MD5 - optional)
     │
     ▼
┌────────────────────────────────┐
│ FileUploader Component         │
│ - Validate file type/size      │
└────┬───────────────────────────┘
     │
     │ 2. POST /api/spaces/[slug]/upload/presign
     │    { filename, contentType, fileSize }
     │
     ▼
┌─────────────────────────────────────┐
│ Presign API Route                   │
│ - Verify authentication             │
│ - Verify space access               │
│ - Generate S3 key with space prefix │
│ - Generate presigned URL            │
└────┬────────────────────────────────┘
     │
     │ 3. Return presigned URL
     │    { uploadUrl, s3Key }
     │
     ▼
┌────────────────────────────────┐
│ Browser                        │
│ - PUT file to presigned URL    │
│ - Show progress                │
└────┬───────────────────────────┘
     │
     │ 4. Upload directly to S3
     │
     ▼
┌─────────────────────────────────┐
│ AWS S3                          │
│ - Store file at s3Key           │
│ - Return ETag                   │
└────┬────────────────────────────┘
     │
     │ 5. Upload success
     │
     ▼
┌────────────────────────────────┐
│ Browser                        │
│ - POST /api/spaces/[slug]/upload/complete
│   { s3Key, metadata }          │
└────┬───────────────────────────┘
     │
     │ 6. Confirm upload
     │
     ▼
┌─────────────────────────────────────┐
│ Complete API Route                  │
│ - Verify file exists in S3          │
│ - Verify MD5 hash matches           │
│ - Verify S3 key belongs to space    │
│ - Save metadata to database         │
│ - Log activity                      │
└────┬────────────────────────────────┘
     │
     │ 7. Success response
     │
     ▼
┌────────────────────────────────┐
│ Browser                        │
│ - Show success message         │
│ - Redirect to file list        │
└────────────────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                           TABLES                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│ users                    │
├──────────────────────────┤
│ id (PK)                  │
│ name                     │
│ email (UNIQUE)           │
│ password_hash            │
│ role (admin/member)      │
│ created_at               │
│ updated_at               │
│ deleted_at               │
└─────────┬────────────────┘
          │
          │ 1:N
          │
          ▼
┌──────────────────────────┐       ┌──────────────────────────┐
│ team_members             │       │ teams (spaces)           │
├──────────────────────────┤       ├──────────────────────────┤
│ id (PK)                  │◄──────┤ id (PK)                  │
│ user_id (FK) ────────────┼───┐   │ name                     │
│ team_id (FK)             │   │   │ slug (UNIQUE)            │◄─┐
│ role (owner/admin/member)│   │   │ description              │  │
│ joined_at                │   │   │ s3_prefix (UNIQUE)       │  │
└──────────────────────────┘   │   │ is_active                │  │
                               │   │ created_at               │  │
                               │   │ updated_at               │  │
                               │   └─────────┬────────────────┘  │
                               │             │                   │
                               │             │ 1:N               │
                               │             │                   │
                               │             ▼                   │
                               │   ┌──────────────────────────┐ │
                               │   │ uploads                  │ │
                               │   ├──────────────────────────┤ │
                               └───┤ id (PK)                  │ │
                                   │ space_id (FK) ───────────┼─┘
                                   │ filename                 │
                                   │ s3_key (UNIQUE)          │
                                   │ file_size                │
                                   │ content_type             │
                                   │ md5_hash                 │
                                   │ description              │
                                   │ changelog                │
                                   │ version                  │
                                   │ uploaded_by (FK)         │
                                   │ uploaded_at              │
                                   │ created_at               │
                                   │ updated_at               │
                                   └──────────────────────────┘

┌──────────────────────────┐
│ activity_logs            │
├──────────────────────────┤
│ id (PK)                  │
│ team_id (FK)             │
│ user_id (FK)             │
│ action                   │
│ timestamp                │
│ ip_address               │
└──────────────────────────┘
```

---

## Space-Based Multi-Tenancy

### Concept

Each "space" represents an isolated workspace:

```
Space: Blaupunkt
├─ Users: blaupunkt_user (owner), admin (admin)
├─ S3 Prefix: uploads/blaupunkt/
└─ Files:
   ├─ uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip
   ├─ uploads/blaupunkt/1234567891-tablet_ota_v2.5.2.zip
   └─ ...

Space: Marketing
├─ Users: marketing_user (owner), admin (admin)
├─ S3 Prefix: uploads/marketing/
└─ Files:
   ├─ uploads/marketing/1234567892-campaign_assets.zip
   ├─ uploads/marketing/1234567893-brand_guidelines.pdf
   └─ ...
```

### Isolation Guarantees

1. **Database Level**
   - All uploads have `space_id` foreign key
   - Queries always filter by space_id
   - Users can only see spaces they're members of

2. **S3 Level**
   - Each space has unique S3 prefix
   - Upload URLs include space prefix
   - S3 keys validated against space prefix
   - Users can't upload/download across spaces

3. **API Level**
   - All routes check space membership
   - Pre-signed URLs scoped to space
   - Download URLs validated for space access

---

## Security Model

### Authentication Flow

```
1. User logs in
   └─> Verify credentials (bcrypt)
       └─> Generate JWT
           └─> Store in HTTP-only cookie
               └─> Return to client
```

### Authorization Flow

```
Every API Request:
1. Verify JWT from cookie
   └─> Valid? Continue : Return 401
2. Extract user ID from JWT
3. For space-scoped routes:
   └─> Verify user has space access
       └─> Has access? Continue : Return 403
4. For sensitive operations:
   └─> Check role permissions
       └─> Has permission? Continue : Return 403
5. Execute operation
```

### S3 Security

```
Upload:
1. User requests presigned URL
2. Server generates URL with:
   - Space-specific prefix
   - MD5 hash requirement
   - 1-hour expiration
   - Content-Type restriction
3. User uploads directly to S3
4. S3 validates MD5 hash
5. Server verifies file and saves metadata

Download:
1. User requests download
2. Server verifies space access
3. Server generates presigned URL (1-hour expiration)
4. User downloads directly from S3

✅ S3 credentials never exposed to client
✅ Pre-signed URLs expire automatically
✅ MD5 verification prevents corruption
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui (Radix UI + Tailwind)
- **State:** React Server Components + Client Components
- **Forms:** React Hook Form (future)
- **Validation:** Zod

### Backend
- **API:** Next.js API Routes
- **Authentication:** JWT (jose library)
- **Session:** HTTP-only cookies
- **Database ORM:** Drizzle
- **File Storage:** AWS S3 (SDK v3)
- **Validation:** Zod

### Database
- **Engine:** PostgreSQL
- **Hosting:** Vercel Postgres
- **Migrations:** Drizzle Kit
- **Connection:** Pooled connections

### Infrastructure
- **Hosting:** Vercel
- **Storage:** AWS S3
- **Database:** Vercel Postgres
- **CDN:** Vercel Edge Network

---

## Key Design Decisions

### 1. Why keep "teams" instead of renaming to "spaces"?
**Decision:** Keep `teams` table, add space-specific fields

**Rationale:**
- Less breaking changes to existing code
- Auth and RBAC already working with teams
- Can use existing team management logic
- Faster to implement

### 2. Why pre-signed URLs instead of proxied uploads?
**Decision:** Use S3 pre-signed URLs for direct upload

**Rationale:**
- No server bandwidth used
- Faster uploads (direct to S3)
- Scalable (no server processing)
- Industry standard approach
- Cost-effective

### 3. Why Drizzle instead of Prisma?
**Decision:** Already using Drizzle in the starter

**Rationale:**
- Lighter weight
- Better TypeScript inference
- SQL-like syntax
- Already configured

### 4. Why JWT in cookies instead of session DB?
**Decision:** Already using JWT in the starter

**Rationale:**
- Stateless (no session storage)
- Scalable (no session DB queries)
- Works with Vercel serverless
- Secure (HTTP-only cookies)

### 5. Why store MD5 as optional metadata?
**Decision:** Store MD5 hash as optional user-provided metadata

**Rationale:**
- Simplifies implementation - no server-side validation
- Users can provide MD5 for their own reference
- Users verify integrity themselves by downloading and checking
- No complexity with multipart uploads vs single-part
- Users who care about integrity can verify, others can skip
- Users calculate MD5:
  - Linux/Mac: `md5sum file.zip`
  - Windows: `certUtil -hashfile file.zip MD5`

---

## Scalability Considerations

### Current Design Supports:

1. **Users**
   - Unlimited users
   - Each user can belong to multiple spaces

2. **Spaces**
   - Unlimited spaces
   - Each space is isolated

3. **Files**
   - Up to 5GB per file
   - Unlimited files per space
   - Database indexed for performance

4. **Concurrent Uploads**
   - Direct to S3 (no server bottleneck)
   - Pre-signed URLs scale infinitely

### Performance Optimizations:

1. **Database**
   - Indexed on frequently queried columns
   - Composite indexes for common queries
   - Pagination for large result sets

2. **S3**
   - Direct uploads (no proxy)
   - Pre-signed URLs with short expiration
   - Proper CORS configuration

3. **API**
   - Server-side caching (future)
   - Optimistic UI updates
   - Lazy loading for large lists

### Future Scaling Options:

1. **If many files per space:**
   - Add Redis cache for file lists
   - Implement virtual scrolling

2. **If huge files (>5GB):**
   - Implement multipart uploads
   - Add upload resume functionality
   - Add chunked upload progress tracking

3. **If global users:**
   - CloudFront CDN for S3
   - Regional S3 buckets

---

## Development Workflow

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Set up database
pnpm db:setup
pnpm db:migrate
pnpm db:seed

# 4. Start dev server
pnpm dev

# Open http://localhost:3000
# Production: https://partner-storage.infra.sunlighten.com
```

### Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Implement feature
# - Update schema if needed
# - Add API routes
# - Add UI components
# - Add tests

# 3. Test locally
# - Manual testing
# - Run tests

# 4. Commit and push
git add .
git commit -m "feat: description"
git push origin feature/your-feature

# 5. Create PR
# - Review changes
# - Run CI checks
# - Get review
# - Merge
```

### Database Changes

```bash
# 1. Update schema
# Edit lib/db/schema.ts

# 2. Generate migration
pnpm db:generate

# 3. Review migration
# Check drizzle/migrations/

# 4. Apply migration
pnpm db:migrate

# 5. Update seed if needed
# Edit lib/db/seed.ts
pnpm db:seed
```

---

## Monitoring & Observability

### Metrics to Track

1. **Upload Metrics**
   - Upload success rate
   - Average upload time
   - Failed uploads by error type

2. **Storage Metrics**
   - Total storage used
   - Storage per space
   - Growth rate

3. **User Metrics**
   - Active users
   - Uploads per user
   - Most active spaces

4. **Performance Metrics**
   - API response times
   - Database query times
   - S3 operation times

### Logging Strategy

1. **Activity Logs** (Database)
   - User actions
   - File operations
   - Member changes

2. **Application Logs** (Vercel)
   - Errors
   - Warnings
   - Info messages

3. **S3 Access Logs** (Optional)
   - Download patterns
   - Access patterns

---

## Maintenance Guide

### Regular Tasks

**Daily:**
- Monitor error logs
- Check failed uploads

**Weekly:**
- Review activity logs
- Check storage growth

**Monthly:**
- Update dependencies
- Review security updates
- Backup verification

**Quarterly:**
- Performance audit
- Security audit
- Cost optimization

### Common Issues

**Issue: Upload fails with CORS error**
- Solution: Verify S3 CORS configuration
- Check allowed origins

**Issue: "Access Denied" on S3 operations**
- Solution: Verify IAM permissions
- Check AWS credentials

**Issue: Slow file listings**
- Solution: Check database indexes
- Add pagination if not present

**Issue: Pre-signed URL expired**
- Solution: Regenerate URL
- Consider longer expiration for large files

---

## Support & Resources

### Documentation
- PRD: `docs/Main_PRD.md`
- Implementation Plan: `docs/IMPLEMENTATION_PLAN.md`
- Progress Tracker: `docs/PROGRESS_TRACKER.md`
- Quick Start: `docs/QUICK_START.md`

### External Resources
- Next.js Docs: https://nextjs.org/docs
- Drizzle Docs: https://orm.drizzle.team/docs
- AWS S3 SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/
- shadcn/ui: https://ui.shadcn.com/

### Getting Help
1. Check documentation first
2. Review code examples in PRD
3. Check progress tracker for status
4. Review implementation plan for guidance

---

**Last Updated:** October 1, 2025

