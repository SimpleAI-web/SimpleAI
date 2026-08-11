const encodedKey = "QVEuQWI4Uk42SXZMNks0TmR5ajRhTVhkR3gyU08yOUlJdGhrUDJQU2ptR0paV2l0azlUelE=";
const API_KEY = atob(encodedKey);

const MODEL = "gemini-1.5-flash";

const GOOGLE_CLIENT_ID = "634945721716-o2c0gg53bgebts6dh859veuv9141okad.apps.googleusercontent.com";

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("chat");

const profileButton = document.getElementById("profileButton")
const googleButton = document.getElementById("googleButton");

const userProfile = document.getElementById("userProfile");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const profileChatButton = document.getElementById("profileChatButton");
const chatHistory = document.getElementById("chatHistory");
const closeChatHistory = document.getElementById("closeChatHistory");

const conversation = [];

let googleInitialized = false;


// ============================================================
// GOOGLE LOGIN
// ============================================================

function handleGoogleLogin(response) {

    try {

        const token = response.credential;

        const payload = token.split(".")[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function(character) {

                    return "%" +
                        ("00" + character.charCodeAt(0).toString(16))
                            .slice(-2);

                })
                .join("")
        );

        const user = JSON.parse(decoded);

        const profile = {
            name: user.name || "Google user",
            email: user.email || "",
            picture: user.picture || ""
        };

        showUserProfile(profile);

        localStorage.setItem(
            "simpleAI_user",
            JSON.stringify(profile)
        );

        hideGoogleButton();

        console.log(
            "Google login successful:",
            profile
        );

    } catch (error) {

        console.error(
            "Ошибка обработки Google-входа:",
            error
        );

    }

}


// ============================================================
// ИНИЦИАЛИЗАЦИЯ GOOGLE
// ============================================================

function initializeGoogleLogin() {

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.error(
            "Google Identity Services не загрузился."
        );

        return;

    }

    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin,

        scope: "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile"

    });

    googleInitialized = true;

    console.log(
        "Google Identity Services initialized."
    );

}


// ============================================================
// ПОКАЗ GOOGLE-КНОПКИ
// ============================================================

function showGoogleButton() {

    if (!googleInitialized) {

        alert(
            "Google Login ещё загружается. Подожди несколько секунд."
        );

        return;

    }

    googleButton.style.display = "block";

    googleButton.innerHTML = "";

    google.accounts.id.renderButton(
        googleButton,
        {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 210
        }
    );

}


// ============================================================
// СКРЫТЬ GOOGLE-КНОПКУ
// ============================================================

function hideGoogleButton() {

    googleButton.style.display = "none";

    googleButton.innerHTML = "";

}


// ============================================================
// КНОПКИ ВХОДА И РЕГИСТРАЦИИ
// ============================================================

profileButton.addEventListener(
    "click",
    function(){
        showGoogleButton();
    }
);


// ============================================================
// ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ============================================================

function showUserProfile(profile) {

    profileButton.style.display = "none";

    userProfile.style.display = "flex";

    userAvatar.src = profile.picture;

    userName.textContent = profile.name;

}


// ============================================================
// ЗАГРУЗКА СОХРАНЁННОГО ПРОФИЛЯ
// ============================================================

function loadSavedUser() {

    const savedUser =
        localStorage.getItem("simpleAI_user");

    if (!savedUser) {

        return;

    }

    try {

        const profile =
            JSON.parse(savedUser);

        if (
            profile &&
            profile.name &&
            profile.picture
        ) {

            showUserProfile(profile);

        }

    } catch (error) {

        console.error(
            "Ошибка загрузки профиля:",
            error
        );

        localStorage.removeItem(
            "simpleAI_user"
        );

    }

}

profileChatButton.addEventListener(
    "click",
    function(){

        chatHistory.style.display = "flex";

    }

);

closeChatHistory.addEventListener(
    "click",
    function(){

        chatHistory.style.display = "none";

    }
);

// ============================================================
// ВЫХОД
// ============================================================

logoutButton.addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "simpleAI_user"
        );

        profileButton.style.display = 
            "inline-block";

        userProfile.style.display =
            "none";

        userAvatar.src = "";

        userName.textContent = "";

        hideGoogleButton();

        if (
            typeof google !== "undefined" &&
            google.accounts &&
            google.accounts.id
        ) {

            google.accounts.id.disableAutoSelect();

        }

    }
);


// ============================================================
// ДОБАВЛЕНИЕ СООБЩЕНИЯ
// ============================================================

function addMessage(text, type) {

    const message =
        document.createElement("div");

    message.classList.add("message");

    if (type === "user") {

        message.classList.add(
            "user-message"
        );

    } else {

        message.classList.add(
            "ai-message"
        );

    }

    if (type === "ai") {

        const cleanText =
            text.replace(
                /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
                ""
            );

        const formattedText =
            cleanText
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
                .replace(
                    /\n/g,
                    "<br>"
                );

        message.innerHTML =
            formattedText;

    } else {

        message.textContent =
            text;

    }

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;

    return message;

}


// ============================================================
// АНИМАЦИЯ
// ============================================================

function createThinkingAnimation() {

    const message =
        document.createElement("div");

    message.classList.add(
        "message"
    );

    message.classList.add(
        "ai-message"
    );

    message.innerHTML =
        '<span class="thinking-dot">●</span> ' +
        '<span class="thinking-dot">●</span> ' +
        '<span class="thinking-dot">●</span>';

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;

    return message;

}


// ============================================================
// GEMINI
// ============================================================

async function sendMessage() {

    try {

        const text =
            messageInput.value.trim();

        if (text === "") {

            return;

        }

        // НАХОДИМ ТЕКУЩИЙ ЧАТ СРАЗУ
        const currentChat = chats.find(c => c.chatId === currentChatId);

        // СОХРАНЯЕМ СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ СРАЗУ В ИСТОРИЮ
        if (currentChat) {
            if (currentChat.title === "Новый чат") {
                currentChat.title = text.length > 20 ? text.substring(0, 20) + "..." : text;
            }
            currentChat.messages.push({ role: "user", parts: [{ text: text }] });
            saveChatsToLocalStorage();
            renderChatList();
        }

        addMessage(
            text,
            "user"
        );

        messageInput.value = "";

        sendButton.disabled = true;

        const thinkingMessage =
            createThinkingAnimation();

        conversation.push({

            role: "user",

            parts: [
                {
                    text: text
                }
            ]

        });

        const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: conversation
        })
    }
);

        const data =
            await response.json();

        thinkingMessage.remove();

        if (!response.ok) {

            addMessage(

                "Ошибка Gemini: " +

                (
                    data.error &&
                    data.error.message
                        ? data.error.message
                        : "Неизвестная ошибка"
                ),

                "ai"

            );

            console.log(data);

            sendButton.disabled =
                false;

            return;

        }

        const answer =

            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text;

        if (!answer) {

            addMessage(
                "Gemini не вернул ответ.",
                "ai"
            );

            console.log(data);

            sendButton.disabled =
                false;

            return;

        }

        addMessage(
            answer,
            "ai"
        );

        conversation.push({

            role: "model",

            parts: [
                {
                    text: answer
                }
            ]

        });

        // СОХРАНЯЕМ ОТВЕТ ИИ В ИСТОРИЮ
        if (currentChat) {
            currentChat.messages.push({ role: "model", parts: [{ text: answer }] });
            saveChatsToLocalStorage();
        }

    } catch (error) {

        addMessage(

            "Ошибка JavaScript: " +
            error.message,

            "ai"

        );

        console.error(error);

    }

    sendButton.disabled =
        false;

}


// ============================================================
// SEND
// ============================================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ============================================================
// ENTER
// ============================================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


// ============================================================
// ЗАПУСК GOOGLE
// ============================================================

function waitForGoogle() {

    if (
        typeof google !== "undefined" &&
        google.accounts &&
        google.accounts.id
    ) {

        initializeGoogleLogin();

        loadSavedUser();

        return;

    }

    setTimeout(
        waitForGoogle,
        300
    );

}

waitForGoogle();


// ============================================================
// УПРАВЛЕНИЕ ИСТОРИЕЙ ЧАТОВ
// ============================================================

let chats = JSON.parse(localStorage.getItem("simpleAI_chats")) || [];
let currentChatId = null;

function saveChatsToLocalStorage() {
    localStorage.setItem("simpleAI_chats", JSON.stringify(chats));
}

function startNewChat() {
    currentChatId = Date.now().toString();
    chat.innerHTML = "";
    conversation.length = 0;
    
    const newChat = {
        chatId: currentChatId,
        title: "Новый чат",
        messages: []
    };
    
    chats.unshift(newChat);
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

        // Текст чата
        const chatTitle = document.createElement("span");
        chatTitle.textContent = chatItem.title;
        chatTitle.onclick = function() {
            switchChat(chatItem.chatId);
            chatHistory.style.display = "none";
        };
        
        // Кнопка удаления
        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "✕";
        deleteBtn.style.color = "black";
        deleteBtn.style.fontWeight = "bold";
        deleteBtn.style.marginLeft = "10px";
        
        deleteBtn.onclick = function(e) {
            e.stopPropagation(); // Чтобы не срабатывал клик по самому чату
            
            // Удаляем чат из массива
            chats = chats.filter(c => c.chatId !== chatItem.chatId);
            saveChatsToLocalStorage();
            
            // Если удалили текущий чат — создаем новый
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
    const selectedChat = chats.find(c => c.chatId === id);
    if (!selectedChat) return;
    
    currentChatId = selectedChat.chatId;
    chat.innerHTML = "";
    conversation.length = 0;
    
    selectedChat.messages.forEach(msg => {
        addMessage(msg.parts[0].text, msg.role === "user" ? "user" : "ai");
        conversation.push(msg);
    });
    renderChatList();
}

newChatButton.addEventListener("click", function() {
    startNewChat();
    chatHistory.style.display = "none";
});

// Инициализация при запуске
if (chats.length === 0) {
    startNewChat();
} else {
    renderChatList();
}
