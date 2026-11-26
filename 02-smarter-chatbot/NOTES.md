# Notes: Spring AI episode 2 (a smarter chatbot)

Extra details for the episode: versions, choices we made after testing, the honest quiz numbers, Windows commands and
the project tree. Real outputs and timings: [`output.txt`](output.txt).

## Versions used
| Tool | Version |
|---|---|
| Java | Eclipse Temurin 21.0.13.1+2 (`openjdk version "21.0.13.1" 2026-11-17 LTS`) |
| Spring Boot | 4.2.0 |
| Spring AI | 2.1.0-M1, as start.spring.io wrote it into `pom.xml` in episode 1 (unchanged in this episode) |
| Ollama / model | 0.32.13 / `qwen3.5:4b` (`think=false`, `num-ctx=8192`, `temperature=0.7`, all from episode 1) |
| Node.js / Vite / React | v26.13.0 / 8.3.8 / 19.3.1 |
| Ports | 8080 (Spring), 5173 (Vite), 11434 (Ollama) |

No new dependencies: everything used here (`defaultSystem`, `.system(...)`, `Resource` templates, `.entity(...)` with a
record that holds a `List` of records, `AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT`) is part of the Spring AI starter
from episode 1. `pom.xml`, `package.json` and `application.properties` are unchanged.

## What each step changes (the files here are the finished state after step 12)
- Step 4: `ChatController` constructor gets `.defaultSystem("""…""")` (the job description, a Java text block).
- Step 6: new folder `src/main/resources/prompts`, new file `tutor.st` (the job description + the `{level}` blank);
  the `defaultSystem` call is removed again (`builder.build()`), because the job description now lives in the file.
- Step 7: field `@Value("classpath:/prompts/tutor.st") Resource tutorPrompt`; `/stream` gets
  `@RequestParam(defaultValue = "complete beginner") String level` and `.system(s -> s.text(tutorPrompt).param("level", level))`.
  `/chat` and `/recipe` are unchanged (they now run without a system message, as in episode 1).
- Step 8: `App.jsx`: a `level` state, a `<select>` with two options, `&level=` in the fetch address, one small CSS rule.
- Step 10: new records `QuizQuestion.java` and `Quiz.java`.
- Step 11: new file `prompts/quiz.st` (blanks `{topic}` and `{count}`), field `quizPrompt`, endpoint `/quiz` with the
  `answerIndex` range check.
- Step 12: `App.jsx` replaced with the AI assistant's answer to `chat-ui/PROMPT-2.md` (unchanged, it worked the first time).
- Restart the Spring app (`Ctrl+C`, `./mvnw spring-boot:run`) after each Java or `.st` change; Vite reloads the page by itself.

## Choices we made after testing
1. **The system prompt's wording.** "When an example helps, give one small Java example" gave weak or wrong code
   (3 of 3 tries); "If code helps, show one small, complete Java method on its own lines" gave correct methods.
   Even then, small models don't follow every rule every time (one answer still used a Markdown code fence).
2. **The level line in `tutor.st`.** "You are talking to a {level}." changed the answers very little; "The person asking
   is a {level}. Use words a {level} knows." made the two levels clearly different (the blank appears twice; both are filled).
3. **The questions on screen.** For "What is a Java record?" our 4B model showed a normal class instead of a record to
   complete beginners (2 of 2 tries), so the level demo uses "What is a class?" (browser) and "What is an interface?"
   (chat page). Episode lesson: always read the code an AI gives you.
4. **Quiz answers are often wrong, so we say so.** 25 of 25 quizzes parsed and every `answerIndex` was in range, but only
   47 of 75 marked answers were really right (we checked each one by hand; list in `output.txt`). Things that did NOT help:
   putting `explanation` before `answerIndex` (54 of 84 right, no better), spelling out "0 for the first option…" in the
   prompt (12 of 30, worse), an extra `answer` text field (broken JSON, much worse). The bigger `qwen3.5:9b` got 27 of 30
   right. The `answerIndex` range check stays: in a test round with the field order swapped it caught 2 impossible answers
   (HTTP 500 with "The AI marked an answer that doesn't exist. Please try again.").
5. **The quiz shown in the video** is a real quiz from the chat page; it took 9 tries to get one whose three marked answers
   were all right (tries 1 to 8 are listed in `output.txt`).

## Things to know
- `.param("count", count)` takes any object; the `int` is written into the template as `3`.
- StringTemplate uses `{ }` for blanks, so a prompt file must not contain other curly braces (use the
  `<` `>` delimiters from the docs if you need JSON inside a prompt).
- The chat page's Markdown: the page shows the model's text as it is. Asking for "plain text, no Markdown" in the system
  prompt is simpler than adding a Markdown library.
- `npm run lint` shows 2 harmless warnings (an unused `err` in two `catch` blocks).
- Timings on a normal laptop CPU will be slower than our test Mac: several seconds per answer, about a minute per quiz.

## Windows equivalents
Not run on Windows (no Windows machine); these are the standard equivalents.

| macOS / Linux | Windows (PowerShell) |
|---|---|
| `ollama list`, `ollama ps`, `ollama stop qwen3.5:4b` | same |
| `cd spring-ai-chat` then `./mvnw spring-boot:run` | `cd spring-ai-chat` then `.\mvnw.cmd spring-boot:run` (Command Prompt: `mvnw spring-boot:run`) |
| CPU only: `./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0` | `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0"` |
| `cd chat-ui` then `npm run dev` | same (`npm.cmd run dev` if PowerShell says running scripts is disabled) |
| `src/main/resources/prompts/tutor.st` | `src\main\resources\prompts\tutor.st` |
| `curl "http://localhost:8080/quiz?topic=recursion"` | `curl.exe "http://localhost:8080/quiz?topic=recursion"` or open the address in the browser |
| Stop an app: `Ctrl+C` | `Ctrl+C` (answer `Y` to "Terminate batch job?") |
| Starting fresh: copy `01-first-ai-chatbot` to `~/Desktop/my-first-chatbot` | copy it to `C:\Users\<you>\Desktop\my-first-chatbot` |

## Explorer tree after this episode (VS Code Explorer, folder `my-first-chatbot`)
Build output (`spring-ai-chat/target/`, `chat-ui/node_modules/`) not shown. VS Code shows
`com/hereandnowai/spring_ai_chat` on one line (compact folders).
```
my-first-chatbot
├── spring-ai-chat
│   ├── .mvn/wrapper/maven-wrapper.properties
│   ├── src
│   │   ├── main
│   │   │   ├── java/com/hereandnowai/spring_ai_chat
│   │   │   │   ├── ChatController.java              (changed: steps 4, 6, 7, 11)
│   │   │   │   ├── Quiz.java                        (new: step 10)
│   │   │   │   ├── QuizQuestion.java                (new: step 10)
│   │   │   │   ├── Recipe.java                      (unchanged)
│   │   │   │   └── SpringAiChatApplication.java
│   │   │   └── resources
│   │   │       ├── prompts
│   │   │       │   ├── quiz.st                      (new: step 11)
│   │   │       │   └── tutor.st                     (new: step 6)
│   │   │       ├── static
│   │   │       ├── templates
│   │   │       └── application.properties           (unchanged)
│   │   └── test/java/com/hereandnowai/spring_ai_chat/SpringAiChatApplicationTests.java
│   ├── .gitattributes, .gitignore, HELP.md, mvnw, mvnw.cmd
│   └── pom.xml                                       (unchanged)
└── chat-ui
    ├── public, src/assets, src/App.css, src/index.css, src/main.jsx
    ├── src/App.jsx                                   (changed: steps 8 and 12)
    ├── index.html, package.json, package-lock.json, vite.config.js, README.md, .gitignore, .oxlintrc.json
    ├── PROMPT.md                                     (episode 1's prompt, for reference)
    └── PROMPT-2.md                                   (this episode's prompt)
```

## How the tests were run (for re-runs)
- Java: Temurin 21.0.13.1 with `JAVA_HOME` pointed at it.
- Each mode: `ollama stop qwen3.5:4b`, then start the app with `./mvnw spring-boot:run [-Dspring-boot.run.arguments=…]`.
- Chat page: `npm run dev`, headless Chromium at 1920×1080: type, press Enter (or click **Quiz me**), sample the answer
  bubble every 50 ms, screenshot when the Send button comes back.
- Quiz quality: every `/quiz` answer was read and judged by hand ("is the option marked by `answerIndex` really the
  correct one?"). Wrong-but-defensible cases were counted as right; questions with no correct option were counted as wrong.
- All apps stopped and `ollama stop qwen3.5:4b` (and `qwen3.5:9b`) run at the end.

## Deviations from the approved plan (and why)
1. **The constructor's `defaultSystem` is removed again in step 6.** The plan says "the system prompt moves here"
   (into `tutor.st`), so the text lives in one place only. `/stream` (the chat page) uses the template; `/chat` and
   `/recipe` go back to episode 1's behaviour (no system message).
2. **Step 7's browser test uses "What is a class?"** (not "What is recursion?") because recursion answers barely
   differed between the two levels; step 9 uses "What is an interface?" because "What is a Java record?" gave beginners
   a class instead of a record (shown as a tip instead).
3. **The `/quiz` code wraps long lines** (`.param(...)` on their own lines, the exception message on a second line) so
   the code fits on screen; it is the same code.
4. **The quiz's honesty:** the plan expected "how often the marked answer was actually right"; the answer is about
   2 in 3 with `qwen3.5:4b` (47 of 75), so the video says so, adds the range check, and shows `qwen3.5:9b` (27 of 30).
5. **The step-12 assistant answer needed no fix.** (Episode 1's needed one; this prompt pastes the whole current file.)
