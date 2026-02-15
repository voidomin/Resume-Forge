# GitHub Branch Protection Setup Guide

This guide provides step-by-step instructions for setting up branch protection on the `main` branch to prevent accidental changes and enforce code review workflows.

**⚠️ Note:** GitHub now uses **Rulesets** (the modern interface) for branch protection. Instructions for both the new Rulesets interface and the legacy Branch protection rules are provided below.

---

## Why Branch Protection?

Branch protection ensures:
- ✅ No direct commits to `main` (all changes go through PR review)
- ✅ Code review requirements before merging
- ✅ Test status checks (if CI/CD is configured)
- ✅ Protection against force pushes and branch deletion
- ✅ Quality control and collaboration standards

---

## Method 1: Rulesets (Recommended - Modern Interface)

GitHub's newer Rulesets interface provides more flexibility and better organization.

### Step 1: Navigate to Rulesets

1. Go to your GitHub repository: [https://github.com/voidomin/Resume-Forge](https://github.com/voidomin/Resume-Forge)
2. Click on **Settings** (top navigation bar)
3. In the left sidebar under "Code and automation", click on **Rulesets**

### Step 2: Create New Ruleset

1. Click **New branch ruleset** button
2. You'll see a form with multiple sections

### Step 3: Configure Ruleset

#### Ruleset Name
```
main
```

#### Enforcement Status
Select: **Active** (not "Disabled" or "Evaluate")

#### Bypass List (Optional)
- **Recommended:** Leave empty for strictest protection
- **Alternative:** Add your username if you need emergency override capability
  - Click "Add bypass"
  - Select your username or team

#### Target Branches
Click **Add target** and configure:
- Select **Include by pattern**
- Enter pattern: `main`
- Or check **Include default branch** checkbox

#### Rules (Check These Boxes)

**Essential Protection Rules:**

✅ **Restrict deletions**
   - Prevents accidental branch deletion

✅ **Block force pushes**
   - Prevents rewriting git history

✅ **Require linear history**
   - Prevents merge commits, keeps clean history

✅ **Require a pull request before merging**
   - Ensures all changes go through PR workflow
   - After checking this, set:
     - **Required approvals:** `1`
     - ☑ **Dismiss stale pull request approvals when new commits are pushed**
     - ☑ **Require review from Code Owners** (if you add CODEOWNERS file later)

**Optional (Enable Later):**

⬜ **Require status checks to pass**
   - Enable when you set up CI/CD (GitHub Actions)

⬜ **Require signed commits**
   - Extra security if you use GPG signing

⬜ **Require deployments to succeed**
   - If you set up deployment previews

**Skip These:**

⬜ **Restrict creations** - Not needed
⬜ **Restrict updates** - Not needed
⬜ **Require code scanning results** - Add later if needed
⬜ **Automatically request Copilot code review** - Optional

### Step 4: Save the Ruleset

1. Scroll to the top or bottom of the page
2. Click **Create** button (green button)
3. Your ruleset is now active!

### Quick Checklist

```
☑ Ruleset Name: "main"
☑ Enforcement: Active
☑ Target branches: "main" (or default branch)
☑ Restrict deletions: ENABLED
☑ Block force pushes: ENABLED
☑ Require linear history: ENABLED
☑ Require pull request: ENABLED
  ↳ Required approvals: 1
  ↳ Dismiss stale approvals: ENABLED
☑ Bypass list: Empty (or add yourself for emergencies)
```

---

## Method 2: Classic Branch Protection Rules (Legacy)

If you see "Branch protection rules" instead of "Rulesets" in your sidebar:

### Step 1: Navigate to Branch Settings

1. Go to your GitHub repository: [https://github.com/voidomin/Resume-Forge](https://github.com/voidomin/Resume-Forge)
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click on **Branches** (under "Code and automation")

### Step 2: Add Branch Protection Rule

1. Under "Branch protection rules", click **Add rule** button
2. In the "Branch name pattern" field, enter: `main`

### Step 3: Configure Protection Settings

Enable the following settings:

#### Required Settings (Essential)

✅ **Require a pull request before merging**
   - This ensures all changes go through a PR workflow
   - Check this box
   - Under this option, also check:
     - ☑ **Require approvals** (set to 1)
     - ☑ **Dismiss stale pull request approvals when new commits are pushed** (optional but recommended)

✅ **Require status checks to pass before merging** (if you add CI/CD later)
   - Leave unchecked for now
   - Enable this when you set up GitHub Actions or other CI/CD

✅ **Require conversation resolution before merging**
   - Check this box
   - Ensures all PR comments are resolved before merge

✅ **Require linear history** (optional but recommended)
   - Check this box
   - Prevents merge commits, keeps history clean

✅ **Do not allow bypassing the above settings**
   - Check this box
   - Enforces rules even for administrators

#### Recommended Settings

✅ **Include administrators**
   - Check this box
   - Ensures even repo owners follow the process
   - Important for maintaining quality standards

✅ **Restrict who can push to matching branches** (optional)
   - Leave unchecked if you're the sole maintainer
   - Enable this if you have multiple collaborators and want to restrict direct pushes

#### Protection Against Destructive Actions

✅ **Allow force pushes** → Leave **UNCHECKED**
   - Prevents force pushes that could rewrite history

✅ **Allow deletions** → Leave **UNCHECKED**
   - Prevents accidental branch deletion

### Step 4: Save the Protection Rule

1. Scroll to the bottom of the page
2. Click **Create** button
3. You should see your protection rule listed under "Branch protection rules"

---

## Verifying Branch Protection

### Test 1: Try Direct Commit to Main

```bash
# Switch to main branch
git checkout main

# Try to make a change
echo "test" >> test.txt
git add test.txt
git commit -m "test commit"
git push origin main
```

**Expected Result:** Push should be **rejected** with an error message:

**Rulesets error:**
```
! [remote rejected] main -> main (protected by ruleset)
```

**Legacy protection error:**
```
remote: error: GH006: Protected branch update failed
```

Both indicate your branch protection is working correctly! ✅

### Test 2: Proper Workflow Via Pull Request

```bash
# Switch to develop branch
git checkout develop

# Make changes
echo "feature" >> feature.txt
git add feature.txt
git commit -m "feat: add new feature"
git push origin develop

# Create a PR on GitHub from develop to main
# PR should require approval before merge
```

**Expected Result:** PR is created successfully, but merge button is disabled until review approval.

---

## Branch Protection Rules Summary

Once configured, your repository will have:

| Setting | Status |
|---------|--------|
| Direct commits to main | ❌ Blocked |
| Force pushes to main | ❌ Blocked |
| Branch deletion | ❌ Blocked |
| PR required for merge | ✅ Required |
| Code review (1 approval) | ✅ Required |
| Conversation resolution | ✅ Required |
| Applies to administrators | ✅ Yes |

---

## Development Workflow with Protection

### For Bug Fixes

1. **Switch to develop branch**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create bug fix branch**
   ```bash
   git checkout -b bugfix/fix-pdf-export
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "fix: resolve PDF export overflow"
   git push origin bugfix/fix-pdf-export
   ```

4. **Create Pull Request**
   - Go to GitHub
   - Create PR from `bugfix/fix-pdf-export` → `develop`
   - Request review (or self-review if sole maintainer)
   - Address any comments
   - Merge when approved

5. **Periodically merge develop to main**
   ```bash
   # After accumulating several bug fixes
   # Create PR: develop → main
   # After review and approval, merge to release v1.1.0
   ```

### For Hotfixes (Critical Production Bugs)

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-security-fix
   ```

2. **Fix and commit**
   ```bash
   git add .
   git commit -m "fix(security): patch JWT validation vulnerability"
   git push origin hotfix/critical-security-fix
   ```

3. **Create PRs to both main and develop**
   - PR 1: `hotfix/critical-security-fix` → `main`
   - PR 2: `hotfix/critical-security-fix` → `develop`
   - Both require review
   - Merge to main first, then develop

4. **Tag hotfix release**
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.1 -m "Hotfix: Security patch for JWT validation"
   git push origin v1.0.1
   ```

---

## Troubleshooting

### "I can't push to main anymore!"

✅ **This is expected!** Branch protection is working correctly.

**Solution:** Use the proper workflow:
1. Create a branch from `develop`
2. Make your changes
3. Push the branch
4. Create a Pull Request
5. Get approval (or approve your own PR if sole maintainer)
6. Merge via GitHub interface

### "I need to make an urgent fix!"

For truly urgent fixes:

**Option 1 (Recommended):** Use hotfix workflow
- Create hotfix branch from main
- Create PR
- Get quick review/approval
- Merge

**Option 2 (Emergency Only):** Temporarily disable protection
- Settings → Branches → Edit rule
- Uncheck "Do not allow bypassing"
- Make your fix
- **Re-enable protection immediately**

### "PR can't be merged - requires approval"

If you're the sole maintainer:
1. Go to your PR on GitHub
2. Click "Files changed" tab
3. Click "Review changes" button
4. Select "Approve"
5. Submit review
6. Return to "Conversation" tab
7. Click "Merge pull request"

---

## Next Steps

After setting up branch protection:

1. ✅ Test the protection by attempting a direct push to main
2. ✅ Verify PRs require approval
3. ✅ Share the [CONTRIBUTING.md](CONTRIBUTING.md) guide with collaborators
4. 🎯 Start collecting user feedback on v1.0.0
5. 🐛 Track bugs in [KNOWN_ISSUES.md](KNOWN_ISSUES.md)
6. 🚀 Prepare for v1.1.0 bug-fix release

---

## Additional Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

**🎯 Your main branch is now production-ready and protected!**
