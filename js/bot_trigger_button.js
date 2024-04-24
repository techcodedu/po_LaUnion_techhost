const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const chatbox = document.getElementById("chatbox");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

let isSpeaking = false;

recognition.onresult = function (event) {
  const last = event.results.length - 1;
  const text = event.results[last][0].transcript.trim();
  if (text) {
    recognition.stop();
    processInput(text);
  }
};

recognition.onend = function () {
  if (!isSpeaking) {
    recognition.start();
  }
};

function processInput(input) {
  const response = generateResponse(input.toLowerCase());
  addToChatbox("You: " + input);
  addToChatbox("Bot: " + response);
  speak(response);
}

function generateResponse(input) {
  if (input.includes("hello")) {
    return "Hello there!";
  } else if (input.includes("how are you")) {
    return "I am fine, thanks for asking!";
  } else {
    return "Can you please repeat?";
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = function () {
    isSpeaking = true;
  };
  utterance.onend = function () {
    isSpeaking = false;
    if (!recognition._isManuallyStopped) {
      recognition.start();
    }
  };
  window.speechSynthesis.speak(utterance);
}

function addToChatbox(message) {
  const p = document.createElement("p");
  p.textContent = message;
  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
}

startBtn.onclick = () => {
  recognition._isManuallyStopped = false;
  recognition.start();
};

resetBtn.onclick = () => {
  recognition.stop();
  recognition._isManuallyStopped = true;
  chatbox.innerHTML = ""; // Clear the chatbox
  isSpeaking = false; // Reset speaking state
};
