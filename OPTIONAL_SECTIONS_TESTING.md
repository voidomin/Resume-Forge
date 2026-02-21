# Optional Sections Testing Guide

## Overview

This document provides a comprehensive testing guide for the new Optional Sections feature (Coursework, Leadership, Awards) added to the Resume Forge application.

## Feature Summary

### What's New

- **Coursework Section**: Add relevant courses with topic and institution
- **Leadership Section**: Add leadership roles with dates, location, and description
- **Awards Section**: Add honors and awards with organization and description
- **AI Relevance Scoring**: Each section is scored (0-100) and included only if relevant to job description
  - Coursework: Include if score ≥ 60
  - Leadership: Include if score ≥ 70
  - Awards: Include if score ≥ 75

### Database

- **Tables Created**: `Coursework`, `Leadership`, `Award`
- **Relationships**: One-to-Many with Profile (cascade delete)
- **Migration**: `20260219144317_add_optional_sections` applied successfully

### Backend APIs

#### Coursework Endpoints

- `POST /profile/coursework` - Add coursework entry
- `PUT /profile/coursework/:id` - Update coursework entry
- `DELETE /profile/coursework/:id` - Delete coursework entry

#### Leadership Endpoints

- `POST /profile/leadership` - Add leadership role
- `PUT /profile/leadership/:id` - Update leadership role
- `DELETE /profile/leadership/:id` - Delete leadership role

#### Awards Endpoints

- `POST /profile/awards` - Add award
- `PUT /profile/awards/:id` - Update award
- `DELETE /profile/awards/:id` - Delete award

### Frontend UI

- **Tabs**: Three new tabs in ProfileEdit component
  - "Coursework" tab
  - "Leadership" tab
  - "Awards" tab
- **Features**:
  - Collapsible accordion-style forms
  - Add/Delete buttons for each entry
  - Save buttons with loading states
  - Visual empty states with guidance

### AI Scoring

- **Prompt Updated**: Explicit scoring instructions for each optional section
- **Scoring Logic**:
  - Coursework: Matches keywords between topics and JD (max 15pts per keyword)
  - Leadership: Evaluates relevance of titles/descriptions (leadership keywords boost score)
  - Awards: Prestige weighting + domain relevance (20pt base high prestige + keywords)
- **Logging**: DEBUG messages show scores including emoji indicators
  - 🎓 Coursework Score (WARN level - highly visible)
  - 📊 Leadership Score (DEBUG level)
  - 🏆 Awards Score (DEBUG level)

### Resume Templates

- **All 4 Templates Updated**: Modern, Standard, Executive, Minimalist
- **Conditional Rendering**: Sections only show if AI includes them
- **Styling**: Consistent with existing template design
- **Placement**: After education section (per Option B design)

## Testing Procedures

### Test 1: Database Layer

#### Prerequisites

- PostgreSQL running in Docker
- Backend listening on port 3000

#### Steps

1. Verify database tables exist
   ```sql
   SELECT * FROM "Coursework" LIMIT 5;
   SELECT * FROM "Leadership" LIMIT 5;
   SELECT * FROM "Award" LIMIT 5;
   ```
2. Verify foreign keys and relationships
   ```sql
   SELECT constraint_name FROM information_schema.table_constraints
   WHERE table_name='Coursework' AND constraint_type='FOREIGN KEY';
   ```

#### Expected Result

- ✅ All 3 tables present with correct columns
- ✅ Foreign key constraints established
- ✅ createdAt/updatedAt timestamps working

---

### Test 2: API Endpoints

#### Prerequisites

- Backend running on `http://localhost:3000`
- Authenticated user with profile created

#### Test 2.1: Add Coursework

```bash
curl -X POST http://localhost:3000/profile/coursework \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Machine Learning Fundamentals",
    "topic": "AI/Machine Learning",
    "institution": "Stanford University"
  }'
```

**Expected Response**:

- ✅ Status 201 Created
- ✅ Returns created coursework object with ID
- ✅ Includes timestamps

#### Test 2.2: Add Leadership

```bash
curl -X POST http://localhost:3000/profile/leadership \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Technical Lead",
    "organization": "Acme Corp",
    "location": "San Francisco, CA",
    "startDate": "2023-01",
    "endDate": "2024-12",
    "current": false,
    "description": "Led team of 5 engineers, managed 3 major projects"
  }'
```

**Expected Response**:

- ✅ Status 201 Created
- ✅ Returns created leadership object with ID

#### Test 2.3: Add Award

```bash
curl -X POST http://localhost:3000/profile/awards \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "awardName": "Best Developer Award",
    "organization": "Tech Conference 2024",
    "awardDate": "2024-06",
    "description": "Recognized for outstanding contributions to open source"
  }'
```

**Expected Response**:

- ✅ Status 201 Created
- ✅ Returns created award object with ID

#### Test 2.4: GET Profile (includes optional sections)

```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response**:

- ✅ Returns profile with coursework array
- ✅ Returns profile with leadership array
- ✅ Returns profile with awards array
- ✅ Arrays contain all added entries

---

### Test 3: Frontend UI

#### Prerequisites

- Frontend running on `http://localhost:5175`
- User logged in
- Profile exists

#### Test 3.1: Load and Display Optional Sections

**Steps**:

1. Navigate to Profile Edit page
2. Click "Coursework" tab
3. Verify empty state shows (if no coursework added)
4. Click "Leadership" tab
5. Verify empty state shows (if no leadership added)
6. Click "Awards" tab
7. Verify empty state shows (if no awards added)

**Expected Result**:

- ✅ All 3 tabs present in tab bar
- ✅ Each tab shows empty state with guidance text
- ✅ All form fields render correctly when expanded

#### Test 3.2: Add Coursework Entry

**Steps**:

1. Click "Coursework" tab
2. Click "Add Coursework" button
3. Enter:
   - Course Name: "Machine Learning Fundamentals"
   - Topic: "AI/ML"
   - Institution: "Stanford"
4. Click "Save Coursework" button
5. Observe loading state
6. Wait for success toast

**Expected Result**:

- ✅ Entry appears in accordion
- ✅ Save button shows Loader2 spinner during save
- ✅ Success toast appears: "Coursework saved!"
- ✅ Form data persists

#### Test 3.3: Edit and Delete Coursework

**Steps**:

1. In coursework entry, expand accordion
2. Change course name
3. Click the delete (trash) button
4. Observe entry is removed from UI

**Expected Result**:

- ✅ Changes update in real-time
- ✅ Delete button removes entry from array
- ✅ Next save deletes from database

#### Test 3.4: Add Leadership Role

**Steps**:

1. Click "Leadership" tab
2. Click "Add Leadership Role"
3. Enter:
   - Title: "Technical Lead"
   - Organization: "Tech Company"
   - Location: "SF, CA"
   - Start Date: "2023-01"
   - End Date: "2024-12"
   - Current: unchecked
   - Description: "Led engineering team"
4. Click "Save Leadership" button

**Expected Result**:

- ✅ "Currently in this role" checkbox works
- ✅ When checked, end date becomes disabled
- ✅ Entry saved successfully with all fields
- ✅ Success toast shows

#### Test 3.5: Add Award

**Steps**:

1. Click "Awards" tab
2. Click "Add Award"
3. Enter:
   - Award Name: "Best Employee"
   - Organization: "Company Inc"
   - Date: "2024-06"
   - Description: "Recognized for excellence"
4. Click "Save Awards" button

**Expected Result**:

- ✅ All fields saved correctly
- ✅ Success toast shows

---

### Test 4: Data Persistence

#### Steps\*\*:

1. Add coursework, leadership, and awards entries (via UI or API)
2. Refresh page (Ctrl+R)
3. Navigate to Profile Edit
4. Check each tab

**Expected Result**:

- ✅ Coursework entries loaded and displayed
- ✅ Leadership entries loaded and displayed
- ✅ Awards entries loaded and displayed
- ✅ All fields populated correctly

---

### Test 5: Resume Generation with Scoring

#### Prerequisites

- Optional sections saved to profile
- Backend logging enabled

#### Steps\*\*:

1. Go to Resume Generator
2. Paste a Job Description that includes AI/ML keywords
3. Click "Generate Resume"
4. Check backend logs

**Expected Logs**:

```
🎓 COURSEWORK SCORE: 65/100 (INCLUDED)
📊 Leadership Score: 72/100 (INCLUDED)
🏆 Awards Score: 78/100 (INCLUDED)
Optional sections summary: Coursework=3, Leadership=2, Awards=1
```

**Expected Result**:

- ✅ Resume generates successfully
- ✅ Scoring logs appear with emoji indicators
- ✅ Log levels correct (WARN for coursework, DEBUG for others)
- ✅ Scores reflect job description relevance

#### Test 5.2: Verify Resume Rendering

**Steps**:

1. View generated PDF
2. Check that sections appear in resume
3. Verify formatting matches template

**Expected Result**:

- ✅ Coursework section visible (if score ≥ 60)
- ✅ Leadership section visible (if score ≥ 70)
- ✅ Awards section visible (if score ≥ 75)
- ✅ Sections styled consistently
- ✅ Sections positioned after education

#### Test 5.3: Margin and Font Constraints

**Steps**:

1. Generate resume with large amount of optional content
2. View PDF
3. Verify layout fits on one page

**Expected Result**:

- ✅ Minimum font size: 11pt
- ✅ Minimum margins: 28pt
- ✅ Content still fits on one A4 page
- ✅ No text overflow or cutoff

---

### Test 6: Error Handling

#### Test 6.1: Missing Required Fields

**Steps**:

1. Click Coursework tab
2. Add entry but leave Course Name empty
3. Click Save

**Expected Result**:

- ✅ Backend validates and returns 400 error
- ✅ Frontend shows error toast
- ✅ No silent failures

#### Test 6.2: Invalid Dates

**Steps**:

1. Click Leadership tab
2. Add entry with end date before start date
3. Click Save

**Expected Result**:

- ✅ Backend or frontend validates order
- ✅ Appropriate error message shown
- ✅ No data corruption

#### Test 6.3: Delete and Re-save

**Steps**:

1. Add 3 coursework entries
2. Delete middle entry
3. Click Save
4. Refresh page

**Expected Result**:

- ✅ Only 2 entries remain
- ✅ Middle entry is gone from database
- ✅ Other entries preserved

---

### Test 7: Template Rendering

#### Test 7.1: Modern Template

**Steps**:

1. Generate resume with Modern template
2. Verify optional sections render correctly

**Expected Style**:

- Coursework: Clean bullet style
- Leadership: Role | Org | Location format
- Awards: Award name with org and date

#### Test 7.2: Standard Template

**Expected Style**:

- Compact bullet-based rendering
- Inline course information
- Consistent spacing

#### Test 7.3: Executive Template

**Expected Style**:

- High-level professional layout
- Prestige-focused
- Centered or balanced layout

#### Test 7.4: Minimalist Template

**Expected Style**:

- Em-dash separators
- Minimal styling
- Clean, simple presentation

---

## Known Limitations

1. **Frontend API calls**: Currently uses simple delete-then-post pattern
   - Could be optimized with batch endpoints
   - Currently works but makes multiple requests

2. **UI/UX Enhancements** (Future):
   - Drag-to-reorder entries
   - Bulk import from external sources
   - Template-specific constraints

3. **Validation** (Current):
   - Basic field validation
   - Could add date range validation
   - Could validate coursework topics against predefined list

---

## Debugging

### Check Backend Logs

```bash
# Look for optional sections scoring logs
docker logs resume_builder_api | grep -E "COURSEWORK|Leadership|Awards"
```

### Check API Route

```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <TOKEN>" | jq '.profile.coursework'
```

### Check Frontend State

1. Open browser DevTools (F12)
2. Go to React DevTools tab
3. Search for ProfileEdit component
4. Inspect props to verify state

---

## Success Criteria

- ✅ All 3 API endpoints working (POST, PUT, DELETE)
- ✅ Frontend UI loads, saves, and deletes correctly
- ✅ Data persists across page refreshes
- ✅ Resume generation includes scoring logs
- ✅ Optional sections render in all 4 templates
- ✅ Sections only show if score meets threshold
- ✅ Final layout respects margin and font constraints
- ✅ All builds pass without errors
- ✅ Components integrated with existing profile system

---

## Deployment Checklist

- [ ] All tests pass
- [ ] Backend builds successfully: `npm run build`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Environment variables set (DATABASE_URL, GEMINI_API_KEY)
- [ ] Logs configured for production
- [ ] Performance tested with large datasets
- [ ] Cross-browser testing completed
- [ ] Security review passed
- [ ] Documentation updated
