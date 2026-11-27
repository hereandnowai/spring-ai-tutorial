# Notes: Spring AI episode 3 of 10 (a chatbot with a memory)

Extra details for the episode: versions, choices we made after testing, the honest numbers, Windows commands and the project
tree. Real outputs and timings: [`output.txt`](output.txt).

## Versions used
| Tool | Version |
|---|---|
| Java | Eclipse Temurin 21.0.13.1+2 |
| Spring Boot | 4.2.0 |
| Spring AI | 2.1.0-M1, as start.spring.io wrote it into `pom.xml` in episode 1 (start.spring.io still picks it for Spring Boot 4.2.0) |
| New libraries | `spring-ai-starter-model-chat-memory-repository-jdbc` 2.1.0-M1 (from the Spring AI BOM), `com.h2database:h2` 2.5.252 (from Spring Boot) |
| Ollama / model | 0.32.13 / `qwen3.5:4b` (`think=false`, `num-ctx=8192`, `temperature=0.7`, all from episode 1) |
| Node.js / Vite / React | v26.13.0 / 8.3.8 / 19.3.1 |
| Ports | 8080 (Spring), 5173 (Vite), 11434 (Ollama) |

## What each step changes (the files here are the finished state after step 12)
- Step 4: `ChatController`: field `MessageChatMemoryAdvisor memory`; the constructor gets `ChatMemory chatMemory` (auto-configured
  by Spring AI: `MessageWindowChatMemory`, 20 messages, in RAM) and builds the advisor; `/stream` gets `.advisors(memory)` and
  `.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, "default"))`.
- Step 7: `/stream` gets `@RequestParam(defaultValue = "default") String chatId`; `"default"` in the advisor line becomes `chatId`.
- Step 8: `App.jsx`: `const [chatId, setChatId] = useState(crypto.randomUUID());` and `"&chatId=" + chatId` in the fetch address.
- Step 9: `App.jsx`: `newChat()` (new id + the first greeting), a **New chat** button in the header, a `.new-chat` style rule.
- Step 10: `pom.xml`: the JDBC chat memory repository starter + `h2` (`<scope>runtime</scope>`), no versions.
- Step 11: `application.properties`: `spring.datasource.url=jdbc:h2:file:./chai-memory` and
  `spring.ai.chat.memory.repository.jdbc.initialize-schema=always`; `spring-ai-chat/.gitignore`: `*.mv.db`, `*.trace.db`.
- Restart the Spring app (`Ctrl+C`, `./mvnw spring-boot:run`) after each Java, `pom.xml` or `.properties` change; Vite reloads the page by itself.

## Choices we made after testing (deviations from the plan)
1. **No default memory advisor in the constructor.** The plan said `.defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())`.
   In Spring AI 2.1.0-M1 a memory advisor needs a conversation id on every call ("There is no default conversation ID." in the
   docs); without it every endpoint failed with `IllegalArgumentException: conversationId cannot be null` (HTTP 500 on `/stream`
   and `/chat`). So the advisor is built in the constructor (field `memory`) and used only in `/stream`, the chat page's endpoint.
   `/chat`, `/recipe` and `/quiz` stay without memory (a quiz doesn't need the chat history, and it keeps structured output simple).
2. **Step 4 uses a fixed conversation id, `default`.** That's the honest first version, and it makes the step-6 mix-up real:
   everyone shares one conversation. Step 7 replaces it with the `chatId` request parameter (default `default`, so old URLs work).
3. **H2 works with the JDBC repository on this version** (the jar ships `schema-h2.sql` and an H2 dialect), so no alternative was
   needed. `initialize-schema=always` is needed for a *file* database (the default `embedded` only covers in-memory databases);
   the script uses `CREATE TABLE IF NOT EXISTS`, so it keeps old messages on every start.
4. **`.gitignore` changes too** (2 lines), so the database file (`chai-memory.mv.db`, plus H2's `.trace.db` log if it ever
   appears) never goes to GitHub. The plan listed four changed files; with `.gitignore` it is five.
5. **Deprecation note.** In Spring AI 2.1.0 (GA), `ChatMemory`, its repositories and `MessageChatMemoryAdvisor` are deprecated
   (to be removed in 3.0.0) in favour of *Session Memory*. Our project is on 2.1.0-M1 (what start.spring.io generates for Spring
   Boot 4.2.0), where they are the standard API and not deprecated. The video says this in one sentence.
6. **The chat id lives in the page's state**, so a page reload also starts a new chat (a new id). That keeps the code to two lines;
   to keep a chat across reloads, store the id in `localStorage`.

## Honest numbers (details in output.txt)
- Episode 2 code: Chai knew the name 0 of 4. With the memory: 4 of 4.
- One shared id, two people: Emma was called Liam 5 of 8, both names mixed 2 of 8, right 1 of 8. One id per person: 16 of 16 right
  (8 via curl, 8 via the chat page).
- New chat: "I don't know your name" 3 of 4 (once Chai only introduced itself).
- Restart with the memory in RAM: forgotten 2 of 2. With the H2 file: remembered 4 of 4 (+1 of 1 on CPU only).
- Window (20 messages, also in the database: `COUNT(*)` per conversation never above 20): after 22 or 32 messages the first
  message is gone and the name was forgotten 5 of 6.
- Speed: while the window is not full, Ollama reuses the work it already did for the same conversation, so time hardly grows
  (normal: first words ~0.45 s with 2, 10 or 20 messages). When the oldest messages drop out, the model reads all 20 again:
  normal 1.4-2.2 s, CPU only 6.75-7.2 s (vs ~0.8 s with 2 messages).

## Things to know
- `chatId` must be at most 36 characters (the H2 table's `conversation_id` is `VARCHAR(36)`); `crypto.randomUUID()` is exactly 36.
- `crypto.randomUUID()` works on `http://localhost` (a secure context); on a plain-HTTP address of another machine it doesn't.
- To change the window size, define your own bean: `MessageWindowChatMemory.builder().chatMemoryRepository(repo).maxMessages(10).build()`.
- To look inside the database (app stopped):
  `java -cp ~/.m2/repository/com/h2database/h2/2.5.252/h2-2.5.252.jar org.h2.tools.Shell -url jdbc:h2:file:./chai-memory -user "" -password ""`
  then `SELECT conversation_id, type, content FROM SPRING_AI_CHAT_MEMORY;` (H2 allows one process at a time on the file).
- Delete `chai-memory.mv.db` (app stopped) to forget everything.
- `npm run lint` shows 2 harmless warnings (an unused `err` in two `catch` blocks), as in episode 2.
- Timings on a normal laptop CPU will be slower than our test Mac.

## Windows equivalents
Not run on Windows (no Windows machine); these are the standard equivalents.

| macOS / Linux | Windows (PowerShell) |
|---|---|
| `ollama list`, `ollama ps`, `ollama stop qwen3.5:4b` | same |
| `cd spring-ai-chat` then `./mvnw spring-boot:run` | `cd spring-ai-chat` then `.\mvnw.cmd spring-boot:run` (Command Prompt: `mvnw spring-boot:run`) |
| CPU only: `./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0` | `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0"` |
| `cd chat-ui` then `npm run dev` | same (`npm.cmd run dev` if PowerShell says running scripts is disabled) |
| `jdbc:h2:file:./chai-memory` | same (relative to the folder you start the app from: `spring-ai-chat`) |
| `curl "http://localhost:8080/stream?q=What's%20my%20name%3F&chatId=emma"` | `curl.exe "http://localhost:8080/stream?q=What's%20my%20name%3F&chatId=emma"` or the browser |
| Stop an app: `Ctrl+C` | `Ctrl+C` (answer `Y` to "Terminate batch job?") |
| Starting fresh: copy `02-smarter-chatbot` to `~/Desktop/my-first-chatbot` | copy it to `C:\Users\<you>\Desktop\my-first-chatbot` |

## Explorer tree after this episode (VS Code Explorer, folder `my-first-chatbot`)
Build output (`spring-ai-chat/target/`, `chat-ui/node_modules/`) not shown. VS Code shows `com/hereandnowai/spring_ai_chat` on one
line (compact folders).
```
my-first-chatbot
├── spring-ai-chat
│   ├── .mvn/wrapper/maven-wrapper.properties
│   ├── src
│   │   ├── main
│   │   │   ├── java/com/hereandnowai/spring_ai_chat
│   │   │   │   ├── ChatController.java              (changed: steps 4 and 7)
│   │   │   │   ├── Quiz.java                        (unchanged)
│   │   │   │   ├── QuizQuestion.java                (unchanged)
│   │   │   │   ├── Recipe.java                      (unchanged)
│   │   │   │   └── SpringAiChatApplication.java
│   │   │   └── resources
│   │   │       ├── prompts/quiz.st, prompts/tutor.st (unchanged)
│   │   │       ├── static, templates
│   │   │       └── application.properties           (changed: step 11)
│   │   └── test/java/com/hereandnowai/spring_ai_chat/SpringAiChatApplicationTests.java
│   ├── .gitattributes, HELP.md, mvnw, mvnw.cmd
│   ├── .gitignore                                    (changed: step 11)
│   ├── chai-memory.mv.db                             (new: step 12, created by the app; ignored by Git, not in this repo)
│   └── pom.xml                                       (changed: step 10)
└── chat-ui
    ├── public, src/assets, src/App.css, src/index.css, src/main.jsx
    ├── src/App.jsx                                   (changed: steps 8 and 9)
    ├── index.html, package.json, package-lock.json, vite.config.js, README.md, .gitignore, .oxlintrc.json
    └── PROMPT.md, PROMPT-2.md                        (episodes 1 and 2's prompts, for reference)
```

## How the tests were run (for re-runs)
- Java: Temurin 21.0.13.1 with `JAVA_HOME` pointed at it.
- Each mode: `ollama stop qwen3.5:4b`, then start the app with `./mvnw spring-boot:run [-Dspring-boot.run.arguments=…]`.
- Chat page: `npm run dev`, headless Chromium at 1920×1080 (one or two browser windows): type, press Enter, sample the answer
  bubble every 50 ms, screenshot when the Send button comes back. Restarts mid-session: Ctrl+C equivalent, start again, keep the page open.
- History timings: a small Node client calls `/stream` with a fresh `chatId`, sends "My name is Emma." and N Java questions, then
  times "What's my name?".
- All apps stopped and `ollama stop qwen3.5:4b` run at the end.
