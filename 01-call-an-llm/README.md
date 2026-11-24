# Spring AI 2.1 Tutorial, Episode 1: Call an LLM From Spring Boot (Free, No API Key)

Episode 1 of **Spring AI for Java Developers** by HERE AND NOW AI. Runs on a CPU-only laptop: no GPU and no API key
needed. The model runs locally with [Ollama](https://ollama.com). Got a strong GPU? Try `qwen3.5:9b` (change
`spring.ai.ollama.chat.model`).

Tested on 25 Nov 2026: Java 27 runtime, code compiled for Java 21 (works on 17+), Spring Boot 4.2.0, Spring AI 2.1.0,
Ollama 0.32.13, model `qwen3.5:4b` (4 billion parameters, 3.3 GB download) with `spring.ai.ollama.chat.think=false`
(with thinking on, a simple question took 40 s instead of 2 s on the CPU) and `spring.ai.ollama.chat.num-ctx=8192`
(keeps memory small). Tested twice: normally, and forced onto the CPU only (`--spring.ai.ollama.chat.num-gpu=0`).
Timings for both: `output.txt`. Small models are not perfect: 1 of 10 recipe calls came back in a shape that could not
be turned into a `Recipe` (HTTP 500); in a real app, catch that and retry.

1. Install Ollama (ollama.com) and pull a model: `ollama pull qwen3.5:4b`
2. Run: `mvn spring-boot:run`
3. Try:
   - `curl "localhost:8080/ai?q=What%20is%20Spring%20AI%3F"` (text answer)
   - `curl "localhost:8080/ai/recipe?dish=masala%20chai"` (a Java record, as JSON)
   - `curl -N "localhost:8080/ai/stream?q=Tell%20me%20a%20joke"` (streaming)

Want to see the CPU-only speed yourself? `mvn spring-boot:run -Dspring-boot.run.arguments=--spring.ai.ollama.chat.num-gpu=0`
then `ollama ps` shows `100% CPU`.

Real output: `output.txt`. Code: `src/main/java/ai/hereandnow/demo/ChatController.java`.
To use another provider later (OpenAI, Anthropic, Gemini…), swap the starter and properties; the ChatClient code stays.
