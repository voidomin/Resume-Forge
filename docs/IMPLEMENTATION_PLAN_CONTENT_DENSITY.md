# Content Density Engine Implementation Plan

**Created:** February 21, 2026  
**Feature Branch:** `feature/content-density-engine`  
**Status:** Planning Phase

---

## 1. Overview

### Problem Statement

Resume generation needs to handle two extremes optimally:

1. **Fresher/Entry-level:** Limited experience → Should look polished with proper spacing
2. **Senior (10-12 years):** Extensive experience → Must fit on ONE page with minimal whitespace, no information loss

### Solution Approach

Implement an intelligent **Content Density Engine** that:

- Auto-detects content volume and complexity
- Applies progressive compression strategy
- Maintains ATS compliance and readability
- Keeps user control with density slider UI
- Scales margins, fonts, and spacing intelligently

---

## 2. Architecture Overview

### Components to Create/Modify

```
shared/
├── design-system.ts (MODIFY)
│   ├── Replace DynamicSizingEngine with ContentDensityEngine
│   └── Add density level definitions
│
backend/src/services/
├── pdf.service.ts (MODIFY)
│   ├── Use ContentDensityEngine instead of calculateOptimalScale
│   ├── Detect content density level before rendering
│   └── Pass density to template renderers
│
├── templates/
│   ├── TemplateRenderer.interface.ts (MODIFY)
│   │   └── Add density parameter to render() signature
│   ├── StandardRenderer.ts (MODIFY)
│   └── [Other Renderers] (MODIFY)
│
├── gemini.service.ts (MODIFY)
│   └── Include optional section scores in generation response
│
frontend/src/
├── types/resume.ts (CREATE/MODIFY)
│   └── Add density definitions to GeneratedResume type
│
├── components/Resume/
│   ├── ResumePreview.tsx (MODIFY)
│   │   └── Accept and apply density parameter
│   │
│   └── templates/
│       ├── StandardTemplate.tsx (MODIFY)
│       ├── ModernTemplate.tsx (MODIFY)
│       ├── ExecutiveTemplate.tsx (MODIFY)
│       └── MinimalistTemplate.tsx (MODIFY)
│
└── pages/
    └── ResumeGenerator.tsx (MODIFY)
        └── Add density slider and control UI
```

---

## 3. Detailed Implementation Steps

### Phase 1: Design System Enhancement

#### 3.1 Create ContentDensityEngine Class

**Location:** `shared/design-system.ts`

**Replace:** Existing `DynamicSizingEngine` (remove unused code)

**New Density Levels:**

```typescript
enum DensityLevel {
  NORMAL = "normal", // Content fits comfortably, good spacing
  COMPACT = "compact", // Content tight, optimized spacing
  ULTRA_COMPACT = "ultra", // Maximum density, minimal white space
}

interface DensityConfig {
  level: DensityLevel;
  marginMultiplier: number; // 0.5 = 50% of base margin
  spacingMultiplier: number; // 0.8 = 80% of base spacing
  fontSizeMultiplier: number; // 1.0 = no font reduction
  hideOptionalSections: string[]; // Section names to hide
  lineHeightMultiplier: number; // Line height scaling
}
```

**Density Presets:**

```typescript
const DENSITY_PRESETS: Record<DensityLevel, DensityConfig> = {
  NORMAL: {
    level: DensityLevel.NORMAL,
    marginMultiplier: 1.0, // 36pt margins
    spacingMultiplier: 1.0, // Full spacing
    fontSizeMultiplier: 1.0, // No font reduction
    hideOptionalSections: [],
    lineHeightMultiplier: 1.3,
  },

  COMPACT: {
    level: DensityLevel.COMPACT,
    marginMultiplier: 0.67, // 24pt margins
    spacingMultiplier: 0.8, // 80% spacing
    fontSizeMultiplier: 0.95, // 5% font reduction
    hideOptionalSections: ["awards"],
    lineHeightMultiplier: 1.25,
  },

  ULTRA_COMPACT: {
    level: DensityLevel.ULTRA,
    marginMultiplier: 0.56, // 20pt margins (minimum)
    spacingMultiplier: 0.6, // 60% spacing
    fontSizeMultiplier: 0.9, // 10% font reduction
    hideOptionalSections: ["awards", "coursework"],
    lineHeightMultiplier: 1.2,
  },
};
```

#### 3.2 ContentDensityEngine Methods

```typescript
class ContentDensityEngine {
  private readonly MIN_FONT_SIZE = 10; // ATS safe minimum
  private readonly MIN_MARGIN = 18; // Industry minimum
  private readonly MIN_LINE_HEIGHT = 1.2;

  /**
   * Detect optimal density based on content analysis
   * Returns: DensityLevel recommendation
   */
  detectDensityLevel(
    estimatedWordCount: number,
    sectionCount: number,
    hasOptionalSections: boolean,
  ): DensityLevel;

  /**
   * Get scaled design system values for a density level
   * Returns: Scaled fonts, spacing, margins
   */
  getScaledDesignSystem(density: DensityLevel): ScaledDesignSystem;

  /**
   * Analyze resume content to determine density
   * Input: Generated resume data
   * Output: Content analysis with recommendation
   */
  analyzeContentVolume(resume: GeneratedResume): ContentAnalysis;

  /**
   * Calculate which optional sections to hide
   * Based on density level and content volume
   */
  getVisibleSections(
    density: DensityLevel,
    availableSections: Section[],
  ): Section[];
}
```

---

### Phase 2: Backend PDF Service Updates

#### 3.3 Update PDFService

**Location:** `backend/src/services/pdf.service.ts`

**Changes:**

- Remove `calculateOptimalScale()` method
- Replace with `detectAndApplyDensity()`
- Update `generateResumePDF()` to use ContentDensityEngine
- Pass density to template renderers

```typescript
generateResumePDF(
  resume: GeneratedResume,
  template: string = "modern",
  userDensity?: DensityLevel // Optional user override
): Promise<Buffer> {

  // Auto-detect or use user preference
  const densityEngine = new ContentDensityEngine();
  const analysis = densityEngine.analyzeContentVolume(resume);
  const density = userDensity || analysis.recommendedDensity;

  // Get scaled design system
  const scaledDS = densityEngine.getScaledDesignSystem(density);

  // Create PDF with scaled margins
  const doc = new PDFDocument({
    size: "A4",
    margins: scaledDS.margins
  });

  // Attach density info for renderers
  (doc as any).__density = density;
  (doc as any).__scaledDesignSystem = scaledDS;

  // Render with density aware template
  const renderer = this.renderers[selectedTemplate];
  renderer.renderWithDensity(doc, resume, density);

  return buffer;
}
```

#### 3.4 Update Template Renderer Interface

**Location:** `backend/src/services/templates/TemplateRenderer.interface.ts`

```typescript
interface TemplateRenderer {
  /**
   * Old method - keep for backwards compatibility
   */
  render(
    doc: PDFDocument,
    resume: GeneratedResume,
    fontScale: number,
    spacingScale: number,
  ): void;

  /**
   * New method - density aware rendering
   */
  renderWithDensity(
    doc: PDFDocument,
    resume: GeneratedResume,
    density: DensityLevel,
  ): void;
}
```

#### 3.5 Update Individual Template Renderers

**Files to modify:**

- `StandardRenderer.ts`
- `ModernRenderer.ts`
- `ExecutiveRenderer.ts`
- `MinimalistRenderer.ts`

**Key changes in each:**

- Check `doc.__density` for current density level
- Get scaled design system from `doc.__scaledDesignSystem`
- Skip rendering optional sections based on density
- Use scaled fonts, spacing, margins instead of fixed values
- Remove `fontScale` and `spacingScale` parameters from `render()`

Example for StandardRenderer:

```typescript
renderWithDensity(doc, resume, density) {
  const scaledDS = (doc as any).__scaledDesignSystem;

  // Only render if not hidden by density
  if (!this.isHidden(density, "awards")) {
    // Render awards section with scaled values
    this.renderAwards(doc, resume, scaledDS);
  }

  // Use scaledDS.fontSize.h2 instead of fixed values
}
```

---

### Phase 3: Frontend Updates

#### 3.6 Update ResumeView/ResumeGenerator

**Location:** `frontend/src/pages/ResumeGenerator.tsx` (or ResumeView.tsx)

**Add:**

- Density slider UI component (0.5 = normal, 1.0 = ultra-compact)
- Show detected density level
- Allow user override
- Pass density to preview and PDF generation

```tsx
const [userDensity, setUserDensity] = useState<DensityLevel | null>(null);
const [detectedDensity, setDetectedDensity] = useState<DensityLevel>("normal");

// When resume is generated
const density = userDensity || detectedDensity;

// Pass to resume preview
<ResumePreview resume={resume} template={template} density={density} />;

// Pass to PDF generation
const downloadPDF = async () => {
  await api.post("/resumes/download-pdf", {
    resumeId: id,
    density: density,
    template: template,
  });
};
```

#### 3.7 Update ResumePreview Component

**Location:** `frontend/src/components/Resume/ResumePreview.tsx`

**Add:**

- Accept density prop
- Pass density to templates
- Update preview scaling logic

```tsx
function ResumePreview({
  resume,
  template = "modern",
  density = "normal",
}: ResumePreviewProps) {
  // Determine CSS scale factor based on density
  const getScaleFactor = (density: DensityLevel) => {
    // Return visual scale for preview
    return { normal: 1.0, compact: 0.92, ultra: 0.85 }[density];
  };

  return (
    <div style={{ transform: `scale(${getScaleFactor(density)})` }}>
      {renderTemplate()}
    </div>
  );
}
```

#### 3.8 Update Resume Templates (Frontend)

**Files:** All 4 template TSX files

**Add:**

- Context/prop to receive density level
- Conditional rendering of optional sections
- Use CSS custom properties for scaled values

```tsx
// In template component
const { density } = useContext(DensityContext);

// Check if section should be hidden
if (isHidden(density, "awards")) return null;

// Use scaled values
const marginStyle = getDensityMargin(density);
const fontStyle = getDensityFont(density, "body");
```

---

### Phase 4: Type Definitions

#### 3.9 Update Resume Types

**Location:** `frontend/src/types/resume.ts`

```typescript
export interface GeneratedResume {
  // ... existing fields ...

  // New density-related fields
  detectedDensity?: DensityLevel;
  contentAnalysis?: {
    wordCount: number;
    sectionCount: number;
    hasOptionalSections: boolean;
    recommendedDensity: DensityLevel;
  };

  // Optional sections with scores
  awards?: Array<{
    awardName: string;
    organization: string;
    awardDate?: string;
    description?: string;
    relevanceScore?: number;
  }>;

  coursework?: Array<{
    courseName: string;
    topic: string;
    institution: string;
    relevanceScore?: number;
  }>;

  leadership?: Array<{
    title: string;
    organization: string;
    location?: string;
    dateRange?: string;
    description?: string;
    relevanceScore?: number;
  }>;
}
```

---

## 4. Implementation Order

### Step-by-step execution:

1. **[Backend] Phase 1.1-1.2:** Create ContentDensityEngine in design-system.ts
2. **[Backend] Phase 2.3:** Update pdf.service.ts to use new engine
3. **[Backend] Phase 2.4-2.5:** Update template renderers interface and implementations
4. **[Frontend] Phase 4.9:** Update type definitions
5. **[Frontend] Phase 3.6-3.8:** Update components and pages
6. **[Testing]:** Manual tests with various resume contents
7. **[Polish]:** Remove old code, optimize performance

---

## 5. Compression Strategy Details

### Content Volume Analysis

```
WORD_COUNT = sum of all text content

IF contentFits(WORD_COUNT, NORMAL):
  density = NORMAL

ELSE IF contentFits(WORD_COUNT, COMPACT):
  density = COMPACT

ELSE:
  density = ULTRA_COMPACT
```

### Section Hiding Priority

When space is tight, hide in this order:

1. **Awards** (lowest priority, easy to remove)
2. **Coursework** (supplementary, can be omitted)
3. **Leadership** (nice-to-have, not requiredfor ATS)
4. Keep: Experience, Education, Skills, Projects

### Scaling Multipliers

Applied to ALL sizing values proportionally:

| Density | Margins | Spacing | Font  | Line Height |
| ------- | ------- | ------- | ----- | ----------- |
| Normal  | 1.0x    | 1.0x    | 1.0x  | 1.3x        |
| Compact | 0.67x   | 0.8x    | 0.95x | 1.25x       |
| Ultra   | 0.56x   | 0.6x    | 0.9x  | 1.2x        |

---

## 6. ATS Compliance Safeguards

- **Minimum font:** 10pt (not below)
- **Minimum margins:** 18pt (not below)
- **Line height:** Never less than 1.2
- **Font weight:** Keep normal for body, bold only for headers
- **Colors:** No light grays in ultra-compact (maintain 4.5:1 contrast ratio)

---

## 7. User Controls (Frontend)

### Density Slider UI

```
[ Spacious ] ----●---- [ Compact ] -------- [ Ultra ]
   (Normal)    (Compact)              (Max Compression)
```

- Show detected density as default selection
- Allow override for user preference
- Update preview in real-time

### Display Information

- "Detected Density: Compact (9,500 words)"
- "Estimated pages: 1"
- Optional sections hidden: Awards, Coursework

---

## 8. Code Cleanup

### Files to Clean

- Remove old `DynamicSizingEngine` from design-system.ts
- Remove `calculateOptimalScale()` from pdf.service.ts
- Remove commented-out code
- Remove unused imports

### Keep

- UnifiedDesignSystem base values
- All design tokens

---

## 9. Testing Strategy

### Manual Testing Scenarios

1. **Fresher Resume (1-2 years experience)**
   - Few bullets, limited skills
   - Should render as NORMAL density
   - Proper spacing, looks polished

2. **Mid-level Resume (5-7 years experience)**
   - Multiple jobs, more skills
   - Should render as COMPACT density
   - Optimized spacing, still readable

3. **Senior Resume (10-12+ years experience)**
   - Many positions, extensive projects, all optional sections
   - Should render as ULTRA_COMPACT
   - Tight but readable, no overflow

### Verification Checklist

- [ ] All content fits on 1 page
- [ ] Fonts remain readable (min 10pt)
- [ ] No overlapping text
- [ ] Proper section alignment
- [ ] Optional sections hide correctly
- [ ] PDF export matches preview
- [ ] All 4 templates work correctly

---

## 10. Future Enhancements

- Machine learning based optimal density detection
- Per-section density control (e.g., compress spacing but not fonts)
- Template-specific density profiles
- Export density settings with resume
- A/B testing density impact on ATS scores

---

## 11. Rollback Plan

If issues arise:

- Revert to previous commit: `git revert <commit-hash>`
- Fall back to simple scaling: `scale = min(1.0, pageHeight / contentHeight)`
- Use NORMAL density as default for all

---

**Next Step:** User approval of this plan, then begin Phase 1 implementation.
