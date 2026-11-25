# Spring AI Tutorial for Java Developers (Spring AI 2.1 + Spring Boot 4.2)

**HERE AND NOW AI** · *AI is Good*

Free, tested, step-by-step code for the **Spring AI for Java Developers** video series on the
[HERE AND NOW AI YouTube channel](https://youtube.com/@hereandnow_ai). Every example runs **on your own laptop,
even without a graphics card**, with a small open model served by [Ollama](https://ollama.com). No API key, no bill.

## Episodes

| # | Topic | Code |
|---|---|---|
| 1 | Your first AI chatbot: Spring Boot + Spring AI + a React chat page, step by step | [01-first-ai-chatbot](01-first-ai-chatbot) |
| 2 | Prompt templates and structured output | coming soon |
| 3 | Chat memory (session memory in Spring AI 2.1) | coming soon |
| 4 | RAG with pgvector: chat with your documents | coming soon |
| 5 | Tool calling: let the model call your Java methods | coming soon |
| 6 | MCP: build an MCP server and client | coming soon |
| 7 | Agents with Spring AI | coming soon |
| 8 | Testing and observability | coming soon |
| 9 | Spring AI vs LangChain4j (tested) | coming soon |
| 10 | LangChain4j quickstart | coming soon |

Each folder has its own `README.md` and an `output.txt` with the real output
we got when we ran it.

## Quick start

You need **Java 21**, **Ollama** and (for the chat page) **Node.js**. Maven comes with each project (`./mvnw`).

```bash
# 1. Get a small model that runs on a normal laptop (about 3.3 GB)
ollama pull qwen3.5:4b

# 2. Get the code
git clone https://github.com/hereandnowai/spring-ai-tutorial.git
cd spring-ai-tutorial/01-first-ai-chatbot/spring-ai-chat

# 3. Run it (Windows: .\mvnw.cmd spring-boot:run)
./mvnw spring-boot:run

# 4. Ask it something
curl "localhost:8080/chat?q=What%20is%20Spring%20AI%3F"
```

Open the folder in VS Code, IntelliJ IDEA or your favourite editor. Each episode's `README.md` walks through every step.

**Tested with:** Spring AI 2.1, Spring Boot 4.2, Java 21, Ollama with `qwen3.5:4b` (also CPU-only).
Got a strong GPU? Try a bigger model such as `qwen3.5:9b` by changing `spring.ai.ollama.chat.model`.

Spring is a trademark of Broadcom Inc. and/or its subsidiaries. Java is a trademark of Oracle.

## About HERE AND NOW AI

HERE AND NOW AI teaches AI, generative AI and agentic AI, explained simply, with real code you can run.

- Website: https://hereandnowai.com
- Email: info@hereandnowai.com
- Phone: +91 996 296 1000
- YouTube: https://youtube.com/@hereandnow_ai
- LinkedIn: https://www.linkedin.com/company/hereandnowai/
- Instagram: https://instagram.com/hereandnow_ai
- X: https://x.com/hereandnowai
- GitHub: https://github.com/hereandnowai

## Licence

MIT, see [LICENSE](LICENSE).
