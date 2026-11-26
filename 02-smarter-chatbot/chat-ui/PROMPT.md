# Step 11: the prompt for a free AI assistant

Copy everything in the box below into ChatGPT, Claude, Gemini or any other AI assistant.

```text
I have a Spring Boot app running on my laptop. It has this endpoint:

GET http://localhost:8080/stream?q=YOUR_QUESTION

It returns the AI's answer as plain text, streamed in small pieces as they are written
(not Server-Sent Events, not JSON).

Please write a React chat page for it:

1. One single file, src/App.jsx, for a project made with Vite
   (npm create vite@latest chat-ui -- --template react).
   Put all the styles inside the same file. No extra libraries, no Tailwind.
2. Make it modern and attractive: a dark theme with a bright yellow (#FFDB00) accent,
   the title "My AI Chatbot", my messages as bubbles on the right, the AI's answers as
   bubbles on the left, and a text box with a Send button at the bottom.
   Pressing Enter sends the message.
3. When I send a question, call the endpoint with fetch (use encodeURIComponent for the
   question), read the answer with response.body.getReader() and a TextDecoder, and add
   each piece to the AI's bubble as soon as it arrives, so I can watch the answer appear live.
4. Show a small "thinking..." indicator until the first words arrive, disable the Send
   button while the AI is answering, show a friendly error message if the app can't be
   reached, and always scroll to the newest message.

Then tell me exactly which files to replace and which commands to run.
```

Every assistant writes slightly different code. If something doesn't work, paste the error back into the
same chat and ask it to fix it. Small fixes are normal.
