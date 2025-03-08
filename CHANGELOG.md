# Changelog

## [Unreleased]

### Enhanced
- **Avatar Component**: 
  - Added size variants (sm, md, lg, xl) using class-variance-authority
  - Made alt prop required for AvatarImage for better accessibility
  - Added text-muted-foreground to AvatarFallback for better contrast
  - Added proper TypeScript interfaces for props
  - Maintained compatibility with existing usage patterns

- **Button Component**:
  - Added an orange variant specifically for primary actions
  - Added a loading state with spinner using Lucide's Loader2 icon
  - Added a rounded variant to support both rounded-md and rounded-full
  - Added a fullWidth variant for buttons that need to span the container
  - Ensured consistent border-radius across size variants
  - Added aria-busy attribute for better accessibility during loading states
  - Fixed inconsistent padding in size variants

- **Card Component**:
  - Added variants for different card styles (default, bordered, elevated)
  - Added size variants for different card sizes
  - Added proper role attribute for better accessibility
  - Fixed type mismatch in CardTitle
  - Added hover effects for elevated cards
  - Added text-lg to CardTitle for better readability
  - Added justify-between to CardFooter for better layout
  - Used class-variance-authority for consistent variant handling

- **Dropdown Menu Component**:
  - Changed cursor-default to cursor-pointer for interactive elements
  - Added explicit focus ring to DropdownMenuTrigger for better keyboard focus visibility
  - Added orange highlight for CheckIcon and DotFilledIcon to match design system
  - Added text-foreground to DropdownMenuLabel for better contrast
  - Added text-muted-foreground to DropdownMenuShortcut for better contrast
  - Added aria-hidden="true" to DropdownMenuShortcut for accessibility
  - Added data-[state=open]:text-accent-foreground to SubTrigger for better state indication

- **Input Component**:
  - Added error state styling and aria-invalid attribute
  - Added size variants (default, sm, lg)
  - Added variants for different input styles (default, outline, filled)
  - Added rounded variants (default, full)
  - Added prefix and suffix support for icons or text
  - Improved file input styling
  - Used class-variance-authority for consistent variant handling
  - Wrapped input in a div to support prefix/suffix

- **Label Component**:
  - Added size variants (default, sm, lg)
  - Added an error state variant
  - Added a required indicator option
  - Used class-variance-authority for consistent variant handling
  - Added proper interface for the Label component props

- **Radio Group Component**:
  - Replaced CheckIcon with a more traditional circular radio indicator
  - Added size variants (sm, default, lg) for different radio button sizes
  - Added an orange variant to match the design system
  - Added a RadioGroupItemText component for better label association
  - Added support for horizontal layout with the orientation prop
  - Used class-variance-authority for consistent variant handling
  - Added proper TypeScript interfaces for props

- **Alert Dialog Component**:
  - Added size variants (default, sm, lg, xl, full)
  - Changed the default action button to use orange variant
  - Added proper TypeScript interface for the AlertDialogContent props
  - Maintained all existing accessibility features and animations

- **Alert Component**:
  - Added more variant options (success, warning, info, orange)
  - Added size variants (default, sm, lg)
  - Added aria-live attribute for better accessibility with dynamic alerts
  - Added an optional close button with onClose prop
  - Enhanced color contrast for all variants in both light and dark modes
  - Added proper TypeScript interface for the Alert component props

- **Dialog Component**:
  - Added size variants (default, sm, lg, xl, full)
  - Added a fullWidth prop for dialogs that need to span the container
  - Changed the default close button to use orange variant
  - Added proper TypeScript interface for the DialogContent props
  - Maintained all existing accessibility features and animations

- **Progress Component**:
  - Added size variants (sm, default, lg, xl) for different progress bar heights
  - Added color variants (default, orange, success, info, warning, destructive)
  - Added indeterminate state for loading without a specific value
  - Added aria-label and aria-valuetext for better accessibility
  - Added a label option and showValueLabel for displaying the progress value
  - Added smooth animation for progress value changes
  - Used class-variance-authority for consistent variant handling
  - Added proper TypeScript interface for the Progress component props

- **Skeleton Component**:
  - Added shape variants (text, heading, avatar, button, card, circle)
  - Added size variants (sm, md, lg, xl, full)
  - Added color variants (default, orange, muted)
  - Added animation variants (pulse, shimmer, none)
  - Added proper accessibility attributes (role, aria-label, aria-live)
  - Added a count prop for rendering multiple skeletons with a gap
  - Added compound variants for common combinations
  - Added screen reader text for better accessibility
  - Used class-variance-authority for consistent variant handling
  - Added proper TypeScript interface for the Skeleton component props

- **Sonner Component**:
  - Added custom styling for different toast types (success, error, warning, info, orange)
  - Added a custom toast function with better TypeScript typing
  - Added icon support for different toast types
  - Added customization options for toast position and close button
  - Added proper accessibility through the underlying Sonner component
  - Added title and description support for better toast structure
  - Added action and cancel button support
  - Added proper TypeScript interfaces for the Toaster component props

- **Table Component**:
  - Added variants for different table styles (default, bordered, striped)
  - Added size variants for different table sizes (default, sm, lg)
  - Added proper accessibility attributes for sortable columns
  - Added a sticky header option for large tables
  - Added a hover effect option for rows
  - Added a selected state for rows
  - Added a loading state for tables with skeleton placeholders
  - Used class-variance-authority for consistent variant handling
  - Added proper TypeScript interfaces for all component props
  - Added sortable column support with visual indicators

- **Tooltip Component**:
  - Added variants for different tooltip styles (default, orange, muted)
  - Added size variants for different tooltip sizes (default, sm, lg)
  - Added explicit side, align, sideOffset, and alignOffset props for better positioning
  - Added a maxWidth prop for controlling tooltip width
  - Added a showArrow prop for toggling the arrow visibility
  - Added a delayDuration prop for controlling the delay before showing the tooltip
  - Used class-variance-authority for consistent variant handling
  - Added proper TypeScript interfaces for all component props
  - Improved arrow styling to match the tooltip variant

- **Login Component**:
  - Redesigned using Shadcn UI Card components for a cleaner, more modern look
  - Added first_name and last_name fields for the signup mode
  - Improved accessibility with proper aria attributes (aria-describedby, aria-busy, role="alert")
  - Enhanced form validation with updated Zod schema
  - Added responsive grid layout for name fields
  - Added Terms of Service and Privacy Policy links
  - Maintained compatibility with existing authentication flow
  - Improved error message display and form field association

- **User Profile Component**:
  - Enhanced the General Settings page with comprehensive user profile fields
  - Added first_name and last_name fields in a responsive two-column layout
  - Added avatar_url field for profile image management
  - Added phone_number and telegram_username fields for additional contact information
  - Implemented responsive grid layouts for better organization of related fields
  - Maintained consistent styling with existing form elements
  - Ensured proper form validation with Zod schema
  - Added proper error handling and success messaging

- **Settings Page**:
  - Added a new Organization Information card to display organization details
  - Enhanced the Team Subscription section with additional customer information
  - Simplified the Team Members section to focus on the team owner
  - Removed team member removal functionality for cleaner UI
  - Maintained the team invitation functionality
  - Improved layout and information hierarchy
  - Added date formatting for better readability
  - Ensured consistent styling with the rest of the application

- **Dashboard Navigation**:
  - Added new navigation links for Organization, Bots, and Workflows
  - Implemented appropriate icons for each new navigation item
  - Added descriptive tooltips for better user guidance
  - Included placeholder for future role-based access control
  - Ensured mobile responsiveness in the Dialog-based mobile menu
  - Maintained consistent styling with existing navigation items
  - Used the orange variant for active links and ghost variant for inactive links

- **Utils**:
  - Enhanced `cn` function with comprehensive JSDoc documentation
  - Added explicit return type for better type safety
  - Added detailed examples covering basic usage, conditional classes, conflict resolution, arbitrary values, and complex variants
  - Ensured proper handling of Tailwind CSS edge cases
  - Added unit tests to verify correct functionality
  - Verified tests pass successfully with all test cases

- **CSS Tooling**:
  - Updated global CSS to use Tailwind CSS v4 directives
  - Replaced `@tailwind base` with `@import "tailwindcss/preflight"`
  - Removed deprecated `@tailwind components` directive
  - Added comprehensive Stylelint configuration for Tailwind CSS
  - Configured VS Code settings for optimal CSS linting
  - Added clear semantic comments for color variables
  - Organized CSS variables with consistent naming patterns
  - Added success, warning, and info color variables

- **Tailwind Configuration**:
  - Created comprehensive tailwind.config.ts with proper TypeScript typing
  - Added extended color palette including success, warning, and info colors
  - Added chart colors for data visualization components
  - Added sidebar-specific color variables for consistent sidebar styling
  - Configured proper border radius system with sm, md, lg, and xl variants
  - Added animation keyframes and utilities for UI interactions
  - Ensured complete alignment between CSS variables and Tailwind theme
  - Optimized content paths to include all component and utility files
  - Fixed darkMode configuration to use string format instead of array for Tailwind v4 compatibility
  - Updated components.json to reference the tailwind.config.ts file for shadcn/ui integration

### Added
- **Theme Provider**:
  - Added a theme provider component using next-themes
  - Implemented system theme detection and preference
  - Added support for light and dark mode
  - Added suppressHydrationWarning to prevent flashing during page load

- **Testing Infrastructure**:
  - Added Jest configuration for unit testing
  - Set up testing environment with jest-environment-jsdom
  - Added test for the `cn` utility function to verify class merging behavior
  - Added npm scripts for running tests (`test` and `test:watch`)
  - Added TypeScript support for Jest with proper type definitions
  - Created Jest-specific TypeScript configuration
  - Added global type declarations for Jest
  - Verified all tests pass successfully

- **Development Tooling**:
  - Added Stylelint for CSS linting with Tailwind CSS support
  - Configured VS Code for optimal CSS development
  - Added Tailwind CSS IntelliSense extension support
  - Added npm script for CSS linting (`lint:css`)
  - Created common-typescript-errors.md to document and solve common TypeScript issues

- **User Schema Extensions**:
  - Added new fields to the user schema for enhanced profile information
  - Implemented firstName and lastName fields for better name handling
  - Added avatarUrl field for profile images
  - Added phoneNumber field for contact information
  - Added telegramUsername field for additional contact options
  - Added organizationId, roleId, and teamId fields for improved user organization management
  - Updated database schema and TypeScript types to reflect these changes
  - Ensured backward compatibility with existing code

- **Navigation Structure**:
  - Added new sections for Organization, Bots, and Workflows management
  - Prepared foundation for role-based access control with commented code
  - Added appropriate icons from Lucide React library
  - Included helpful tooltips with descriptive text for each navigation item

- **Supabase Auth Integration**:
  - Integrated Supabase Authentication for user management
  - Updated schema to use integer IDs for users instead of UUIDs
  - Modified database queries to work with Supabase Auth
  - Added proper type definitions for Supabase database
  - Updated cookie handling in Supabase client for Next.js compatibility
  - Added CSP configuration to allow Supabase scripts and connections
  - Implemented email lookup for user identification instead of direct ID matching

### Updated
- **Root Layout**:
  - Integrated the Toaster component with improved positioning
  - Added theme provider for consistent theming across the application
  - Updated font from Manrope to Inter for better readability
  - Updated metadata with new title and description

- **Dashboard Layout**:
  - Enhanced mobile navigation with Dialog component
  - Added tooltips to navigation items for better context
  - Used orange variant for active navigation items
  - Added descriptive tooltips for each navigation item
  - Improved visual hierarchy with consistent styling
  - Added new navigation links for Organization, Bots, and Workflows
  - Implemented placeholder for future role-based access control

- **Dashboard Parent Layout**:
  - Completely redesigned with modern UI components
  - Added a responsive header with logo and navigation
  - Added theme toggle with tooltip for switching between light and dark modes
  - Added user dropdown menu with profile, settings, and logout options
  - Added mobile-friendly navigation using Dialog component
  - Improved accessibility with proper ARIA attributes and keyboard navigation
  - Added dark mode support with appropriate styling

- **Authentication Flow**:
  - Updated sign-up schema to include optional first_name and last_name fields
  - Enhanced user creation process to handle new fields
  - Improved form validation with more descriptive error messages
  - Maintained backward compatibility with existing authentication system
  - Added proper field validation and error handling

- **Account Management**:
  - Enhanced the updateAccount action to support new user profile fields
  - Updated Zod validation schema to include new fields with proper validation rules
  - Improved error handling with more specific error messages
  - Added support for optional fields with proper null handling
  - Maintained backward compatibility with existing account management features

- **Team Management**:
  - Simplified the team members display to focus on the team owner
  - Removed the team member removal functionality
  - Maintained the team invitation system
  - Added organization information display
  - Enhanced subscription information with additional details
  - Improved the overall layout and information hierarchy

### Fixed
- **Database Schema Compatibility**:
  - Fixed foreign key constraints between users and related tables
  - Updated column types from text/varchar to more appropriate types
  - Ensured consistent ID types across related tables
  - Resolved type mismatches between Supabase Auth and database schema

- **Authentication Flow**:
  - Fixed user creation process to work with Supabase Auth
  - Updated sign-in and sign-up functions to use Supabase client
  - Resolved cookie handling issues with Next.js and Supabase
  - Fixed activity logging to work with numeric user IDs

## [0.1.0] - 2025-03-07

### Fixed

#### Database Connection Issues
- Fixed the database host: Updated the `POSTGRES_HOST` in both `.env` and `.env.local` to use the correct Supabase database host format: `db.xxxxx.supabase.co`.
- Improved SSL configuration: Modified the SSL configuration in both `drizzle.ts` and `drizzle.config.ts` to handle self-signed certificates by setting `rejectUnauthorized: false`.
- Enhanced environment variable loading: Updated both `drizzle.ts` and `drizzle.config.ts` to load environment variables from both `.env` and `.env.local` files, with `.env.local` taking precedence.

#### TypeScript Errors
- Fixed TypeScript errors in `seed.ts` by properly typing the `db` variable in `drizzle.ts`.
- Added proper type definitions for the database client and connection.

#### Seed Script Improvements
- Made the seed script more robust: Modified the seed script to check if users and teams already exist before trying to create them, preventing duplicate key errors.
- Added Stripe error handling: Added error handling for Stripe API calls in the seed script to gracefully handle missing or invalid API keys.

### Summary
These changes have successfully fixed the database connection issues, and both the migration and seed scripts are now working correctly. The TypeScript errors have also been resolved, providing better type safety and IDE support. 