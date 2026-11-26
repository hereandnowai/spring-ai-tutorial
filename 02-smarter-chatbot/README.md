# Spring AI Tutorial, Episode 2: Give Your AI Chatbot a Personality (System Prompts, Prompt Templates, Structured Output)

**HERE AND NOW AI** · *AI is Good*

Episode 2 of **Spring AI for Java Developers** on the [HERE AND NOW AI YouTube channel](https://youtube.com/@hereandnow_ai).
This episode **continues the chatbot from episode 1** (same `my-first-chatbot` folder, same two apps). It becomes
**Chai, a friendly Java tutor from HERE AND NOW AI**: a job description (system prompt), a prompt template in its own
file with a blank (`{level}`), an **"Explain for"** dropdown in the chat page, and a **Quiz me** button that turns the
AI's answer into Java objects and shows clickable quiz cards. Still free, still on your own laptop, still no API key.

```
 Chat page (React, port 5173)  →  Spring Boot app + Spring AI (port 8080)  →  Ollama + qwen3.5:4b (port 11434)
```

**Starting fresh?** Copy the episode 1 folder [`01-first-ai-chatbot`](../01-first-ai-chatbot) from this repo to your
Desktop, rename it `my-first-chatbot`, run `npm install` once inside `chat-ui`, and you're exactly where episode 2 starts.

**6 parts, 12 steps.** Tick each one as you go.

| Part | Step | |
|---|---|---|
| 1. Where we left off | 1. Recap episode 1 · 2. Open the project again | ☐ ☐ |
| 2. Give it a job description | 3. Learn the two roles · 4. Add a default system prompt · 5. Restart and meet Chai | ☐ ☐ ☐ |
| 3. A prompt template in its own file | 6. Create `tutor.st` · 7. Fill the blank from the request | ☐ ☐ |
| 4. Upgrade the chat page | 8. Add the "Explain for" dropdown · 9. Try both levels | ☐ ☐ |
| 5. Quiz me: answers as Java objects | 10. Two records · 11. The `/quiz` endpoint | ☐ ☐ |
| 6. Quiz cards in the chat page | 12. Ask the AI assistant for the quiz cards | ☐ |

Commands are shown for macOS/Linux. **Windows:** see [NOTES.md → Windows](NOTES.md#windows-equivalents) (mostly:
use `.\mvnw.cmd` instead of `./mvnw` and `\` in paths).

You need what episode 1 installed (official download links):
- Java 21 (Eclipse Temurin): <https://adoptium.net/temurin/releases/?version=21>
- Ollama: <https://ollama.com/download>, then `ollama pull qwen3.5:4b`
- VS Code: <https://code.visualstudio.com/download> + "Extension Pack for Java"
- Node.js (LTS): <https://nodejs.org/en/download>

No new libraries in this episode: `pom.xml` and `package.json` stay exactly as they were.

---

## Part 1. Where we left off

### Step 1. Recap episode 1
In episode 1 you built: a laptop ready for AI, a Spring Boot project, your first AI endpoint (`/chat`), answers as Java
objects (`/recipe` + `Recipe.java`), streaming answers (`/stream`) and a React chat page (`chat-ui`). The folder:
```
my-first-chatbot/
├── spring-ai-chat/                                  ← the Java app (Spring Boot + Spring AI)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/hereandnowai/spring_ai_chat/
│       │   ├── ChatController.java                  ← /chat, /recipe, /stream
│       │   ├── Recipe.java
│       │   └── SpringAiChatApplication.java
│       └── resources/application.properties
└── chat-ui/                                         ← the chat page (React + Vite)
    └── src/App.jsx
```

### Step 2. Open the project again
VS Code → **File → Open Folder…** → `my-first-chatbot`. Check that Ollama has the model:
```bash
ollama list            # qwen3.5:4b should be in the list
```
Start both apps, each in its own terminal (VS Code: **Terminal → New Terminal**, twice):
```bash
# terminal 1
cd spring-ai-chat
./mvnw spring-boot:run
# terminal 2
cd chat-ui
npm run dev
```
Open <http://localhost:5173> and ask "What is recursion?". It still works, but the answer is long (about 17 seconds in
our test), the example is in Python, and it's full of Markdown (`**`, `###`) shown as plain text. Let's fix that.

## Part 2. Give it a job description

### Step 3. Learn the two roles
A model understands different kinds of messages. The **user** message is the question. The **system** message is the job
description: who the AI is and how it should answer. It goes first, before every question. Official reference:
<https://docs.spring.io/spring-ai/reference/api/prompt.html> (Roles).

### Step 4. Add a default system prompt
Open `spring-ai-chat/src/main/java/com/hereandnowai/spring_ai_chat/ChatController.java` and change the constructor:
```java
public ChatController(ChatClient.Builder builder) {
    this.chatClient = builder
            .defaultSystem("""
                You are Chai, a friendly Java tutor from HERE AND NOW AI.
                Answer in three short sentences or less.
                If code helps, show one small, complete Java method on its own lines.
                Use plain text, no Markdown.
                """)
            .build();
}
```
`defaultSystem` = send this system message with every request. Docs:
<https://docs.spring.io/spring-ai/reference/api/chatclient.html> (Using Defaults).

### Step 5. Restart and meet Chai
In terminal 1: **Ctrl+C**, then `./mvnw spring-boot:run` again (Java changes need a restart; the chat page keeps running).
Ask the page "Who are you?" and "What is recursion?". Our answers: "I am Chai, your friendly Java tutor from HERE AND NOW
AI…" and a three-sentence explanation with a small Java method, in about 2 seconds. Small models don't follow every rule
every time (once Chai still used a Markdown code fence).

## Part 3. A prompt template in its own file

### Step 6. Put the prompt in its own file
In the VS Code Explorer: right-click `src/main/resources` → **New Folder** → `prompts`; right-click `prompts` →
**New File** → `tutor.st` (`.st` = StringTemplate, the template engine Spring AI uses). Move the job description here
and add one line with a blank:
```
You are Chai, a friendly Java tutor from HERE AND NOW AI.
The person asking is a {level}. Use words a {level} knows.
Answer in three short sentences or less.
If code helps, show one small, complete Java method on its own lines.
Use plain text, no Markdown.
```
Then remove the `defaultSystem(...)` call from the constructor, so it is `this.chatClient = builder.build();` again.

### Step 7. Fill the blank from the request
In `ChatController.java`, add a field above the constructor (Spring reads the file for you):
```java
@Value("classpath:/prompts/tutor.st")
private Resource tutorPrompt;
```
and change `/stream`:
```java
@GetMapping("/stream")
public Flux<String> stream(@RequestParam String q,
        @RequestParam(defaultValue = "complete beginner") String level) {
    return chatClient.prompt()
            .system(s -> s.text(tutorPrompt).param("level", level))   // the system message, blank filled in
            .user(q)
            .stream()
            .content();
}
```
(Imports: `org.springframework.beans.factory.annotation.Value` and `org.springframework.core.io.Resource`; VS Code offers
them for you.) Restart, then try the same question for two levels:
- <http://localhost:8080/stream?q=What%20is%20a%20class%3F&level=complete%20beginner>
- <http://localhost:8080/stream?q=What%20is%20a%20class%3F&level=Java%20developer>

Docs: <https://docs.spring.io/spring-ai/reference/api/chatclient.html> (Prompt Templates) and
<https://docs.spring.io/spring-ai/reference/api/prompt.html> (Using resources instead of raw Strings).

## Part 4. Upgrade the chat page

### Step 8. Add the "Explain for" dropdown
Type these few changes into `chat-ui/src/App.jsx` yourself:
```jsx
// 1. next to the other useState lines
const [level, setLevel] = useState("complete beginner");

// 2. in fetch(...): add the level to the address
const response = await fetch(
  API_URL + encodeURIComponent(question) + "&level=" + encodeURIComponent(level)
);

// 3. in <footer className="composer">, before the <input>
<select value={level} onChange={(e) => setLevel(e.target.value)}>
  <option value="complete beginner">Explain for: Complete beginner</option>
  <option value="Java developer">Explain for: Java developer</option>
</select>
```
and one small style rule inside the `styles` text:
```css
.composer select {
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: #15151b;
  color: #f5f5f7;
  font-size: 14px;
}
```
Save: Vite reloads the page by itself.

### Step 9. Try both levels
Ask "What is an interface?" with **Complete beginner**, then again with **Java developer**. Ours: "An interface is like a
rulebook…" vs "An interface defines a contract of behavior…". Tip: always read the code an AI gives you (for "What is a
Java record?" our small model sometimes showed a normal class to beginners).

## Part 5. Quiz me: answers as Java objects

### Step 10. Two records
New files next to `ChatController.java`:
```java
// QuizQuestion.java
public record QuizQuestion(
        String question,
        List<String> options,
        int answerIndex,
        String explanation) {}
```
```java
// Quiz.java
public record Quiz(String topic, List<QuizQuestion> questions) {}
```
(`answerIndex` = the position of the right option, counting from 0. Each file also needs `package …;` and `import java.util.List;`.)

### Step 11. The `/quiz` endpoint
New file `src/main/resources/prompts/quiz.st` with two blanks:
```
Make a quiz about {topic} for a Java beginner.
Write exactly {count} multiple-choice questions.
Each question has 4 options, and exactly one of them is correct.
answerIndex is the position of the correct option, counting from 0.
Explain the correct answer in one short sentence.
```
In `ChatController.java`, a second field and the new endpoint:
```java
@Value("classpath:/prompts/quiz.st")
private Resource quizPrompt;

@GetMapping("/quiz")
public Quiz quiz(@RequestParam String topic,
        @RequestParam(defaultValue = "3") int count) {
    Quiz quiz = chatClient.prompt()
            .user(u -> u.text(quizPrompt)
                    .param("topic", topic)
                    .param("count", count))
            .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT) // answer in exactly the Quiz shape
            .call()
            .entity(Quiz.class);
    // Our own check: every answerIndex must point at a real option
    for (QuizQuestion q : quiz.questions()) {
        if (q.answerIndex() < 0 || q.answerIndex() >= q.options().size()) {
            throw new IllegalStateException(
                "The AI marked an answer that doesn't exist. Please try again.");
        }
    }
    return quiz;
}
```
Restart and open <http://localhost:8080/quiz?topic=recursion>.

**Honest numbers (our tests, all in [output.txt](output.txt)):** 25 of 25 quizzes came back as valid Java objects, and every
`answerIndex` was in range. But when we checked the answers ourselves, only **47 of 75** marked answers were really right
(about 2 in 3). Code can check the shape, not the truth. The bigger `qwen3.5:9b` got **27 of 30** right, if your laptop can
run it (`ollama pull qwen3.5:9b`, then `spring.ai.ollama.chat.model=qwen3.5:9b`).
Docs: <https://docs.spring.io/spring-ai/reference/api/structured-output-converter.html> and
<https://docs.spring.io/spring-ai/reference/api/structured-output/native.html>.

## Part 6. Quiz cards in the chat page

### Step 12. Ask the AI assistant for the quiz cards
Copy the prompt from [`chat-ui/PROMPT-2.md`](chat-ui/PROMPT-2.md) into the same free AI assistant as in episode 1
(ChatGPT, Claude, Gemini or any other), paste your current `App.jsx` where it says so, and replace `chat-ui/src/App.jsx`
with the answer. Our result is the [`App.jsx`](chat-ui/src/App.jsx) in this folder (it worked the first time).
Type a topic (e.g. `recursion`) and click **Quiz me**: three cards appear; a right answer turns green, a wrong one red
(and the right one green), with the explanation.

---

## What changed today
- **Changed:** `ChatController.java`, `chat-ui/src/App.jsx`
- **New:** `src/main/resources/prompts/tutor.st`, `src/main/resources/prompts/quiz.st`, `QuizQuestion.java`, `Quiz.java`
- **Unchanged:** `pom.xml`, `application.properties`, `Recipe.java` (no new libraries)

## Next episode
Tell Chai "My name is Priya.", then ask "What's my name?": it doesn't know. Every request starts from zero. In the next
episode we give Chai a memory.

## What we tested
Real outputs and timings: [`output.txt`](output.txt). Spring Boot 4.2.0, Spring AI 2.1.0-M1 (as generated in episode 1),
Java 21 (Eclipse Temurin 21.0.13.1), Ollama 0.32.13, `qwen3.5:4b`, Node.js 26.13.0, Vite 8.3.8, React 19.3.1. Tested twice:
normally and **forced onto the CPU only** (`./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0`,
`ollama ps` shows `100% CPU`): answers in 4 to 10 seconds, a quiz in about 30 seconds on our machine.

## Links
- Website: <https://hereandnowai.com> · YouTube: <https://youtube.com/@hereandnow_ai>
- Code (MIT): <https://github.com/hereandnowai/spring-ai-tutorial>

Spring, Spring Boot and Spring AI are trademarks of Broadcom Inc. Java is a trademark of Oracle. Other names are
trademarks of their owners. HERE AND NOW AI is not affiliated with them.
