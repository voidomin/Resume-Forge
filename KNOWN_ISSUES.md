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

**Status:** None identified

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
