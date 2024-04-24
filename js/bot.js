document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  let isSpeaking = false;
  let isListening = false;
  let manuallyStopped = false;
  let conversationState = 0;

  const dialogues = [
    { input: "hi tech host", response: "Hello PD Ruth, how are you today?" },
    {
      input: "great, so will you be able to help with our event today?",
      response: "Sure PD, where do you want me to start?",
    },
    {
      input:
        "can you provide me on the screen the qualification for skills competition today and the participating tvi?",
      response:
        "Sure, here are the qualifications: WEB Development NC III (by Lorma and GESTAAC), Cookery NC III (by Tenacity and LUCST), and etc.",
    },
    {
      input: "great tech host, it was a great help",
      response:
        "Sure PD, any time. Is there anything else I can help you with?",
    },
    {
      input: "none for now, let us start the competition",
      response: "Great! Good luck to all participants!",
    },
  ];

  recognition.onresult = function (event) {
    const last = event.results.length - 1;
    const text = event.results[last][0].transcript.trim().toLowerCase();
    console.log("Heard:", text);
    if (event.results[last].isFinal) {
      processInput(text);
    }
  };
  function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Substitution
            matrix[i][j - 1] + 1, // Insertion
            matrix[i - 1][j] + 1 // Deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Separated similarity function, outside levenshteinDistance
  function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    const distance = levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
  }
  function processInput(input) {
    console.log("Processing input:", input);

    const dialogue = findClosestDialogue(input);
    if (dialogue) {
      speak(dialogue.response);
      conversationState = (conversationState + 1) % dialogues.length; // Move to the next state
    } else {
      speak("I didn't catch that. Can you please repeat?");
    }
  }

  function findClosestDialogue(input) {
    let maxSimilarity = 0;
    let bestMatchDialogue = null;
    dialogues.forEach((dialogue) => {
      const similarityScore = similarity(input, dialogue.input.toLowerCase());
      if (similarityScore > maxSimilarity && similarityScore >= 0.6) {
        // Threshold can be adjusted
        maxSimilarity = similarityScore;
        bestMatchDialogue = dialogue;
      }
    });
    return bestMatchDialogue;
  }

  function speak(text) {
    if (isListening) {
      recognition.stop(); // Stop recognition before speaking to prevent it from listening to its own voice.
      isListening = false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      isSpeaking = true;
    };
    utterance.onend = () => {
      isSpeaking = false;
      if (!manuallyStopped) {
        // Only restart recognition if it wasn't manually stopped.
        startRecognition();
      }
    };
    window.speechSynthesis.speak(utterance);
    addToChatbox("Bot: " + text);
  }

  function addToChatbox(message) {
    const p = document.createElement("p");
    p.textContent = message;
    chatbox.appendChild(p);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function startRecognition() {
    console.log("Trying to start recognition."); // Additional logging
    if (!isSpeaking && !isListening) {
      // Ensure we're not already speaking or listening
      recognition.start();
      isListening = true;
      console.log("Recognition started."); // Confirm that recognition has started
    } else {
      console.log(
        "Recognition not started because isSpeaking or isListening is true."
      );
    }
  }

  recognition.onend = function () {
    console.log("Recognition ended."); // Log when recognition ends
    isListening = false;
    if (!isSpeaking && !manuallyStopped) {
      console.log("Recognition is auto-restarting.");
      startRecognition(); // Restart recognition if not manually stopped and not speaking.
    }
  };
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (manuallyStopped || !isListening) {
        manuallyStopped = false;
        startRecognition();
      }
    } else if (event.key === "Escape") {
      recognition.stop();
      isListening = false;
      manuallyStopped = true;
      chatbox.innerHTML = "";
      addToChatbox("Conversation reset.");
      conversationState = 0; // Reset the conversation state
    }
  });

  addToChatbox("Press Enter to start recognition, Escape to reset.");
});
