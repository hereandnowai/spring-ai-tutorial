# Episode 2, step 12: the prompt for the quiz cards

Open the same free AI assistant you used in episode 1 (ChatGPT, Claude, Gemini or any other).
Copy everything in the box below. Where it says `[PASTE YOUR App.jsx HERE]`, paste your whole current
`chat-ui/src/App.jsx` (open it in VS Code, press Ctrl+A / Cmd+A, then copy).

```text
I have a React chat page (src/App.jsx, made with Vite) for my Spring Boot app.
Here is the whole file:

[PASTE YOUR App.jsx HERE]

My Spring Boot app now has a second endpoint:

GET http://localhost:8080/quiz?topic=TOPIC&count=3

It returns JSON like this:
{"topic":"Recursion","questions":[{"question":"...","options":["...","...","...","..."],
 "explanation":"...","answerIndex":2}]}
answerIndex is the position of the correct option, counting from 0.

Please change App.jsx:
1. Add a "Quiz me" button next to the Send button. It uses the text in the input box
   as the topic.
2. Show my request as a chat bubble ("Quiz me on recursion"), then call /quiz with fetch
   (use encodeURIComponent for the topic) and show the quiz in the chat as cards:
   one card per question, with its options as buttons.
3. When I click an option: if it is right, it turns green. If it is wrong, it turns red
   and the right option turns green. Then show the explanation under the question.
   Each card can be answered only once.
4. Show the "thinking..." indicator while the quiz is loading, and a friendly error
   bubble if the request fails.
5. Keep everything else exactly as it is: the design, the streaming chat and the
   "Explain for" dropdown. One file, styles inside it, no extra libraries.

Then give me the complete new App.jsx.
```

Replace `chat-ui/src/App.jsx` with the code the assistant gives you and save. If `npm run dev` is still running,
the page reloads by itself.

Every assistant writes slightly different code. If something doesn't work, paste the error (or describe what you see)
back into the same chat and ask it to fix it. Small fixes are normal.
