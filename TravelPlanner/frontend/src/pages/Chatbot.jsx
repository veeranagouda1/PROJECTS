import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

const MAX_HISTORY = 20; // prevent storage overflow

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const bottomRef = useRef(null);

  // Load saved chat
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chatbot_history");
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {
      console.warn("Failed to load stored messages");
      localStorage.removeItem("chatbot_history");
    }
  }, []);

  // Save safely
  useEffect(() => {
    try {
      const trimmed = messages.slice(-MAX_HISTORY);
      localStorage.setItem("chatbot_history", JSON.stringify(trimmed));
    } catch (err) {
      console.warn("Storage full — clearing history.");
      localStorage.removeItem("chatbot_history");
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const showToast = (msg, type = "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // === SEND MESSAGE ===
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot/chat", {
        message: currentInput,
        context: messages.map((m) => m.content).join("\n"),
      });

      const botReply =
        res.data.reply ||
        res.data.response ||
        "I’m here! But I didn’t receive a proper response.";

      const aiMsg = { role: "assistant", content: botReply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      showToast("Failed to get response from server", "error");
      // Remove user message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // Clear history
  const clearHistory = () => {
    if (window.confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("chatbot_history");
    }
  };

  return (
    <div className="page-transition">
      <Navbar />

      <div
        style={{
          padding: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Title + Clear button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              background: "linear-gradient(135deg, #4C2AFF 0%, #8B5DFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2.4rem",
              fontWeight: "bold",
            }}
          >
            AI Travel Assistant
          </h1>

          <button
            onClick={clearHistory}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "#6c757d",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {/* Chat window */}
        <div
          style={{
            height: "500px",
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
          className="card"
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "35%" }}>
              <p>Start chatting with your AI assistant!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 18px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #4C2AFF, #8B5DFF)"
                        : "rgba(255,255,255,0.9)",
                    color: msg.role === "user" ? "white" : "#333",
                    border:
                      msg.role !== "user"
                        ? "1px solid rgba(76,42,255,0.2)"
                        : "none",
                    boxShadow:
                      msg.role === "user"
                        ? "0 4px 12px rgba(76,42,255,0.3)"
                        : "0 2px 8px rgba(0,0,0,0.1)",
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(76,42,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#4C2AFF",
                    animation: "pulse 1s infinite",
                  }}
                ></span>
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ marginTop: "15px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "12px",
                border: "2px solid rgba(76,42,255,0.2)",
                background: "rgba(255,255,255,0.85)",
              }}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "12px 22px",
                background:
                  "linear-gradient(135deg, #4C2AFF 0%, #8B5DFF 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor:
                  loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Chatbot;
