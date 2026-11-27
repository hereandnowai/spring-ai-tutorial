import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8080/stream?q=";
const QUIZ_URL = "http://localhost:8080/quiz?count=3&topic=";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI chatbot. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("complete beginner");
  const [chatId, setChatId] = useState(crypto.randomUUID()); // this chat's own id
  const bottomRef = useRef(null);

  // Always scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setLoading(true);
    // Add my question and an empty AI bubble that we fill as the answer streams in
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "ai", text: "" },
    ]);

    try {
      const response = await fetch(
        API_URL + encodeURIComponent(question) + "&level=" + encodeURIComponent(level) +
          "&chatId=" + chatId
      );
      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const piece = decoder.decode(value, { stream: true });
        // Append the new piece to the last (AI) message
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, text: last.text + piece }];
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "error",
          text: "Sorry, I can't reach the chatbot app. Is it running on http://localhost:8080?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz() {
    const topic = input.trim();
    if (!topic || loading) return;

    setInput("");
    setLoading(true);
    // Show my request, plus an empty AI bubble so the "thinking..." dots appear
    setMessages((prev) => [
      ...prev,
      { role: "user", text: `Quiz me on ${topic}` },
      { role: "ai", text: "" },
    ]);

    try {
      const response = await fetch(QUIZ_URL + encodeURIComponent(topic));
      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const quiz = await response.json();
      // Replace the empty AI bubble with the quiz cards
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "quiz", quiz, picked: quiz.questions.map(() => null) },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "error", text: "Sorry, I couldn't make a quiz this time. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Remember which option was clicked on card q of message i (each card only once)
  function pickOption(i, q, option) {
    setMessages((prev) =>
      prev.map((m, k) => {
        if (k !== i || m.picked[q] !== null) return m;
        const picked = [...m.picked];
        picked[q] = option;
        return { ...m, picked };
      })
    );
  }

  // Start over: a new id means a new, empty memory
  function newChat() {
    setChatId(crypto.randomUUID());
    setMessages([{ role: "ai", text: "Hi! I'm your AI chatbot. Ask me anything." }]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const lastMessage = messages[messages.length - 1];
  const waitingForFirstWords = loading && lastMessage.role === "ai" && lastMessage.text === "";

  return (
    <div className="app">
      <style>{styles}</style>

      <header className="header">
        <div className="logo">AI</div>
        <div>
          <h1>My AI Chatbot</h1>
          <p>Spring AI + Ollama, running on your laptop</p>
        </div>
        <button className="new-chat" onClick={newChat} disabled={loading}>
          New chat
        </button>
      </header>

      <main className="messages">
        {messages.map((m, i) => {
          if (m.role === "ai" && m.text === "") return null; // the thinking dots show instead
          if (m.role === "quiz") {
            return (
              <div key={i} className="row left">
                <div className="quiz">
                  <div className="quiz-title">Quiz: {m.quiz.topic}</div>
                  {m.quiz.questions.map((q, qi) => {
                    const picked = m.picked[qi];
                    const answered = picked !== null;
                    return (
                      <div key={qi} className="quiz-card">
                        <div className="quiz-q">
                          {qi + 1}. {q.question}
                        </div>
                        {q.options.map((opt, oi) => {
                          let state = "";
                          if (answered && oi === q.answerIndex) state = "right";
                          else if (answered && oi === picked) state = "wrong";
                          return (
                            <button
                              key={oi}
                              className={`opt ${state}`}
                              onClick={() => pickOption(i, qi, oi)}
                              disabled={answered}
                            >
                              {opt}
                            </button>
                          );
                        })}
                        {answered && (
                          <div className={`explain ${picked === q.answerIndex ? "good" : "bad"}`}>
                            {picked === q.answerIndex ? "Correct! " : "Not quite. "}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`row ${m.role === "user" ? "right" : "left"}`}>
              <div className={`bubble ${m.role}`}>{m.text}</div>
            </div>
          );
        })}

        {waitingForFirstWords && (
          <div className="row left">
            <div className="bubble ai thinking">
              <span>thinking</span>
              <span className="dots">
                <i></i><i></i><i></i>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="composer">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="complete beginner">Explain for: Complete beginner</option>
          <option value="Java developer">Explain for: Java developer</option>
        </select>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          autoFocus
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "..." : "Send"}
        </button>
        <button className="quiz-btn" onClick={startQuiz} disabled={loading || !input.trim()}>
          Quiz me
        </button>
      </footer>
    </div>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: radial-gradient(circle at top, #1c1c22 0%, #0b0b0f 70%);
    color: #f5f5f7;
  }
  .app {
    max-width: 820px;
    height: 100vh;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    padding: 24px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .logo {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: #FFDB00;
    color: #111;
    font-weight: 800;
    display: grid;
    place-items: center;
    box-shadow: 0 0 24px rgba(255, 219, 0, 0.35);
  }
  .header h1 { margin: 0; font-size: 22px; }
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
  .header p { margin: 2px 0 0; font-size: 13px; color: #a1a1aa; }
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 4px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .row { display: flex; }
  .row.right { justify-content: flex-end; }
  .row.left { justify-content: flex-start; }
  .bubble {
    max-width: 78%;
    padding: 12px 16px;
    border-radius: 18px;
    line-height: 1.5;
    font-size: 15.5px;
    white-space: pre-wrap;
    animation: pop 0.25s ease-out;
  }
  .bubble.user {
    background: #FFDB00;
    color: #111;
    border-bottom-right-radius: 6px;
  }
  .bubble.ai {
    background: #1f1f27;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom-left-radius: 6px;
  }
  .bubble.error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fca5a5;
  }
  .thinking { display: flex; align-items: center; gap: 8px; color: #a1a1aa; }
  .dots { display: inline-flex; gap: 4px; }
  .dots i {
    width: 6px; height: 6px; border-radius: 50%;
    background: #FFDB00;
    animation: blink 1.2s infinite ease-in-out;
  }
  .dots i:nth-child(2) { animation-delay: 0.2s; }
  .dots i:nth-child(3) { animation-delay: 0.4s; }
  .composer {
    display: flex;
    gap: 10px;
    padding: 10px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .composer input {
    flex: 1;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: #15151b;
    color: #f5f5f7;
    font-size: 15.5px;
    outline: none;
  }
  .composer input:focus { border-color: #FFDB00; }
  .composer select {
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: #15151b;
    color: #f5f5f7;
    font-size: 14px;
  }
  .composer button {
    padding: 0 26px;
    border: none;
    border-radius: 12px;
    background: #FFDB00;
    color: #111;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;
  }
  .composer button:hover:not(:disabled) { transform: translateY(-1px); }
  .composer button:disabled { opacity: 0.4; cursor: not-allowed; }
  .composer button.quiz-btn {
    background: transparent;
    color: #FFDB00;
    border: 1px solid #FFDB00;
  }
  .quiz {
    width: 78%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: pop 0.25s ease-out;
  }
  .quiz-title { font-weight: 700; color: #FFDB00; font-size: 15px; }
  .quiz-card {
    background: #1f1f27;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .quiz-q { font-weight: 600; line-height: 1.45; margin-bottom: 4px; }
  .opt {
    text-align: left;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #15151b;
    color: #f5f5f7;
    font-size: 14.5px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .opt:hover:not(:disabled) { border-color: #FFDB00; }
  .opt:disabled { cursor: default; }
  .opt.right { background: rgba(34, 197, 94, 0.18); border-color: #22c55e; color: #bbf7d0; }
  .opt.wrong { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #fecaca; }
  .explain { font-size: 14px; line-height: 1.5; padding-top: 4px; }
  .explain.good { color: #86efac; }
  .explain.bad { color: #fca5a5; }
  @keyframes pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
`;
