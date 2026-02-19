# Optional Sections - Quick Reference & Testing Checklist

## Quick Links

- 🔗 Frontend: http://localhost:5175
- 🔗 Backend: http://localhost:3000
- 📚 Full Testing Guide: [OPTIONAL_SECTIONS_TESTING.md](OPTIONAL_SECTIONS_TESTING.md)
- 📋 Session Summary: [OPTIONAL_SECTIONS_SESSION_SUMMARY.md](OPTIONAL_SECTIONS_SESSION_SUMMARY.md)

---

## 5-Minute Feature Overview

### What Was Built

Three new resume sections with AI relevance scoring:

- **Coursework**: Relevant courses (score ≥ 60)
- **Leadership**: Leadership roles (score ≥ 70)
- **Awards**: Honors and awards (score ≥ 75)

### Key Enhancements

✅ **Scoring**: Explicit AI scoring logic with transparency logging
✅ **Backend**: New API endpoints for create/read/update/delete operations
✅ **Frontend**: New UI tabs with save/load functionality
✅ **Persistence**: Data survives page refreshes
✅ **Logging**: Score visibility with emoji indicators

---

## API Quick Reference

### Coursework Endpoints

```bash
# Add coursework
POST /profile/coursework
Header: Authorization: Bearer <TOKEN>
Body: { courseName, topic, institution }

# List coursework (in GET /profile)
GET /profile

# Delete coursework
DELETE /profile/coursework/{id}
```

### Leadership Endpoints

```bash
# Add leadership role
POST /profile/leadership
Body: { title, organization, location, startDate, endDate, current, description }

# Delete leadership
DELETE /profile/leadership/{id}
```

### Awards Endpoints

```bash
# Add award
POST /profile/awards
Body: { awardName, organization, awardDate, description }

# Delete award
DELETE /profile/awards/{id}
```

---

## Frontend Quick Test

### Path to Test Optional Sections

1. Go to http://localhost:5175
2. Login with test account
3. Click "Profile" → "Edit Profile"
4. Look for three new tabs: **Coursework**, **Leadership**, **Awards**
5. Try adding entries and clicking Save

### Expected Behavior

- ✅ UI responds to clicks
- ✅ Save button shows spinner
- ✅ Success toast appears
- ✅ Data persists on refresh

---

## Backend Scoring Logs

### Where to Find Logs

```bash
# Watch backend console (already running on port 3000)
[Look for messages like these when generating resume]
```

### Score Log Format

```
🎓 COURSEWORK SCORE: 65/100 (INCLUDED)
📊 Leadership Score: 72/100 (INCLUDED)
🏆 Awards Score: 78/100 (INCLUDED)
Optional sections summary: Coursework=3, Leadership=2, Awards=1
```

### Log Levels

- 🎓 Coursework: **WARN** level (highly visible)
- 📊 Leadership: **DEBUG** level (development)
- 🏆 Awards: **DEBUG** level (development)

---

## Testing Checklist

### ✅ Pre-Test Checks

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5175
- [ ] PostgreSQL running in Docker
- [ ] Browser opened to http://localhost:5175
- [ ] User is logged in

### ✅ Coursework Testing

- [ ] Click "Coursework" tab
- [ ] Click "Add Coursework" button
- [ ] Fill in: Course Name, Topic, Institution
- [ ] Click "Save Coursework"
- [ ] Verify success toast
- [ ] Refresh page - data persists
- [ ] Delete entry - works
- [ ] Re-save - works

### ✅ Leadership Testing

- [ ] Click "Leadership" tab
- [ ] Click "Add Leadership Role"
- [ ] Fill in all fields
- [ ] Test "Current role" checkbox (hides end date)
- [ ] Click "Save Leadership"
- [ ] Verify persist after refresh
- [ ] Delete works
- [ ] Re-save works

### ✅ Awards Testing

- [ ] Click "Awards" tab
- [ ] Click "Add Award"
- [ ] Fill in all fields
- [ ] Click "Save Awards"
- [ ] Verify persist
- [ ] Delete works
- [ ] Re-save works

### ✅ Resume Generation Testing

- [ ] Add some coursework, leadership, awards to profile
- [ ] Go to Resume Generator
- [ ] Paste a job description
- [ ] Click "Generate Resume"
- [ ] Watch backend logs for scores
- [ ] Download PDF
- [ ] Verify sections appear in PDF
- [ ] Verify scoring meets thresholds

### ✅ Error Handling Testing

- [ ] Try to add entry with missing fields (should error)
- [ ] Try invalid dates (should error)
- [ ] Check error toast appears
- [ ] Verify data not corrupted

---

## Scoring Thresholds Reference

| Section    | Threshold | Emoji | Log Level |
| ---------- | --------- | ----- | --------- |
| Coursework | ≥ 60      | 🎓    | WARN      |
| Leadership | ≥ 70      | 📊    | DEBUG     |
| Awards     | ≥ 75      | 🏆    | DEBUG     |

**Scores Below Threshold**: Section excluded from resume

---

## Code Files Modified

### Backend

- `resume-builder/backend/src/services/gemini.service.ts` (Scoring + Logging)

### Frontend

- `resume-builder/frontend/src/pages/ProfileEdit.tsx` (Save/Load + UI)

### Documentation

- `OPTIONAL_SECTIONS_TESTING.md` (7 test scenarios)
- `OPTIONAL_SECTIONS_SESSION_SUMMARY.md` (Session overview)
- `OPTIONAL_SECTIONS_QUICK_REFERENCE.md` (This file!)

---

## Git Commits in This Session

```
afbb6af - docs: add comprehensive testing and session summary documentation
61b766f - feat: implement save/load functionality for optional sections
44858f9 - feat: add scoring logic and logging for optional sections
```

---

## Common Issues & Solutions

### Issue: "Save" button not responding

**Solution**:

- Check backend console for errors
- Verify authentication token is valid
- Check browser console (F12) for network errors

### Issue: Data not persisting after refresh

**Solution**:

- Verify database connection (check logs)
- Check Network tab in DevTools for failed requests
- Verify POST/DELETE operations succeeded

### Issue: No score logs appearing

**Solution**:

- When generating resume, add optional sections to profile first
- Check backend console log level (may be DEBUG)
- Verify Gemini API responses include scores

### Issue: Scores showing 0/100

**Solution**:

- Job description may not match profiles
- Check Gemini API connectivity
- Verify optional sections data is complete

---

## Debug Commands

### Check if services running

```bash
# Backend
curl http://localhost:3000/health

# Frontend (in browser)
curl http://localhost:5175
```

### View database tables

```bash
# Connect to PostgreSQL and run
SELECT * FROM "Coursework" LIMIT 5;
SELECT * FROM "Leadership" LIMIT 5;
SELECT * FROM "Award" LIMIT 5;
```

### Test API endpoint

```bash
curl -X POST http://localhost:3000/profile/coursework \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"courseName":"Test","topic":"Testing","institution":"Test U"}'
```

---

## Success Indicators

✅ All three optional sections working
✅ Save/load functionality responsive
✅ Data persists across sessions
✅ Score logs visible during generation
✅ Sections render in resume PDF
✅ No TypeScript errors
✅ No console errors
✅ All 4 templates handle optional content

---

## Next Steps After Testing

1. **If all tests pass**: Feature is production-ready for merge
2. **If issues found**: Check full testing guide for resolution steps
3. **If edge cases**: Document and create issues for future sprints
4. **Deployment**: Create deployment checklist from SESSION_SUMMARY

---

## Support Resources

📚 **Full Testing Guide**: [OPTIONAL_SECTIONS_TESTING.md](OPTIONAL_SECTIONS_TESTING.md)
📋 **Session Summary**: [OPTIONAL_SECTIONS_SESSION_SUMMARY.md](OPTIONAL_SECTIONS_SESSION_SUMMARY.md)
🔧 **Main Documentation**: Check `/docs` folder for architecture and design

---

**Status**: ✅ Ready for Testing
**Last Updated**: February 19, 2025
**Commits**: 3 total (2 feature + 1 documentation)
