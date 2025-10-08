# Product Requirements Document: Sunlighten - Partner Storage

## 1. Executive Summary

### 1.1 Purpose
Build a secure web application for partners (starting with Blaupunkt) to upload Android tablet OTA images and related files to our AWS S3 storage, replacing the current insecure WeTransfer-based workflow.

### 1.2 Goals
- **Security**: Eliminate exposure of S3 credentials; secure file transfer
- **Simplicity**: Easy to develop, deploy, and maintain
- **Traceability**: Track all uploads with metadata and audit trail
- **Scalability**: Support multiple teams/partners via spaces (multi-tenancy)
- **Reliability**: Ensure file integrity with MD5 hash verification

### 1.3 Success Metrics
- Zero security incidents related to file transfers
- 100% of uploads tracked with complete metadata
- Partners can successfully upload without technical support
- Zero maintenance overhead after initial deployment
- Easy addition of new partner spaces

---

## 2. Technical Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Frontend Framework | Next.js 14+ (App Router) | Server/client components, built-in API routes |
| Hosting | Vercel | Zero-config deployment, existing usage |
| Database | Vercel Postgres | One-click setup, serverless, no management |
| Object Storage | AWS S3 | Existing infrastructure |
| Authentication | NextAuth.js v5 | Built for Next.js, database-backed auth |
| Styling | Tailwind CSS | Rapid UI development |
| File Upload | Pre-signed S3 URLs | Secure, direct-to-S3 uploads |

---

## 3. System Architecture

### 3.1 Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (Partner)  │
└──────┬──────┘
       │
       │ 1. Login
       ▼
┌─────────────────────────────────┐
│     Next.js Application         │
│      (Vercel Hosted)            │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Frontend (React)        │  │
│  │  - Login Page            │  │
│  │  - Space Selection       │  │
│  │  - Upload Form           │  │
│  │  - File List/History     │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  API Routes              │  │
│  │  - /api/auth/*           │  │
│  │  - /api/spaces/*         │  │
│  │  - /api/spaces/[slug]/   │  │
│  │    upload/*              │  │
│  │  - /api/spaces/[slug]/   │  │
│  │    files/*               │  │
│  └──────────────────────────┘  │
└────┬─────────────────────┬─────┘
     │                     │
     │ 2. Get presigned    │ 5. Save metadata
     │    URL              │
     ▼                     ▼
┌──────────┐        ┌─────────────────┐
│  AWS S3  │        │ Vercel Postgres │
│  Bucket  │        │                 │
│          │        │  - spaces       │
│  uploads/│        │  - users        │
│  ├─space1│        │  - space_members│
│  └─space2│        │  - uploads      │
└────▲─────┘        └─────────────────┘
     │
     │ 3. Direct upload
     │    (presigned URL)
     │
┌────┴─────┐
│ Browser  │
└──────────┘
```

### 3.2 Upload Flow Sequence

```
Partner                Next.js API              S3                Database
  │                        │                    │                    │
  │──1. Select space───────│                    │                    │
  │                        │                    │                    │
  │──2. Fill form──────────│                    │                    │
  │                        │                    │                    │
  │──3. Request upload─────►                    │                    │
  │   (with space context) │                    │                    │
  │                        │──4. Verify access──┼────────────────────►
  │                        │                    │                    │
  │                        │──5. Generate───────►                    │
  │                        │   presigned URL    │                    │
  │                        │   (space prefix)   │                    │
  │                        │                    │                    │
  │◄─6. Return URL─────────│                    │                    │
  │                        │                    │                    │
  │──7. Upload file────────┼────────────────────►                    │
  │    (with MD5)          │                    │                    │
  │                        │                    │                    │
  │◄─8. Upload success─────┼────────────────────┘                    │
  │                        │                                         │
  │──9. Confirm upload─────►                                         │
  │                        │                                         │
  │                        │──10. Verify S3 file─────────────────────►
  │                        │──11. Save metadata──────────────────────►
  │                        │                                         │
  │◄─12. Complete──────────│                                         │
```

---

## 4. Database Schema

### 4.1 Multi-Tenancy with Spaces

**Spaces Concept:**
A "Space" is an isolated workspace for teams/partners to upload and manage their files. Each space has:
- Unique identifier and name (e.g., "blaupunkt", "marketing")
- Own S3 folder prefix for file organization
- Own set of users with access
- Independent file listings and permissions

**Benefits:**
- Clear separation of concerns between partners/teams
- Scalable: easily add new partners without code changes
- Secure: users only see files in their assigned spaces
- Organized: S3 files stored in `/uploads/{space_slug}/` folders

### 4.2 Tables

#### Table: `spaces`

```sql
CREATE TABLE spaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  s3_prefix VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_spaces_slug ON spaces(slug);
CREATE INDEX idx_spaces_is_active ON spaces(is_active);
```

#### Table: `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### Table: `space_members`

```sql
CREATE TABLE space_members (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(space_id, user_id)
);

-- Indexes
CREATE INDEX idx_space_members_space_id ON space_members(space_id);
CREATE INDEX idx_space_members_user_id ON space_members(user_id);
CREATE INDEX idx_space_members_role ON space_members(role);
```

#### Table: `uploads`

```sql
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  
  -- Space association
  space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  
  -- File identification
  filename VARCHAR(255) NOT NULL,
  s3_key VARCHAR(512) NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  content_type VARCHAR(100),
  
  -- Integrity
  md5_hash VARCHAR(32) NOT NULL,
  
  -- Metadata
  description TEXT,
  changelog TEXT,
  version VARCHAR(50),
  
  -- Audit
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_uploads_space_id ON uploads(space_id);
CREATE INDEX idx_uploads_uploaded_at ON uploads(uploaded_at DESC);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX idx_uploads_version ON uploads(version);
CREATE INDEX idx_uploads_md5_hash ON uploads(md5_hash);

-- Composite index for space-specific queries
CREATE INDEX idx_uploads_space_uploaded_at ON uploads(space_id, uploaded_at DESC);
```

### 4.3 Seed Data (Initial Setup)

```sql
-- Create initial spaces
INSERT INTO spaces (name, slug, description, s3_prefix) VALUES
  ('Blaupunkt', 'blaupunkt', 'Blaupunkt Android tablet OTA images', 'uploads/blaupunkt'),
  ('Marketing', 'marketing', 'Marketing team assets and files', 'uploads/marketing');

-- Create initial users (password hash generated with bcrypt)
-- Generate hash: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10, (err, hash) => console.log(hash));"
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
  ('blaupunkt_user', '$2a$10$...', 'Blaupunkt Partner', 'partner@blaupunkt.com', 'member'),
  ('admin', '$2a$10$...', 'System Admin', 'admin@yourcompany.com', 'admin');

-- Assign users to spaces
INSERT INTO space_members (space_id, user_id, role) VALUES
  (1, 1, 'owner'),  -- Blaupunkt user -> Blaupunkt space (owner)
  (2, 2, 'owner');  -- Admin -> Marketing space (owner)
```

### 4.4 Row Level Security Concept

Users can only:
- View uploads in spaces they're members of
- Upload files to spaces they're members of
- Manage spaces if they have 'owner' or 'admin' role in that space

This is enforced at the application level in API routes.

---

## 5. API Specification

### 5.1 Authentication

#### POST `/api/auth/signin`
**Purpose**: Authenticate user and return their accessible spaces

**Request Body**:
```json
{
  "username": "blaupunkt_user",
  "password": "secure-password"
}
```

**Response (Success - 200)**:
```json
{
  "user": {
    "id": 1,
    "name": "Blaupunkt Partner",
    "email": "partner@blaupunkt.com",
    "username": "blaupunkt_user"
  },
  "spaces": [
    {
      "id": 1,
      "name": "Blaupunkt",
      "slug": "blaupunkt",
      "role": "owner"
    }
  ]
}
```

**Response (Error - 401)**:
```json
{
  "error": "Invalid credentials"
}
```

---

### 5.2 Space Management

#### GET `/api/spaces`
**Purpose**: List all spaces accessible by current user

**Authentication**: Required (Session)

**Response (Success - 200)**:
```json
{
  "spaces": [
    {
      "id": 1,
      "name": "Blaupunkt",
      "slug": "blaupunkt",
      "description": "Blaupunkt Android tablet OTA images",
      "role": "owner",
      "memberCount": 3,
      "fileCount": 15,
      "totalSize": 7516192768
    }
  ]
}
```

---

#### GET `/api/spaces/[slug]`
**Purpose**: Get details of a specific space

**Authentication**: Required (Session + Space membership)

**Response (Success - 200)**:
```json
{
  "id": 1,
  "name": "Blaupunkt",
  "slug": "blaupunkt",
  "description": "Blaupunkt Android tablet OTA images",
  "s3Prefix": "uploads/blaupunkt",
  "isActive": true,
  "createdAt": "2025-09-01T10:00:00Z",
  "userRole": "owner",
  "stats": {
    "totalFiles": 15,
    "totalSize": 7516192768,
    "memberCount": 3
  }
}
```

**Response (Error - 403)**:
```json
{
  "error": "You don't have access to this space"
}
```

---

### 5.3 File Upload (Space-Scoped)

#### POST `/api/spaces/[slug]/upload/presign`
**Purpose**: Generate pre-signed S3 URL for direct upload to a specific space

**Authentication**: Required (Session + Space membership)

**Request Body**:
```json
{
  "filename": "tablet_ota_v2.5.3.zip",
  "contentType": "application/zip",
  "fileSize": 524288000,
  "md5Hash": "5d41402abc4b2a76b9719d911017c592"
}
```

**Response (Success - 200)**:
```json
{
  "uploadUrl": "https://bucket.s3.amazonaws.com/uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip?X-Amz-...",
  "s3Key": "uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip",
  "expiresIn": 3600
}
```

**Note**: S3 key automatically includes space prefix: `uploads/{space_slug}/{timestamp}-{filename}`

**Validation Rules**:
- Filename: max 255 characters, alphanumeric + dashes/underscores
- File size: max 5GB
- Content type: application/zip, application/octet-stream, application/x-gzip
- MD5 hash: exactly 32 hexadecimal characters

---

#### POST `/api/spaces/[slug]/upload/complete`
**Purpose**: Confirm upload and save metadata to database for a specific space

**Authentication**: Required (Session + Space membership)

**Request Body**:
```json
{
  "s3Key": "uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip",
  "filename": "tablet_ota_v2.5.3.zip",
  "fileSize": 524288000,
  "contentType": "application/zip",
  "md5Hash": "5d41402abc4b2a76b9719d911017c592",
  "description": "Android 13 OTA update for Model X tablets",
  "changelog": "- Fixed WiFi connectivity\n- Updated security patches\n- Improved battery life",
  "version": "2.5.3"
}
```

**Response (Success - 201)**:
```json
{
  "id": 42,
  "message": "Upload recorded successfully",
  "upload": {
    "id": 42,
    "filename": "tablet_ota_v2.5.3.zip",
    "version": "2.5.3",
    "spaceSlug": "blaupunkt",
    "uploadedAt": "2025-10-01T10:30:00Z"
  }
}
```

**Backend Actions**:
1. Verify user has access to the space
2. Verify file exists in S3 (HEAD request)
3. Verify S3 object ETag matches provided MD5
4. Verify S3 key starts with correct space prefix
5. Insert record into database with space_id
6. Return confirmation

---

### 5.4 File Management (Space-Scoped)

#### GET `/api/spaces/[slug]/files`
**Purpose**: List all uploaded files in a specific space

**Authentication**: Required (Session + Space membership)

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page
- `search` (optional): Search in filename, description, version
- `sortBy` (optional, default: uploaded_at): Sort field
- `sortOrder` (optional, default: desc): asc | desc

**Response (Success - 200)**:
```json
{
  "space": {
    "id": 1,
    "name": "Blaupunkt",
    "slug": "blaupunkt"
  },
  "files": [
    {
      "id": 42,
      "filename": "tablet_ota_v2.5.3.zip",
      "s3Key": "uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip",
      "fileSize": 524288000,
      "md5Hash": "5d41402abc4b2a76b9719d911017c592",
      "description": "Android 13 OTA update for Model X tablets",
      "version": "2.5.3",
      "uploadedBy": {
        "id": 1,
        "username": "blaupunkt_user",
        "fullName": "Blaupunkt Partner"
      },
      "uploadedAt": "2025-10-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

#### GET `/api/spaces/[slug]/files/[id]`
**Purpose**: Get details of a specific upload in a space

**Authentication**: Required (Session + Space membership)

**Response (Success - 200)**:
```json
{
  "id": 42,
  "filename": "tablet_ota_v2.5.3.zip",
  "s3Key": "uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip",
  "fileSize": 524288000,
  "contentType": "application/zip",
  "md5Hash": "5d41402abc4b2a76b9719d911017c592",
  "description": "Android 13 OTA update for Model X tablets",
  "changelog": "- Fixed WiFi connectivity\n- Updated security patches\n- Improved battery life",
  "version": "2.5.3",
  "space": {
    "id": 1,
    "name": "Blaupunkt",
    "slug": "blaupunkt"
  },
  "uploadedBy": {
    "id": 1,
    "username": "blaupunkt_user",
    "fullName": "Blaupunkt Partner"
  },
  "uploadedAt": "2025-10-01T10:30:00Z"
}
```

---

#### GET `/api/spaces/[slug]/files/[id]/download`
**Purpose**: Generate pre-signed download URL for a file in a space

**Authentication**: Required (Session + Space membership)

**Response (Success - 200)**:
```json
{
  "downloadUrl": "https://bucket.s3.amazonaws.com/uploads/blaupunkt/1234567890-tablet_ota_v2.5.3.zip?X-Amz-...",
  "expiresIn": 3600,
  "filename": "tablet_ota_v2.5.3.zip"
}
```

---

#### DELETE `/api/spaces/[slug]/files/[id]`
**Purpose**: Delete upload record and S3 object (Owner/Admin only)

**Authentication**: Required (Session + Owner/Admin role in space)

**Response (Success - 200)**:
```json
{
  "message": "File deleted successfully"
}
```

---

## 6. Frontend Pages

### 6.1 Page: Login (`/login`)

**Purpose**: Authenticate users

**Components**:
- Company logo
- Username input field
- Password input field (masked)
- "Sign In" button
- Error message display

**Behavior**:
- On successful login: redirect to `/spaces` (space selection)
- On failed login: show error message
- Remember session (30 days)

---

### 6.2 Page: Spaces (`/spaces`)

**Purpose**: Select which space to work in

**Components**:
- Navigation bar (logo, "Spaces", logout)
- Grid of space cards
- Each card shows:
  - Space name and description
  - File count and total size
  - Role badge (Owner/Admin/Member)
  - "Open" button

**Behavior**:
- Load all user's accessible spaces
- Click card or "Open" to navigate to `/spaces/[slug]`
- Show empty state if user has no spaces

---

### 6.3 Page: Space Dashboard (`/spaces/[slug]`)

**Purpose**: Overview and navigation for a specific space

**Components**:
- Navigation breadcrumb: Spaces > [Space Name]
- Space header with name and description
- Quick stats: Total files, Total size, Members
- Action buttons: "Upload File", "View Files", "Manage Members" (if owner)
- Recent uploads list (last 5)

**Behavior**:
- Check user has access to space (or 403)
- Show space-specific content
- Quick access to common actions

---

### 6.4 Page: Upload (`/spaces/[slug]/upload`)

**Purpose**: Upload new files to a specific space

**Components**:
- Navigation breadcrumb: Spaces > [Space Name] > Upload
- Space name indicator
- File drop zone / file picker
- Metadata form:
  - Description (textarea, required)
  - Version (text input, required)
  - Changelog (textarea, required)
  - MD5 Hash (text input, auto-calculated, required)
- Upload progress bar
- Success/error notifications

**Validation**:
- User must be member of the space
- File type: .zip, .img, .bin only
- File size: max 5GB
- MD5 hash: 32 hex characters
- Description: max 1000 characters
- Version: max 50 characters
- Changelog: max 5000 characters

---

### 6.5 Page: Files List (`/spaces/[slug]/files`)

**Purpose**: View and download files in a specific space

**Components**:
- Navigation breadcrumb: Spaces > [Space Name] > Files
- Space name indicator
- Search bar
- Filters: date range, version
- Table with columns:
  - Filename
  - Version
  - Size
  - Uploaded by
  - Upload date
  - Actions (View details, Download)
- Pagination controls

**Behavior**:
- Verify user has access to space
- Load files for this space only (paginated)
- Search filters table in real-time
- Download button generates pre-signed URL

---

### 6.6 Page: File Details (`/spaces/[slug]/files/[id]`)

**Purpose**: View complete details of a specific upload

**Components**:
- Navigation breadcrumb: Spaces > [Space Name] > Files > [Filename]
- Back button
- All file metadata displayed
- Download button
- Delete button (if user is owner/admin)
- MD5 hash with copy button
- Changelog formatted with line breaks

---

### 6.7 Page: Space Members (`/spaces/[slug]/members`) (Owner/Admin only)

**Purpose**: Manage members of a space

**Components**:
- Navigation breadcrumb: Spaces > [Space Name] > Members
- "Add Member" button
- Members table:
  - Username
  - Full name
  - Email
  - Role
  - Joined date
  - Actions (Change role, Remove)

**Behavior**:
- Only accessible to space owners/admins
- List all members of the space
- Add new members by username
- Change member roles
- Remove members (except owners)

---

## 7. Security Requirements

### 7.1 Authentication & Authorization
- **Session Management**: NextAuth.js with JWT strategy
- **Session Duration**: 30 days with sliding expiration
- **Password Storage**: bcrypt hashed
- **API Protection**: All API routes protected by middleware
- **Space Access**: Verified on every request

### 7.2 S3 Security
- **Credentials**: Stored as Vercel environment variables (server-side only)
- **Pre-signed URLs**: 1-hour expiration for uploads and downloads
- **Bucket Policy**: Block public access, require authenticated requests
- **CORS Configuration**:
```json
{
  "AllowedOrigins": ["https://partner-storage.infra.sunlighten.com"],
  "AllowedMethods": ["PUT", "GET"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"]
}
```

### 7.3 File Upload Security
- **File Type Validation**: Server-side MIME type checking
- **File Size Limits**: 5GB max (enforced in pre-signed URL)
- **MD5 Verification**: Compare client-provided MD5 with S3 ETag
- **Space Isolation**: S3 keys must match space prefix

### 7.4 Database Security
- **Connection**: TLS-encrypted connection to Vercel Postgres
- **SQL Injection**: Use parameterized queries
- **Foreign Keys**: Enforce referential integrity
- **Cascade Deletes**: Clean up related records

### 7.5 Multi-Tenant Security
- **Space Access Checks**: On every API request
- **Query Filters**: Always include space_id in WHERE clauses
- **S3 Key Validation**: Verify prefix matches user's space
- **Role Verification**: Check permissions before sensitive operations

---

## 8. Environment Variables

```bash
# Database (Auto-configured by Vercel Postgres)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# AWS S3
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_REGION=us-east-1
S3_BUCKET=your-ota-bucket

# NextAuth
NEXTAUTH_URL=https://partner-storage.infra.sunlighten.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# Optional: Feature Flags
ENABLE_FILE_DELETION=true
MAX_FILE_SIZE_GB=5
```

---

## 9. File Organization

```
ota-portal/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   └── spaces/
│   │       ├── route.ts
│   │       └── [slug]/
│   │           ├── route.ts
│   │           ├── members/route.ts
│   │           ├── upload/
│   │           │   ├── presign/route.ts
│   │           │   └── complete/route.ts
│   │           └── files/
│   │               ├── route.ts
│   │               └── [id]/
│   │                   ├── route.ts
│   │                   └── download/route.ts
│   ├── login/page.tsx
│   ├── spaces/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── upload/page.tsx
│   │       ├── files/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       └── members/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SpaceCard.tsx
│   ├── FileUploader.tsx
│   ├── FileList.tsx
│   ├── Navbar.tsx
│   └── Breadcrumb.tsx
├── lib/
│   ├── db.ts
│   ├── s3.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
├── types/
│   ├── space.ts
│   ├── upload.ts
│   └── api.ts
└── middleware.ts
```

---

## 10. Implementation Phases

### Phase 1: MVP with Single Space (Week 1)
**Goal**: Basic upload and list functionality for Blaupunkt space only

**Tasks**:
1. Initialize Next.js project
2. Set up Vercel Postgres database
3. Create all database tables
4. Create initial Blaupunkt space and user
5. Implement NextAuth with database authentication
6. Build upload page with pre-signed URL flow
7. Build files list page
8. Implement download functionality
9. Deploy to Vercel

**Deliverables**:
- Working login system
- Blaupunkt user can upload files to their space
- Files stored with space prefix: `uploads/blaupunkt/`
- View and download functionality

---

### Phase 2: Multi-Space UI (Week 2)
**Goal**: Enable space selection and navigation

**Tasks**:
1. Build spaces list page
2. Build space dashboard page
3. Update all pages to be space-scoped
4. Add space access verification
5. Add breadcrumb navigation
6. Implement space isolation in queries

**Deliverables**:
- Space selection after login
- All operations are space-scoped
- Cannot access files from other spaces

---

### Phase 3: Space Management (Week 3)
**Goal**: Enable managing spaces and members

**Tasks**:
1. Create admin role
2. Build member management UI
3. Implement add/remove members
4. Implement role management
5. Add space creation (admin only)

**Deliverables**:
- Admins can create new spaces
- Owners can manage members
- Role-based permissions working

---

### Phase 4: Polish & Production (Week 4)
**Goal**: Production-ready features

**Tasks**:
1. Implement file deletion
2. Add audit logging
3. Implement rate limiting
4. Add space analytics
5. Production testing
6. Documentation

**Deliverables**:
- Complete audit trail
- Production security hardening
- User documentation

---

## 11. Key Code Examples

### 11.1 Database Client (`lib/db.ts`)

```typescript
import { sql } from '@vercel/postgres';

// Get user's accessible spaces
export async function getUserSpaces(userId: number) {
  const result = await sql`
    SELECT 
      s.id, s.name, s.slug, s.description,
      sm.role,
      COUNT(DISTINCT u.id) as file_count,
      COALESCE(SUM(u.file_size), 0) as total_size
    FROM spaces s
    JOIN space_members sm ON s.id = sm.space_id
    LEFT JOIN uploads u ON s.id = u.space_id
    WHERE sm.user_id = ${userId} AND s.is_active = true
    GROUP BY s.id, s.name, s.slug, s.description, sm.role
    ORDER BY s.name
  `;
  return result.rows;
}

// Check if user has access to space
export async function userHasSpaceAccess(
  userId: number, 
  spaceSlug: string
): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM space_members sm
    JOIN spaces s ON sm.space_id = s.id
    WHERE sm.user_id = ${userId} 
      AND s.slug = ${spaceSlug}
      AND s.is_active = true
  `;
  return result.rowCount > 0;
}

// Get user's role in space
export async function getUserSpaceRole(
  userId: number, 
  spaceSlug: string
): Promise<string | null> {
  const result = await sql`
    SELECT sm.role FROM space_members sm
    JOIN spaces s ON sm.space_id = s.id
    WHERE sm.user_id = ${userId} AND s.slug = ${spaceSlug}
  `;
  return result.rows[0]?.role || null;
}

// Get space by slug
export async function getSpaceBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM spaces WHERE slug = ${slug} AND is_active = true
  `;
  return result.rows[0] || null;
}

// Create upload with space association
export async function createUpload(data: {
  spaceId: number;
  filename: string;
  s3Key: string;
  fileSize: number;
  contentType: string;
  md5Hash: string;
  description?: string;
  changelog?: string;
  version?: string;
  uploadedBy: number;
}) {
  const result = await sql`
    INSERT INTO uploads (
      space_id, filename, s3_key, file_size, content_type, 
      md5_hash, description, changelog, version, uploaded_by
    )
    VALUES (
      ${data.spaceId}, ${data.filename}, ${data.s3Key}, 
      ${data.fileSize}, ${data.contentType}, ${data.md5Hash},
      ${data.description || null}, ${data.changelog || null}, 
      ${data.version || null}, ${data.uploadedBy}
    )
    RETURNING *
  `;
  return result.rows[0];
}

// Get uploads for a specific space
export async function getSpaceUploads(
  spaceId: number,
  params: {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT u.*, 
           users.username, users.full_name 
    FROM uploads u
    JOIN users ON u.uploaded_by = users.id
    WHERE u.space_id = $1
  `;
  const values: any[] = [spaceId];
  
  if (params.search) {
    query += ` AND (
      u.filename ILIKE ${values.length + 1} 
      OR u.description ILIKE ${values.length + 1} 
      OR u.version ILIKE ${values.length + 1}
    )`;
    values.push(`%${params.search}%`);
  }
  
  query += ` ORDER BY u.uploaded_at DESC`;
  query += ` LIMIT ${values.length + 1} OFFSET ${values.length + 2}`;
  values.push(limit, offset);
  
  const result = await sql.query(query, values);
  
  const countResult = await sql`
    SELECT COUNT(*) FROM uploads WHERE space_id = ${spaceId}
  `;
  
  return {
    uploads: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
}
```

---

### 11.2 S3 Client (`lib/s3.ts`)

```typescript
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET!;

// Generate presigned URL with space prefix
export async function generatePresignedUploadUrl(
  spaceSlug: string,
  filename: string,
  contentType: string,
  md5Hash: string
) {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // S3 key includes space prefix
  const s3Key = `uploads/${spaceSlug}/${timestamp}-${sanitizedFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
    ContentMD5: Buffer.from(md5Hash, 'hex').toString('base64'),
    Metadata: {
      'original-filename': filename,
      'upload-timestamp': timestamp.toString(),
      'space-slug': spaceSlug,
    },
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 
  });
  
  return { uploadUrl, s3Key, expiresIn: 3600 };
}

// Generate presigned download URL
export async function generatePresignedDownloadUrl(
  s3Key: string,
  filename: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Check if file exists in S3
export async function checkFileExists(s3Key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Get file metadata from S3
export async function getFileMetadata(s3Key: string) {
  const response = await s3Client.send(new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  }));
  
  return {
    contentLength: response.ContentLength,
    contentType: response.ContentType,
    etag: response.ETag?.replace(/"/g, ''),
    lastModified: response.LastModified,
    metadata: response.Metadata,
  };
}

// Verify S3 key belongs to space
export function verifyS3KeyBelongsToSpace(
  s3Key: string, 
  spaceSlug: string
): boolean {
  return s3Key.startsWith(`uploads/${spaceSlug}/`);
}

// Delete file from S3
export async function deleteFile(s3Key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  }));
}
```

---

### 11.3 NextAuth Configuration (`lib/auth.ts`)

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        // Query database for user
        const result = await sql`
          SELECT id, username, password_hash, full_name, email, role, is_active
          FROM users
          WHERE username = ${credentials.username} AND is_active = true
        `;
        
        const user = result.rows[0];
        if (!user) {
          return null;
        }
        
        // Verify password
        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        
        if (!passwordValid) {
          return null;
        }
        
        // Update last login
        await sql`
          UPDATE users 
          SET last_login = NOW() 
          WHERE id = ${user.id}
        `;
        
        return {
          id: user.id.toString(),
          name: user.full_name,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

### 11.4 Validation Schemas (`lib/validations.ts`)

```typescript
import { z } from 'zod';

export const uploadPresignSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters'),
  contentType: z.enum([
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
    'application/x-gzip',
  ]),
  fileSize: z.number()
    .min(1, 'File size must be greater than 0')
    .max(5 * 1024 * 1024 * 1024, 'File size exceeds 5GB limit'),
  md5Hash: z.string()
    .length(32, 'MD5 hash must be 32 characters')
    .regex(/^[a-f0-9]+$/, 'Invalid MD5 hash format'),
});

export const uploadCompleteSchema = z.object({
  s3Key: z.string().min(1),
  filename: z.string().min(1).max(255),
  fileSize: z.number().min(1),
  contentType: z.string(),
  md5Hash: z.string().length(32),
  description: z.string().max(1000).optional(),
  changelog: z.string().max(5000).optional(),
  version: z.string().max(50).optional(),
});
```

---

### 11.5 API Route: Presign Upload (`app/api/spaces/[slug]/upload/presign/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePresignedUploadUrl } from '@/lib/s3';
import { uploadPresignSchema } from '@/lib/validations';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const spaceSlug = params.slug;
    
    // Verify space exists
    const space = await getSpaceBySlug(spaceSlug);
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Verify user has access to space
    const hasAccess = await userHasSpaceAccess(
      parseInt(session.user.id), 
      spaceSlug
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this space" },
        { status: 403 }
      );
    }
    
    // Parse and validate request
    const body = await request.json();
    const validatedData = uploadPresignSchema.parse(body);
    
    // Generate pre-signed URL with space prefix
    const result = await generatePresignedUploadUrl(
      spaceSlug,
      validatedData.filename,
      validatedData.contentType,
      validatedData.md5Hash
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Presign error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
```

---

### 11.6 API Route: Complete Upload (`app/api/spaces/[slug]/upload/complete/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createUpload, getSpaceBySlug, userHasSpaceAccess } from '@/lib/db';
import { checkFileExists, getFileMetadata, verifyS3KeyBelongsToSpace } from '@/lib/s3';
import { uploadCompleteSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const spaceSlug = params.slug;
    
    // Verify space exists
    const space = await getSpaceBySlug(spaceSlug);
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Verify user has access
    const hasAccess = await userHasSpaceAccess(
      parseInt(session.user.id), 
      spaceSlug
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this space" },
        { status: 403 }
      );
    }
    
    // Parse and validate request
    const body = await request.json();
    const validatedData = uploadCompleteSchema.parse(body);
    
    // Verify S3 key belongs to this space
    if (!verifyS3KeyBelongsToSpace(validatedData.s3Key, spaceSlug)) {
      return NextResponse.json(
        { error: 'Invalid S3 key for this space' },
        { status: 400 }
      );
    }
    
    // Verify file exists in S3
    const fileExists = await checkFileExists(validatedData.s3Key);
    if (!fileExists) {
      return NextResponse.json(
        { error: 'File not found in S3. Upload may have failed.' },
        { status: 404 }
      );
    }
    
    // Get S3 metadata and verify MD5
    const s3Metadata = await getFileMetadata(validatedData.s3Key);
    if (s3Metadata.etag !== validatedData.md5Hash) {
      return NextResponse.json(
        { error: 'MD5 hash mismatch. File may be corrupted.' },
        { status: 400 }
      );
    }
    
    // Save to database
    const upload = await createUpload({
      spaceId: space.id,
      filename: validatedData.filename,
      s3Key: validatedData.s3Key,
      fileSize: validatedData.fileSize,
      contentType: validatedData.contentType,
      md5Hash: validatedData.md5Hash,
      description: validatedData.description,
      changelog: validatedData.changelog,
      version: validatedData.version,
      uploadedBy: parseInt(session.user.id),
    });
    
    return NextResponse.json(
      {
        message: 'Upload recorded successfully',
        upload: {
          id: upload.id,
          filename: upload.filename,
          version: upload.version,
          uploadedAt: upload.uploaded_at,
        },
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Complete upload error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
```

---

## 12. Deployment Instructions

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest ota-portal --typescript --tailwind --app --eslint
cd ota-portal
```

### Step 2: Install Dependencies

```bash
npm install next-auth @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @vercel/postgres zod bcryptjs
npm install -D @types/bcryptjs
```

### Step 3: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to vercel.com and import your repository
2. Framework Preset: Next.js (auto-detected)
3. Click "Deploy"

### Step 5: Add Vercel Postgres

1. In Vercel dashboard, go to Storage tab
2. Click "Create Database" → "Postgres"
3. Name: ota-portal-db
4. Click "Create"
5. Wait for provisioning (30 seconds)

### Step 6: Run Database Migration

In Vercel dashboard → Storage → ota-portal-db → Query tab, run:

```sql
-- Create spaces table
CREATE TABLE spaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  s3_prefix VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create space_members table
CREATE TABLE space_members (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(space_id, user_id)
);

-- Create uploads table
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  s3_key VARCHAR(512) NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  content_type VARCHAR(100),
  md5_hash VARCHAR(32) NOT NULL,
  description TEXT,
  changelog TEXT,
  version VARCHAR(50),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_spaces_slug ON spaces(slug);
CREATE INDEX idx_spaces_is_active ON spaces(is_active);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_space_members_space_id ON space_members(space_id);
CREATE INDEX idx_space_members_user_id ON space_members(user_id);
CREATE INDEX idx_uploads_space_id ON uploads(space_id);
CREATE INDEX idx_uploads_uploaded_at ON uploads(uploaded_at DESC);
CREATE INDEX idx_uploads_space_uploaded_at ON uploads(space_id, uploaded_at DESC);

-- Insert initial space
INSERT INTO spaces (name, slug, description, s3_prefix) VALUES
  ('Blaupunkt', 'blaupunkt', 'Blaupunkt Android tablet OTA images', 'uploads/blaupunkt');

-- Insert initial user (replace password hash)
-- Generate hash with: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10, (err, hash) => console.log(hash));"
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
  ('blaupunkt_user', '$2a$10$...REPLACE_WITH_ACTUAL_HASH...', 'Blaupunkt Partner', 'partner@blaupunkt.com', 'member');

-- Assign user to space
INSERT INTO space_members (space_id, user_id, role) VALUES
  (1, 1, 'owner');
```

### Step 7: Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
S3_ACCESS_KEY_ID=<your-key>
S3_SECRET_ACCESS_KEY=<your-secret>
S3_REGION=us-east-1
S3_BUCKET=<your-bucket-name>
NEXTAUTH_URL=https://partner-storage.infra.sunlighten.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
```

### Step 8: Configure S3 Bucket

**S3 Bucket CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["https://partner-storage.infra.sunlighten.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**S3 Bucket Policy (Block Public Access):**
Ensure "Block all public access" is enabled in S3 bucket settings.

### Step 9: Redeploy

After adding environment variables, redeploy from Vercel dashboard or push a new commit.

---

## 13. Testing Checklist

### Authentication
- [ ] Login with correct credentials succeeds
- [ ] Login with incorrect credentials fails
- [ ] Session persists after page refresh
- [ ] Logout clears session

### Space Access
- [ ] User sees only their assigned spaces
- [ ] Cannot access other spaces via URL manipulation
- [ ] API returns 403 for unauthorized space access

### Upload Flow
- [ ] Select space successfully
- [ ] Upload .zip file successfully
- [ ] File stored with correct S3 prefix (`uploads/{space}/`)
- [ ] Database record has correct space_id
- [ ] MD5 hash calculated correctly
- [ ] Upload progress shows correctly
- [ ] Invalid file type rejected
- [ ] File > 5GB rejected

### File Management
- [ ] Files list loads for space
- [ ] Search filters results
- [ ] Pagination works
- [ ] Download generates valid URL
- [ ] Downloaded file matches MD5
- [ ] File details page shows all metadata
- [ ] Cannot see files from other spaces

### Security
- [ ] S3 credentials not exposed in browser
- [ ] Pre-signed URLs expire after 1 hour
- [ ] Cannot upload to other space's prefix
- [ ] SQL injection attempts fail
- [ ] XSS attempts sanitized

---

## 14. Space Management Guide

### 14.1 Creating a New Space

**Via SQL:**
```sql
-- Create space
INSERT INTO spaces (name, slug, description, s3_prefix) VALUES
  ('Marketing', 'marketing', 'Marketing team assets', 'uploads/marketing')
RETURNING id;

-- Add owner
INSERT INTO space_members (space_id, user_id, role) VALUES
  (2, <user_id>, 'owner');
```

### 14.2 Adding Users to Spaces

**Create user first:**
```bash
# Generate password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10, (err, hash) => console.log(hash));"
```

**Then via SQL:**
```sql
-- Create user
INSERT INTO users (username, password_hash, full_name, email) VALUES
  ('marketing_user', '$2a$10$...', 'Marketing User', 'marketing@company.com')
RETURNING id;

-- Add to space
INSERT INTO space_members (space_id, user_id, role) VALUES
  (<space_id>, <user_id>, 'member');
```

### 14.3 Space Roles and Permissions

| Action | Member | Admin | Owner |
|--------|--------|-------|-------|
| View files | ✅ | ✅ | ✅ |
| Upload files | ✅ | ✅ | ✅ |
| Download files | ✅ | ✅ | ✅ |
| Delete files | ❌ | ✅ | ✅ |
| Add members | ❌ | ✅ | ✅ |
| Remove members | ❌ | ✅ | ✅ |
| Change roles | ❌ | ✅ | ✅ |
| Edit space settings | ❌ | ❌ | ✅ |
| Delete space | ❌ | ❌ | ✅ |

### 14.4 S3 Folder Structure

```
your-ota-bucket/
├── uploads/
│   ├── blaupunkt/
│   │   ├── 1696234567890-tablet_ota_v2.5.3.zip
│   │   ├── 1696234567891-tablet_ota_v2.5.2.zip
│   │   └── ...
│   ├── marketing/
│   │   ├── 1696234567892-campaign_assets.zip
│   │   ├── 1696234567893-brand_guidelines.pdf
│   │   └── ...
│   └── customer-support/
│       └── ...
```

---

## 15. Production Checklist

### Before Launch:
- [ ] All database tables created with indexes
- [ ] Foreign key constraints in place
- [ ] Initial spaces and users created
- [ ] Users assigned to correct spaces
- [ ] S3 bucket structure verified
- [ ] All API routes check space access
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Password hashes generated securely

### Launch Day:
- [ ] Send credentials to partners
- [ ] Provide quick start guide
- [ ] Monitor error logs
- [ ] Be available for support

### Post-Launch:
- [ ] Verify uploads going to correct S3 prefixes
- [ ] Check database records have correct space_id
- [ ] Monitor storage growth
- [ ] Gather user feedback

### Maintenance:
- [ ] Weekly: Review error logs
- [ ] Monthly: Check storage usage
- [ ] Quarterly: Rotate S3 keys
- [ ] Yearly: Update dependencies

---

## 16. FAQ

**Q: Can a user be a member of multiple spaces?**
A: Yes! Users can be members of unlimited spaces with different roles in each.

**Q: Can files be moved between spaces?**
A: Not in initial phases. This would require both S3 move and database update.

**Q: What happens if a space is deleted?**
A: All uploads, members, and S3 files in that space are deleted (CASCADE).

**Q: How do I add a new space?**
A: Via SQL (see Section 14.1) or via admin UI in Phase 3.

**Q: What's the storage limit per space?**
A: Unlimited by default. You can add quotas later.

**Q: Can I rename a space slug?**
A: Not recommended as it affects URLs and S3 paths.

**Q: What if two spaces need the same filename?**
A: No problem! Files are timestamped: `uploads/space1/123-file.zip` vs `uploads/space2/456-file.zip`

---

**END OF PRD**

This complete PRD is ready for implementation with Claude Code or Cursor!