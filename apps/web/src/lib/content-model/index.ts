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

  // Optional image for visual learning
  image: z.string().optional(), // URL

  // Phonetic pronunciation guide (e.g., "ha-LO" for "Hallo")
  phonetic: z.string().optional(),

  // Word type/part of speech (e.g., "noun", "verb", "adjective", "phrase")
  wordType: z.string().optional(),

  // Additional note in Persian for learners
  note: z.object({
    fa: z.string(),
  }).optional(),

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
   Step Type 5: Matching Exercise
   Match items from two columns (tap-to-match)
-------------------------------------------------- */

export const MatchingStepSchema = BaseStepSchema.extend({
  type: z.literal("matching"),

  // Instruction text
  instruction: z.string().default("Match the items."),

  // Left column items (e.g., German words)
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ).min(2).max(6),

  // Right column items (e.g., Persian translations)
  matches: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ).min(2).max(6),

  // Correct pairs: array of [itemId, matchId] tuples
  correctPairs: z.array(
    z.tuple([z.string(), z.string()])
  ),

  // Whether to shuffle the right column (default: true)
  shuffleTargets: z.boolean().default(true),
});

/* --------------------------------------------------
   Step Type 6: True or False
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

  // Dialog title (e.g., "Im Deutschkurs", "Am Telefon")
  title: z.string().optional(),

  // Instruction text (e.g., "Read and practice:")
  instruction: z.string().optional(),

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
   Step Type 10: Listen and Choose
   Hear audio, select what was said
-------------------------------------------------- */

export const ListenAndChooseStepSchema = BaseStepSchema.extend({
  type: z.literal("listen-and-choose"),

  // Instruction text
  instruction: z.string().default("چه شنیدید؟"),

  // The German text to be spoken (audio will be generated/played)
  germanText: z.string(),

  // Optional Persian translation to show after answering
  translation: z.string().optional(),

  // Answer choices (German text options)
  options: z.array(z.string()).min(2).max(4),

  // Correct answer index (0-based)
  correctAnswerIndex: z.number().int().min(0),

  // Auto-play audio on step load
  autoPlay: z.boolean().default(false),
});

/* --------------------------------------------------
   Step Type 11: Speed Challenge
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
   Step Type 12: Formality Choice
   Choose Sie (formal) or Du (informal) for situations
   Critical for Persian speakers (similar to شما/تو)
-------------------------------------------------- */

export const FormalityChoiceStepSchema = BaseStepSchema.extend({
  type: z.literal("formality-choice"),

  // Instruction text
  instruction: z.string().default("رسمی یا غیررسمی؟"),

  // Scenario description (in Persian)
  scenario: z.string(),

  // Optional scenario image
  scenarioImage: z.string().optional(),

  // The two options (formal and informal German phrases)
  formalOption: z.object({
    text: z.string(),        // "Wie geht es Ihnen?"
    label: z.string().default("رسمی (Sie)"),
  }),

  informalOption: z.object({
    text: z.string(),        // "Wie geht's?"
    label: z.string().default("غیررسمی (Du)"),
  }),

  // Which is correct: "formal" or "informal"
  correctAnswer: z.enum(["formal", "informal"]),

  // Cultural explanation (shown after answering)
  explanation: z.string(),

  // Optional comparison to Persian culture
  persianNote: z.string().optional(),
});

/* --------------------------------------------------
   Step Type 13: Memory Match
   Classic memory game with German-Persian pairs
-------------------------------------------------- */

export const MemoryMatchPairSchema = z.object({
  id: z.string(),
  german: z.string(),
  persian: z.string(),
});

export const MemoryMatchStepSchema = BaseStepSchema.extend({
  type: z.literal("memory-match"),

  // Instruction text
  instruction: z.string().default("کارت‌های همسان را پیدا کنید!"),

  // Pairs to match (German-Persian)
  pairs: z.array(MemoryMatchPairSchema).min(3).max(8),

  // Grid columns (auto-calculated if not provided)
  columns: z.number().int().min(2).max(4).optional(),

  // Optional time limit in seconds (0 = no limit)
  timeLimit: z.number().int().min(0).max(300).default(0),

  // Show attempts counter
  showAttempts: z.boolean().default(true),
});

/* --------------------------------------------------
   Step Type 14: Word Hunt
   Word search puzzle - find German words in a letter grid
-------------------------------------------------- */

export const WordHuntWordSchema = z.object({
  word: z.string(),           // The German word to find
  translation: z.string(),    // Persian translation (shown in word list)
});

export const WordHuntStepSchema = BaseStepSchema.extend({
  type: z.literal("word-hunt"),

  // Instruction text
  instruction: z.string().default("کلمات آلمانی را در جدول پیدا کنید!"),

  // Words to find in the grid
  words: z.array(WordHuntWordSchema).min(3).max(8),

  // Grid size (6x6, 8x8, etc.) - will be auto-generated
  gridSize: z.number().int().min(5).max(10).default(6),

  // Allowed directions for word placement
  directions: z.array(z.enum(["horizontal", "vertical", "diagonal"])).default(["horizontal", "vertical"]),

  // Optional time limit in seconds (0 = no limit)
  timeLimit: z.number().int().min(0).max(300).default(0),

  // Show hints (highlight first letter)
  showHints: z.boolean().default(false),
});

/* --------------------------------------------------
   Step Type 15: Rapid Fire
   Tinder-style swipe decisions for vocabulary
-------------------------------------------------- */

export const RapidFireQuestionSchema = z.object({
  question: z.string(),           // German word or phrase
  optionLeft: z.string(),         // Left swipe option (e.g., Persian translation A)
  optionRight: z.string(),        // Right swipe option (e.g., Persian translation B)
  correctSide: z.enum(["left", "right"]), // Which side is correct
});

export const RapidFireStepSchema = BaseStepSchema.extend({
  type: z.literal("rapid-fire"),

  // Title shown at start
  title: z.string().default("چالش سریع!"),

  // Instructions
  instruction: z.string().default("به چپ یا راست بکشید!"),

  // Questions pool
  questions: z.array(RapidFireQuestionSchema).min(5),

  // Time per question in seconds (0 = no limit)
  timePerQuestion: z.number().int().min(0).max(10).default(3),

  // Points per correct answer
  basePoints: z.number().int().default(10),

  // Show streak counter with fire animation
  showStreak: z.boolean().default(true),
});

/* --------------------------------------------------
   Step Type 16: Chat Simulator
   WhatsApp-style conversation practice
-------------------------------------------------- */

export const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(["friend", "user"]),  // Who sends this message
  text: z.string(),                     // Message text (German)
  translation: z.string().optional(),   // Persian translation (shown on tap)
  timestamp: z.string().optional(),     // e.g., "14:32"
});

export const ChatResponseOptionSchema = z.object({
  id: z.string(),
  text: z.string(),                     // German response text
  translation: z.string().optional(),   // Persian hint
  isCorrect: z.boolean().default(true), // All can be correct for branching
  nextMessageId: z.string().optional(), // Which message follows this choice
});

export const ChatNodeSchema = z.object({
  messageId: z.string(),                // ID of friend's message
  message: ChatMessageSchema,           // The friend's message
  responseOptions: z.array(ChatResponseOptionSchema).min(2).max(4),
  correctResponseId: z.string().optional(), // If there's one "best" answer
});

export const ChatSimulatorStepSchema = BaseStepSchema.extend({
  type: z.literal("chat-simulator"),

  // Friend's name and avatar
  friendName: z.string().default("Anna"),
  friendAvatar: z.string().optional(),  // Emoji or image URL

  // Scenario description (Persian)
  scenario: z.string(),

  // Conversation nodes (tree structure)
  nodes: z.array(ChatNodeSchema).min(1),

  // Starting node ID
  startNodeId: z.string(),

  // Show translations automatically or on tap
  showTranslations: z.boolean().default(false),
});

/* --------------------------------------------------
   Step Type 17: Vocab Check
   In-lesson vocabulary self-assessment with difficulty rating
-------------------------------------------------- */

export const VocabCheckWordSchema = z.object({
  id: z.string(),
  german: z.string(),
  persian: z.string(),
  example: z.string().optional(),       // Example sentence
  audio: z.string().optional(),         // Audio ID for pronunciation
});

export const VocabCheckStepSchema = BaseStepSchema.extend({
  type: z.literal("vocab-check"),

  // Title
  title: z.string().default("مرور واژگان"),

  // Instruction
  instruction: z.string().default("هر کلمه را مرور کنید و سختی آن را مشخص کنید"),

  // Words to check
  words: z.array(VocabCheckWordSchema).min(3),

  // Show example sentences
  showExamples: z.boolean().default(true),

  // Enable audio playback
  enableAudio: z.boolean().default(true),
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
  MatchingStepSchema,
  TrueFalseStepSchema,
  TranslationStepSchema,
  DialogStepSchema,
  GrammarTipStepSchema,
  CompletionStepSchema,
  ListenAndChooseStepSchema,
  SpeedChallengeStepSchema,
  FormalityChoiceStepSchema,
  MemoryMatchStepSchema,
  WordHuntStepSchema,
  RapidFireStepSchema,
  ChatSimulatorStepSchema,
  VocabCheckStepSchema,
  // Add new step types here as you discover them
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
export type MatchingStep = z.infer<typeof MatchingStepSchema>;
export type TrueFalseStep = z.infer<typeof TrueFalseStepSchema>;
export type TranslationStep = z.infer<typeof TranslationStepSchema>;
export type DialogStep = z.infer<typeof DialogStepSchema>;
export type GrammarTipStep = z.infer<typeof GrammarTipStepSchema>;
export type CompletionStep = z.infer<typeof CompletionStepSchema>;
export type ListenAndChooseStep = z.infer<typeof ListenAndChooseStepSchema>;
export type SpeedChallengeStep = z.infer<typeof SpeedChallengeStepSchema>;
export type SpeedChallengeQuestion = z.infer<typeof SpeedChallengeQuestionSchema>;
export type FormalityChoiceStep = z.infer<typeof FormalityChoiceStepSchema>;
export type MemoryMatchStep = z.infer<typeof MemoryMatchStepSchema>;
export type MemoryMatchPair = z.infer<typeof MemoryMatchPairSchema>;
export type WordHuntStep = z.infer<typeof WordHuntStepSchema>;
export type WordHuntWord = z.infer<typeof WordHuntWordSchema>;
export type RapidFireStep = z.infer<typeof RapidFireStepSchema>;
export type RapidFireQuestion = z.infer<typeof RapidFireQuestionSchema>;
export type ChatSimulatorStep = z.infer<typeof ChatSimulatorStepSchema>;
export type ChatNode = z.infer<typeof ChatNodeSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatResponseOption = z.infer<typeof ChatResponseOptionSchema>;
export type VocabCheckStep = z.infer<typeof VocabCheckStepSchema>;
export type VocabCheckWord = z.infer<typeof VocabCheckWordSchema>;
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
