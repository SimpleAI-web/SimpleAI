const encodedKey = "c2stb3ItdjEtOTI1MzVkZjZlMWUzYzYwOGNmNGY5YjAwZDBmMzA5ZjMyMzMyMGUwZjI1OGQyOGVjY2FiZjg0NTM1NjJiYzM5YQ==";
const API_KEY = atob(encodedKey);

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

const chatList = document.getElementById("chatList");
const newChatButton = document.getElementById("newChatButton");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("chat");

const profileButton = document.getElementById("profileButton");
const historyButton = document.getElementById("historyButton");
const userProfile = document.getElementById("userProfile");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const profileChatButton = document.getElementById("profileChatButton");
const chatHistory = document.getElementById("chatHistory");
const closeChatHistory = document.getElementById("closeChatHistory");

const SYSTEM_PROMPT = `
Ты — искусственный интеллект SimpleAI.

Ты работаешь внутри приложения SimpleAI и являешься его AI-ассистентом.

Если пользователь спрашивает, как тебя зовут, кто ты, какая у тебя идентичность или как называется этот AI:
- отвечай, что тебя зовут SimpleAI;
- не называй себя названием базовой модели, через которую работает API;
- не утверждай, что ты разработан Google, NVIDIA, OpenAI, Qwen или другой компанией;
- можешь сказать: "Я SimpleAI — искусственный интеллект этого приложения."

Отвечай естественно и по существу.
`;

const conversation = [
    {
        role: "system",
        content: SYSTEM_PROMPT
    }
];


// ============================================================
// ПРОФИЛЬ
// ============================================================

function showUserProfile(profile) {
    profileButton.style.display = "none";
    userProfile.style.display = "flex";

    userAvatar.src = profile.picture || "";
    userName.textContent = profile.name || "";
}

function loadSavedUser() {
    const savedUser = localStorage.getItem("simpleAI_user");

    if (!savedUser) return;

    try {
        const profile = JSON.parse(savedUser);

        if (profile && profile.name && profile.picture) {
            showUserProfile(profile);
        }
    } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
        localStorage.removeItem("simpleAI_user");
    }
}


// ============================================================
// ИСТОРИЯ ЧАТОВ
// ============================================================

let chats =
    JSON.parse(localStorage.getItem("simpleAI_chats")) || [];

let currentChatId = null;

function saveChatsToLocalStorage() {
    localStorage.setItem(
        "simpleAI_chats",
        JSON.stringify(chats)
    );
}

function startNewChat() {
    currentChatId = Date.now().toString();

    chat.innerHTML = "";
    conversation.length = 0;

    chats.unshift({
        chatId: currentChatId,
        title: "Новый чат",
        messages: []
    });

    saveChatsToLocalStorage();
    renderChatList();
}

function renderChatList() {
    chatList.innerHTML = "";

    chats.forEach(function(chatItem) {
        const chatContainer = document.createElement("div");

        chatContainer.style.display = "flex";
        chatContainer.style.justifyContent = "space-between";
        chatContainer.style.alignItems = "center";
        chatContainer.style.padding = "10px";
        chatContainer.style.margin = "5px 0";
        chatContainer.style.border = "1px solid #000000";
        chatContainer.style.borderRadius = "7px";
        chatContainer.style.cursor = "pointer";

        const chatTitle = document.createElement("span");
        chatTitle.textContent = chatItem.title;

        chatTitle.onclick = function() {
            switchChat(chatItem.chatId);
            chatHistory.style.display = "none";
        };

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.style.fontWeight = "bold";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.style.cursor = "pointer";

        deleteBtn.onclick = function(event) {
            event.stopPropagation();

            chats = chats.filter(function(c) {
                return c.chatId !== chatItem.chatId;
            });

            saveChatsToLocalStorage();

            if (currentChatId === chatItem.chatId) {
                startNewChat();
            } else {
                renderChatList();
            }
        };

        chatContainer.appendChild(chatTitle);
        chatContainer.appendChild(deleteBtn);
        chatList.appendChild(chatContainer);
    });
}

function switchChat(id) {
    const selectedChat =
        chats.find(function(c) {
            return c.chatId === id;
        });

    if (!selectedChat) return;

    currentChatId = selectedChat.chatId;

    chat.innerHTML = "";
    conversation.length = 0;

    selectedChat.messages.forEach(function(msg) {
        const type =
            msg.role === "user" ? "user" : "ai";

        addMessage(msg.parts[0].text, type);

        conversation.push({
            role: msg.role === "model" ? "assistant" : msg.role,
            content: msg.parts[0].text
        });
    });

    renderChatList();
    chatHistory.style.display = "none";
}


// ============================================================
// ПРОФИЛЬ / ИСТОРИЯ
// ============================================================

profileChatButton.addEventListener(
    "click",
    function() {
        chatHistory.style.display = "flex";
    }
);

closeChatHistory.addEventListener(
    "click",
    function() {
        chatHistory.style.display = "none";
    }
);

historyButton.addEventListener(
    "click",
    function() {
        chatHistory.style.display = "flex";
    }
);

newChatButton.addEventListener(
    "click",
    function() {
        startNewChat();
        chatHistory.style.display = "none";
    }
);


// ============================================================
// ВЫХОД
// ============================================================

logoutButton.addEventListener(
    "click",
    function() {
        localStorage.removeItem("simpleAI_user");

        profileButton.style.display = "inline-block";
        userProfile.style.display = "none";

        userAvatar.src = "";
        userName.textContent = "";
    }
);


// ============================================================
// СООБЩЕНИЯ
// ============================================================

function addMessage(text, type) {
    const message = document.createElement("div");

    message.classList.add("message");

    if (type === "user") {
        message.classList.add("user-message");
    } else {
        message.classList.add("ai-message");
    }

    if (type === "ai") {
        const cleanText = text.replace(
            /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
            ""
        );

        const formattedText = cleanText
            .replace(
                /\*\*\*(.*?)\*\*\*/g,
                "<strong><em>$1</em></strong>"
            )
            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )
            .replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            )
            .replace(/\n/g, "<br>");

        message.innerHTML = formattedText;
    } else {
        message.textContent = text;
    }

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;

    return message;
}


// ============================================================
// АНИМАЦИЯ
// ============================================================

function createThinkingAnimation() {
    const message = document.createElement("div");

    message.classList.add("message", "ai-message");

    message.innerHTML =
        '<span class="thinking-dot">●</span> ' +
        '<span class="thinking-dot">●</span> ' +
        '<span class="thinking-dot">●</span>';

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;

    return message;
}


// ============================================================
// AI — ВРЕМЕННО GEMINI
// ============================================================

async function sendMessage() {
    try {
        const text = messageInput.value.trim();

        if (text === "") return;

        const currentChat =
            chats.find(function(c) {
                return c.chatId === currentChatId;
            });

        if (currentChat) {
            if (currentChat.title === "Новый чат") {
                currentChat.title =
                    text.length > 20
                        ? text.substring(0, 20) + "..."
                        : text;
            }

            currentChat.messages.push({
                role: "user",
                parts: [{ text: text }]
            });

            saveChatsToLocalStorage();
            renderChatList();
        }

        addMessage(text, "user");

        messageInput.value = "";
        sendButton.disabled = true;

        const thinkingMessage =
            createThinkingAnimation();

        conversation.push({
            role: "user",
            content: text
        });

        const response = await fetch(API_URL, {
    method: "POST",

    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    },

    body: JSON.stringify({
        model: MODEL,
        messages: conversation
    })
});

const data = await response.json();

        thinkingMessage.remove();

        if (!response.ok) {
            addMessage(
                "Ошибка AI: " +
                (
                    data.error &&
                    data.error.message
                        ? data.error.message
                        : "Неизвестная ошибка"
                ),
                "ai"
            );

            console.log(data);
            sendButton.disabled = false;
            return;
        }

        const answer =
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;
        if (!answer) {
            addMessage("AI не вернул ответ.", "ai");
            console.log(data);
            sendButton.disabled = false;
            return;
        }

        addMessage(answer, "ai");

        conversation.push({
            role: "assistant",
            content: answer
        });

        if (currentChat) {
            currentChat.messages.push({
                role: "model",
                parts: [{ text: answer }]
            });

            saveChatsToLocalStorage();
        }

    } catch (error) {
        addMessage(
            "Ошибка JavaScript: " + error.message,
            "ai"
        );

        console.error(error);
    }

    sendButton.disabled = false;
}


// ============================================================
// SEND / ENTER
// ============================================================

sendButton.addEventListener(
    "click",
    sendMessage
);

messageInput.addEventListener(
    "keydown",
    function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    }
);


// ============================================================
// ЗАПУСК
// ============================================================

loadSavedUser();

if (chats.length === 0) {
    startNewChat();
} else {
    currentChatId = chats[0].chatId;
    renderChatList();
    switchChat(currentChatId);
}
