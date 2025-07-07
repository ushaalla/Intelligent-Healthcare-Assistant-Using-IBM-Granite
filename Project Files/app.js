// Panel switching
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    const target = this.getAttribute('data-target');
    document.getElementById(target).style.display = 'block';
  });
});

// General submit function for forms
function submitForm(endpoint, inputId, resultId) {
  const input = document.getElementById(inputId).value;
  if (!input.trim()) return;

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `user_input=${encodeURIComponent(input)}`
  })
  .then(res => res.json())
  .then(data => {
    const resultBox = document.getElementById(resultId);
    const result = data.result || '';

    const formatted = result
      .split(/[0-9]+\.\s|\n|•|👉/)  // common list separators
      .filter(line => line.trim())
      .map(line => `👉 ${line.trim()}`)
      .join("<br>");

    resultBox.innerHTML = formatted || "⚠️ No response.";
  })
  .catch(() => {
    document.getElementById(resultId).innerText = "⚠️ Failed to fetch result.";
  });
}

// Get tips and show each one in a card
function getTips() {
  fetch('/tips')
    .then(res => res.json())
    .then(data => {
      const tipsContainer = document.getElementById("tipsResult");
      const tips = data.result
        .split(/[0-9]+\.\s|\n|👉|•/) // split by common list markers
        .filter(t => t.trim());

      tipsContainer.innerHTML = tips.map(tip => `
        <div class="tip-card">
          💡 ${tip.trim()}
        </div>
      `).join("");
    })
    .catch(() => {
      document.getElementById("tipsResult").innerHTML = "⚠️ Failed to load tips.";
    });
}

// Patient Chat Assistant - preserves conversation
async function sendChat() {
  const input = document.getElementById("chatInput").value.trim();
  const chatWindow = document.getElementById("chatWindow");

  if (!input) return;

  // Show user message
  const userDiv = document.createElement("div");
  userDiv.className = "chat-bubble user-bubble";
  userDiv.innerText = `👤: ${input}`;
  chatWindow.appendChild(userDiv);

  // Clear input
  document.getElementById("chatInput").value = "";

  // Call backend
  const formData = new FormData();
  formData.append("user_input", input);

  const res = await fetch("/chat", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  // Show bot response
  const botDiv = document.createElement("div");
  botDiv.className = "chat-bubble bot-bubble";
  botDiv.innerText = `🤖: ${data.result}`;
  chatWindow.appendChild(botDiv);

  // Auto-scroll
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
