package com.hereandnowai.spring_ai_chat;

import org.springframework.ai.chat.client.AdvisorParams;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // let our React page (Vite dev server) call this app
public class ChatController {

    private final ChatClient chatClient;

    // Spring AI hands us a ready-made builder, already set up for Ollama
    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    // 1. Ask a question, get the answer as text:  /chat?q=...
    @GetMapping("/chat")
    public String chat(@RequestParam String q) {
        return chatClient.prompt()   // start a new prompt
                .user(q)             // our question
                .call()              // send it to the model and wait
                .content();          // the answer, as text
    }

    // 2. Get a Java object back instead of text:  /recipe?dish=...
    @GetMapping("/recipe")
    public Recipe recipe(@RequestParam String dish) {
        return chatClient.prompt()
                .user("Give me a simple recipe for " + dish)
                .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT) // ask Ollama to answer in exactly this shape
                .call()
                .entity(Recipe.class);   // turn the answer into a Recipe
    }

    // 3. Stream the answer piece by piece, as it is written:  /stream?q=...
    @GetMapping("/stream")
    public Flux<String> stream(@RequestParam String q) {
        return chatClient.prompt()
                .user(q)
                .stream()            // don't wait for the whole answer
                .content();          // a stream (Flux) of small text pieces
    }
}
