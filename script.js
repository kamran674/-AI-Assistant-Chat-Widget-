

(function() {
    "use strict";

    // ----- DOM refs -----
    const widget = document.getElementById('chatWidget');
    const toggleBtn = document.getElementById('widgetToggle');
    const closeBtn = document.getElementById('closeWidgetBtn');
    const messagesArea = document.getElementById('messagesArea');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const typingIndicator = document.getElementById('typingIndicator');

    // ----- state -----
    let isOpen = false;
    let isProcessing = false;

    // ----- helper: scroll to bottom -----
    function scrollToBottom() {
        setTimeout(() => {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }, 20);
    }

    // ----- add message (user or bot) -----
    function addMessage(text, sender = 'user') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        if (sender === 'bot') {
            msgDiv.innerHTML = `<i class="fas fa-robot"></i> ${text}`;
        } else {
            msgDiv.textContent = text;
        }
        const ts = document.createElement('span');
        ts.className = 'timestamp';
        ts.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msgDiv.appendChild(ts);
        messagesArea.appendChild(msgDiv);
        scrollToBottom();
    }

    // ----- show/hide typing -----
    function showTyping(show) {
        typingIndicator.style.display = show ? 'flex' : 'none';
        if (show) scrollToBottom();
    }

    // ----- mock AI response (simulated delay) -----
    function getMockReply(userMessage) {
        const lower = userMessage.toLowerCase();
        if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) {
            return "Our pricing starts at $49/month for basic, $99/month for pro. Would you like a custom quote?";
        } else if (lower.includes('service') || lower.includes('help') || lower.includes('support')) {
            return "We offer 24/7 support, onboarding, and dedicated account management. How can I assist you further?";
        } else if (lower.includes('demo') || lower.includes('see')) {
            return "Sure! You can schedule a live demo with our team. Just let me know a good time. 😊";
        } else {
            return "Thanks for your message! I can help with quotes, services, or demos. What would you like to know?";
        }
    }

    // ----- process user message (with mock delay) -----
    function processUserMessage(text) {
        if (isProcessing) return;
        if (!text.trim()) return;

        addMessage(text, 'user');
        chatInput.value = '';
        chatInput.focus();

        isProcessing = true;
        sendBtn.disabled = true;
        chatInput.disabled = true;

        showTyping(true);

        const delay = 600 + Math.random() * 600;
        setTimeout(() => {
            showTyping(false);
            const reply = getMockReply(text);
            addMessage(reply, 'bot');

            isProcessing = false;
            sendBtn.disabled = false;
            chatInput.disabled = false;
            chatInput.focus();
        }, delay);
    }

    // ----- open / close widget -----
    function openWidget() {
        widget.classList.remove('closed');
        toggleBtn.classList.add('hidden');
        isOpen = true;
        setTimeout(() => chatInput.focus(), 250);
    }

    function closeWidget() {
        widget.classList.add('closed');
        toggleBtn.classList.remove('hidden');
        isOpen = false;
    }

    function toggleWidget() {
        isOpen ? closeWidget() : openWidget();
    }

    // ----- event listeners -----
    toggleBtn.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', closeWidget);

    sendBtn.addEventListener('click', function() {
        processUserMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            processUserMessage(chatInput.value);
        }
    });

    // click on widget background to focus input
    widget.addEventListener('click', function(e) {
        if (e.target === widget || e.target.closest('.messages-area')) {
            chatInput.focus();
        }
    });

    console.log('Chat widget ready. Click the bubble to open.');
})();