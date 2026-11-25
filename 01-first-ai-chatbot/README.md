# Spring AI Tutorial, Episode 1: Your First AI Chatbot (Spring Boot + React, Free, No API Key)

**HERE AND NOW AI** · *AI is Good*

Episode 1 of **Spring AI for Java Developers** on the [HERE AND NOW AI YouTube channel](https://youtube.com/@hereandnow_ai).
You build your first AI chatbot: a modern chat page (React) talks to a Spring Boot app, and the app uses **Spring AI**
to talk to a free AI model running **on your own laptop** with [Ollama](https://ollama.com).
No API key, no bill, no graphics card needed.

```
 Chat page (React, port 5173)  →  Spring Boot app + Spring AI (port 8080)  →  Ollama + qwen3.5:4b (port 11434)
```

**6 parts, 13 steps.** Tick each one as you go.

| Part | Step | |
|---|---|---|
| 1. Get your laptop ready | 1. Install Java 21 · 2. Install Ollama + download the model · 3. Install VS Code + the Java extensions | ☐ ☐ ☐ |
| 2. Create the project | 4. Make a folder and open it · 5. Generate the project | ☐ ☐ |
| 3. First call to the AI | 6. Configure the model · 7. Write the controller · 8. Run it and ask a question | ☐ ☐ ☐ |
| 4. Get a Java object back | 9. A `Recipe` record + `/recipe` | ☐ |
| 5. Stream the answer | 10. Add `/stream` | ☐ |
| 6. Your first chatbot page | 11. Ask a free AI assistant for the page · 12. Create the React app · 13. Connect page and app | ☐ ☐ ☐ |

Commands are shown for macOS/Linux. **Windows:** see [NOTES.md → Windows](NOTES.md#windows-equivalents) (mostly:
use `.\mvnw.cmd` instead of `./mvnw` and `\` in paths).

---

## Part 1. Get your laptop ready

### Step 1. Install Java 21
Download **Eclipse Temurin 21 (LTS)** from the official site and run the installer:
<https://adoptium.net/temurin/releases/?version=21> (Windows: in the installer, also tick **"Set JAVA_HOME variable"**).

Check it in a new terminal:
```bash
java -version
# openjdk version "21.0.13.1" 2026-11-17 LTS   (your exact number may differ)
```

### Step 2. Install Ollama and download the model
Download Ollama from <https://ollama.com/download> and install it. Then download a small model (about 3.3 GB) that runs
fine on a normal laptop CPU:
```bash
ollama pull qwen3.5:4b
```
New to Ollama? Watch our Ollama video first: https://youtu.be/vq8opP4w30s Got a strong graphics card? Try `qwen3.5:9b` later.

### Step 3. Install VS Code and the Java extensions
Download VS Code from <https://code.visualstudio.com/download>. In VS Code open the **Extensions** panel and install
**"Extension Pack for Java"** (by Microsoft):
<https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack>.

## Part 2. Create the project

### Step 4. Make a folder and open it
Make a new folder called **`my-first-chatbot`** on your Desktop (any place is fine).
In VS Code: **File → Open Folder…** and pick it. Both projects of this episode will live inside it:
the Spring Boot app (`spring-ai-chat`) and the chat page (`chat-ui`).

### Step 5. Generate the project
Go to <https://start.spring.io> and choose:

| Field | Choose |
|---|---|
| Project | **Maven** |
| Language | **Java** |
| Spring Boot | **4.2.0** |
| Group | `com.hereandnowai` |
| Artifact | `spring-ai-chat` (Package name fills itself in) |
| Packaging | Jar |
| Configuration | Properties |
| Java | **21** |
| Dependencies (ADD DEPENDENCIES…) | **Spring Web** and **Ollama** |

Click **GENERATE**, then unzip `spring-ai-chat.zip` into your `my-first-chatbot` folder. In the VS Code Explorer you now see:

```
my-first-chatbot/
└── spring-ai-chat/
    ├── pom.xml                                  ← the project's shopping list (Spring Boot, Spring AI, Ollama)
    ├── mvnw, mvnw.cmd                           ← run Maven without installing it
    └── src/main/
        ├── java/com/hereandnowai/spring_ai_chat/
        │   └── SpringAiChatApplication.java     ← starts the app
        └── resources/
            └── application.properties           ← settings
```
(The web page shows the package as `spring-ai-chat`; Java names can't have dashes, so the generated package is
`com.hereandnowai.spring_ai_chat`.)

## Part 3. First call to the AI

### Step 6. Configure the model
Open `src/main/resources/application.properties` and add:
```properties
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=qwen3.5:4b
spring.ai.ollama.chat.temperature=0.7
spring.ai.ollama.chat.num-ctx=8192
spring.ai.ollama.chat.think=false
```
The sneaky setting is the last one. `qwen3.5` "thinks" before it answers. On a laptop CPU that made the same question
take **47 to 56 seconds instead of 4 to 6 seconds** in our CPU-only test. `think=false` switches it off.

### Step 7. Write the controller
Right-click the `spring_ai_chat` folder → **New File** → `ChatController.java`:
```
src/main/java/com/hereandnowai/spring_ai_chat/ChatController.java
```
```java
@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String q) {
        return chatClient.prompt()   // start a new prompt
                .user(q)             // our question
                .call()              // send it to the model and wait
                .content();          // the answer, as text
    }
}
```
(Full file with imports: [`spring-ai-chat/src/main/java/com/hereandnowai/spring_ai_chat/ChatController.java`](spring-ai-chat/src/main/java/com/hereandnowai/spring_ai_chat/ChatController.java).)

### Step 8. Run it and ask a question
Make sure the Ollama app is running, then in the VS Code terminal:
```bash
cd spring-ai-chat
./mvnw spring-boot:run
```
Wait for `Started SpringAiChatApplication`, then open this in your browser:
<http://localhost:8080/chat?q=What%20is%20Spring%20AI%3F%20Answer%20in%202%20sentences.>

You get a real answer from the model on your laptop (ours: 1.5 s normally, 4 to 6 s on the CPU only).
Stop the app with **Ctrl+C** before each change, then run it again.

## Part 4. Get a Java object back

### Step 9. A `Recipe` record + `/recipe`
New file `Recipe.java` next to the controller:
```java
public record Recipe(String name, List<String> ingredients, int minutes) {}
```
Add to `ChatController`:
```java
@GetMapping("/recipe")
public Recipe recipe(@RequestParam String dish) {
    return chatClient.prompt()
            .user("Give me a simple recipe for " + dish)
            .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT) // ask Ollama to answer in exactly this shape
            .call()
            .entity(Recipe.class);   // turn the answer into a Recipe
}
```
Try <http://localhost:8080/recipe?dish=Masala%20Chai>: you get a real Java object, as JSON.

Why the `.advisors(...)` line? Without it, our small model sometimes copied the instructions back instead of a recipe
(only 15 of 25 tries worked). With it, Ollama is made to answer in exactly the `Recipe` shape: 25 of 25 worked,
on the CPU too. Small models still make mistakes, so in a real app catch errors and try again.

## Part 5. Stream the answer

### Step 10. Add `/stream`
```java
@GetMapping("/stream")
public Flux<String> stream(@RequestParam String q) {
    return chatClient.prompt()
            .user(q)
            .stream()            // don't wait for the whole answer
            .content();          // a stream (Flux) of small text pieces
}
```
Watch the words arrive live:
```bash
curl -N "http://localhost:8080/stream?q=Write%20a%20short%204-line%20poem%20about%20Java%20and%20coffee."
```

## Part 6. Your first chatbot page

### Step 11. Ask a free AI assistant for the page
Copy the prompt from [`chat-ui/PROMPT.md`](chat-ui/PROMPT.md) into ChatGPT, Claude, Gemini or any other AI assistant.
It gives you the code for `src/App.jsx`.

### Step 12. Create the React app
Install **Node.js (LTS)** from <https://nodejs.org/en/download>. Then, in a new VS Code terminal, inside `my-first-chatbot`:
```bash
npm create vite@latest chat-ui -- --template react
#   "Which linter to use?"            → Oxlint (just press Enter)
#   "Install with npm and start now?" → No
cd chat-ui
```
Replace everything in `chat-ui/src/App.jsx` with the code from the assistant. Then:
```bash
npm install
npm run dev
```
Small fix we needed: Vite's starter styles (`src/index.css`) fought with the page's own dark styles (centred text,
a dark title on a dark background). Delete this one line from `src/main.jsx`:
```js
import './index.css'
```
Your assistant may write slightly different code. If something doesn't work, paste the error back into the same chat.

### Step 13. Connect page and app
The page runs on port 5173 and the app on 8080, so the browser blocks the call until Spring allows it. Add **one line**
above the controller class:
```java
@CrossOrigin(origins = "http://localhost:5173") // let our React page (Vite dev server) call this app
```
Restart the Spring app (`Ctrl+C`, then `./mvnw spring-boot:run`), open <http://localhost:5173>, ask a question,
and watch the answer stream in. **You built your first AI chatbot.**

---

## Swap the model (OpenAI, Anthropic, Google)
Only **two files** change: `pom.xml` (one starter) and `application.properties` (key + model).
`ChatController.java` stays exactly the same. Exact names from the Spring AI 2.1 reference: [NOTES.md](NOTES.md#swap-the-model).
(Not tested by us: these need paid API keys.)

## What we tested (25 Nov 2026)
Real outputs and timings: [`output.txt`](output.txt). Spring Boot 4.2.0, Spring AI 2.1.0-M1 (the version start.spring.io
puts in `pom.xml` today; 2.1.0 also tested), Java 21 (Eclipse Temurin 21.0.13.1), Ollama 0.32.13, `qwen3.5:4b`,
Node.js 26.13.0, npm 11.20.0, Vite 8.3.8, React 19.3.1. Tested twice: normally and **forced onto the CPU only**
(`./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0`, `ollama ps` shows `100% CPU`).

## Links
- Website: <https://hereandnowai.com> · YouTube: <https://youtube.com/@hereandnow_ai>
- Code (MIT): <https://github.com/hereandnowai/spring-ai-tutorial>

Spring, Spring Boot and Spring AI are trademarks of Broadcom Inc. Java is a trademark of Oracle. Other names are
trademarks of their owners. HERE AND NOW AI is not affiliated with them.
