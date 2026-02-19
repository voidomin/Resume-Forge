# Known Issues

This document tracks bugs and issues reported by users during testing and production use of SmartResume Builder v1.0.0.

**Last Updated:** February 14, 2026  
**Version:** v1.0.0

---

## How to Report Issues

If you encounter any bugs or issues:

1. **Check this document** to see if the issue is already known
2. **Search GitHub Issues** at [github.com/voidomin/Resume-Forge/issues](https://github.com/voidomin/Resume-Forge/issues)
3. **Open a new issue** if your problem isn't listed, including:
   - Clear description of the problem
   - Steps to reproduce
   - Expected behavior vs. actual behavior
   - Your environment (browser, OS, device)
   - Screenshots or error messages if applicable

---

## Issue Priority Levels

- **Critical** 🔴 - Blocks core functionality, data loss, security vulnerabilities
- **High** 🟠 - Major feature broken, significant UX degradation
- **Medium** 🟡 - Feature partially working, moderate UX issues
- **Low** 🟢 - Minor cosmetic issues, nice-to-have improvements

---

## Critical Issues 🔴

**Status:** None identified

---

## High Priority Issues 🟠

**Status:** None currently open

### [RESOLVED] [AI Selecting First Items Instead of Most Relevant]

**Issue ID:** #AI-SELECTION-RELEVANCE-001  
**Reported:** 2026-02-19  
**Resolved:** 2026-02-19  
**Priority:** High  
**Status:** ✅ **RESOLVED** - Fixed in develop
**Affected Version:** v1.0.0
**Fixed In:** develop branch (pending v1.0.1 release)

**Description:**
When generating resumes, the AI was selecting the first 2-3 items from the profile (projects, experiences, skills, certifications) instead of selecting the most relevant items based on the job description.

**Root Causes:**
1. **Database ordering:** Projects, skills, and certifications had no explicit ordering, so they arrived in random/insertion order
2. **Weak AI prompt:** Instructions said "Max 2 projects" without emphasizing relevance selection

**Resolution:**
- **Backend Fix 1:** Added database ordering (`createdAt DESC`) for skills, projects, and certifications
- **Backend Fix 2:** Strengthened AI prompt with explicit "SELECT MOST RELEVANT" instructions for all sections
- **Backend Fix 3:** Added prominent "CRITICAL SELECTION RULE" header to prompt emphasizing intelligent selection over taking first N items

**Files Changed:**
- `backend/src/routes/resume.routes.ts` - Added orderBy for skills, projects, certifications (2 locations)
- `backend/src/services/gemini.service.ts` - Strengthened prompt with relevance emphasis

**Impact:**
- AI now intelligently selects most relevant experiences, projects, skills, and certifications
- Resumes better match job descriptions
- Higher ATS scores
- Better user experience

---

### [RESOLVED] [Regenerate Button Using Wrong Job Description]

**Issue ID:** #REGENERATE-JD-BUG-001  
**Reported:** 2026-02-19  
**Resolved:** 2026-02-19  
**Priority:** High (P0)  
**Status:** ✅ **RESOLVED** - Fixed in develop
**Affected Version:** v1.0.0
**Fixed In:** develop branch (pending v1.0.1 release)

**Description:**
When clicking the "Regenerate" button on a resume, the system was generating the resume using the most recent job description from any resume generation session, instead of using the original job description that was saved with that specific resume. This caused:

- Wrong content regeneration (resume matched wrong job posting)
- Data corruption (original job description was permanently overwritten)
- Loss of original job description with no recovery option

**Root Causes:**

1. **Backend:** The regenerate endpoint was overwriting the `jobDescription` field in the database, corrupting the original data
2. **Frontend:** React state management wasn't properly resetting when navigating between resumes, causing stale job descriptions to be sent

**Resolution:**

- **Backend Fix:** Modified regenerate endpoint to preserve original `jobDescription` field - only updates `generatedContent` and `atsScore`
- **Frontend Fix 1:** Added state reset on navigation to prevent stale data
- **Frontend Fix 2:** Implemented `useCallback` for proper dependency management
- **Frontend Fix 3:** Added state validation guard to detect and prevent mismatches between URL and state

**Files Changed:**

- `backend/src/routes/resume.routes.ts` - Removed jobDescription overwrite in update
- `frontend/src/pages/ResumeView.tsx` - Added useCallback, state reset, validation guards

**Testing:**

- ✅ Navigate between multiple resumes and verify correct JD is used
- ✅ Use browser back/forward and verify state updates correctly
- ✅ Rapid navigation doesn't cause race conditions
- ✅ Original job description is preserved after regeneration

---

### [RESOLVED] [Template Inconsistency: Preview vs Downloaded Files]

**Issue ID:** #TEMPLATE-CONSISTENCY-001  
**Reported:** 2026-02-18  
**Resolved:** 2026-02-19
**Priority:** High  
**Status:** ✅ **RESOLVED** - Merged to develop
**Affected Version:** v1.0.0
**Fixed In:** develop branch (pending v1.0.1 release)

**Resolution:**
Created unified design system and proper spacing calculations across all template renderers:

- Created `resume-builder/shared/design-system.ts` - single source of truth for all design tokens
- Created `resume-builder/shared/unit-converters.ts` - proper unit conversion utilities
- Updated all 4 PDF renderers (Modern, Standard, Executive, Minimalist) to use unified system
- Updated DOCX service to use unified system
- Fixed spacing calculations with proper `moveDownPoints()` helper
- Updated Modern template frontend component

All templates now render consistently across preview, PDF, and DOCX formats.

**Testing Completed:**

- ✅ Modern template: Preview = PDF = DOCX
- ✅ Standard template: Preview = PDF = DOCX
- ✅ Executive template: Preview = PDF = DOCX
- ✅ Minimalist template: Preview = PDF = DOCX

**Description:**
Significant visual inconsistencies exist between the frontend resume preview and the downloaded PDF/DOCX files. Users see one design and formatting in the browser preview, but the downloaded files have different fonts, spacing, sizes, and layouts. This affects **ALL templates** (Modern, Standard, Executive, Minimalist).

**Steps to Reproduce:**

1. Create or view any resume
2. Observe the preview in browser
3. Download as PDF
4. Download as DOCX
5. Compare all three versions

**Expected Behavior:**

- Frontend preview should match PDF download exactly
- PDF and DOCX downloads should have identical layouts
- Font sizes, spacing, and positioning should be consistent
- What You See Is What You Get (WYSIWYG)

**Actual Behavior:**

- Different fonts: Frontend uses Inter/Arial, PDF uses Helvetica, DOCX uses Times New Roman
- Different font sizes: Frontend uses pt units, PDF uses scaled values, DOCX uses half-points
- Different spacing: CSS pixels vs PDFKit moveDown() vs DOCX twips
- Different layouts: Flexbox vs sequential positioning vs Word flow
- Text wraps at different points causing layout shifts

**Root Causes:**

1. **Font inconsistencies** across rendering engines
2. **Font size unit differences** (pt vs scaled pt vs half-points)
3. **Spacing system differences** (pixels vs document points vs twips)
4. **Layout system differences** (CSS flexbox vs PDF positioning vs DOCX flow)
5. **No shared design system** between frontend and backend
6. **Different scaling algorithms** for content overflow

**Environment:**

- All browsers
- All devices
- All templates affected

**Impact:**

- User confusion and frustration
- Loss of trust in preview accuracy
- Potential resume formatting issues for job applications
- Professional appearance compromised

**Implementation Plan:**
See [TEMPLATE_CONSISTENCY_FIX_PLAN.md](TEMPLATE_CONSISTENCY_FIX_PLAN.md) for comprehensive solution.

**Key Solutions:**

1. Create unified design system shared across frontend/backend
2. Standardize font to Arial/Helvetica across all formats
3. Convert all measurements to consistent pt-based system
4. Implement visual regression testing
5. Add "Download Preview" mode showing exact PDF styling
6. Create template consistency validation tests

**Quick Wins:**

- Phase 1: Standardize fonts to Arial/Helvetica ✅
- Phase 2: Fix font size units (all use base pt) ✅
- Phase 3: Align spacing values ✅
- Phase 4: Add basic consistency tests ✅

**Workaround:**
Currently, users should download and review the actual PDF/DOCX files before using them for applications, rather than relying solely on the preview.

**Assignee:** To be assigned  
**Target Version:** v1.1.0  
**Estimated Effort:** 2-3 weeks  
**Related Files:**

- Frontend: `resume-builder/frontend/src/components/Resume/templates/*.tsx`
- Backend PDF: `resume-builder/backend/src/services/templates/*.ts`
- Backend DOCX: `resume-builder/backend/src/services/docx.service.ts`

---

## Medium Priority Issues 🟡

### [Missing "Forgot Password" Feature]

**Issue ID:** #TBD  
**Reported:** 2026-02-15  
**Priority:** Medium  
**Status:** Open  
**Affected Version:** v1.0.0

**Description:**
Users have no way to recover their account if they forget their password. The login page does not have a "Forgot Password" link or functionality.

**Steps to Reproduce:**

1. Go to login page
2. Look for "Forgot Password" option
3. Option does not exist

**Expected Behavior:**

- "Forgot Password" link on login page
- Password reset flow via email
- Secure token-based password reset

**Actual Behavior:**
No password recovery mechanism exists. Users who forget their password cannot access their account.

**Environment:**

- All browsers
- All devices

**Implementation Requirements:**

- Email service integration (e.g., SendGrid, AWS SES, Resend)
- Password reset token generation and validation
- Reset password form
- Email template for password reset link
- Token expiration (e.g., 1 hour)

**Workaround:**
For now, users can create a new account if they forget their password. No data migration available.

**Assignee:** Unassigned  
**Target Version:** v1.1.0

---

## Low Priority Issues 🟢

**Status:** None identified

---

## Fixed in Upcoming Releases

### Planned for v1.1.0

- Password reset functionality (Forgot Password feature)
- Additional improvements based on user feedback

---

## Won't Fix / By Design

**Status:** None

---

## Issue Template

When adding issues to this document, use this format:

```markdown
### [Issue Title]

**Issue ID:** #XXX (if GitHub issue exists)  
**Reported:** YYYY-MM-DD  
**Priority:** Critical/High/Medium/Low  
**Status:** Open/In Progress/Testing/Fixed  
**Affected Version:** v1.0.0

**Description:**
[Clear description of the issue]

**Steps to Reproduce:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**

- Browser: [e.g., Chrome 98, Firefox 96]
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Device: [e.g., Desktop, iPhone 13, Samsung Galaxy S21]

**Workaround:**
[If any workaround exists]

**Assignee:** [Name or unassigned]  
**Target Version:** [e.g., v1.1.0]
```

---

## Notes

- This document is maintained alongside CHANGELOG.md
- Fixed issues will be moved to CHANGELOG.md under the appropriate version
- Critical and high-priority issues will be addressed in patch releases (v1.0.x)
- Medium and low-priority issues will be batched into minor releases (v1.1.0, v1.2.0)

---

**Project Status:** ✅ Production v1.0.0 - Stable  
**Next Release:** v1.1.0 (Bug fixes based on user feedback)

For real-time bug reports and discussions, visit:  
🐛 [GitHub Issues](https://github.com/voidomin/Resume-Forge/issues)
