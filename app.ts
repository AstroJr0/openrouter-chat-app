// State Management
let apiKey: string = localStorage.getItem('openrouter_api_key') || '';
let currentModel: string = 'gpt-4o'; // Default

// DOM Elements
const chatWindow = document.getElementById('chat-window') as HTMLElement;
const messagesContainer = document.getElementById('messages-container') as HTMLElement;
const userInput = document.getElementById('user-input') as HTMLTextAreaElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const modelDisplay = document.getElementById('current-model-display') as HTMLElement;

// Toast Elements
const toastOverlay = document.getElementById('toast-overlay') as HTMLElement;
const toastTitle = document.getElementById('toast-title') as HTMLElement;
const toastInput = document.getElementById('toast-input') as HTMLInputElement;
const toastConfirm = document.getElementById('toast-confirm') as HTMLButtonElement;
const toastCancel = document.getElementById('toast-cancel') as HTMLButtonElement;

let activeToastType: 'API_KEY' | 'ADD_MODEL' | null = null;

/**
 * UI Interactions
 */

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${userInput.scrollHeight}px`;
});

// Toast Logic
const showToast = (type: 'API_KEY' | 'ADD_MODEL') => {
    activeToastType = type;
    toastTitle.innerText = type === 'API_KEY' ? 'Enter OpenRouter API Key' : 'Enter Model Name';
    toastInput.value = type === 'API_KEY' ? apiKey : '';
    toastInput.placeholder = type === 'API_KEY' ? 'sk-or-v1-...' : 'openai/gpt-4o';
    toastOverlay.classList.remove('hidden');
    toastInput.focus();
};

document.getElementById('btn-api-key')?.addEventListener('click', () => showToast('API_KEY'));
document.getElementById('btn-add-model')?.addEventListener('click', () => showToast('ADD_MODEL'));

toastCancel.addEventListener('click', () => {
    toastOverlay.classList.add('hidden');
    activeToastType = null;
});

toastConfirm.addEventListener('click', () => {
    const val = toastInput.value.trim();
    if (!val) return;

    if (activeToastType === 'API_KEY') {
        apiKey = val;
        localStorage.setItem('openrouter_api_key', val);
    } else if (activeToastType === 'ADD_MODEL') {
        currentModel = val;
        modelDisplay.innerText = val;
    }

    toastOverlay.classList.add('hidden');
    activeToastType = null;
});

/**
 * Chat Logic
 */

const appendMessage = (role: 'user' | 'ai', text: string) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerText = text;
    messagesContainer.appendChild(msgDiv);
    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
};

const sendMessage = async () => {
    const prompt = userInput.value.trim();
    if (!prompt || !apiKey) {
        if (!apiKey) alert('Please set your API Key first.');
        return;
    }

    // 1. Trigger the 720deg spin (360 * 2)
    sendBtn.classList.add('spin-animation');
    setTimeout(() => sendBtn.classList.remove('spin-animation'), 800);

    // 2. Clear input & UI update
    appendMessage('user', prompt);
    userInput.value = '';
    userInput.style.height = 'auto';

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                apiKey,
                model: currentModel
            })
        });

        const data = await response.json();
        appendMessage('ai', data.message || 'Error: No response from backend.');
    } catch (err) {
        appendMessage('ai', 'Error connecting to the backend.');
        console.error(err);
    }
};

sendBtn.addEventListener('click', sendMessage);

// Allow Enter to send, Shift+Enter for new line
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
  
