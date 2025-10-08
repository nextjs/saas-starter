# Sunlighten - Partner Storage - Quick Start Guide

## What We're Building

A secure web portal for partners (like Blaupunkt) to upload Android tablet OTA images to AWS S3, replacing the insecure WeTransfer workflow.

## Current State vs. Target

### ✅ What We Already Have
- Next.js 15 application with App Router
- Postgres database with Drizzle ORM
- JWT-based authentication
- Multi-tenancy (teams)
- RBAC (roles: admin, member, owner)
- Activity logging
- Modern UI with shadcn/ui

### 🔨 What We Need to Build
- Adapt teams → spaces (with S3 prefixes)
- AWS S3 integration
- File upload/download with pre-signed URLs
- File metadata tracking
- MD5 hash verification
- Space-based access control

## Key Architectural Decisions

### 1. Keep "teams" table, extend it as "spaces"
**Why:** Less breaking changes, faster implementation
- Add: `slug`, `s3Prefix`, `description`, `isActive`
- Keep existing: `id`, `name`, `createdAt`, `updatedAt`

### 2. Direct-to-S3 uploads with pre-signed URLs
**Flow:**
1. Client requests upload URL from API
2. API generates pre-signed URL (includes space prefix)
3. Client uploads directly to S3
4. Client confirms completion with API
5. API verifies file in S3 and saves metadata

### 3. Space-based file isolation
- S3 structure: `uploads/{space-slug}/{timestamp}-{filename}`
- Database: Every upload has `spaceId` foreign key
- API: Every request validates space access

## Development Phases

### Phase 1: Foundation (Week 1)
**Goal:** Database + S3 setup
- Extend database schema
- Create uploads table
- Set up S3 client
- Create query functions

**Deliverable:** Can generate pre-signed URLs and query spaces

### Phase 2: Backend API (Week 2)
**Goal:** Working API endpoints
- Upload presign endpoint
- Upload complete endpoint
- File list endpoint
- File download endpoint

**Deliverable:** API tested with Postman/curl

### Phase 3: Frontend Core (Week 3)
**Goal:** Basic UI working
- Space selection page
- File upload page
- File list page
- File details page

**Deliverable:** Can upload and download files through UI

### Phase 4: Advanced Features (Week 4)
**Goal:** Member management + security
- Member management UI
- Permission checks
- Activity logging
- Role-based access

**Deliverable:** Multi-user with proper access control

### Phase 5: Admin & Polish (Week 5)
**Goal:** Admin features + UX
- Admin dashboard
- Space management
- Loading states
- Error handling
- Confirmations

**Deliverable:** Production-quality UX

### Phase 6: Testing & Deploy (Week 6)
**Goal:** Production-ready
- Unit tests
- Integration tests
- Security audit
- Documentation
- Deploy to Vercel

**Deliverable:** Live production system

## Tech Stack

| Component | Technology | Status |
|-----------|------------|--------|
| Framework | Next.js 15 | ✅ Installed |
| Database | Postgres | ✅ Connected |
| ORM | Drizzle | ✅ Configured |
| Auth | JWT (Jose) | ✅ Working |
| UI | shadcn/ui | ✅ Setup |
| Storage | AWS S3 | 🔨 To add |
| Validation | Zod | ✅ Installed |

## Getting Started with Development

### 1. Review the PRD
```bash
cat docs/Main_PRD.md
```
Key sections: 3 (Architecture), 5 (API), 11 (Code Examples)

### 2. Review the Implementation Plan
```bash
cat docs/IMPLEMENTATION_PLAN.md
```
This has ALL the detailed tasks

### 3. Set up AWS S3
- Create S3 bucket
- Create IAM user with S3 permissions
- Get access key and secret
- Configure CORS

### 4. Add environment variables
```bash
# Add to .env.local
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### 5. Start with Phase 1, Task 1.1
Open `docs/IMPLEMENTATION_PLAN.md` and follow Phase 1

## File Structure (Planned)

```
/app
  /(dashboard)
    /spaces
      /page.tsx                          # List all spaces
      /[slug]
        /page.tsx                        # Space dashboard
        /upload/page.tsx                 # Upload files
        /files/page.tsx                  # List files
        /files/[id]/page.tsx            # File details
        /members/page.tsx                # Manage members
    /admin
      /spaces/page.tsx                   # Admin: manage spaces
  /api
    /spaces
      /[slug]
        /upload
          /presign/route.ts              # Get upload URL
          /complete/route.ts             # Confirm upload
        /files
          /route.ts                      # List files
          /[id]
            /route.ts                    # File details/delete
            /download/route.ts           # Get download URL
        /members/route.ts                # Manage members

/lib
  /db
    /queries
      /spaces.ts                         # Space queries
      /uploads.ts                        # Upload queries
      /spaceMembers.ts                   # Member queries
  /s3
    /client.ts                           # S3 operations
    /utils.ts                            # S3 utilities
  /validations
    /upload.ts                           # Upload schemas
  /permissions
    /spacePermissions.ts                 # Permission checks

/components
  /SpaceCard.tsx                         # Space card component
  /FileUploader.tsx                      # Upload component
  /FileList.tsx                          # File list component
  /FileTable.tsx                         # File table component
  /FileDetails.tsx                       # File details component
  /Breadcrumb.tsx                        # Breadcrumb nav
```

## Key Concepts

### Spaces
- A "space" is an isolated workspace for a team/partner
- Each space has a unique slug (e.g., "blaupunkt")
- Each space has an S3 prefix (e.g., "uploads/blaupunkt")
- Users are assigned to spaces with roles (owner, admin, member)

### File Upload Flow
```
1. User selects file and fills metadata form (description, version, changelog, MD5 - optional)
2. Request presigned URL from API
3. Verify user has space access
4. Generate presigned URL with space prefix
5. Client uploads directly to S3
6. Client confirms upload with metadata
7. API verifies file exists in S3
8. Save metadata to database (including optional MD5)
9. Log activity
```

### File Integrity Verification

**MD5 hash is stored as optional metadata:**
- Users can provide MD5 hash for their own reference
- Users verify integrity by downloading file and checking MD5 themselves
- Simplifies implementation - no server-side validation needed
- Users calculate MD5:
  - Linux/Mac: `md5sum file.zip`
  - Windows: `certUtil -hashfile file.zip MD5`

### Security Model
- **Authentication:** JWT tokens in cookies
- **Authorization:** Check space membership on every request
- **S3 Security:** Credentials never exposed, presigned URLs expire in 1hr
- **Data Isolation:** All queries filtered by spaceId
- **S3 Isolation:** S3 keys validated against space prefix

### Roles & Permissions

| Action | Member | Admin | Owner | System Admin |
|--------|--------|-------|-------|--------------|
| View files | ✅ | ✅ | ✅ | ✅ |
| Upload files | ✅ | ✅ | ✅ | ✅ |
| Download files | ✅ | ✅ | ✅ | ✅ |
| Delete files | ❌ | ✅ | ✅ | ✅ |
| Add members | ❌ | ✅ | ✅ | ✅ |
| Remove members | ❌ | ✅ | ✅ | ✅ |
| Manage space | ❌ | ❌ | ✅ | ✅ |
| Create spaces | ❌ | ❌ | ❌ | ✅ |

## Testing Strategy

### After Each Task
- Does it work in isolation?
- Does it handle errors?
- Are types correct?

### After Each Phase
- Integration test the phase
- Test with different users/roles
- Test edge cases
- Check security (can't access other spaces?)

### Before Production
- Full end-to-end test
- Security audit
- Performance test with large files
- Test with multiple concurrent users

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm db:studio             # Open Drizzle Studio

# Database
pnpm db:generate           # Generate migrations
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database

# Testing
pnpm test                  # Run tests (when added)
pnpm test:watch            # Watch mode

# Production
pnpm build                 # Build for production
pnpm start                 # Start production server
```

## Next Steps

1. **Read the full PRD** (`docs/Main_PRD.md`) - Understand the complete vision
2. **Review implementation plan** (`docs/IMPLEMENTATION_PLAN.md`) - See all tasks
3. **Set up AWS S3** - Create bucket and get credentials
4. **Start Phase 1, Task 1.1** - Extend database schema

## Questions or Issues?

Refer to:
- **PRD:** `docs/Main_PRD.md` - Complete specification
- **Plan:** `docs/IMPLEMENTATION_PLAN.md` - Detailed tasks
- **Code Examples:** PRD Section 11 - Reference implementations

## Success Metrics

**MVP Success:**
- ✅ Blaupunkt user can log in
- ✅ Can upload OTA file to their space
- ✅ File stored in S3 at `uploads/blaupunkt/`
- ✅ Can view and download files
- ✅ Metadata (including optional MD5) stored correctly
- ✅ Can't access other spaces

**Production Success:**
- ✅ All security checks pass
- ✅ Can handle 5GB files
- ✅ Multiple spaces working
- ✅ Activity logging complete
- ✅ Admin can manage spaces
- ✅ Documentation complete

---

**Let's build this! 🚀**

