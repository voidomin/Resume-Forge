# Bug Report: Regenerate Button Using Wrong Job Description

**Date:** February 19, 2026  
**Reporter:** User  
**Severity:** High  
**Status:** Under Investigation

---

## Issue Description

When clicking the "Regenerate" button on a resume, the system generates the resume using the **most recent job description** from any resume generation session, instead of using the **original job description** that was used to create that specific resume.

### Expected Behavior
1. User creates Resume A with Job Description A
2. User creates Resume B with Job Description B  
3. User navigates back to Resume A and clicks "Regenerate"
4. System should regenerate Resume A using **Job Description A** (the original)

### Actual Behavior
1. User creates Resume A with Job Description A
2. User creates Resume B with Job Description B
3. User navigates back to Resume A and clicks "Regenerate"  
4. System regenerates Resume A using **Job Description B** (the latest one used)

---

## Root Cause Analysis

### Data Flow Examination

#### 1. **Database Schema** ✅ CORRECT
```prisma
model Resume {
  id               String
  jobDescription   String?  // Stores the original JD per resume
  // ... other fields
}
```
- Each resume has its own `jobDescription` field
- Job descriptions are stored independently per resume

#### 2. **Resume Creation** ✅ CORRECT
```typescript
// backend/src/routes/resume.routes.ts (line 117-126)
const resume = await prisma.resume.create({
  data: {
    userId,
    name: targetRole || generatedResume.contactInfo.name + " Resume",
    jobDescription,      // ✅ Original JD is saved
    targetRole,
    generatedContent: JSON.stringify(generatedResume),
    atsScore: generatedResume.atsScore,
  },
});
```
- Original job description IS being saved correctly during resume creation

#### 3. **Resume Retrieval** ✅ CORRECT
```typescript
// backend/src/routes/resume.routes.ts (line 186-223)
server.get<{ Params: { id: string } }>(
  "/:id",
  async (request, reply) => {
    const resume = await prisma.resume.findUnique({ where: { id } });
    return reply.send({
      resume: {
        ...resume,    // ✅ Includes jobDescription from DB
        content,
      },
      atsReport,
    });
  }
);
```
- The GET endpoint returns the correct `jobDescription` for the specific resume

#### 4. **Frontend State Management** ✅ CORRECT (Mostly)
```typescript
// frontend/src/pages/ResumeView.tsx (line 79-104)
const { id } = useParams<{ id: string }>();
const [resume, setResume] = useState<Resume | null>(null);

useEffect(() => {
  fetchResume();
}, [id]);  // ✅ Refetches when id changes

const fetchResume = async () => {
  const response = await api.get(`/resumes/${id}`);
  setResume(response.data.resume);  // ✅ Sets resume with correct JD
};
```
- Component fetches the resume data when `id` changes
- Resume state should contain the correct job description

#### 5. **Regenerate Handler** ✅ CORRECT
```typescript
// frontend/src/pages/ResumeView.tsx (line 173-189)
const handleRegenerate = async () => {
  if (!id || !resume?.jobDescription) return;

  const response = await api.post(`/resumes/${id}/regenerate`, {
    jobDescription: resume.jobDescription,  // ✅ Sends stored JD
  });
  
  setResume({
    ...resume,
    content: response.data.content,
  });
};
```
- Uses `resume.jobDescription` from state
- Should be the correct JD if state is properly set

#### 6. **Backend Regenerate Endpoint** ⚠️ POTENTIAL ISSUE
```typescript
// backend/src/routes/resume.routes.ts (line 390-500)
server.post("/:id/regenerate", async (request, reply) => {
  const { jobDescription } = request.body;
  const existingResume = await prisma.resume.findUnique({ where: { id } });
  
  const jd = jobDescription || existingResume.jobDescription;  // ✅ Fallback logic correct
  
  // Generate new resume with jd
  const generatedResume = await geminiService.generateOptimizedResume(profileData, jd);
  
  // ⚠️ UPDATES the jobDescription in database
  await prisma.resume.update({
    where: { id },
    data: {
      jobDescription: jd,              // ⚠️ Overwrites original JD
      generatedContent: JSON.stringify(generatedResume),
      atsScore: generatedResume.atsScore,
    },
  });
});
```

**KEY FINDING:** The regenerate endpoint **updates** the `jobDescription` field in the database. If the wrong JD is sent from the frontend, it will permanently overwrite the original JD!

---

## Possible Bug Scenarios

### Scenario 1: React State Not Updating (Most Likely)
**Hypothesis:** When navigating between resumes, React state might not be properly cleared/reset between navigation.

**Test Case:**
1. Open Resume A (JD = "Software Engineer at Google")
2. Navigate to Dashboard
3. Open Resume B (JD = "Data Scientist at Meta")
4. Click Back button to Resume A
5. Click Regenerate
6. **Check:** Is `resume.jobDescription` in state pointing to Resume A's JD or Resume B's JD?

**Potential Cause:**
- `useEffect` dependency array might be missing something
- React Router might not be properly unmounting/remounting component
- Stale closure capturing old state

### Scenario 2: Browser Back/Forward Navigation
**Hypothesis:** Using browser back/forward buttons might cause React Router to not update the `id` param properly.

**Test Case:**
1. Generate Resume A with JD A
2. Generate Resume B with JD B
3. Use browser back button to go to Resume A
4. Click Regenerate
5. **Check:** Does URL param `id` match Resume A's ID?

### Scenario 3: Race Condition (Less Likely)
**Hypothesis:** If user navigates quickly between resumes, the fetch request might complete out of order.

**Test Case:**
1. Open Resume A
2. Immediately navigate to Resume B before Resume A fully loads
3. Navigate back to Resume A
4. Click Regenerate

### Scenario 4: Multiple Tabs/Windows
**Hypothesis:** Having multiple tabs open with different resumes might cause cross-contamination.

**Test Case:**
1. Open Resume A in Tab 1
2. Open Resume B in Tab 2
3. Go back to Tab 1 and click Regenerate

---

## Debugging Steps Needed

### 1. Add Console Logging
Add debug logs to track state changes:

```typescript
// In ResumeView.tsx
useEffect(() => {
  console.log('🔍 ResumeView - ID changed to:', id);
  fetchResume();
}, [id]);

const fetchResume = async () => {
  console.log('📥 Fetching resume with ID:', id);
  const response = await api.get(`/resumes/${id}`);
  console.log('📦 Fetched resume:', response.data.resume.id);
  console.log('📄 Job Description:', response.data.resume.jobDescription?.substring(0, 100));
  setResume(response.data.resume);
};

const handleRegenerate = async () => {
  console.log('🔄 Regenerating resume ID:', id);
  console.log('📄 Using JD:', resume?.jobDescription?.substring(0, 100));
  // ... rest of code
};
```

### 2. Check useEffect Dependencies
The current useEffect only depends on `[id]`. Consider if it should also include `fetchResume`:

```typescript
// Current (might cause issues if fetchResume changes)
useEffect(() => {
  fetchResume();
}, [id]);

// Better (using useCallback)
const fetchResume = useCallback(async () => {
  // ... fetch logic
}, [id]);

useEffect(() => {
  fetchResume();
}, [fetchResume]);
```

### 3. Add Loading State Guards
Ensure regenerate can't be called with stale data:

```typescript
const handleRegenerate = async () => {
  if (!id || !resume?.jobDescription) {
    console.error('❌ Cannot regenerate: missing data', { id, hasResume: !!resume, hasJD: !!resume?.jobDescription });
    return;
  }
  
  if (resume.id !== id) {
    console.error('❌ State mismatch: resume.id !== URL id', { resumeId: resume.id, urlId: id });
    return;
  }
  
  // ... rest of regenerate logic
};
```

### 4. Test Network Requests
Use browser DevTools Network tab to verify:
- GET `/resumes/:id` returns correct `jobDescription` for each resume
- POST `/resumes/:id/regenerate` sends correct `jobDescription` in request body
- Compare the `id` in URL with the `id` in API requests

---

## Recommended Fixes

### Fix 1: Add State Validation (Immediate)
```typescript
const handleRegenerate = async () => {
  if (!id || !resume?.jobDescription) return;
  
  // ✅ Validate state matches URL
  if (resume.id !== id) {
    toast.error("State mismatch - refreshing...");
    await fetchResume();
    return;
  }

  setRegenerating(true);
  try {
    const response = await api.post(`/resumes/${id}/regenerate`, {
      jobDescription: resume.jobDescription,
    });
    // ... rest of code
  }
};
```

### Fix 2: Reset State on Navigation (Recommended)
```typescript
useEffect(() => {
  setResume(null);  // ✅ Clear state immediately when id changes
  setLoading(true);
  fetchResume();
}, [id]);
```

### Fix 3: Use useCallback for fetchResume (Best Practice)
```typescript
const fetchResume = useCallback(async () => {
  try {
    setLoading(true);
    const response = await api.get(`/resumes/${id}`);
    setResume(response.data.resume);
    setAtsReport(response.data.atsReport || null);
  } catch (error) {
    toast.error("Failed to load resume");
    navigate("/dashboard");
  } finally {
    setLoading(false);
  }
}, [id, navigate]);

useEffect(() => {
  fetchResume();
}, [fetchResume]);
```

### Fix 4: Add Resume ID to Interface (Defensive)
Ensure the resume state always includes its ID:
```typescript
interface Resume {
  id: string;  // ✅ Already exists
  // ... other fields
}

// In handleRegenerate, double-check
const handleRegenerate = async () => {
  if (!id || !resume?.id || resume.id !== id) {
    await fetchResume();  // Force refresh if mismatch
    return;
  }
  // ... rest of code
};
```

### Fix 5: Don't Update jobDescription on Regenerate (Backend)
**Question:** Should regenerate update the `jobDescription` field in the database?

**Current Behavior:** It overwrites the original JD with whatever is sent
**Proposed Behavior:** Only update `generatedContent` and `atsScore`, keep original `jobDescription`

```typescript
// backend/src/routes/resume.routes.ts
await prisma.resume.update({
  where: { id },
  data: {
    // ❌ REMOVE: jobDescription: jd,  // Don't overwrite original
    generatedContent: JSON.stringify(generatedResume),  // ✅ Update content
    atsScore: generatedResume.atsScore,                 // ✅ Update score
  },
});
```

This way, even if wrong JD is sent, it won't corrupt the database.

---

## Testing Plan

1. **Manual Testing:**
   - Create 3 resumes with distinct job descriptions
   - Navigate between them using:
     - Dashboard links
     - Browser back/forward
     - Direct URL changes
   - Click regenerate on each and verify correct JD is used

2. **Log Analysis:**
   - Add console logs as described above
   - Capture logs during navigation between resumes
   - Verify state updates correctly

3. **Network Inspection:**
   - Monitor Network tab during regenerate
   - Verify POST body contains correct `jobDescription`
   - Check if request `id` matches URL `id`

4. **Edge Cases:**
   - Test with multiple browser tabs open
   - Test rapid navigation (click-click-click)
   - Test with slow network (throttle to 3G)

---

## Impact Assessment

**User Impact:** High  
- Users lose their original job descriptions when regenerating
- Regenerated resumes don't match the intended job posting
- Data corruption in database (original JD is overwritten)

**Data Integrity:** Critical  
- Once JD is overwritten, original is lost permanently
- No way to recover unless backups exist

**Priority:** P0 - Should be fixed immediately

---

## Next Steps

1. ✅ Create this bug report
2. ⏳ Add debug logging to ResumeView component
3. ⏳ Reproduce the bug with specific test case
4. ⏳ Identify exact root cause (state management vs backend)
5. ⏳ Implement Fix 2 + Fix 3 (Reset state + useCallback)
6. ⏳ Implement Fix 5 (Don't overwrite JD in database)
7. ⏳ Test all fixes
8. ⏳ Deploy to production

---

## Additional Notes

- Consider adding a "Job Description" field to the UI showing what JD was used
- Consider adding an "Edit Job Description" feature before regenerating
- Consider showing a confirmation dialog: "Regenerate with original JD: [truncated JD]?"
- Add analytics to track how often regenerate is used

