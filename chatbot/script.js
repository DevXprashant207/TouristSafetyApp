<script type="module">
  import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

  const API_KEY = "YOUR_GEMINI_API_KEY"; // ⚠️ personal use only
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const messagesEl = document.getElementById("messages");
  const promptEl = document.getElementById("prompt");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");

  function pushMessage(role, text) {
    const div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "user" : "bot");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function typeText(container, text) {
    container.textContent = "";
    for (let i = 0; i < text.length; i++) {
      container.textContent += text[i];
      messagesEl.scrollTop = messagesEl.scrollHeight;
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  async function callAPI(prompt) {
    pushMessage("user", prompt);

    const typingDiv = document.createElement("div");
    typingDiv.className = "msg bot";
    typingDiv.textContent = "AI is typing...";
    messagesEl.appendChild(typingDiv);

    try {
      const result = await model.generateContent(prompt);
      const reply = result.response.text();

      typingDiv.textContent = "";
      await typeText(typingDiv, reply);
    } catch (err) {
      typingDiv.textContent = "Error: " + err.message;
    }
  }

  sendBtn.onclick = () => {
    const text = promptEl.value.trim();
    if (!text) return;
    promptEl.value = "";
    callAPI(text);
  };

  promptEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  clearBtn.onclick = () => (messagesEl.innerHTML = "");
</script>
