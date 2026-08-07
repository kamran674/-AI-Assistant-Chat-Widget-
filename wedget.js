// ============================================================
// widget.js – Self-contained embeddable chat widget (improved)
// ============================================================

(function() {
    "use strict";

    // Prevent duplicate initialization
    if (document.getElementById('quote-chat-widget')) return;

    // ----- 1. Load Font Awesome (for professional icons) -----
    function loadFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // ----- 2. Inline CSS (no external file needed!) -----
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ---- Chat Widget Styles ---- */
            #quote-chat-widget {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }

            /* Toggle Button */
            #chat-toggle {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: linear-gradient(145deg, #1e293b, #0f172a);
                color: white;
                border: none;
                font-size: 28px;
                cursor: pointer;
                box-shadow: 0 12px 30px rgba(0,0,0,0.25);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255,255,255,0.1);
            }
            #chat-toggle:hover {
                transform: scale(1.05);
                background: #2d3a4f;
            }
            #chat-toggle.hidden {
                transform: scale(0);
                opacity: 0;
                pointer-events: none;
            }

            /* Chat Window */
            #chat-window {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: 380px;
                max-width: calc(100vw - 32px);
                height: 560px;
                max-height: 70vh;
                background: white;
                border-radius: 28px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                display: none;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.2);
                transition: all 0.3s ease;
            }
            #chat-window.open {
                display: flex;
            }

            /* Header */
            .chat-header {
                background: linear-gradient(145deg, #1e293b, #0f172a);
                color: white;
                padding: 18px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
                border-bottom: 1px solid #334155;
                font-weight: 500;
                font-size: 1rem;
            }
            .chat-header i {
                color: #60a5fa;
                margin-right: 10px;
            }
            #close-chat {
                cursor: pointer;
                font-size: 1.2rem;
                opacity: 0.7;
                transition: 0.2s;
                background: none;
                border: none;
                color: white;
                padding: 0 8px;
            }
            #close-chat:hover {
                opacity: 1;
            }

            /* Messages Area */
            #chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px 16px 12px;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            #chat-messages::-webkit-scrollbar {
                width: 4px;
            }
            #chat-messages::-webkit-scrollbar-thumb {
                background: #b9c4d0;
                border-radius: 8px;
            }

            /* Message Bubbles */
            .message {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 22px;
                font-size: 0.9rem;
                line-height: 1.5;
                word-break: break-word;
                animation: msgFade 0.2s ease;
            }
            .message.user {
                align-self: flex-end;
                background: linear-gradient(145deg, #2563eb, #1d4ed8);
                color: white;
                border-bottom-right-radius: 4px;
            }
            .message.bot {
                align-self: flex-start;
                background: white;
                color: #0f172a;
                border-bottom-left-radius: 4px;
                border: 1px solid #e9edf2;
            }
            .message.bot i {
                color: #2563eb;
                margin-right: 6px;
            }
            .message .timestamp {
                font-size: 0.6rem;
                opacity: 0.5;
                margin-top: 4px;
                display: block;
                text-align: right;
            }

            /* Typing Indicator */
            .typing-indicator {
                display: none;
                align-items: center;
                gap: 4px;
                padding: 10px 16px;
                background: white;
                border-radius: 30px;
                align-self: flex-start;
                border: 1px solid #e9edf2;
                margin-bottom: 2px;
                margin-left: 16px;
            }
            .typing-indicator span {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #94a3b8;
                border-radius: 40px;
                animation: typingBounce 1.2s infinite;
            }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

            /* Input Area */
            .chat-input {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 14px 16px 18px;
                background: white;
                border-top: 1px solid #eef2f6;
                flex-shrink: 0;
            }
            #message-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #dce1e9;
                border-radius: 60px;
                font-size: 0.9rem;
                background: #f1f5f9;
                outline: none;
                transition: 0.2s;
                min-width: 0;
            }
            #message-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
            }
            #send-btn {
                background: linear-gradient(145deg, #1e293b, #0f172a);
                border: none;
                color: white;
                padding: 12px 20px;
                border-radius: 60px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: 0.2s;
                white-space: nowrap;
            }
            #send-btn:hover {
                transform: scale(0.96);
                background: #2d3a4f;
            }
            #send-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Animations */
            @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); background: #94a3b8; }
                30% { transform: translateY(-6px); background: #3b82f6; }
            }
            @keyframes msgFade {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Mobile Responsive */
            @media (max-width: 480px) {
                #chat-window {
                    width: calc(100vw - 24px);
                    height: 80vh;
                    bottom: 80px;
                    right: 12px;
                }
                #chat-toggle {
                    width: 56px;
                    height: 56px;
                    font-size: 24px;
                }
                .message {
                    max-width: 90%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ----- 3. Build Widget HTML -----
    function buildWidget() {
        const container = document.createElement('div');
        container.id = 'quote-chat-widget';
        container.innerHTML = `
            <!-- Toggle Button -->
            <button id="chat-toggle" aria-label="Open chat">
                <i class="fas fa-comment-dots"></i>
            </button>

            <!-- Chat Window -->
            <div id="chat-window">
                <div class="chat-header">
                    <span><i class="fas fa-comment-dots"></i> Get a Quote</span>
                    <button id="close-chat" aria-label="Close chat">✖</button>
                </div>

                <div id="chat-messages">
                    <div class="message bot">
                        <i class="fas fa-robot"></i> Hello! I'm your quote assistant. Ask me about pricing, services, or anything else.
                        <span class="timestamp">just now</span>
                    </div>
                </div>

                <div class="typing-indicator" id="typingIndicator">
                    <span></span><span></span><span></span>
                </div>

                <div class="chat-input">
                    <input id="message-input" placeholder="Ask for a quote..." autocomplete="off">
                    <button id="send-btn"><i class="fas fa-arrow-up"></i> Send</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        initWidget();
    }

    // ----- 4. Widget Functionality -----
    function initWidget() {
        const toggleBtn = document.getElementById('chat-toggle');
        const closeBtn = document.getElementById('close-chat');
        const chatWindow = document.getElementById('chat-window');
        const messagesArea = document.getElementById('chat-messages');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const typingIndicator = document.getElementById('typingIndicator');

        let isOpen = false;
        let isProcessing = false;

        // Scroll to bottom
        function scrollToBottom() {
            setTimeout(() => {
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }, 20);
        }

        // Add message
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

        // Show/hide typing
        function showTyping(show) {
            typingIndicator.style.display = show ? 'flex' : 'none';
            if (show) scrollToBottom();
        }

        // Mock response
        function getMockReply(text) {
            const lower = text.toLowerCase();
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

        // Process message
        function processMessage(text) {
            if (isProcessing) return;
            if (!text.trim()) return;

            addMessage(text, 'user');
            messageInput.value = '';
            messageInput.focus();

            isProcessing = true;
            sendBtn.disabled = true;
            messageInput.disabled = true;

            showTyping(true);

            setTimeout(() => {
                showTyping(false);
                addMessage(getMockReply(text), 'bot');
                isProcessing = false;
                sendBtn.disabled = false;
                messageInput.disabled = false;
                messageInput.focus();
            }, 600 + Math.random() * 600);
        }

        // Toggle chat
        function toggleChat() {
            isOpen = !isOpen;
            chatWindow.classList.toggle('open', isOpen);
            toggleBtn.classList.toggle('hidden', isOpen);
            if (isOpen) {
                setTimeout(() => messageInput.focus(), 250);
            }
        }

        // Event listeners
        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        sendBtn.addEventListener('click', () => processMessage(messageInput.value));

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                processMessage(messageInput.value);
            }
        });

        console.log('Quote Chat Widget ready! Click the 💬 to open.');
    }

    // ----- 5. Initialize when DOM is ready -----
    function init() {
        loadFontAwesome();
        injectStyles();
        buildWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();