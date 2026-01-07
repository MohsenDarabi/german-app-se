# Adding New Step Types - Developer Guide

This guide explains how to add new step types to the content schema as you discover them in Busuu.

## Architecture Overview

Our schema is designed for **extensibility**:

1. **Base Schema**: All steps inherit from `BaseStepSchema` with common fields (id, type, video, audio, feedback)
2. **Reusable Components**: Shared schemas like `MediaSchema`, `BilingualTextSchema`, `FeedbackSchema`
3. **Type-Safe**: Zod validation + TypeScript discriminated unions
4. **Easy to Extend**: Just 3 steps to add a new type

## How to Add a New Step Type

### Step 1: Define the Schema

Add your new step schema in `packages/content-model/src/index.ts`:

```typescript
/* --------------------------------------------------
   Step Type: Your New Type
   Brief description
-------------------------------------------------- */

export const YourNewStepSchema = BaseStepSchema.extend({
  type: z.literal("your-new-type"),

  // Add specific fields for this step type
  yourField: z.string(),
  optionalField: z.string().optional(),

  // Reuse common schemas where applicable
  instruction: z.string().default("Your instruction"),

  // Can use any Zod validators
  numberOfChoices: z.number().int().min(2).max(4),
});
```

### Step 2: Add to Discriminated Union

Update the `LessonStepSchema` union (around line 259):

```typescript
export const LessonStepSchema = z.discriminatedUnion("type", [
  NewWordStepSchema,
  MultipleChoiceStepSchema,
  // ... other types
  YourNewStepSchema,  // ← Add here
]);
```

### Step 3: Export TypeScript Type

Add the inferred type (around line 335):

```typescript
export type YourNewStep = z.infer<typeof YourNewStepSchema>;
```

### Step 4: Create the UI Component

In `apps/web/src/lib/components/lesson/steps/`:

```svelte
<!-- YourNewStepRenderer.svelte -->
<script lang="ts">
  import type { YourNewStep } from '@pkg/content-model';

  export let step: YourNewStep;
  export let onComplete: () => void;

  // Component logic
</script>

<!-- Component UI -->
```

### Step 5: Register in Step Renderer

Update the main `StepRenderer.svelte`:

```svelte
<script lang="ts">
  import YourNewStepRenderer from './steps/YourNewStepRenderer.svelte';

  // ... existing imports
</script>

{#if step.type === 'your-new-type'}
  <YourNewStepRenderer {step} {onComplete} />
{:else if step.type === 'new-word'}
  <!-- ... -->
{/if}
```

## Example: Real World Case

Let's say you discover a new "Listening Comprehension" step in Busuu:

### 1. Define Schema

```typescript
export const ListeningComprehensionStepSchema = BaseStepSchema.extend({
  type: z.literal("listening-comprehension"),

  instruction: z.string().default("Listen and answer the question."),

  // Audio is already in BaseStepSchema, so just use it

  // Question after listening
  question: BilingualTextSchema,

  // Multiple choice answers
  options: z.array(BilingualTextSchema).min(2).max(4),
  correctAnswerIndex: z.number().int().min(0),

  // Optional transcript
  transcript: BilingualTextSchema.optional(),
});
```

### 2. Add to Union

```typescript
export const LessonStepSchema = z.discriminatedUnion("type", [
  // ... existing types
  ListeningComprehensionStepSchema,
]);
```

### 3. Export Type

```typescript
export type ListeningComprehensionStep = z.infer<typeof ListeningComprehensionStepSchema>;
```

### 4. Create JSON Content

```json
{
  "type": "listening-comprehension",
  "id": "step-5",
  "audio": {
    "url": "/audio/conversation.mp3",
    "autoPlay": true
  },
  "question": {
    "de": "Was sagt Eli?",
    "fa": "الی چه می‌گوید؟"
  },
  "options": [
    { "de": "Guten Morgen", "fa": "صبح بخیر" },
    { "de": "Guten Abend", "fa": "عصر بخیر" }
  ],
  "correctAnswerIndex": 0,
  "feedback": {
    "explanation": "Eli grüßt am Morgen."
  }
}
```

## Best Practices

### 1. Reuse Common Schemas

Don't reinvent the wheel:

```typescript
// ❌ Bad - defining new media object
audio: z.object({
  url: z.string(),
  autoPlay: z.boolean()
})

// ✅ Good - reusing MediaSchema
audio: MediaSchema
```

### 2. Use BilingualText for Display Text

```typescript
// ✅ Good - supports both languages
title: BilingualTextSchema

// ❌ Bad - hard to translate later
title: z.string()
```

### 3. Add Defaults for Common Values

```typescript
instruction: z.string().default("Put the words in order."),
autoPlay: z.boolean().default(false),
```

### 4. Make Media Optional Unless Required

```typescript
// Most steps might have video/audio, but not always
video: MediaSchema.optional(),
```

### 5. Document Your Schema

Add clear comments explaining the purpose and format:

```typescript
// Sentence template with blanks marked as {0}, {1}, etc.
// Example: "Hallo, ich {0} Maria."
sentence: z.string(),
```

## Testing Your Schema

Before using a new step type in production:

```typescript
// test-new-step.ts
import { parseLesson } from '@pkg/content-model';

const testLesson = {
  id: "TEST-01",
  title: { de: "Test", fa: "تست" },
  level: "A1",
  module: 1,
  lessonNumber: 1,
  steps: [
    {
      type: "your-new-type",
      id: "s1",
      yourField: "test value",
      // ... all required fields
    }
  ]
};

try {
  const validated = parseLesson(testLesson);
  console.log("✅ Schema valid!", validated);
} catch (error) {
  console.error("❌ Schema invalid:", error);
}
```

## Common Step Patterns

### Pattern 1: Question with Choices

```typescript
question: z.string(),
options: z.array(z.string()).min(2).max(4),
correctAnswerIndex: z.number().int().min(0),
```

### Pattern 2: Sentence with Blanks

```typescript
sentence: z.string(), // "Hello, my name {0} Eli."
options: z.array(z.string()),
correctAnswers: z.array(z.number().int().min(0)),
```

### Pattern 3: Interactive Media

```typescript
video: MediaSchema,
instruction: z.string(),
onVideoEndAction: z.enum(["continue", "quiz", "none"]).optional(),
```

### Pattern 4: Pair Matching

```typescript
leftItems: z.array(z.string()),
rightItems: z.array(z.string()),
correctPairs: z.array(z.tuple([z.number(), z.number()])),
```

## Migration Guide

If you need to update existing lesson files after adding a new step type:

1. Update the JSON files with new fields
2. Run validation: `pnpm validate-content` (if you set up a script)
3. Update UI components
4. Test in development

## Questions?

- Review existing step types in `src/index.ts` for examples
- Check Busuu screenshots for UI/UX patterns
- Ask the team if unsure about field names or structure
