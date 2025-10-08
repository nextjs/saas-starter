# Sunlighten - Partner Storage Implementation Plan

## Overview

This project already has a Next.js SaaS starter with authentication, teams (multi-tenancy), and RBAC. We'll adapt this foundation to build the Sunlighten - Partner Storage described in the PRD.

**Current State:**
- ✅ Next.js 15 with App Router
- ✅ Postgres database with Drizzle ORM
- ✅ Authentication (JWT-based)
- ✅ Multi-tenancy (teams → will become spaces)
- ✅ RBAC (roles already exist)
- ✅ Activity logging
- ✅ shadcn/ui components

**What We Need to Add:**
- 🔨 Adapt "teams" to "spaces" with S3 prefixes
- 🔨 AWS S3 integration
- 🔨 File upload table and functionality
- 🔨 Pre-signed URL generation
- 🔨 File upload/download UI
- 🔨 Optional metadata fields (version, changelog, MD5)

---

## Phase 1: Foundation & Database Schema (MVP Core)

**Goal:** Set up the database schema and S3 infrastructure without breaking existing functionality

### Task 1.1: Extend Database Schema for Spaces
**Files to modify:**
- `lib/db/schema.ts`

**Changes:**
1. Add fields to `teams` table (or rename to `spaces`):
   - `slug` VARCHAR(50) UNIQUE NOT NULL
   - `description` TEXT
   - `s3Prefix` VARCHAR(100) UNIQUE NOT NULL
   - `isActive` BOOLEAN DEFAULT true
2. Update types and exports
3. Keep existing `teamMembers` → `spaceMembers` (or keep as is)

**Decision Point:** Should we rename `teams` to `spaces` or keep `teams` and add space-specific fields?
- **Recommendation:** Keep `teams` table name but add space-specific fields. Less breaking changes.

### Task 1.2: Create Uploads Table
**Files to create/modify:**
- `lib/db/schema.ts`

**New table:**
```typescript
uploads {
  id: serial PRIMARY KEY
  spaceId: integer (FK to teams.id)
  filename: varchar(255)
  s3Key: varchar(512) UNIQUE
  fileSize: bigint
  contentType: varchar(100)
  md5Hash: varchar(32)
  description: text
  changelog: text
  version: varchar(50)
  uploadedBy: integer (FK to users.id)
  uploadedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Relations:**
- uploads → teams (spaceId)
- uploads → users (uploadedBy)

### Task 1.3: Generate and Run Migration
**Commands:**
```bash
pnpm db:generate
pnpm db:migrate
```

**Verification:** Check that new columns/tables exist in database

### Task 1.4: Create Seed Data for Spaces
**Files to modify:**
- `lib/db/seed.ts`

**Add:**
1. Update existing team to have `slug: 'blaupunkt'` and `s3Prefix: 'uploads/blaupunkt'`
2. Set `isActive: true`
3. Add description

**Test:** Run `pnpm db:seed` and verify data

---

## Phase 2: S3 Integration

**Goal:** Set up AWS S3 client and pre-signed URL generation

### Task 2.1: Install AWS SDK
**Command:**
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Task 2.2: Add Environment Variables
**Files to create:**
- `.env.local` (add to .gitignore if not already)

**Variables:**
```
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### Task 2.3: Create S3 Client Library
**Files to create:**
- `lib/s3/client.ts`

**Functions to implement:**
```typescript
- generatePresignedUploadUrl(spaceSlug, filename, contentType)
  // Generate pre-signed URL for direct upload
  
- generatePresignedDownloadUrl(s3Key, filename)
  // Generate pre-signed URL for download
  
- checkFileExists(s3Key)
  // Verify file exists in S3
  
- getFileMetadata(s3Key)
  // Returns: { contentLength, contentType, etag, lastModified, metadata }
  
- verifyS3KeyBelongsToSpace(s3Key, spaceSlug)
  // Ensure S3 key starts with correct space prefix
  
- deleteFile(s3Key)
  // Delete file from S3
```

**Reference:** Section 11.2 in PRD

### Task 2.4: Create S3 Utility Functions
**Files to create:**
- `lib/s3/utils.ts`

**Functions:**
```typescript
- sanitizeFilename(filename)
- generateS3Key(spaceSlug, filename)
- parseS3Key(s3Key) → { spaceSlug, timestamp, filename }
```

**Test:** Create simple test file to verify S3 connection works

---

## Phase 3: Database Query Layer

**Goal:** Create all database query functions for spaces and uploads

### Task 3.1: Create Space Queries
**Files to create:**
- `lib/db/queries/spaces.ts`

**Functions to implement:**
```typescript
- getUserSpaces(userId) → Space[]
- getSpaceBySlug(slug) → Space | null
- getSpaceById(id) → Space | null
- userHasSpaceAccess(userId, spaceSlug) → boolean
- getUserSpaceRole(userId, spaceSlug) → string | null
- getSpaceStats(spaceId) → { totalFiles, totalSize, memberCount }
- createSpace(data) → Space
- updateSpace(id, data) → Space
```

**Reference:** Section 11.1 in PRD (adapt for Drizzle ORM)

### Task 3.2: Create Upload Queries
**Files to create:**
- `lib/db/queries/uploads.ts`

**Functions to implement:**
```typescript
- createUpload(data) → Upload
- getSpaceUploads(spaceId, params) → { uploads, total }
- getUploadById(id) → Upload | null
- getUploadByS3Key(s3Key) → Upload | null
- deleteUpload(id) → void
- searchUploads(spaceId, query) → Upload[]
```

**Reference:** Section 11.1 in PRD

### Task 3.3: Create Space Member Queries
**Files to create:**
- `lib/db/queries/spaceMembers.ts`

**Functions to implement:**
```typescript
- getSpaceMembers(spaceId) → SpaceMember[]
- addSpaceMember(spaceId, userId, role) → SpaceMember
- removeSpaceMember(spaceId, userId) → void
- updateSpaceMemberRole(spaceId, userId, role) → SpaceMember
```

---

## Phase 4: API Routes - Upload Flow

**Goal:** Implement the file upload flow with pre-signed URLs

### Task 4.1: Create Upload Presign Endpoint
**Files to create:**
- `app/api/spaces/[slug]/upload/presign/route.ts`

**Functionality:**
1. Verify authentication (middleware)
2. Verify space exists
3. Verify user has space access
4. Validate request body (Zod schema)
5. Generate pre-signed URL
6. Return URL + s3Key

**Reference:** Section 11.5 in PRD

### Task 4.2: Create Upload Complete Endpoint
**Files to create:**
- `app/api/spaces/[slug]/upload/complete/route.ts`

**Functionality:**
1. Verify authentication
2. Verify space access
3. Validate request body
4. Verify S3 key belongs to space
5. Verify file exists in S3 (HEAD request)
6. Get file metadata from S3 (size, ETag)
7. Save to database with metadata
8. Log activity
9. Return success

**Note:** MD5 hash is stored as optional metadata only. Users can verify integrity themselves by downloading and comparing hashes.

**Reference:** Section 11.6 in PRD

### Task 4.3: Create Validation Schemas
**Files to create:**
- `lib/validations/upload.ts`

**Schemas:**
```typescript
- uploadPresignSchema
- uploadCompleteSchema
```

**Reference:** Section 11.4 in PRD

**Test:** Use Postman/curl to test presign → upload → complete flow

---

## Phase 5: API Routes - File Management

**Goal:** Implement file listing, details, and download endpoints

### Task 5.1: List Files Endpoint
**Files to create:**
- `app/api/spaces/[slug]/files/route.ts`

**Functionality:**
- GET: List all files in space (paginated, searchable)
- Query params: page, limit, search, sortBy, sortOrder

**Reference:** Section 5.4 in PRD

### Task 5.2: File Details Endpoint
**Files to create:**
- `app/api/spaces/[slug]/files/[id]/route.ts`

**Functionality:**
- GET: Get single file details
- DELETE: Delete file (owner/admin only)

**Reference:** Section 5.4 in PRD

### Task 5.3: File Download Endpoint
**Files to create:**
- `app/api/spaces/[slug]/files/[id]/download/route.ts`

**Functionality:**
- GET: Generate pre-signed download URL
- Return URL with expiration time

**Reference:** Section 5.4 in PRD

**Test:** Verify all endpoints with different roles and spaces

---

## Phase 6: Frontend - Space Selection & Dashboard

**Goal:** Build the space selection and dashboard UI

### Task 6.1: Adapt Existing Dashboard
**Files to modify:**
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/page.tsx`

**Changes:**
1. Add space context (use React Context or URL params)
2. Fetch user's spaces
3. Display space selector/switcher
4. Show current space in navbar

### Task 6.2: Create Spaces List Page
**Files to create:**
- `app/(dashboard)/spaces/page.tsx`
- `components/SpaceCard.tsx`

**Functionality:**
- Display all accessible spaces as cards
- Show space stats (file count, size, members)
- Show user's role badge
- Click to navigate to space dashboard

**Reference:** Section 6.2 in PRD

### Task 6.3: Create Space Dashboard Page
**Files to create:**
- `app/(dashboard)/spaces/[slug]/page.tsx`
- `components/SpaceHeader.tsx`
- `components/SpaceStats.tsx`

**Functionality:**
- Space header with name, description
- Quick stats (files, size, members)
- Recent uploads list (last 5)
- Action buttons: Upload, View Files, Manage Members

**Reference:** Section 6.3 in PRD

### Task 6.4: Create Space Layout with Breadcrumbs
**Files to create:**
- `app/(dashboard)/spaces/[slug]/layout.tsx`
- `components/Breadcrumb.tsx`

**Functionality:**
- Verify user has space access (middleware)
- Show breadcrumb navigation
- Consistent layout for all space pages

---

## Phase 7: Frontend - File Upload

**Goal:** Build the file upload interface

### Task 7.1: Create Upload Page
**Files to create:**
- `app/(dashboard)/spaces/[slug]/upload/page.tsx`

**Functionality:**
- File drop zone / file picker
- Metadata form (description, version, changelog, MD5 hash - optional)
- Upload progress bar
- Success/error notifications

**Validation:**
- File type: .zip, .img, .bin only
- File size: max 5GB
- Description: max 1000 characters
- Version: max 50 characters (optional)
- Changelog: max 5000 characters (optional)
- MD5 hash: optional, if provided validate format (32 hex characters)

**Reference:** Section 6.4 in PRD

### Task 7.2: Create File Uploader Component
**Files to create:**
- `components/FileUploader.tsx`

**Functionality:**
1. File selection/drag-drop
2. Validate file type and size
3. Request pre-signed URL (with user-provided MD5)
4. Upload to S3 with progress
5. Complete upload with metadata
6. Handle errors gracefully

### Task 7.3: Create Upload Actions
**Files to create:**
- `app/(dashboard)/spaces/[slug]/upload/actions.ts`

**Server Actions:**
```typescript
- requestPresignedUrl(spaceSlug, fileData)
- completeUpload(spaceSlug, uploadData)
```

**Test:** Upload a file end-to-end and verify in S3 and database

---

## Phase 8: Frontend - File Management

**Goal:** Build file listing, details, and download UI

### Task 8.1: Create Files List Page
**Files to create:**
- `app/(dashboard)/spaces/[slug]/files/page.tsx`
- `components/FileList.tsx`
- `components/FileTable.tsx`

**Functionality:**
- Paginated file list
- Search bar
- Filters (date, version)
- Sort by column headers
- Download button
- View details button

**Reference:** Section 6.5 in PRD

### Task 8.2: Create File Details Page
**Files to create:**
- `app/(dashboard)/spaces/[slug]/files/[id]/page.tsx`
- `components/FileDetails.tsx`

**Functionality:**
- Display all file metadata
- Formatted changelog
- MD5 hash with copy button
- Download button
- Delete button (owner/admin only)
- Back navigation

**Reference:** Section 6.6 in PRD

### Task 8.3: Implement Download Functionality
**Files to create:**
- `lib/utils/download.ts`

**Functionality:**
- Request download URL from API
- Trigger browser download
- Show loading state
- Handle errors

**Test:** Download files and verify MD5 hash matches

---

## Phase 9: Space Member Management

**Goal:** Implement member management UI (Owner/Admin only)

### Task 9.1: Create Members API Endpoints
**Files to create:**
- `app/api/spaces/[slug]/members/route.ts`
- `app/api/spaces/[slug]/members/[userId]/route.ts`

**Functionality:**
- GET: List members
- POST: Add member
- PATCH: Update member role
- DELETE: Remove member

### Task 9.2: Create Members Page
**Files to create:**
- `app/(dashboard)/spaces/[slug]/members/page.tsx`
- `components/MemberList.tsx`
- `components/AddMemberDialog.tsx`

**Functionality:**
- List all space members
- Show role badges
- Add member by email/username
- Change member role
- Remove member
- Only accessible to owners/admins

**Reference:** Section 6.7 in PRD

**Test:** Verify only owners/admins can access

---

## Phase 10: Security & Permissions

**Goal:** Harden security and enforce permissions

### Task 10.1: Implement Space Access Middleware
**Files to create:**
- `lib/middleware/spaceAccess.ts`

**Functionality:**
- Verify user is authenticated
- Verify user has access to space
- Attach space info to request context

### Task 10.2: Implement Role-Based Permissions
**Files to create:**
- `lib/permissions/spacePermissions.ts`

**Functions:**
```typescript
- canUploadFiles(role) → boolean
- canDeleteFiles(role) → boolean
- canManageMembers(role) → boolean
- canDeleteSpace(role) → boolean
```

### Task 10.3: Add Permission Checks to All Routes
**Files to modify:**
- All API routes under `/api/spaces/[slug]/*`

**Changes:**
1. Verify space access at route level
2. Verify specific permissions for sensitive operations
3. Return 403 for unauthorized access

### Task 10.4: Sanitize User Inputs
**Files to modify:**
- All API routes receiving user input

**Changes:**
1. Validate all inputs with Zod
2. Sanitize filenames
3. Escape special characters
4. Prevent SQL injection (Drizzle handles this)

**Test:** Try to access other spaces, manipulate URLs, test with different roles

---

## Phase 11: Activity Logging

**Goal:** Track all important actions for audit trail

### Task 11.1: Add Upload Activity Types
**Files to modify:**
- `lib/db/schema.ts`

**Add to ActivityType enum:**
```typescript
- UPLOAD_FILE
- DOWNLOAD_FILE
- DELETE_FILE
- ADD_SPACE_MEMBER
- REMOVE_SPACE_MEMBER
- UPDATE_SPACE_MEMBER_ROLE
```

### Task 11.2: Create Activity Logging Helper
**Files to create:**
- `lib/utils/activityLogger.ts`

**Functions:**
```typescript
- logFileUpload(teamId, userId, filename)
- logFileDownload(teamId, userId, filename)
- logFileDelete(teamId, userId, filename)
- logMemberAdded(teamId, userId, targetUserId)
```

### Task 11.3: Add Logging to All Actions
**Files to modify:**
- All API routes performing important actions

**Changes:**
- Add activity log after successful operations
- Include relevant metadata

### Task 11.4: Create Activity Log Viewer
**Files to modify:**
- `app/(dashboard)/dashboard/activity/page.tsx`

**Changes:**
- Filter by space
- Show file-related activities
- Show member-related activities

---

## Phase 12: Admin Features

**Goal:** Add admin-only features for space management

### Task 12.1: Create Space Management API
**Files to create:**
- `app/api/admin/spaces/route.ts`
- `app/api/admin/spaces/[id]/route.ts`

**Functionality:**
- GET: List all spaces (admin only)
- POST: Create new space (admin only)
- PATCH: Update space settings (admin only)
- DELETE: Delete space (admin only)

### Task 12.2: Create Admin Dashboard
**Files to create:**
- `app/(dashboard)/admin/spaces/page.tsx`
- `app/(dashboard)/admin/spaces/new/page.tsx`
- `components/admin/CreateSpaceDialog.tsx`

**Functionality:**
- List all spaces
- Create new space
- Edit space settings
- Assign initial owner
- Activate/deactivate spaces

### Task 12.3: Add Admin Navigation
**Files to modify:**
- `app/(dashboard)/layout.tsx`

**Changes:**
- Add "Admin" section to navbar (admin users only)
- Link to admin pages

**Test:** Verify only admin role can access

---

## Phase 13: Polish & UX Improvements

**Goal:** Improve user experience and add missing features

### Task 13.1: Add Loading States
**Files to modify:**
- All pages and components

**Changes:**
- Add loading skeletons
- Show loading spinners
- Disable buttons during operations
- Use Suspense boundaries

### Task 13.2: Add Error Handling
**Files to create:**
- `app/(dashboard)/spaces/[slug]/error.tsx`
- `components/ErrorBoundary.tsx`

**Functionality:**
- Catch and display errors gracefully
- Show user-friendly error messages
- Provide retry options

### Task 13.3: Add Empty States
**Files to modify:**
- Files list page
- Spaces list page
- Members list page

**Changes:**
- Show helpful empty states
- Add call-to-action buttons
- Provide guidance for new users

### Task 13.4: Add Confirmation Dialogs
**Files to create:**
- `components/ConfirmDialog.tsx`

**Use cases:**
- Confirm before deleting file
- Confirm before removing member
- Confirm before deleting space

### Task 13.5: Improve File Upload UX
**Files to modify:**
- `components/FileUploader.tsx`

**Changes:**
- Add file type validation
- Show file size limits
- Add drag-over visual feedback
- Show upload time estimate
- Cancel upload option

### Task 13.6: Add Toast Notifications
**Dependencies:**
```bash
pnpm add sonner
```

**Changes:**
- Add toast for successful uploads
- Add toast for errors
- Add toast for downloads
- Add toast for member operations

---

## Phase 14: Testing & Production Prep

**Goal:** Test thoroughly and prepare for production

### Task 14.1: Write Unit Tests
**Files to create:**
- `__tests__/lib/s3/client.test.ts`
- `__tests__/lib/db/queries/spaces.test.ts`
- `__tests__/lib/db/queries/uploads.test.ts`

**Test coverage:**
- S3 client functions
- Database queries
- Validation schemas
- Utility functions

### Task 14.2: Write Integration Tests
**Files to create:**
- `__tests__/api/upload-flow.test.ts`
- `__tests__/api/download-flow.test.ts`
- `__tests__/api/space-access.test.ts`

**Test scenarios:**
- Complete upload flow
- Complete download flow
- Space access control
- Role-based permissions

### Task 14.3: Manual Testing Checklist
**Create test plan:**
- Test all user roles (admin, owner, member)
- Test all API endpoints
- Test file upload with various file types
- Test file download
- Test space access control
- Test member management
- Test activity logging
- Test error scenarios
- Test with large files (up to 5GB)

**Reference:** Section 13 in PRD

### Task 14.4: Performance Testing
**Test:**
- Upload large files (5GB)
- List pages with many files (1000+)
- Search performance
- Concurrent uploads
- Database query performance

### Task 14.5: Security Audit
**Review:**
- S3 credentials not exposed
- Pre-signed URLs expire correctly
- Space isolation working
- SQL injection prevention
- XSS prevention
- CORS configuration
- Authentication working
- Authorization working

**Reference:** Section 7 in PRD

### Task 14.6: Production Environment Setup
**Tasks:**
1. Set up production Postgres database
2. Set up AWS S3 bucket
3. Configure CORS on S3
4. Set up Vercel project
5. Add environment variables
6. Run migrations on production DB
7. Create seed data (initial spaces/users)
8. Test deployment

**Reference:** Section 12 in PRD

### Task 14.7: Documentation
**Files to create:**
- `docs/USER_GUIDE.md`
- `docs/ADMIN_GUIDE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/DEPLOYMENT_GUIDE.md`

**Content:**
- How to upload files
- How to manage spaces
- How to add members
- API endpoint documentation
- Environment variables
- Deployment instructions

---

## Phase 15: Optional Enhancements (Post-MVP)

**Goal:** Add nice-to-have features

### Task 15.1: File Preview
- Show preview for images
- Show details for ZIP files
- Show metadata for binaries

### Task 15.2: Bulk Operations
- Bulk upload
- Bulk download (create ZIP)
- Bulk delete

### Task 15.3: Advanced Search
- Search by date range
- Search by uploader
- Filter by file size
- Saved search filters

### Task 15.4: Space Analytics
- Upload trends
- Storage usage over time
- Most active uploaders
- Download statistics

### Task 15.5: Notifications
- Email on upload complete
- Email on member added
- Email on quota approaching
- Webhook support

### Task 15.6: Storage Quotas
- Set per-space quotas
- Warn when approaching limit
- Prevent uploads when over quota
- Admin quota management

### Task 15.7: File Versioning
- Track file versions
- Compare versions
- Rollback to previous version
- Version history view

### Task 15.8: Public Share Links
- Generate public share links
- Set expiration on links
- Password-protected links
- Track download counts

---

## Implementation Strategy

### Recommended Order

**Week 1: Foundation**
- Phase 1: Database Schema (Tasks 1.1-1.4)
- Phase 2: S3 Integration (Tasks 2.1-2.4)
- Phase 3: Database Queries (Tasks 3.1-3.3)

**Week 2: Backend API**
- Phase 4: Upload Flow API (Tasks 4.1-4.3)
- Phase 5: File Management API (Tasks 5.1-5.3)
- Test API endpoints thoroughly

**Week 3: Frontend Core**
- Phase 6: Space Dashboard UI (Tasks 6.1-6.4)
- Phase 7: File Upload UI (Tasks 7.1-7.3)
- Phase 8: File Management UI (Tasks 8.1-8.3)

**Week 4: Advanced Features**
- Phase 9: Member Management (Tasks 9.1-9.2)
- Phase 10: Security & Permissions (Tasks 10.1-10.4)
- Phase 11: Activity Logging (Tasks 11.1-11.4)

**Week 5: Admin & Polish**
- Phase 12: Admin Features (Tasks 12.1-12.3)
- Phase 13: Polish & UX (Tasks 13.1-13.6)

**Week 6: Testing & Deployment**
- Phase 14: Testing & Production (Tasks 14.1-14.7)

### Development Best Practices

1. **Incremental Development**
   - Complete one task before moving to next
   - Test each task thoroughly
   - Commit after each completed task

2. **Testing Strategy**
   - Test API endpoints as you build them
   - Test UI components in isolation
   - Test integration after each phase

3. **Code Review Checkpoints**
   - After Phase 2 (S3 + DB)
   - After Phase 5 (All API routes)
   - After Phase 8 (Core UI)
   - Before Phase 14 (Production)

4. **Git Strategy**
   - Create feature branch for each phase
   - Create PR for each phase
   - Use descriptive commit messages
   - Tag releases (v0.1-mvp, v0.2-admin, etc.)

5. **Documentation**
   - Document as you build
   - Update README with setup instructions
   - Keep API docs updated
   - Add inline code comments for complex logic

---

## Success Criteria

**MVP is complete when:**
- ✅ Users can log in
- ✅ Users see only their assigned spaces
- ✅ Users can upload files to their spaces
- ✅ Files are stored in S3 with correct prefix
- ✅ Files are tracked in database with metadata
- ✅ Users can list and search files
- ✅ Users can download files
- ✅ MD5 hash verification works
- ✅ Activity logging works
- ✅ Space isolation is enforced
- ✅ Role-based permissions work
- ✅ Admin can manage spaces

**Production-ready when:**
- ✅ All tests pass
- ✅ Security audit complete
- ✅ Performance acceptable
- ✅ Documentation complete
- ✅ Deployed to production
- ✅ Monitoring set up
- ✅ Backup strategy in place

---

## Risk Mitigation

### Technical Risks

1. **Large file uploads (5GB)**
   - Mitigation: Use chunked uploads, test early
   - Fallback: Reduce max file size

2. **S3 costs**
   - Mitigation: Set up cost alerts
   - Monitor: Storage usage dashboard

3. **Database performance with many files**
   - Mitigation: Proper indexing, pagination
   - Monitor: Query performance

4. **Pre-signed URL expiration**
   - Mitigation: Handle gracefully, allow retry
   - Extend: Allow custom expiration times

### Security Risks

1. **S3 credential exposure**
   - Mitigation: Server-side only, never in client
   - Verify: Security audit

2. **Space access bypass**
   - Mitigation: Check access on every request
   - Test: Comprehensive access control tests

3. **Malicious file uploads**
   - Mitigation: File type validation, size limits
   - Consider: Virus scanning (future)

### Business Risks

1. **User confusion with spaces**
   - Mitigation: Clear UX, good documentation
   - Provide: User onboarding

2. **Data loss**
   - Mitigation: S3 versioning, database backups
   - Test: Recovery procedures

---

## Notes

- The existing codebase gives us a huge head start
- Most authentication and RBAC is already done
- We're essentially adapting "teams" to "spaces" and adding file management
- Focus on getting MVP working first, then add polish
- Test security and access control thoroughly
- Document as you go for easier maintenance

---

**Last Updated:** October 1, 2025
**Status:** Ready to implement
**Estimated Timeline:** 6 weeks to production-ready

