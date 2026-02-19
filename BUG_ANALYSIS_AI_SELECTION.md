# Bug Report: AI Selecting First Items Instead of Most Relevant

**Issue ID:** #AI-SELECTION-RELEVANCE-001  
**Reported:** February 19, 2026  
**Severity:** High  
**Status:** Identified - Fix in progress

---

## Problem Description

When generating resumes, the AI is selecting the first 2-3 items from the profile (projects, experiences, certifications) instead of selecting the **most relevant** items based on the job description.

**Example:**

- User has 4 projects: Project 1, Project 2, Project 3, Project 4
- Job description requires skills matching Project 3 and Project 4
- **Expected:** AI selects Project 3 and Project 4 (most relevant)
- **Actual:** AI selects Project 1 and Project 2 (first in list)

---

## Root Cause Analysis

### Issue 1: Database Ordering (Backend)

**File:** `resume-builder/backend/src/routes/resume.routes.ts` (Lines 48-55)

```typescript
const profile = await prisma.profile.findUnique({
  where: { userId },
  include: {
    experiences: { orderBy: { startDate: "desc" } }, // ✅ Ordered
    education: { orderBy: { endDate: "desc" } }, // ✅ Ordered
    skills: true, // ❌ NOT ordered
    projects: true, // ❌ NOT ordered
    certifications: true, // ❌ NOT ordered
  },
});
```

**Problem:**

- Projects, skills, and certifications have NO explicit ordering
- Database returns them in insertion order (or undefined order)
- So the AI receives them in whatever order they were created, NOT by relevance or recency

### Issue 2: Weak AI Prompt (Backend)

**File:** `resume-builder/backend/src/services/gemini.service.ts` (Lines 320-335)

```typescript
INSTRUCTIONS:
1. **CONTENT VOLUME**: If the candidate has many experiences,
   you MUST limit them to the 3 most relevant ones...     // ✅ Says "most relevant"

4. **SKILLS**: Group into max 5 categories with 4-5 skills each.  // ❌ No mention of relevance
5. **PROJECTS**: Max 2 projects with 2 bullets each.              // ❌ No mention of relevance
6. **EDUCATION**: Concise 1-line per degree.                      // ❌ No mention of relevance
```

**Problem:**

- For **experiences**: Prompt explicitly says "3 most relevant ones" ✅
- For **projects**: Just says "Max 2 projects" - no emphasis on selecting by relevance ❌
- For **skills**: Says "Group into max 5 categories" - no selection guidance ❌
- For **certifications**: No instruction at all ❌

**Result:**
When Gemini sees "Max 2 projects" without explicit relevance instruction, combined with projects arriving in database insertion order, it likely just takes the first 2 it encounters rather than analyzing all 4 and selecting the best match.

---

## Impact

**User Experience:** High negative impact

- Resumes don't match job descriptions well
- Less relevant content is shown
- ATS scores are artificially lowered
- Users have to manually reorder items in their profile to get desired results

**Workaround (Current):**
Users must manually reorder their profile items (move most relevant to top) before generating each resume - this defeats the purpose of AI selection!

---

## Proposed Solution

### Fix 1: Add Database Ordering (Quick Win)

**File:** `resume-builder/backend/src/routes/resume.routes.ts`

```typescript
const profile = await prisma.profile.findUnique({
  where: { userId },
  include: {
    experiences: { orderBy: { startDate: "desc" } }, // ✅ Already ordered
    education: { orderBy: { endDate: "desc" } }, // ✅ Already ordered
    skills: { orderBy: { createdAt: "desc" } }, // ✅ ADD: Most recent first
    projects: { orderBy: { createdAt: "desc" } }, // ✅ ADD: Most recent first
    certifications: { orderBy: { createdAt: "desc" } }, // ✅ ADD: Most recent first
  },
});
```

**Benefit:**

- At minimum, most recent items are prioritized
- Better than random/insertion order
- Doesn't fix AI selection but improves default behavior

### Fix 2: Strengthen AI Prompt (Critical)

**File:** `resume-builder/backend/src/services/gemini.service.ts`

**Before:**

```typescript
4. **SKILLS**: Group into max 5 categories with 4-5 skills each.
5. **PROJECTS**: Max 2 projects with 2 bullets each.
```

**After:**

```typescript
4. **SKILLS**: Select ONLY the skills most relevant to the job description.
   Group into max 5 categories with 4-5 skills each. Prioritize required skills
   from the JD: ${jobAnalysis.requiredSkills.join(", ")}.

5. **PROJECTS**: Select the 2 MOST RELEVANT projects based on the job description.
   Prioritize projects that demonstrate required skills and technologies.
   Include 2 bullets each highlighting achievements with metrics.

6. **CERTIFICATIONS**: If the candidate has certifications, include ONLY those
   relevant to the job description (max 3).
```

**Key Changes:**

- ✅ Explicitly say "MOST RELEVANT" for every section
- ✅ Reference the job description explicitly
- ✅ Mention the extracted required skills
- ✅ Add stronger selection criteria

### Fix 3: Add Selection Emphasis to Prompt Header

**File:** `resume-builder/backend/src/services/gemini.service.ts` (After line 318)

**Add this before INSTRUCTIONS section:**

```typescript
**CRITICAL SELECTION RULE:**
The candidate has provided ALL their experiences, projects, skills, and certifications.
You MUST analyze the job description and SELECT ONLY the items that are MOST RELEVANT.

For each section:
- EXPERIENCES: Choose the 3 most relevant roles that match the job requirements
- PROJECTS: Choose the 2 most relevant projects that demonstrate required skills
- SKILLS: Include ONLY skills mentioned in or relevant to the job description
- CERTIFICATIONS: Include ONLY certifications that strengthen the application

DO NOT simply take the first N items. ANALYZE for relevance and select accordingly.
```

---

## Testing Plan

**Test Case 1: Projects Selection**

1. Create profile with 4 projects:
   - Project A: E-commerce (React, Node.js)
   - Project B: Mobile App (React Native, Firebase)
   - Project C: ML Pipeline (Python, TensorFlow, AWS)
   - Project D: DevOps Tool (Docker, Kubernetes, CI/CD)

2. Generate resume with JD requiring: "Python, Machine Learning, AWS, TensorFlow"

3. **Expected:** Resume shows Project C (ML Pipeline) - most relevant
4. **Verify:** AI doesn't just pick first 2 (Project A & B)

**Test Case 2: Skills Selection**

1. Create profile with 20+ skills across multiple categories
2. Generate resume with JD requiring specific 5-7 skills
3. **Expected:** Resume prioritizes those 5-7 skills
4. **Verify:** Don't just get first N skills alphabetically

**Test Case 3: Multiple Resumes**

1. Generate Resume A with Backend JD (Node.js, PostgreSQL, Docker)
2. Generate Resume B with ML JD (Python, TensorFlow, Pandas)
3. Generate Resume C with Frontend JD (React, TypeScript, CSS)
4. **Verify:** Each resume shows different relevant projects/skills

---

## Implementation Priority

**P0 (Critical - Implement immediately):**

- Fix 2: Strengthen AI prompt with explicit relevance instructions
- Fix 3: Add selection emphasis header

**P1 (High - Implement same session):**

- Fix 1: Add database ordering for projects/skills/certifications

**P2 (Medium - Future enhancement):**

- Consider adding relevance scoring logic before passing to AI
- Add user-facing "pin" feature to force certain items in resume

---

## Files to Modify

1. `resume-builder/backend/src/routes/resume.routes.ts` (Line ~50, ~425)
   - Add orderBy to projects, skills, certifications queries

2. `resume-builder/backend/src/services/gemini.service.ts` (Line ~318-335)
   - Strengthen prompt with relevance emphasis
   - Add explicit selection instructions for all sections

---

## Estimated Effort

- Analysis: ✅ Done (30 minutes)
- Implementation: 30 minutes
- Testing: 20 minutes
- Total: ~1.5 hours

---

## Next Steps

1. ✅ Create bug report (done)
2. ⏳ Implement Fix 1 (database ordering)
3. ⏳ Implement Fix 2 & 3 (prompt strengthening)
4. ⏳ Test with multiple scenarios
5. ⏳ Commit and document fix
6. ⏳ User verification testing
