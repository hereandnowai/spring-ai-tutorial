# Notes: Spring AI episode 1 (your first AI chatbot)

Extra details for the episode: versions, the harmless Mac log line, swapping the model, Windows commands and the project tree.

## Versions used
| Tool | Version |
|---|---|
| Java (step 1) | Eclipse Temurin 21.0.13.1+2 (`openjdk version "21.0.13.1" 2026-11-17 LTS`) |
| Spring Boot | 4.2.0 (start.spring.io default and current GA) |
| Spring AI | **2.1.0-M1** as written by start.spring.io into `pom.xml` (see "Deviations" 1); 2.1.0 GA also tested |
| Maven | none installed by the viewer: `./mvnw` downloads Maven 3.10.1 on first run |
| Ollama / model | 0.32.13 / `qwen3.5:4b` (3.3 GB download, 3.4 GB loaded on GPU, 3.9 GB on CPU) |
| Node.js / npm | v26.13.0 / 11.20.0 |
| create-vite / Vite / React | 9.3.4 / 8.3.8 / 19.3.1 (`@vitejs/plugin-react` 6.1.2, `oxlint` 1.90) from registry.npmjs.org |
| Ports | 8080 (Spring), 5173 (Vite), 11434 (Ollama), all defaults, all free |

## A harmless red ERROR line on Macs
On the first AI call the Spring log prints (Apple Silicon Mac):
`ERROR … i.n.r.d.DnsServerAddressStreamProviders : Unable to load io.netty.resolver.dns.macos.MacOSDnsServerAddressStreamProvider, fallback to system defaults…`
Everything works. Worth a one-line "you may see this red line on a Mac; ignore it" so beginners don't panic.
(Not seen on Windows/Linux; it is Netty looking for an optional Mac-only library.)

## Swap the model
Not tested by us (needs paid API keys). Source: the official Spring AI 2.1.0 reference (all pages show "2.1.0 Stable").
**Files that change:** `pom.xml` (swap the starter) and `application.properties` (key + model).
**Files that don't change:** `ChatController.java`, `Recipe.java`, `SpringAiChatApplication.java`, and the whole `chat-ui`.
The `spring-ai-bom` import in pom.xml manages the version for every starter.

| Provider | Starter (groupId `org.springframework.ai`) | Properties | Docs |
|---|---|---|---|
| Ollama (ours) | `spring-ai-starter-model-ollama` | `spring.ai.ollama.base-url`, `spring.ai.ollama.chat.model` | <https://docs.spring.io/spring-ai/reference/api/chat/ollama-chat.html> |
| OpenAI | `spring-ai-starter-model-openai` | `spring.ai.openai.api-key=${OPENAI_API_KEY}`, `spring.ai.openai.chat.model` (default `gpt-5-mini`) | <https://docs.spring.io/spring-ai/reference/api/chat/openai-chat.html> |
| Anthropic | `spring-ai-starter-model-anthropic` | `spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}`, `spring.ai.anthropic.chat.model` (default `claude-haiku-4-5`) | <https://docs.spring.io/spring-ai/reference/api/chat/anthropic-chat.html> |
| Google (Gemini) | `spring-ai-starter-model-google-genai` | Gemini API key: `spring.ai.google.genai.api-key`; or Vertex AI: `spring.ai.google.genai.project-id` + `spring.ai.google.genai.location`; model: `spring.ai.google.genai.chat.model` (default `gemini-2.5-flash`) | <https://docs.spring.io/spring-ai/reference/api/chat/google-genai-chat.html> |

pom.xml change (example OpenAI): replace
```xml
<artifactId>spring-ai-starter-model-ollama</artifactId>
```
with
```xml
<artifactId>spring-ai-starter-model-openai</artifactId>
```
application.properties (example OpenAI): delete the `spring.ai.ollama.*` lines and add
```properties
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.model=gpt-5-mini
```
Notes from the docs: keep keys out of the file (use an environment variable, `export OPENAI_API_KEY=…`).
If you keep two starters at once, choose one with `spring.ai.model.chat=openai` (documented on the OpenAI and Google
pages; values `openai`, `google-genai`, `none`). The `ENABLE_NATIVE_STRUCTURED_OUTPUT` line also works with OpenAI,
Anthropic and Google GenAI (listed on the native structured output page). Not shown in v2: `think`, `num-ctx` are
Ollama-only settings and go away with the Ollama lines.

## Windows equivalents
Not run on Windows (no Windows machine); these are the standard equivalents.

| macOS / Linux | Windows (PowerShell) |
|---|---|
| `java -version` | `java -version` (Temurin installer: tick "Set JAVA_HOME variable"; open a **new** terminal after installing) |
| `ollama pull qwen3.5:4b` | same |
| Desktop folder `~/Desktop/my-first-chatbot` | `C:\Users\<you>\Desktop\my-first-chatbot` (with OneDrive: `C:\Users\<you>\OneDrive\Desktop\my-first-chatbot`) |
| `cd spring-ai-chat` | `cd spring-ai-chat` |
| `./mvnw spring-boot:run` | `.\mvnw.cmd spring-boot:run` (Command Prompt: `mvnw spring-boot:run`) |
| `./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0` | `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0"` (quotes needed in PowerShell) |
| `src/main/java/com/hereandnowai/spring_ai_chat/ChatController.java` | `src\main\java\com\hereandnowai\spring_ai_chat\ChatController.java` |
| `src/main/resources/application.properties` | `src\main\resources\application.properties` |
| `curl "http://localhost:8080/chat?q=What%20is%20Spring%20AI%3F"` | `curl.exe "http://localhost:8080/chat?q=What%20is%20Spring%20AI%3F"` (`curl` alone is a different command in Windows PowerShell 5.1) or just open the URL in the browser |
| `curl -N "http://localhost:8080/stream?q=…"` | `curl.exe -N "http://localhost:8080/stream?q=…"` |
| `ollama ps`, `ollama stop qwen3.5:4b` | same |
| `npm create vite@latest chat-ui -- --template react` | same. If PowerShell says "running scripts is disabled on this system", use Command Prompt, or run `npm.cmd create vite@latest chat-ui -- --template react` |
| `cd chat-ui`, `npm install`, `npm run dev` | same (`npm.cmd …` if the script error above appears) |
| Stop an app: `Ctrl+C` | `Ctrl+C` (answer `Y` to "Terminate batch job?") |
| Unzip: double-click the zip | right-click → **Extract All…** → choose `my-first-chatbot` (check you don't get a doubled `spring-ai-chat\spring-ai-chat`) |
| Port check: `lsof -i :8080` | `netstat -ano | findstr :8080` |

## Explorer tree (folder `my-first-chatbot`)
Exact files, minus build output (`spring-ai-chat/target/` appears after the first run, `chat-ui/node_modules/` after
`npm install`). VS Code shows `com/hereandnowai/spring_ai_chat` on one line (compact folders) by default. Dot-files are shown by VS Code.

```
my-first-chatbot
├── spring-ai-chat
│   ├── .mvn
│   │   └── wrapper
│   │       └── maven-wrapper.properties
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── hereandnowai
│   │   │   │           └── spring_ai_chat
│   │   │   │               ├── ChatController.java        (step 7, new)
│   │   │   │               ├── Recipe.java                (step 9, new)
│   │   │   │               └── SpringAiChatApplication.java
│   │   │   └── resources
│   │   │       ├── static
│   │   │       ├── templates
│   │   │       └── application.properties             (step 6, edited)
│   │   └── test
│   │       └── java
│   │           └── com
│   │               └── hereandnowai
│   │                   └── spring_ai_chat
│   │                       └── SpringAiChatApplicationTests.java
│   ├── .gitattributes
│   ├── .gitignore
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
└── chat-ui
    ├── public
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src
    │   ├── assets
    │   │   ├── hero.png
    │   │   ├── react.svg
    │   │   └── vite.svg
    │   ├── App.css
    │   ├── App.jsx                                     (step 12, replaced with the AI's code)
    │   ├── index.css
    │   └── main.jsx                                    (step 12, one line removed)
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
    ├── package-lock.json                               (made by npm install)
    ├── package.json
    ├── README.md
    └── vite.config.js
```
In this repo the two projects sit in `tutorials/spring-ai/01-call-an-llm-v2/` (instead of `my-first-chatbot/`), next to
`README.md`, `NOTES.md`, `output.txt` and `chat-ui/PROMPT.md`.

