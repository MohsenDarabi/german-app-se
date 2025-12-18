# Content Schema Redesign - Summary

## What Was Done

Based on 23 screenshots from the Busuu app, we've redesigned the content schema to be:
1. **Comprehensive** - Covers all step types seen in Busuu
2. **Flexible** - Easy to add new step types as you discover them
3. **Type-Safe** - Full TypeScript + Zod validation
4. **Maintainable** - Reusable components and clear patterns

## Files Created/Updated

### 1. Core Schema
**File**: `packages/content-model/src/index.ts`

**New Features:**
- ✅ 9 step types (vs. 4 before)
- ✅ Bilingual text support (German + Persian)
- ✅ Video/audio media objects
- ✅ Feedback system with explanations
- ✅ Hierarchical structure: Level → Module → Lesson → Steps
- ✅ Extensible architecture for future step types

**Step Types Implemented:**
1. `new-word` - Vocabulary introduction cards
2. `multiple-choice` - Quiz questions
3. `fill-in-blank` - Complete sentences
4. `word-order` - Arrange words (drag & drop)
5. `true-false` - Verify statements
6. `translation` - Translate to German
7. `dialog` - Conversations
8. `grammar-tip` - Educational content
9. `completion` - Lesson summary with stats

### 2. Developer Guide
**File**: `packages/content-model/ADDING_NEW_STEP_TYPES.md`

Step-by-step instructions for adding new step types with:
- Real examples
- Best practices
- Common patterns
- Testing guide

### 3. Example Lessons
**Files**:
- `content/de-fa/A1/module-01/lesson-01-new-format.json`
- `content/de-fa/A1/module-01/lesson-02-new-format.json`

Real lesson files matching the Busuu screenshots, showing:
- NewWord cards with video
- Multiple choice quizzes
- Fill-in-blank exercises
- Word ordering
- True/false questions
- Translation exercises
- Completion screens

## Key Improvements

### Before:
```json
{
  "type": "new-word",
  "word": "Hallo",
  "translation": "سلام",
  "audio": "/audio.mp3"
}
```

### After:
```json
{
  "type": "new-word",
  "header": "Look, something new!",
  "video": {
    "url": "/videos/hallo.mp4",
    "autoPlay": true
  },
  "word": {
    "de": "Hallo!",
    "fa": "سلام!"
  },
  "example": {
    "text": {
      "de": "Hallo!",
      "fa": "سلام!"
    },
    "audio": {
      "url": "/audio/hallo-example.mp3"
    }
  }
}
```

## Architecture Highlights

### 1. Reusable Components
```typescript
// Instead of repeating video/audio structure everywhere
MediaSchema = {
  url: string,
  autoPlay: boolean,
  mimeType?: string
}

// Use it in any step:
video: MediaSchema.optional()
```

### 2. Bilingual by Default
```typescript
BilingualTextSchema = {
  de: string,  // German
  fa: string   // Persian/English
}

// Every display text supports both languages
word: BilingualTextSchema
```

### 3. Consistent Feedback
```typescript
FeedbackSchema = {
  explanation?: string,
  tip?: string,
  correctAnswer?: string,
  correctAnswerTranslation?: string
}

// Any step can have feedback
feedback: FeedbackSchema.optional()
```

### 4. Type Safety
```typescript
// TypeScript knows all possible step types
type LessonStep =
  | NewWordStep
  | MultipleChoiceStep
  | FillInBlankStep
  | ... // etc

// Discriminated union on 'type' field
// No runtime errors for unknown types
```

## Next Steps

### For Content Creators:
1. **Convert existing lessons** to new format
2. **Create new lessons** using example files as templates
3. **Add media files** (videos/audio) to appropriate directories
4. **Validate** content using `parseLesson()` helper

### For Developers:
1. **Update UI components** to match new schema:
   - `NewWordStepRenderer.svelte` - Add video support
   - `MultipleChoiceStepRenderer.svelte` - Add feedback panel
   - `FillInBlankStepRenderer.svelte` - Create from scratch
   - `WordOrderStepRenderer.svelte` - Create with drag & drop
   - `TrueFalseStepRenderer.svelte` - Create from scratch
   - `TranslationStepRenderer.svelte` - Create from scratch
   - `CompletionStepRenderer.svelte` - Add stats display

2. **Update StepRenderer.svelte**:
   ```svelte
   {#if step.type === 'new-word'}
     <NewWordStepRenderer {step} {onComplete} />
   {:else if step.type === 'fill-in-blank'}
     <FillInBlankStepRenderer {step} {onComplete} />
   <!-- ... etc -->
   {/if}
   ```

3. **Add media handling**:
   - Video player component
   - Audio player component
   - Auto-play logic
   - Replay functionality

4. **Implement feedback system**:
   - Show correct/incorrect states
   - Display explanations
   - Grammar tips panel

### For Future:
When you discover new step types in Busuu:

1. Screenshot the step
2. Document its structure
3. Follow `ADDING_NEW_STEP_TYPES.md` guide
4. Add schema (3 lines of code)
5. Create renderer component
6. Update StepRenderer switcher

## Migration Strategy

### Phase 1: Test New Schema (Week 1)
- ✅ Schema defined
- ✅ Example lessons created
- ⏳ Create 1-2 UI components
- ⏳ Test with example lessons
- ⏳ Validate approach

### Phase 2: Build All Renderers (Week 2-3)
- ⏳ Implement all 9 step renderer components
- ⏳ Build media player components
- ⏳ Add feedback system
- ⏳ Test each component individually

### Phase 3: Convert Content (Week 4)
- ⏳ Convert existing lessons to new format
- ⏳ Add missing media files
- ⏳ Validate all content
- ⏳ Update content loader

### Phase 4: Polish & Extend (Ongoing)
- ⏳ Add new step types as discovered
- ⏳ Enhance animations
- ⏳ Add sound effects
- ⏳ Improve accessibility

## Code Examples

### Validating a Lesson
```typescript
import { parseLesson } from '@pkg/content-model';
import lessonData from './lesson-01-new-format.json';

try {
  const lesson = parseLesson(lessonData);
  console.log('✅ Valid lesson!', lesson);
} catch (error) {
  console.error('❌ Invalid lesson:', error);
}
```

### Type-Safe Step Rendering
```typescript
function renderStep(step: LessonStep) {
  switch (step.type) {
    case 'new-word':
      // TypeScript knows: step is NewWordStep
      return <NewWordCard word={step.word} />;

    case 'multiple-choice':
      // TypeScript knows: step is MultipleChoiceStep
      return <Quiz options={step.options} />;

    // ... etc
  }
}
```

### Adding a New Step Type
```typescript
// 1. Define schema
export const ListeningStep = BaseStepSchema.extend({
  type: z.literal("listening"),
  question: BilingualTextSchema,
  // ... fields
});

// 2. Add to union
export const LessonStepSchema = z.discriminatedUnion("type", [
  // ... existing
  ListeningStep,
]);

// 3. Export type
export type ListeningStep = z.infer<typeof ListeningStep>;

// Done! Now use it in JSON and UI
```

## Benefits of This Approach

### 1. Scalability
- Easy to add new step types (just 3 lines of code)
- No breaking changes when extending
- Future-proof architecture

### 2. Type Safety
- Catch errors at compile time
- Auto-complete in IDE
- No runtime surprises

### 3. Consistency
- All steps follow same patterns
- Reusable components
- Predictable structure

### 4. Maintainability
- Clear documentation
- Simple to understand
- Easy to onboard new developers

### 5. Flexibility
- Support for unknown future types
- Can extend without breaking old content
- Optional fields for gradual migration

## Questions & Answers

**Q: What if I find a new step type in Busuu?**
A: Follow `ADDING_NEW_STEP_TYPES.md` - it takes ~15 minutes to add.

**Q: Can I still use old lesson files?**
A: Yes, but they need conversion. The old schema is incompatible.

**Q: What about media files (videos/audio)?**
A: Store in `apps/web/static/` directory. Reference by path in JSON.

**Q: How do I validate my JSON?**
A: Use `parseLesson()` helper - it will throw detailed errors.

**Q: Can I have custom fields?**
A: Yes! Add them to the specific step schema. All steps extend `BaseStepSchema`.

**Q: What if I need a step type that doesn't fit any pattern?**
A: Use `GenericStepSchema` temporarily, then propose a new specific type.

## Resources

- 📄 Schema definition: `packages/content-model/src/index.ts`
- 📚 Developer guide: `packages/content-model/ADDING_NEW_STEP_TYPES.md`
- 📝 Example lessons: `content/de-fa/A1/module-01/lesson-*-new-format.json`
- 🖼️ Busuu screenshots: `apps/web/src/screenShots/`

## Contact

Questions? Issues? Ideas?
- Review the code and examples
- Check existing step types for patterns
- Consult the team for design decisions
