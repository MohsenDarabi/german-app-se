import { z } from "zod";

/* --------------------------------------------------
   Common Reusable Schemas
-------------------------------------------------- */

// Media objects for video/audio
export const MediaSchema = z.object({
  url: z.string(),
  autoPlay: z.boolean().default(false),
  mimeType: z.string().optional(), // "video/mp4", "audio/mpeg"
});

// Bilingual text (German + Persian/English)
export const BilingualTextSchema = z.object({
  de: z.string(), // German text
  fa: z.string(), // Persian/English translation
});

// Example sentence with audio
export const ExampleSchema = z.object({
  text: BilingualTextSchema,
  audio: MediaSchema.optional(),
});

// Feedback shown after answering
export const FeedbackSchema = z.object({
  explanation: z.string().optional(), // Grammar explanation or note
  tip: z.string().optional(),          // Additional learning tip
  correctAnswer: z.string().optional(), // Show correct answer if wrong
  correctAnswerTranslation: z.string().optional(),
});

/* --------------------------------------------------
   Base Step Schema
   All step types extend this base
-------------------------------------------------- */

export const BaseStepSchema = z.object({
  id: z.string(),
  type: z.string(), // Will be overridden by specific types

  // Optional media that can appear in any step
  video: MediaSchema.optional(),
  audio: MediaSchema.optional(),

  // Image support - use imageId for asset registry lookup, or image for direct path
  imageId: z.string().optional(), // Asset registry ID (e.g., "ubahn-berlin")
  image: z.string().optional(),   // Direct URL path (legacy, for backward compatibility)

  // Optional feedback/explanation for any step
  feedback: FeedbackSchema.optional(),
});

/* --------------------------------------------------
   Step Type 1: NewWord Card
   "Look, something new!" - Intro card with word/phrase
-------------------------------------------------- */

export const NewWordStepSchema = BaseStepSchema.extend({
  type: z.literal("new-word"),

  // Main content
  word: BilingualTextSchema, // The word/phrase being taught

  // Optional example usage
  example: ExampleSchema.optional(),

  // Note: image and imageId are now in BaseStepSchema for all step types

  // Header text (default: "Look, something new!")
  header: z.string().default("Look, something new!"),
});

/* --------------------------------------------------
   Step Type 2: Multiple Choice Quiz
   Select the correct answer from options
-------------------------------------------------- */

export const MultipleChoiceStepSchema = BaseStepSchema.extend({
  type: z.literal("multiple-choice"),

  // Question to display
  question: z.string(), // Can be German word or Persian question

  // Answer choices
  options: z.array(z.string()).min(2).max(4),

  // Correct answer index (0-based)
  correctAnswerIndex: z.number().int().min(0),
});

/* --------------------------------------------------
   Step Type 3: Fill in the Blank
   Complete sentence by selecting correct word(s)
-------------------------------------------------- */

export const FillInBlankStepSchema = BaseStepSchema.extend({
  type: z.literal("fill-in-blank"),

  // Instruction text
  instruction: z.string().default("Complete the sentence."),

  // Sentence template with blanks marked as {0}, {1}, etc.
  // Example: "Hallo, ich {0} Maria."
  sentence: z.string(),

  // Word choices to fill blanks
  options: z.array(z.string()).min(2),

  // Correct answers for each blank (by index)
  // Example: [1] means options[1] is correct for {0}
  correctAnswers: z.array(z.number().int().min(0)),
});

/* --------------------------------------------------
   Step Type 4: Word Ordering
   Put words in correct order (drag & drop)
-------------------------------------------------- */

export const WordOrderStepSchema = BaseStepSchema.extend({
  type: z.literal("word-order"),

  // Instruction text
  instruction: z.string().default("Put the words in order."),

  // Words to arrange (in scrambled order)
  words: z.array(z.string()).min(2),

  // Correct order (array of indices from 'words')
  // Example: [2, 0, 1] means words[2], words[0], words[1]
  correctOrder: z.array(z.number().int().min(0)),

  // Or alternatively, just the correct sentence as string
  correctSentence: BilingualTextSchema,
});

/* --------------------------------------------------
   Step Type 5: True or False
   Verify if a statement is correct
-------------------------------------------------- */

export const TrueFalseStepSchema = BaseStepSchema.extend({
  type: z.literal("true-false"),

  // Instruction
  instruction: z.string().default("True or false?"),

  // Statement to verify
  statement: z.string(),

  // Explanation of the statement
  statementExplanation: z.string().optional(),

  // Correct answer
  correctAnswer: z.boolean(),
});

/* --------------------------------------------------
   Step Type 6: Translation Exercise
   Translate English/Persian sentence to German
-------------------------------------------------- */

export const TranslationStepSchema = BaseStepSchema.extend({
  type: z.literal("translation"),

  // Source sentence (English/Persian) to translate
  sourceText: z.string(),

  // Template with multiple blanks: "Freut {0}. Ich {1} Anna."
  sentenceTemplate: z.string(),

  // Available word choices
  options: z.array(z.string()).min(2),

  // Correct word indices for each blank
  correctAnswers: z.array(z.number().int().min(0)),

  // Full correct translation
  correctTranslation: BilingualTextSchema,
});

/* --------------------------------------------------
   Step Type 7: Dialog/Conversation
   Show a conversation between speakers
-------------------------------------------------- */

export const DialogStepSchema = BaseStepSchema.extend({
  type: z.literal("dialog"),

  // Conversation lines with speaker names
  lines: z.array(
    z.object({
      speaker: z.string(), // "Anna", "Tom", etc.
      text: BilingualTextSchema,
      audio: MediaSchema.optional(),
    })
  ),
});

/* --------------------------------------------------
   Step Type 8: Grammar Tip
   Educational explanation
-------------------------------------------------- */

export const GrammarTipStepSchema = BaseStepSchema.extend({
  type: z.literal("grammar-tip"),

  // Tip title
  title: z.string().optional(),

  // Main explanation text (can be markdown)
  content: z.string(),

  // Optional examples
  examples: z.array(BilingualTextSchema).optional(),
});

/* --------------------------------------------------
   Step Type 9: Completion/Summary Screen
   Shown at end of lesson with stats
-------------------------------------------------- */

export const CompletionStepSchema = BaseStepSchema.extend({
  type: z.literal("completion"),

  // Celebration message
  message: z.string().default("Well done!"),

  // Vocabulary learned in this lesson
  vocabularyLearned: z.array(
    z.object({
      word: BilingualTextSchema,
      audio: MediaSchema.optional(),
    })
  ),

  // Stats to show (calculated at runtime, these are defaults/hints)
  stats: z.object({
    starsEarned: z.number().optional(),
    scorePercentage: z.number().optional(),
    newVocabCount: z.number().optional(),
  }).optional(),
});

/* --------------------------------------------------
   Step Type 10: Speed Challenge
   Timed vocabulary sprint - answer as many as possible
-------------------------------------------------- */

export const SpeedChallengeQuestionSchema = z.object({
  question: z.string(), // German word or phrase
  options: z.array(z.string()).min(2).max(4),
  correctAnswerIndex: z.number().int().min(0),
});

export const SpeedChallengeStepSchema = BaseStepSchema.extend({
  type: z.literal("speed-challenge"),

  // Title shown at start
  title: z.string().default("Speed Challenge!"),

  // Instructions
  instruction: z.string().default("Answer as many as you can!"),

  // Time limit in seconds (default 60)
  timeLimit: z.number().int().min(10).max(180).default(60),

  // Questions pool
  questions: z.array(SpeedChallengeQuestionSchema).min(5),

  // Points per correct answer
  basePoints: z.number().int().default(10),

  // Combo multiplier settings
  comboEnabled: z.boolean().default(true),
});

/* --------------------------------------------------
   Step Type 11: Spelling Exercise
   Spell a word by clicking/typing letters in order
-------------------------------------------------- */

export const SpellingStepSchema = BaseStepSchema.extend({
  type: z.literal("spelling"),

  // The word to spell
  word: z.string(),

  // Persian translation
  translation: z.string(),

  // Optional phonetic hint
  hint: z.string().optional(),

  // Instruction text
  instruction: z.string().default("Spell the word."),
});

/* --------------------------------------------------
   Step Type 12: Comprehension Exercise
   Read/listen to a passage and answer questions
-------------------------------------------------- */

export const ComprehensionQuestionSchema = z.object({
  question: z.string(), // Question text
  options: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

export const ComprehensionStepSchema = BaseStepSchema.extend({
  type: z.literal("comprehension"),

  // Title for the exercise
  title: z.string().optional(),

  // The passage to read/comprehend
  passage: BilingualTextSchema,

  // Optional media (audio or video of the passage)
  media: z.object({
    type: z.enum(["audio", "video"]),
    url: z.string(),
  }).optional(),

  // Questions about the passage
  questions: z.array(ComprehensionQuestionSchema).min(1),

  // Instruction text
  instruction: z.string().default("Read/listen and answer the questions."),
});

/* --------------------------------------------------
   Step Type 13: Rapid Fire Game
   Quick-fire translation matching game
-------------------------------------------------- */

export const RapidFireQuestionSchema = z.object({
  prompt: z.string(), // Word/phrase shown on the card (what to match)
  left: z.string(),   // Left option text
  right: z.string(),  // Right option text
  correctSide: z.enum(["left", "right"]),
});

export const RapidFireStepSchema = BaseStepSchema.extend({
  type: z.literal("rapid-fire"),
  title: z.string().default("Quick Quiz"),
  instruction: z.string().default("Answer quickly!"),
  timePerQuestion: z.number().int().min(1).max(30).default(5),
  basePoints: z.number().int().min(1).default(10),
  showStreak: z.boolean().default(true),
  questions: z.array(RapidFireQuestionSchema).min(2),
});

/* --------------------------------------------------
   Step Type 14: Memory Match Game
   Match pairs of German-Persian words
-------------------------------------------------- */

export const MemoryMatchPairSchema = z.object({
  de: z.string(),
  fa: z.string(),
});

export const MemoryMatchStepSchema = BaseStepSchema.extend({
  type: z.literal("memory-match"),
  title: z.string().default("Memory Game"),
  pairs: z.array(MemoryMatchPairSchema).min(2).max(8),
  timeLimit: z.number().int().min(30).max(300).default(60),
});

/* --------------------------------------------------
   Step Type 15: Vocab Check (Self-Assessment)
   User rates their knowledge of words
-------------------------------------------------- */

export const VocabCheckWordSchema = z.object({
  de: z.string(),
  fa: z.string(),
});

export const VocabCheckStepSchema = BaseStepSchema.extend({
  type: z.literal("vocab-check"),
  title: z.string().default("Self Check"),
  instruction: z.string().default("How well did you learn these words?"),
  words: z.array(VocabCheckWordSchema).min(1),
});

/* --------------------------------------------------
   Step Type 16: Word Hunt Game
   Find words in a letter grid
-------------------------------------------------- */

export const WordHuntStepSchema = BaseStepSchema.extend({
  type: z.literal("word-hunt"),
  title: z.string().default("Word Hunt"),
  instruction: z.string().default("Find all the German words from this lesson"),
  targetWords: z.array(z.string()).min(2),
  gridSize: z.object({
    rows: z.number().int().min(5).max(12).default(8),
    cols: z.number().int().min(5).max(12).default(8),
  }).optional(),
  timeLimit: z.number().int().min(30).max(300).default(90),
});

/* --------------------------------------------------
   Step Type 17: Matching Exercise
   Match German items to Persian translations
-------------------------------------------------- */

export const MatchingItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const MatchingStepSchema = BaseStepSchema.extend({
  type: z.literal("matching"),
  instruction: z.string().default("Find the correct pairs"),
  items: z.array(MatchingItemSchema).min(2),
  matches: z.array(MatchingItemSchema).min(2),
  correctPairs: z.array(z.array(z.string()).length(2)),
  shuffleTargets: z.boolean().default(true),
});

/* --------------------------------------------------
   EXTENSIBILITY: Generic Step Type
   For future unknown step types, allow custom data
-------------------------------------------------- */

export const GenericStepSchema = BaseStepSchema.extend({
  type: z.string(), // Any string that isn't a known type

  // Custom data as JSON object
  data: z.record(z.any()).optional(),
});

/* --------------------------------------------------
   Discriminated Union of All Step Types
-------------------------------------------------- */

export const LessonStepSchema = z.discriminatedUnion("type", [
  NewWordStepSchema,
  MultipleChoiceStepSchema,
  FillInBlankStepSchema,
  WordOrderStepSchema,
  TrueFalseStepSchema,
  TranslationStepSchema,
  DialogStepSchema,
  GrammarTipStepSchema,
  CompletionStepSchema,
  SpeedChallengeStepSchema,
  SpellingStepSchema,
  ComprehensionStepSchema,
  // Game step types
  RapidFireStepSchema,
  MemoryMatchStepSchema,
  VocabCheckStepSchema,
  WordHuntStepSchema,
  MatchingStepSchema,
]);

/* --------------------------------------------------
   Lesson Schema
-------------------------------------------------- */

export const LessonSchema = z.object({
  id: z.string(), // "A1-M01-L01"
  title: BilingualTextSchema,

  // Lesson metadata
  level: z.string(), // "A1", "A2", etc.
  module: z.number(), // Module number
  lessonNumber: z.number(),

  // Estimated duration in minutes
  estimatedMinutes: z.number().optional(),

  // Steps in this lesson
  steps: z.array(LessonStepSchema),

  // Tags for categorization
  tags: z.array(z.string()).optional(),
});

/* --------------------------------------------------
   Module Schema (Chapter)
-------------------------------------------------- */

export const ModuleSchema = z.object({
  id: z.string(), // "A1-M01"
  title: BilingualTextSchema,
  description: z.string().optional(),
  lessons: z.array(LessonSchema),
});

/* --------------------------------------------------
   Level/Course Schema
-------------------------------------------------- */

export const LevelSchema = z.object({
  id: z.string(), // "A1"
  title: BilingualTextSchema, // { de: "Anfänger", fa: "مبتدی" }
  description: z.string().optional(),
  modules: z.array(ModuleSchema),
});

/* --------------------------------------------------
   TypeScript Types (inferred from Zod schemas)
-------------------------------------------------- */

export type Media = z.infer<typeof MediaSchema>;
export type BilingualText = z.infer<typeof BilingualTextSchema>;
export type Example = z.infer<typeof ExampleSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;

export type BaseStep = z.infer<typeof BaseStepSchema>;
export type NewWordStep = z.infer<typeof NewWordStepSchema>;
export type MultipleChoiceStep = z.infer<typeof MultipleChoiceStepSchema>;
export type FillInBlankStep = z.infer<typeof FillInBlankStepSchema>;
export type WordOrderStep = z.infer<typeof WordOrderStepSchema>;
export type TrueFalseStep = z.infer<typeof TrueFalseStepSchema>;
export type TranslationStep = z.infer<typeof TranslationStepSchema>;
export type DialogStep = z.infer<typeof DialogStepSchema>;
export type GrammarTipStep = z.infer<typeof GrammarTipStepSchema>;
export type CompletionStep = z.infer<typeof CompletionStepSchema>;
export type SpeedChallengeStep = z.infer<typeof SpeedChallengeStepSchema>;
export type SpeedChallengeQuestion = z.infer<typeof SpeedChallengeQuestionSchema>;
export type SpellingStep = z.infer<typeof SpellingStepSchema>;
export type ComprehensionStep = z.infer<typeof ComprehensionStepSchema>;
export type ComprehensionQuestion = z.infer<typeof ComprehensionQuestionSchema>;
export type RapidFireStep = z.infer<typeof RapidFireStepSchema>;
export type RapidFireQuestion = z.infer<typeof RapidFireQuestionSchema>;
export type MemoryMatchStep = z.infer<typeof MemoryMatchStepSchema>;
export type MemoryMatchPair = z.infer<typeof MemoryMatchPairSchema>;
export type VocabCheckStep = z.infer<typeof VocabCheckStepSchema>;
export type VocabCheckWord = z.infer<typeof VocabCheckWordSchema>;
export type WordHuntStep = z.infer<typeof WordHuntStepSchema>;
export type MatchingStep = z.infer<typeof MatchingStepSchema>;
export type MatchingItem = z.infer<typeof MatchingItemSchema>;
export type GenericStep = z.infer<typeof GenericStepSchema>;

export type LessonStep = z.infer<typeof LessonStepSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Level = z.infer<typeof LevelSchema>;

/* --------------------------------------------------
   Helper: Validate and parse lesson JSON
-------------------------------------------------- */

export function parseLesson(jsonData: unknown): Lesson {
  return LessonSchema.parse(jsonData);
}

export function parseLevel(jsonData: unknown): Level {
  return LevelSchema.parse(jsonData);
}
