# Spring AI Tutorial, Episode 3 of 10: Give Your Java AI Chatbot a Memory (Chat Memory in Spring AI)

**HERE AND NOW AI** · *AI is Good*

Episode 3 of 10 of **Spring AI for Java Developers** on the [HERE AND NOW AI YouTube channel](https://youtube.com/@hereandnow_ai).
This episode **continues the chatbot from episodes 1 and 2** (same `my-first-chatbot` folder, same two apps). At the end of
episode 2, Chai (our Java tutor) forgot your name right after you told it. Today Chai gets a **memory**: a chat memory
advisor, **one memory per person** (a conversation id), a **New chat** button in the chat page, and a small **database file**
so the memory even survives a restart. Still free, still on your own laptop, still no API key.

```
 Chat page (React, port 5173)  →  Spring Boot app + Spring AI (port 8080)  →  Ollama + qwen3.5:4b (port 11434)
      sends its chatId                 chat memory (last 20 messages) ⇄ chai-memory.mv.db (H2 file database)
```

**Starting fresh?** Copy the episode 2 folder [`02-smarter-chatbot`](../02-smarter-chatbot) from this repo to your Desktop,
rename it `my-first-chatbot`, run `npm install` once inside `chat-ui`, and you're exactly where episode 3 starts.

**6 parts, 12 steps.** Tick each one as you go.

| Part | Step | |
|---|---|---|
| 1. Where we left off | 1. Recap episodes 1 and 2 · 2. Open the project and see the problem | ☐ ☐ |
| 2. Why Chai forgets | 3. How a chat model really works | ☐ |
| 3. Give Chai a memory | 4. Add the memory advisor · 5. Restart and test | ☐ ☐ |
| 4. One memory per person | 6. The mix-up · 7. A conversation id | ☐ ☐ |
| 5. Upgrade the chat page | 8. Send the chat id · 9. A New chat button | ☐ ☐ |
| 6. Remember after a restart | 10. Add the JDBC memory library · 11. Configure the database · 12. Restart and prove it | ☐ ☐ ☐ |

Commands are shown for macOS/Linux. **Windows:** see [NOTES.md → Windows](NOTES.md#windows-equivalents) (mostly:
use `.\mvnw.cmd` instead of `./mvnw` and `\` in paths).

You need what episode 1 installed (official download links):
- Java 21 (Eclipse Temurin): <https://adoptium.net/temurin/releases/?version=21>
- Ollama: <https://ollama.com/download>, then `ollama pull qwen3.5:4b`
- VS Code: <https://code.visualstudio.com/download> + "Extension Pack for Java"
- Node.js (LTS): <https://nodejs.org/en/download>

New in this episode: two libraries in `pom.xml` (Maven downloads them for you; nothing to install by hand).

---

## Part 1. Where we left off

### Step 1. Recap episodes 1 and 2
Episode 1: a laptop ready for AI, a Spring Boot project, `/chat`, `/recipe` (answers as Java objects), `/stream` and a
React chat page. Episode 2: Chai's job description (system prompt), `prompts/tutor.st` with a `{level}` blank, the
"Explain for" dropdown, and the quiz (`/quiz`, `Quiz` + `QuizQuestion` records, clickable quiz cards). The folder:
```
my-first-chatbot/
├── spring-ai-chat/                                  ← the Java app (Spring Boot + Spring AI)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/hereandnowai/spring_ai_chat/
│       │   ├── ChatController.java                  ← /chat, /recipe, /stream, /quiz
│       │   ├── Quiz.java, QuizQuestion.java, Recipe.java
│       │   └── SpringAiChatApplication.java
│       └── resources/
│           ├── prompts/tutor.st, prompts/quiz.st
│           └── application.properties
└── chat-ui/                                         ← the chat page (React + Vite)
    └── src/App.jsx
```

### Step 2. Open the project and see the problem
VS Code → **File → Open Folder…** → `my-first-chatbot`. Check Ollama (`ollama list` shows `qwen3.5:4b`), then start
both apps, each in its own terminal:
```bash
# terminal 1
cd spring-ai-chat
./mvnw spring-boot:run
# terminal 2
cd chat-ui
npm run dev
```
Open <http://localhost:5173>, type "My name is Emma.", then "What's my name?". Chai doesn't know (4 of 4 tries in our test):
every request starts from zero.

## Part 2. Why Chai forgets

### Step 3. How a chat model really works
A chat model is **stateless**: it only sees what you send in one request. Think of a waiter without a notepad. Chat memory
is the notepad: **our app** keeps the earlier messages and sends them again with every new question. The model itself still
remembers nothing. Official docs: <https://docs.spring.io/spring-ai/reference/api/chat-memory.html> ("Large language models
(LLMs) are stateless, meaning they do not retain information about previous interactions.").

## Part 3. Give Chai a memory

### Step 4. Add the memory advisor
Open `spring-ai-chat/src/main/java/com/hereandnowai/spring_ai_chat/ChatController.java`. A new field and a second
constructor parameter (Spring AI auto-configures a `ChatMemory`: a message window that keeps the last 20 messages, in RAM):
```java
private final MessageChatMemoryAdvisor memory;   // Chai's notepad: re-sends the earlier messages

public ChatController(ChatClient.Builder builder, ChatMemory chatMemory) {
    this.chatClient = builder.build();
    this.memory = MessageChatMemoryAdvisor.builder(chatMemory).build();
}
```
In `/stream`, right after `.user(q)`, two lines:
```java
                .advisors(memory)                                                // remember this chat
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, "default"))   // which conversation
```
(Imports: `org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor` and
`org.springframework.ai.chat.memory.ChatMemory`; VS Code offers them.) **The conversation id is required**: without it you get
`IllegalArgumentException: conversationId cannot be null` (docs: "There is no default conversation ID."). For now, every
message uses the same id, `default`.

Note: in Spring AI **2.1.0** (the release after the 2.1.0-M1 that start.spring.io gives our project), `ChatMemory` and
`MessageChatMemoryAdvisor` are marked deprecated in favour of the new *Session Memory*; they still work until 3.0.
The idea (an advisor re-sends the conversation, keyed by a conversation id) stays the same.

### Step 5. Restart and test
Terminal 1: **Ctrl+C**, then `./mvnw spring-boot:run`. In the page: "My name is Emma." → "What's my name?" → "Your name is
Emma. I know it because you told me your name right here." (4 of 4 in our tests, each answer under a second).

## Part 4. One memory per person

### Step 6. The mix-up
Open the page in two browser windows. Emma: "My name is Emma." Liam: "My name is Liam." Emma: "What's my name?" →
"Your name is Liam." Everyone shares the conversation `default`. In 8 tries: Emma was called Liam 5 times, both names were
mixed up 2 times, right once.

### Step 7. A conversation id
`/stream` gets a third request parameter and uses it in the advisor line:
```java
@GetMapping("/stream")
public Flux<String> stream(@RequestParam String q,
        @RequestParam(defaultValue = "complete beginner") String level,
        @RequestParam(defaultValue = "default") String chatId) {
    return chatClient.prompt()
            .system(s -> s.text(tutorPrompt).param("level", level))
            .user(q)
            .advisors(memory)
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))      // whose conversation
            .stream()
            .content();
}
```
Restart, then test with two ids (the docs: "make the conversation ID unique per user"):
- <http://localhost:8080/stream?q=My%20name%20is%20Emma.&chatId=emma> and <http://localhost:8080/stream?q=My%20name%20is%20Liam.&chatId=liam>
- <http://localhost:8080/stream?q=What's%20my%20name%3F&chatId=emma> → "Your name is Emma." and the same with `chatId=liam` → "Your name is Liam." (8 of 8 right)

## Part 5. Upgrade the chat page

### Step 8. Send the chat id
In `chat-ui/src/App.jsx`, type two small changes:
```jsx
// 1. next to the other useState lines: a random id for this page (made by the browser)
const [chatId, setChatId] = useState(crypto.randomUUID()); // this chat's own id

// 2. in fetch(...): add the id to the address
const response = await fetch(
  API_URL + encodeURIComponent(question) + "&level=" + encodeURIComponent(level) +
    "&chatId=" + chatId
);
```
Save (Vite reloads). Two windows, Emma and Liam: each one gets its own name back (8 of 8).

### Step 9. A New chat button
Still in `App.jsx`: a function, a button in the header, and a style rule:
```jsx
// Start over: a new id means a new, empty memory
function newChat() {
  setChatId(crypto.randomUUID());
  setMessages([{ role: "ai", text: "Hi! I'm your AI chatbot. Ask me anything." }]);
}

// in <header className="header">, after the <div> with the title
<button className="new-chat" onClick={newChat} disabled={loading}>
  New chat
</button>
```
```css
.new-chat {
  margin-left: auto;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid #FFDB00;
  background: transparent;
  color: #FFDB00;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}
.new-chat:disabled { opacity: 0.4; cursor: not-allowed; }
```
Try it: "My name is Emma." → "What's my name?" (Emma) → **New chat** → "What's my name?" → "I don't know your name yet."
(3 of 4; once Chai just introduced itself.) Note: reloading the page also gives it a new id, so a reload starts a new chat.

## Part 6. Remember after a restart

Right now the memory lives in the app's RAM: tell Chai your name, restart the Java app, ask again in the same page, and
it's gone (2 of 2 in our test).

### Step 10. Add the JDBC memory library
In `spring-ai-chat/pom.xml`, inside `<dependencies>`, the first new libraries of the series (no versions needed: the Spring AI
BOM and Spring Boot choose them; we got 2.1.0-M1 and H2 2.5.252):
```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-chat-memory-repository-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```
The JDBC repository stores the messages in a database; H2 is a small Java database that lives in one file.
Docs: <https://docs.spring.io/spring-ai/reference/api/chat-memory.html> (JdbcChatMemoryRepository).

### Step 11. Configure the database
Add to `src/main/resources/application.properties`:
```properties
# Chat memory in a small file database (H2): the file chai-memory.mv.db, next to pom.xml
spring.datasource.url=jdbc:h2:file:./chai-memory
# Create the memory table when the app starts (only if it isn't there yet)
spring.ai.chat.memory.repository.jdbc.initialize-schema=always
```
and to `spring-ai-chat/.gitignore`, so your conversations never go to GitHub:
```
*.mv.db
*.trace.db
```

### Step 12. Restart and prove it
**Ctrl+C**, `./mvnw spring-boot:run` (the first run downloads the two libraries). A new file `chai-memory.mv.db` appears next
to `pom.xml`. In the page: "My name is Emma." → "What's my name?" → **Ctrl+C**, start again → same page, "What's my name?" →
"Your name is Emma." (4 of 4 in our tests).

**Honest numbers** (all in [output.txt](output.txt)):
- **The window:** Chai keeps the last 20 messages (also in the database). After 22 messages, the name had dropped out in 5 of 6
  tries. Change it with your own `ChatMemory` bean (`MessageWindowChatMemory.builder().chatMemoryRepository(repo).maxMessages(…)`).
- **Speed:** every earlier message is sent again. On our machine, CPU only: first words after about 0.8 s with 2 messages,
  about 7 s when all 20 had to be read again. Ollama can often reuse work it already did for the same chat, so most
  answers were faster.

---

## What changed today
- **Changed:** `ChatController.java`, `chat-ui/src/App.jsx`, `pom.xml` (2 new libraries), `application.properties` (2 settings), `spring-ai-chat/.gitignore` (2 lines)
- **New:** `spring-ai-chat/chai-memory.mv.db` (the database, created on the first start; ignored by Git)
- **Unchanged:** `Recipe.java`, `Quiz.java`, `QuizQuestion.java`, `prompts/tutor.st`, `prompts/quiz.st`

## Next episode
Ask Chai "What does our company's leave policy say?": it doesn't know, because it has never seen your documents. In the next
episode, Chai learns to answer from your own documents.

## What we tested
Real outputs and timings: [`output.txt`](output.txt). Spring Boot 4.2.0, Spring AI 2.1.0-M1 (as generated in episode 1), Java 21
(Eclipse Temurin 21.0.13.1), Ollama 0.32.13, `qwen3.5:4b`, H2 2.5.252, Node.js 26.13.0, Vite 8.3.8, React 19.3.1. Tested
normally and **forced onto the CPU only** (`./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0`,
`ollama ps` shows `100% CPU`): the memory and the restart test work the same; answers take about 1 to 7 seconds.

## Links
- Website: <https://hereandnowai.com> · YouTube: <https://youtube.com/@hereandnow_ai>
- Code (MIT): <https://github.com/hereandnowai/spring-ai-tutorial>

Spring, Spring Boot and Spring AI are trademarks of Broadcom Inc. Java is a trademark of Oracle. Other names are
trademarks of their owners. HERE AND NOW AI is not affiliated with them.
