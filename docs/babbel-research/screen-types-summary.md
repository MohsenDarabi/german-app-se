# Babbel Screen Types - Research Summary

> Research Date: 2025-12-28 / 2025-12-29
> Lessons Analyzed:
>   - "Hallo, wie geht's dir? Part 1" (A1.1 Unit 1, Lesson 1)
>   - "Hallo, wie geht's dir? Part 2" (A1.1 Unit 1, Lesson 2)
>   - "Hallo, wie geht's dir? Part 3" (A1.1 Unit 1, Lesson 3) - Formal greetings
>   - "German Pronunciation: 'i'" (A1.1 Unit 1, Lesson 4)
>   - Recap Quiz (A1.1 Unit 1)

---

## Summary: 23 Unique Screen Types Discovered

| Category | Types Found |
|----------|-------------|
| **Vocabulary** | vocab-intro |
| **Translation** | mcq-translation |
| **Listening** | listening-fill, listening-choose-said |
| **Grammar** | grammar-tip |
| **Matching** | matching, response-matching |
| **Building** | word-sorting, sentence-order, spelling |
| **Dialogue** | dialogue, response-choice |
| **Pronunciation** | pronunciation-fill, listen-repeat, pronunciation-rule, pronunciation-quiz |
| **Meta/Navigation** | lesson-end, pronunciation-end, feedback-popup-tip, recap-intro, recap-end, formality-choice, story-intro |

---

## Part A: Core Lesson Exercise Types (Lessons 1-2)

### 1. Vocabulary Introduction (`vocab-intro`)
- **Screenshot**: `01-vocab-intro.png`
- **Instruction**: "Let's look at your first German words!"
- **Structure**:
  - German word (button)
  - English translation below
- **Interaction**: Click word to hear audio, auto-advances
- **Data to extract**: German word, English translation

### 2. MCQ Translation (`mcq-translation`)
- **Screenshot**: `02-mcq-translation.png`
- **Instruction**: "Choose the correct translation"
- **Structure**:
  - German word to translate (button at top)
  - 3-4 image options with English labels
- **Interaction**: Click correct option
- **Data to extract**: German word, options array, correct answer

### 3. Listening Fill-in-Blank (`listening-fill`)
- **Screenshot**: `03-listening-fill-blank.png`
- **Instruction**: "Listen and choose the correct answer"
- **Structure**:
  - Sentence with blank: "_____, Maria."
  - English translation: "Thanks, Maria."
  - 2 answer options as buttons
  - "Hide translation" toggle
- **Interaction**: Click correct word
- **Data to extract**: Sentence template, translation, options, correct answer

### 4. Grammar Tip with Fill-in (`grammar-tip`)
- **Screenshot**: `04-grammar-tip-fill.png`
- **Instruction**: Topic title (e.g., "Introducing yourself")
- **Structure**:
  - Explanation text: "To introduce yourself in German you use:"
  - Fill-in pattern: "_____ + your name."
  - Example sentence with translation
  - Sometimes has follow-up practice
- **Interaction**: Click answer to fill blank
- **Data to extract**: Topic, explanation, pattern, examples, practice items

### 5. Matching Exercise (`matching`)
- **Screenshot**: `05-matching.png`
- **Instruction**: "Match the items"
- **Structure**:
  - German word on left
  - 4 numbered English options on right
  - Words appear one at a time after matching
- **Interaction**: Click corresponding number
- **Data to extract**: Array of German-English pairs

### 6. Word Sorting / Phrase Builder (`word-sorting`)
- **Screenshot**: `06-word-sorting.png`
- **Instruction**: "Sort the items"
- **Structure**:
  - Audio icon (playable)
  - English translation shown
  - Syllable/word fragments as buttons
- **Interaction**: Click syllables in correct order
- **Data to extract**: Target word, translation, fragments array, audio URL

### 7. Dialogue with Fill-ins (`dialogue`)
- **Screenshots**: `07-listening-with-context.png`, `08-dialogue-complete.png`
- **Instruction**: "Listen and choose the correct answer"
- **Structure**:
  - Context/story text at top
  - Multiple conversation turns
  - Blanks to fill in sequence
  - "Listen to dialogue" button at end
- **Interaction**: Fill blanks in order, then Continue
- **Data to extract**: Context, dialogue array (speaker, german, english, isBlank)

### 8. Lesson Complete (`lesson-end`)
- **Screenshot**: `09-lesson-end.png`
- **URL Pattern**: `/activity-end/`
- **Structure**:
  - Celebration message
  - Score (e.g., "23/23 Answered correctly")
  - Upsell button
- **Interaction**: Click X or continue
- **Data to extract**: Score, lesson completion status

### 9. Listening - Choose What's Said (`listening-choose-said`)
- **Screenshot**: `10-listening-choose-said.png`
- **Instruction**: "Listen and choose what is said"
- **Structure**:
  - Audio playback icon
  - 2-3 German text options
  - Optional translation toggle
- **Interaction**: Click the option matching what you hear
- **Data to extract**: Audio URL, options array, correct answer

### 10. Sentence Order (`sentence-order`)
- **Screenshot**: `11-sentence-order.png`
- **Instruction**: "Put the sentence in the right order"
- **Structure**:
  - English translation shown
  - Word tiles to arrange
  - Drop zone for answer
- **Interaction**: Click/drag words in correct order
- **Data to extract**: Target sentence, translation, word tiles

### 11. Feedback Popup Tip (`feedback-popup-tip`)
- **Type**: Informational overlay
- **Structure**:
  - Popup appears after certain exercises
  - Contains grammar tips or cultural notes
  - "Got it" button to dismiss
- **Interaction**: Click to dismiss
- **Data to extract**: Tip text, related vocabulary

---

## Part B: Pronunciation Lesson Types (Lesson 4)

### 12. Pronunciation Fill (`pronunciation-fill`)
- **Screenshot**: `12-pronunciation-fill.png`
- **Instruction**: "Pronouncing [letter]"
- **Structure**:
  - Image (person listening)
  - Fill-in statement about pronunciation rules
  - 2 answer options
  - Explanation callout with letter highlight
- **Interaction**: Click correct answer
- **Data to extract**: Rule text, answer options, explanation

### 13. Listen and Repeat (`listen-repeat`)
- **Screenshot**: `13-listen-repeat.png`
- **Instruction**: "Listen and repeat: the short/long [letter]"
- **Structure**:
  - Word to pronounce (e.g., "bitte", "Bier")
  - Play sound buttons
  - Microphone recording button
  - "Show translation" button
- **Interaction**: Listen, then record yourself speaking
- **Data to extract**: Word, audio URL, translation, pronunciation type (long/short)
- **Note**: Speech recognition - may need to skip in automation

### 14. Pronunciation Rule (`pronunciation-rule`)
- **Screenshot**: `14-pronunciation-rule.png`
- **Instruction**: "The short and long [letter]"
- **Structure**:
  - Rule explanation with blanks
  - Example words with highlighted letters
  - Multiple fill-ins for the rule
- **Interaction**: Fill in blanks about pronunciation rules
- **Data to extract**: Rule template, correct values, example words

### 15. Pronunciation Quiz (`pronunciation-quiz`)
- **Screenshot**: `15-pronunciation-quiz.png`
- **Instruction**: "Is the [letter] long or short?"
- **Structure**:
  - Example words showing the letter
  - "long" / "short" options
  - Reveals translation after answering
- **Interaction**: Choose correct pronunciation type
- **Data to extract**: Word, correct answer (long/short), translation

### 16. Pronunciation Lesson End (`pronunciation-end`)
- **Screenshot**: `16-pronunciation-end.png`
- **URL Pattern**: `/activity-end/`
- **Structure**:
  - "Awesome! You're getting closer to crushing your goal"
  - Score (e.g., "4/4 Answered correctly")
  - "Continue learning" button
- **Interaction**: Click continue
- **Data to extract**: Score

---

## Part C: Recap/Quiz Types

### 17. Recap Introduction (`recap-intro`)
- **Screenshot**: `17-recap-intro.png`
- **Instruction**: "Quiz Time"
- **Structure**:
  - Puzzle image
  - Introduction text: "Now you're going to test what you remember..."
  - Fill-in with "Los geht's!" (Here we go!)
- **Interaction**: Click answer to start
- **Data to extract**: None (intro screen)

### 18. Formality Choice (`formality-choice`)
- **Screenshot**: `18-formality-choice.png`
- **Instruction**: "Decide whether the situation is formal (formell) or informal (informell)"
- **Structure**:
  - Audio playback for context
  - "informell" / "formell" options
- **Interaction**: Listen and choose formality level
- **Data to extract**: Context description, audio URL, correct formality

### 19. Response Matching (`response-matching`)
- **Screenshot**: `19-response-matching.png`
- **Instruction**: "Match the correct response"
- **Structure**:
  - Prompt statement (e.g., "Hallo, ich bin Freddy.")
  - 3 numbered response options
  - "Show translation" available
- **Interaction**: Click the appropriate response
- **Data to extract**: Prompt, options array, correct response

### 20. Spelling Exercise (`spelling`)
- **Screenshot**: `20-spelling.png`
- **Instruction**: "Fill in the gaps"
- **Structure**:
  - Sentence with blank
  - Individual letter buttons (scrambled)
  - Delete and Done buttons
  - Audio playback available
- **Interaction**: Click letters in correct order, then Done
- **Data to extract**: Target word, sentence context, translation

### 21. Response Choice (`response-choice`)
- **Instruction**: "How would you respond?"
- **Structure**:
  - Context in English (e.g., "Hello, I'm Freddy. – Hello, I'm Maria.")
  - 2 German response options
  - "Hide translation" toggle
- **Interaction**: Click appropriate response
- **Data to extract**: Context, options, correct answer

### 22. Recap End (`recap-end`)
- **Screenshot**: `21-recap-end.png`
- **Structure**:
  - "Nice work!" message
  - Encouragement text
  - "Continue" button
- **Interaction**: Click continue
- **Data to extract**: None (transition screen)

### 23. Story Introduction (`story-intro`)
- **Screenshot**: `22-story-intro.png`
- **Instruction**: None (narrative screen)
- **Structure**:
  - Title (e.g., "Freddy's second day in Berlin")
  - Story/context text setting up the lesson scenario
  - Additional context about what will be learned
  - "Continue" button
- **Interaction**: Click continue to proceed
- **Data to extract**: Title, story text, context
- **Note**: Sets narrative context for subsequent exercises (e.g., visiting apartment, formal situation)

---

## URL Patterns

| Type | URL Pattern |
|------|-------------|
| Lesson Player | `/lesson-player/{LANG}/{lesson_id}/{activity_id}?...` |
| Lesson End | `/activity-end/{LANG}/lesson/{lesson_id}/{activity_id}?...` |
| Dashboard | `/dashboard` |
| Course Overview | `/course-overview/{LANG}/learn_languages` |

---

## Common Button Patterns

| Button Type | Selector |
|-------------|----------|
| Answer buttons | `button[description*="answer"]` |
| Continue | `button:contains("Continue")` |
| Close | `button[description="Close"]` |
| Translation toggle | `button[description*="translation"]` |
| Sound playback | `button:contains("play-sound")` or sound icon |
| Microphone | `button[description*="microphone"]` |
| Delete (spelling) | `button[description="delete"]` |
| Done (spelling) | `button:contains("Done")` |

---

## Navigation Elements

- **Progress indicator**: In `<nav>`, format "X/Y" (current/total screens)
- **To previous/next trainer**: Arrow buttons for navigating between exercises
- **Close button**: Returns to dashboard

---

## Screenshots Captured

1. `01-vocab-intro.png` - Vocabulary introduction
2. `02-mcq-translation.png` - Multiple choice translation
3. `03-listening-fill-blank.png` - Listening fill-in
4. `04-grammar-tip-fill.png` - Grammar tip
5. `05-matching.png` - Matching exercise
6. `06-word-sorting.png` - Word sorting
7. `07-listening-with-context.png` - Dialogue context
8. `08-dialogue-complete.png` - Completed dialogue
9. `09-lesson-end.png` - Lesson completion
10. `10-listening-choose-said.png` - Listen and choose
11. `11-sentence-order.png` - Sentence ordering
12. `12-pronunciation-fill.png` - Pronunciation fill-in
13. `13-listen-repeat.png` - Listen and repeat (speech)
14. `14-pronunciation-rule.png` - Pronunciation rules
15. `15-pronunciation-quiz.png` - Pronunciation quiz
16. `16-pronunciation-end.png` - Pronunciation lesson end
17. `17-recap-intro.png` - Recap introduction
18. `18-formality-choice.png` - Formality choice
19. `19-response-matching.png` - Response matching
20. `20-spelling.png` - Spelling exercise
21. `21-recap-end.png` - Recap end

---

## Next Steps

1. [x] Explore core lessons (Lesson 1-2)
2. [x] Explore pronunciation lessons
3. [x] Explore recap/quiz lessons
4. [ ] Explore Lesson 3 (formal greetings) for additional types
5. [ ] Explore review section for any unique types
6. [ ] Update extractor to handle all 22 types
7. [ ] Begin A1 content extraction
