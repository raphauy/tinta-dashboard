# PRD - Tinta Agency Form Builder

## Project Overview

**Project Name:** Tinta Agency Form Builder  
**Type:** Marketing Agency Client Management Platform  
**Based on:** RC Starter Kit v2  

## Project Description

Tinta Agency Form Builder is a specialized platform for a wine-focused marketing agency to manage client briefs and forms. The application extends the existing RC Starter Kit to provide a workspace-based system where each workspace represents a client, and agency members can create, manage, and collect client brief information through custom forms.

## Business Context

Tinta Agency specializes in wine marketing and needs an efficient way to collect detailed briefs from their clients for various services like logo design, brand development, and general design work. The platform will streamline the brief collection process by providing standardized yet customizable forms that clients can fill out without requiring agency account access.

## Existing Starter Kit Features to Maintain

- **OTP Authentication System** - For agency members
- **Workspace Management** - Repurposed as client containers
- **Role-based Access Control** - Admin and Member roles per workspace
- **Admin Panel** - For superadmin management
- **Dark Mode Support** - Full theme system
- **Email System** - For notifications
- **User Management** - For agency team members

## Core Features to Implement

### 1. Enhanced Workspace UI

#### 1.1 Client-Focused Workspace Selector
- **Location:** Top of sidebar, below title and trigger
- **Functionality:** Dropdown selector showing all workspaces accessible to the user
- **Display:** Show workspace name (client name)
- **Behavior:** 
  - Regular users see only their assigned workspaces
  - Superadmins see all workspaces/clients
  - Selection persists in session
  - Clear visual indication of currently selected client

#### 1.2 Workspace Sidebar Navigation
- **Primary Section:** Forms management
- **Structure:** Clean, organized navigation following Tinta brand guidelines
- **Integration:** Seamless integration with existing workspace layout

### 2. Form Template System

#### 2.1 Global Template Library
- **Predefined Templates:**
  - Logo Brief Template (based on Tinta_Brief_DeLogotipo.pdf)
  - Design Brief Template (based on Tinta_Brief_DeDiseño.pdf)
  - Brand Brief Template (based on Tinta_Brief_DeMarca.pdf)
- **Template Creation:**
  - Superadmins can create new global templates
  - Workspace admins can create global templates (accessible to all workspaces)
  - Templates can be created from existing forms (promote form to template)
- **Template Management:**
  - CRUD operations for templates
  - Preview functionality
  - Template versioning/updating

#### 2.2 Template-to-Form Workflow
- Select template as starting point for new form
- Customize fields, order, and content
- Save as workspace-specific form
- Maintain template independence (changes to form don't affect template)

### 3. Form Builder System

#### 3.1 Form Structure
- **Form Properties:**
  - Form name/title
  - Description/instructions
  - Workspace association (client)
  - Creation date and creator
  - Unique shareable link
  - Edit permissions (single submission vs. editable)
  - Status (active, inactive, completed)

#### 3.2 Field Types
- **Short Text:** Single-line text input
- **Long Text:** Multi-line textarea
- **File Upload:** 
  - File size limit: 10MB per file
  - Allowed types: PDF, DOC, DOCX, JPG, PNG, ZIP
  - Multiple files per field allowed
- **Field Properties:**
  - Field label
  - Help text/description
  - Required/optional flag
  - Display order (reorderable)

#### 3.3 Form Editor
- **Drag-and-drop field reordering**
- **Field management:** Add, edit, remove fields
- **Real-time preview** of form as clients will see it
- **Template integration:** Start from template or blank
- **Save and publish workflow**

### 4. Public Form Access System

#### 4.1 Unique Link Generation
- **URL Structure:** `https://dashboard.tinta.wine/f/[unique-token]`
- **Security:** Cryptographically secure tokens
- **No Authentication Required:** Public access for minimal friction
- **Mobile Responsive:** Optimized for all devices

#### 4.2 Client Form Experience
- **Branding:** Tinta Agency visual identity
- **Progress Indication:** Clear form completion status
- **File Upload Interface:** Drag-and-drop with progress indicators
- **Validation:** Real-time field validation
- **Submission Confirmation:** Clear success messaging
- **Edit Access:** Based on form settings (one-time vs. editable)

### 5. Response Management System

#### 5.1 Response Collection
- **Data Storage:** All form submissions stored securely
- **File Handling:** Uploaded files stored with proper organization
- **Submission Tracking:** Timestamp, IP (optional), completion status
- **Response Association:** Linked to specific form and workspace

#### 5.2 Response Viewing Interface
- **Workspace Dashboard:** List of forms with response counts
- **Individual Response View:** Formatted display of all submitted data
- **File Download:** Secure access to uploaded files
- **Response Export:** PDF or structured data export
- **Response Status:** New, reviewed, processed flags

### 6. Notification System

#### 6.1 Email Notifications
- **Recipients:** All workspace members + superadmins
- **Trigger:** New form submission completed
- **Content:** 
  - Client name (workspace)
  - Form name
  - Submission timestamp
  - Quick link to view response
- **Frequency:** Immediate notification per submission

### 7. Permission System Integration

#### 7.1 Role-Based Access Control
- **Superadmin:**
  - Access to all workspaces/clients
  - Create global templates
  - Manage all forms and responses
  - Full system administration

- **Workspace Admin:**
  - Create, edit, delete forms in their workspace
  - Create global templates (accessible to all workspaces)
  - View all responses for their workspace
  - Manage form sharing and permissions
  - Convert forms to templates

- **Workspace Member:**
  - Create, edit, delete forms in their workspace
  - View all responses for their workspace
  - Use existing templates

#### 7.2 Form-Level Permissions
- Form creation: Workspace members and above
- Template creation: Workspace admins and above (all templates are global)
- Response viewing: All workspace members

### 8. Design System Integration

#### 8.1 Tinta Brand Integration
- **Brand Guidelines:** Implement Tinta visual identity from `/docs/resources`
- **Color Palette:** Use Tinta brand colors
- **Typography:** Consistent with Tinta brand standards
- **Iconography:** Tinta-specific icons where applicable
- **Dark Mode:** Maintain support with Tinta brand adaptations

#### 8.2 UI/UX Consistency
- **Component Library:** Extend existing shadcn/ui components
- **Responsive Design:** Mobile-first approach
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** Fast loading times for public forms

## Technical Requirements

### Database Schema Extensions
- **Form Templates:** Global templates accessible to all workspaces
- **Forms:** Workspace-associated forms with metadata
- **Form Fields:** Flexible field definitions with ordering
- **Form Responses:** Client submissions with file associations
- **File Storage:** Secure file upload and storage system

### Integration Points
- **Existing Authentication:** Leverage NextAuth.js for agency members
- **Workspace System:** Extend existing workspace functionality
- **Email System:** Use existing Resend integration for notifications
- **File Storage:** Integrate with Vercel Blob for file uploads
- **Admin Panel:** Extend with form management capabilities

### Security Considerations
- **Public Form Access:** Secure token generation and validation
- **File Upload Security:** Type validation and size limits
- **Data Privacy:** Secure storage of client information
- **Access Control:** Proper workspace isolation

## Success Criteria

### Functional Requirements
- [ ] Agency members can create forms from templates or scratch
- [ ] Forms can be shared via unique links with external clients
- [ ] Clients can submit forms without creating accounts
- [ ] All form responses are captured and accessible to workspace members
- [ ] Email notifications work for new submissions
- [ ] File uploads are properly handled and stored
- [ ] Workspace selector provides easy client switching

### Performance Requirements
- [ ] Public forms load in under 2 seconds
- [ ] File uploads handle up to 10MB efficiently
- [ ] Form builder interface is responsive and intuitive
- [ ] Mobile form completion experience is seamless

### Security Requirements
- [ ] Form links are cryptographically secure
- [ ] Uploaded files are properly validated
- [ ] Workspace data isolation is maintained
- [ ] No unauthorized access to client information

## Future Considerations
- Analytics and reporting on form completion rates
- Advanced field types (signatures, dates, ratings)
- Form branching and conditional logic
- Integration with external design tools
- Client portal access for reviewing submissions

## Resources
- **Brand Guidelines:** `/docs/resources/` (Tinta manual de marca)
- **Existing Templates:** 
  - `/docs/resources/Tinta_Brief_DeLogotipo.pdf`
  - `/docs/resources/Tinta_Brief_DeDiseño.pdf`
  - `/docs/resources/Tinta_Brief_DeMarca.pdf`
- **Starter Kit Reference:** RC Starter Kit v2 README.md