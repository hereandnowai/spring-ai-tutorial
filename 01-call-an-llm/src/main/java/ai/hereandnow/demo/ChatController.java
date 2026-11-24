package ai.hereandnow.demo;

import java.util.List;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
class ChatController {

    private final ChatClient chatClient;

    ChatController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("You are a friendly assistant for Java developers. Answer in two short sentences.")
                .build();
    }

    // 1. Ask a question, get text back
    @GetMapping("/ai")
    String ask(@RequestParam String q) {
        return chatClient.prompt()
                .user(q)
                .call()
                .content();
    }

    // 2. Get a Java object back (structured output)
    record Recipe(String name, List<String> ingredients, int minutes) {}

    @GetMapping("/ai/recipe")
    Recipe recipe(@RequestParam String dish) {
        return chatClient.prompt()
                .user("Give me a simple recipe for " + dish)
                .call()
                .entity(Recipe.class);
    }

    // 3. Stream the answer word by word
    @GetMapping("/ai/stream")
    Flux<String> stream(@RequestParam String q) {
        return chatClient.prompt()
                .user(q)
                .stream()
                .content();
    }
}
