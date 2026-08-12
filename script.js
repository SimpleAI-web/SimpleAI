const SUPABASE_URL =
    "https://pgfapqxxgpuzjyfknquu.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_zHLQIdSPhoKGnGf7_5Yg-Q_Yp6Jw12P";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ============================================================
   DATABASE CONFIG
   ============================================================ */

const CHATS_TABLE = "chats";
const MESSAGES_TABLE = "messages";


/* ============================================================
   AI
   ============================================================ */


/* ============================================================
   DOM
   ============================================================ */

const chatList =
    document.getElementById("chatList");

const newChatButton =
    document.getElementById("newChatButton");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const chat =
    document.getElementById("chat");

const profileButton =
    document.getElementById("profileButton");

const userProfile =
    document.getElementById("userProfile");

const userAvatar =
    document.getElementById("userAvatar");

const userName =
    document.getElementById("userName");

const logoutButton =
    document.getElementById("logoutButton");

const profileChatButton =
    document.getElementById("profileChatButton");

const chatHistory =
    document.getElementById("chatHistory");

const closeChatHistory =
    document.getElementById("closeChatHistory");


/* ============================================================
   AUTH DOM
   ============================================================ */

const authOverlay =
    document.getElementById("authOverlay");

const closeAuth =
    document.getElementById("closeAuth");

const loginView =
    document.getElementById("loginView");

const registerView =
    document.getElementById("registerView");

const verifyView =
    document.getElementById("verifyView");

const successView =
    document.getElementById("successView");

const openRegister =
    document.getElementById("openRegister");

const openLogin =
    document.getElementById("openLogin");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginSubmit =
    document.getElementById("loginSubmit");

const loginError =
    document.getElementById("loginError");

const registerUsername =
    document.getElementById("registerUsername");

const registerEmail =
    document.getElementById("registerEmail");

const registerPassword =
    document.getElementById("registerPassword");

const registerPassword2 =
    document.getElementById("registerPassword2");

const registerSubmit =
    document.getElementById("registerSubmit");

const registerError =
    document.getElementById("registerError");

const verifyEmailText =
    document.getElementById("verifyEmailText");

const verifyCode =
    document.getElementById("verifyCode");

const verifySubmit =
    document.getElementById("verifySubmit");

const verifyError =
    document.getElementById("verifyError");

const demoCodeText =
    document.getElementById("demoCodeText");

const backToRegister =
    document.getElementById("backToRegister");

const successUsername =
    document.getElementById("successUsername");

const successContinue =
    document.getElementById("successContinue");


/* ============================================================
   SYSTEM PROMPT
   ============================================================ */

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


/* ============================================================
   STATE
   ============================================================ */

let conversation = [
    {
        role: "system",
        content: SYSTEM_PROMPT
    }
];

let pendingRegistration = null;

let chats = [];

let currentChatId = null;

let currentUser = null;


/* ============================================================
   AUTH UI
   ============================================================ */

function hideAllAuthViews() {
    loginView.classList.add("hidden");
    registerView.classList.add("hidden");
    verifyView.classList.add("hidden");
    successView.classList.add("hidden");
}


function openAuth(view = "login") {
    authOverlay.classList.add("active");

    hideAllAuthViews();

    if (view === "register") {
        registerView.classList.remove("hidden");
    }

    else if (view === "verify") {
        verifyView.classList.remove("hidden");
    }

    else if (view === "success") {
        successView.classList.remove("hidden");
    }

    else {
        loginView.classList.remove("hidden");
    }
}


function closeAuthWindow() {
    authOverlay.classList.remove("active");
    clearAuthErrors();
}


function clearAuthErrors() {
    loginError.textContent = "";
    registerError.textContent = "";
    verifyError.textContent = "";
}


/* ============================================================
   AUTH EVENTS
   ============================================================ */

profileButton.addEventListener(
    "click",
    function () {
        openAuth("login");
    }
);


closeAuth.addEventListener(
    "click",
    closeAuthWindow
);


authOverlay.addEventListener(
    "click",
    function (event) {

        if (event.target === authOverlay) {
            closeAuthWindow();
        }

    }
);


openRegister.addEventListener(
    "click",
    function () {

        clearAuthErrors();
        openAuth("register");

    }
);


openLogin.addEventListener(
    "click",
    function () {

        clearAuthErrors();
        openAuth("login");

    }
);


backToRegister.addEventListener(
    "click",
    function () {

        clearAuthErrors();
        openAuth("register");

    }
);


/* ============================================================
   PASSWORD TOGGLE
   ============================================================ */

document
    .querySelectorAll(".password-toggle")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const target =
                    document.getElementById(
                        button.dataset.target
                    );

                if (target.type === "password") {

                    target.type = "text";
                    button.textContent = "Скрыть";

                }

                else {

                    target.type = "password";
                    button.textContent = "Показать";

                }

            }
        );

    });


/* ============================================================
   REGISTRATION
   ============================================================ */

registerSubmit.addEventListener(
    "click",
    async function () {

        const username =
            registerUsername.value.trim();

        const email =
            registerEmail.value
                .trim()
                .toLowerCase();

        const password =
            registerPassword.value;

        const password2 =
            registerPassword2.value;

        registerError.textContent = "";

        if (!username) {

            registerError.textContent =
                "Введите username.";

            return;

        }

        if (!email || !email.includes("@")) {

            registerError.textContent =
                "Введите корректный email.";

            return;

        }

        if (password.length < 6) {

            registerError.textContent =
                "Пароль должен содержать минимум 6 символов.";

            return;

        }

        if (password !== password2) {

            registerError.textContent =
                "Пароли не совпадают.";

            return;

        }

        registerSubmit.disabled = true;

        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {
                        data: {
                            username: username
                        }
                    }

                });


            if (error) {

                registerError.textContent =
                    error.message;

                return;

            }


            pendingRegistration = {
                username: username,
                email: email
            };


            /*
             * Если Supabase сразу создал сессию,
             * значит подтверждение email не требуется.
             */

            if (data.session && data.user) {

                currentUser = data.user;

                successUsername.textContent =
                    username;

                pendingRegistration = null;

                await loadChatsFromSupabase();

                openAuth("success");

                return;

            }


            /*
             * Если email confirmation включён,
             * Supabase отправит письмо со ссылкой.
             */

            verifyEmailText.textContent =
                email;

            demoCodeText.textContent =
                "Проверьте почту и перейдите по ссылке подтверждения.";

            verifyCode.value = "";

            openAuth("verify");


        }

        catch (error) {

            console.error(error);

            registerError.textContent =
                "Ошибка регистрации: " +
                error.message;

        }

        finally {

            registerSubmit.disabled = false;

        }

    }
);


/* ============================================================
   EMAIL VERIFICATION
   ============================================================ */

verifySubmit.addEventListener(
    "click",
    async function () {

        verifyError.textContent = "";

        if (!pendingRegistration) {

            verifyError.textContent =
                "Регистрация уже подтверждена или сессия потеряна.";

            return;

        }


        const code =
            verifyCode.value.trim();


        /*
         * В некоторых конфигурациях Supabase
         * можно подтвердить email шестизначным OTP-кодом.
         *
         * Если у тебя используется confirmation link,
         * просто нажми ссылку в письме — этот блок
         * не понадобится.
         */

        if (!code) {

            verifyError.textContent =
                "Если Supabase прислал код — введите его. Если пришла ссылка, просто нажмите её в письме.";

            return;

        }


        verifySubmit.disabled = true;

        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.verifyOtp({

                    email:
                        pendingRegistration.email,

                    token:
                        code,

                    type:
                        "email"

                });


            if (error) {

                verifyError.textContent =
                    "Неверный или просроченный код.";

                console.error(error);

                return;

            }


            currentUser =
                data.user;


            const username =
                data.user?.user_metadata?.username ||
                pendingRegistration.username;


            successUsername.textContent =
                username;


            pendingRegistration = null;


            await loadChatsFromSupabase();

            openAuth("success");


        }

        catch (error) {

            console.error(error);

            verifyError.textContent =
                "Ошибка подтверждения: " +
                error.message;

        }

        finally {

            verifySubmit.disabled = false;

        }

    }
);


/* ============================================================
   SUCCESS
   ============================================================ */

successContinue.addEventListener(
    "click",
    async function () {

        const {
            data
        } =
            await supabaseClient.auth.getUser();


        if (data?.user) {

            currentUser =
                data.user;

            showUserProfile(
                data.user
            );

            await loadChatsFromSupabase();

        }


        closeAuthWindow();

    }
);


/* ============================================================
   LOGIN
   ============================================================ */

loginSubmit.addEventListener(
    "click",
    async function () {

        loginError.textContent = "";

        const email =
            loginEmail.value
                .trim()
                .toLowerCase();

        const password =
            loginPassword.value;


        if (!email || !password) {

            loginError.textContent =
                "Введите email и пароль.";

            return;

        }


        loginSubmit.disabled = true;


        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


            if (error) {

                loginError.textContent =
                    "Неверный email или пароль.";

                console.error(error);

                return;

            }


            if (!data.user) {

                loginError.textContent =
                    "Не удалось получить пользователя.";

                return;

            }


            currentUser =
                data.user;


            showUserProfile(
                data.user
            );


            await loadChatsFromSupabase();


            closeAuthWindow();


        }

        catch (error) {

            console.error(error);

            loginError.textContent =
                "Ошибка входа: " +
                error.message;

        }

        finally {

            loginSubmit.disabled = false;

        }

    }
);


/* ============================================================
   PROFILE
   ============================================================ */

function showUserProfile(profile) {

    profileButton.style.display =
        "none";

    userProfile.style.display =
        "flex";


    const metadata =
        profile.user_metadata || {};


    const name =
        metadata.username ||
        profile.email ||
        "User";


    userAvatar.textContent =
        name
            .charAt(0)
            .toUpperCase();


    userName.textContent =
        name;

}


async function loadSavedUser() {

    try {

        const {
            data
        } =
            await supabaseClient.auth.getUser();


        if (data?.user) {

            currentUser =
                data.user;

            showUserProfile(
                data.user
            );

            return data.user;

        }

    }

    catch (error) {

        console.error(
            "Ошибка загрузки Supabase-пользователя:",
            error
        );

    }

    return null;
}


/* ============================================================
   AUTH STATE
   ============================================================ */

supabaseClient.auth.onAuthStateChange(
    async function (event, session) {

        if (session?.user) {

            currentUser =
                session.user;

            showUserProfile(
                session.user
            );


            /*
             * После подтверждения email
             * Supabase может вернуть пользователя
             * через SIGNED_IN.
             */

            if (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION"
            ) {

                await loadChatsFromSupabase();

            }

        }

        else {

            currentUser = null;

            chats = [];

            currentChatId = null;

            conversation = [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                }
            ];


            chat.innerHTML = "";

            chatList.innerHTML = "";


            profileButton.style.display =
                "inline-block";

            userProfile.style.display =
                "none";

            userAvatar.textContent =
                "S";

            userName.textContent =
                "";

        }

    }
);


/* ============================================================
   LOGOUT
   ============================================================ */

logoutButton.addEventListener(
    "click",
    async function () {

        try {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(error);
                return;

            }


            currentUser = null;

            chats = [];

            currentChatId = null;

            chat.innerHTML = "";

            chatList.innerHTML = "";


            conversation = [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                }
            ];


            profileButton.style.display =
                "inline-block";

            userProfile.style.display =
                "none";

            userAvatar.textContent =
                "S";

            userName.textContent =
                "";

        }

        catch (error) {

            console.error(
                "Ошибка выхода:",
                error
            );

        }

    }
);


/* ============================================================
   SUPABASE CHAT DATABASE
   ============================================================ */


/*
 * Получаем текущего авторизованного пользователя.
 */

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Ошибка получения пользователя:",
            error
        );

        return null;

    }


    return data?.user || null;

}


/*
 * Загружаем все чаты ТОЛЬКО текущего пользователя.
 */

async function loadChatsFromSupabase() {

    const user =
        await getCurrentUser();


    if (!user) {

        chats = [];
        currentChatId = null;

        chat.innerHTML = "";
        chatList.innerHTML = "";

        return;

    }


    currentUser =
        user;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(CHATS_TABLE)
                .select("*")
                .eq("user_id", user.id)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Ошибка загрузки чатов:",
                error
            );

            return;

        }


        chats =
            data || [];


        /*
         * Если чатов нет — создаём первый.
         */

        if (chats.length === 0) {

            await startNewChat();

            return;

        }


        currentChatId =
            chats[0].id;


        await switchChat(
            currentChatId
        );

        renderChatList();

    }

    catch (error) {

        console.error(
            "Ошибка загрузки чатов:",
            error
        );

    }

}


/*
 * Создаём новый чат в Supabase.
 */

async function startNewChat() {

    const user =
        await getCurrentUser();


    if (!user) {

        openAuth("login");
        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(CHATS_TABLE)
                .insert({

                    user_id:
                        user.id,

                    title:
                        "Новый чат"

                })
                .select()
                .single();


        if (error) {

            console.error(
                "Ошибка создания чата:",
                error
            );

            alert(
                "Не удалось создать чат. Проверь RLS для таблицы chats."
            );

            return;

        }


        chats.unshift(
            data
        );


        currentChatId =
            data.id;


        chat.innerHTML = "";

        conversation = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            }
        ];


        renderChatList();

    }

    catch (error) {

        console.error(
            "Ошибка создания чата:",
            error
        );

    }

}


/*
 * Список чатов.
 */

function renderChatList() {

    chatList.innerHTML = "";


    chats.forEach(
        function (chatItem) {

            const chatContainer =
                document.createElement(
                    "div"
                );


            chatContainer.style.display =
                "flex";

            chatContainer.style.justifyContent =
                "space-between";

            chatContainer.style.alignItems =
                "center";

            chatContainer.style.padding =
                "10px";

            chatContainer.style.margin =
                "5px 0";

            chatContainer.style.border =
                "1px solid #000000";

            chatContainer.style.borderRadius =
                "7px";

            chatContainer.style.cursor =
                "pointer";


            const chatTitle =
                document.createElement(
                    "span"
                );


            chatTitle.textContent =
                chatItem.title ||
                "Новый чат";


            chatTitle.onclick =
                async function () {

                    await switchChat(
                        chatItem.id
                    );

                    chatHistory.style.display =
                        "none";

                };


            const deleteBtn =
                document.createElement(
                    "span"
                );


            deleteBtn.textContent =
                "✕";

            deleteBtn.style.fontWeight =
                "bold";

            deleteBtn.style.marginLeft =
                "10px";

            deleteBtn.style.cursor =
                "pointer";


            deleteBtn.onclick =
                async function (event) {

                    event.stopPropagation();

                    await deleteChat(
                        chatItem.id
                    );

                };


            chatContainer.appendChild(
                chatTitle
            );

            chatContainer.appendChild(
                deleteBtn
            );

            chatList.appendChild(
                chatContainer
            );

        }
    );

}


/*
 * Открываем конкретный чат и загружаем его сообщения.
 */

async function switchChat(id) {

    const selectedChat =
        chats.find(
            function (c) {

                return c.id === id;

            }
        );


    if (!selectedChat) {
        return;
    }


    currentChatId =
        selectedChat.id;


    chat.innerHTML = "";


    conversation = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        }
    ];


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(MESSAGES_TABLE)
                .select("*")
                .eq(
                    "chat_id",
                    selectedChat.id
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Ошибка загрузки сообщений:",
                error
            );

            return;

        }


        (data || []).forEach(
            function (msg) {

                const type =
                    msg.role === "user"
                        ? "user"
                        : "ai";


                const text =
                    msg.content || "";


                addMessage(
                    text,
                    type
                );


                conversation.push({

                    role:
                        msg.role === "assistant"
                            ? "assistant"
                            : msg.role,

                    content:
                        text

                });

            }
        );


        renderChatList();

    }

    catch (error) {

        console.error(
            "Ошибка открытия чата:",
            error
        );

    }

}


/*
 * Обновляем название чата.
 */

async function updateChatTitle(
    chatId,
    title
) {

    const {
        error
    } =
        await supabaseClient
            .from(CHATS_TABLE)
            .update({
                title: title
            })
            .eq(
                "id",
                chatId
            );


    if (error) {

        console.error(
            "Ошибка обновления названия чата:",
            error
        );

    }

}


/*
 * Удаляем сообщения чата, затем сам чат.
 */

async function deleteChat(chatId) {

    try {

        const {
            error:
                messagesError
        } =
            await supabaseClient
                .from(MESSAGES_TABLE)
                .delete()
                .eq(
                    "chat_id",
                    chatId
                );


        if (messagesError) {

            console.error(
                "Ошибка удаления сообщений:",
                messagesError
            );

            return;

        }


        const {
            error:
                chatError
        } =
            await supabaseClient
                .from(CHATS_TABLE)
                .delete()
                .eq(
                    "id",
                    chatId
                );


        if (chatError) {

            console.error(
                "Ошибка удаления чата:",
                chatError
            );

            return;

        }


        chats =
            chats.filter(
                function (c) {

                    return c.id !== chatId;

                }
            );


        if (currentChatId === chatId) {

            if (chats.length > 0) {

                currentChatId =
                    chats[0].id;

                await switchChat(
                    currentChatId
                );

            }

            else {

                currentChatId = null;

                chat.innerHTML = "";

                await startNewChat();

            }

        }


        renderChatList();

    }

    catch (error) {

        console.error(
            "Ошибка удаления чата:",
            error
        );

    }

}


/* ============================================================
   HISTORY UI
   ============================================================ */

profileChatButton.addEventListener(
    "click",
    function () {

        chatHistory.style.display =
            "flex";

    }
);


closeChatHistory.addEventListener(
    "click",
    function () {

        chatHistory.style.display =
            "none";

    }
);

newChatButton.addEventListener(
    "click",
    async function () {

        if (!currentUser) {

            openAuth("login");
            return;

        }


        await startNewChat();

        chatHistory.style.display =
            "none";

    }
);


/* ============================================================
   MESSAGES
   ============================================================ */

function addMessage(
    text,
    type
) {

    const message =
        document.createElement(
            "div"
        );


    message.classList.add(
        "message"
    );


    if (type === "user") {

        message.classList.add(
            "user-message"
        );

    }

    else {

        message.classList.add(
            "ai-message"
        );

    }


    if (type === "ai") {

        const cleanText =
            String(text)
                .replace(
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

    }

    else {

        message.textContent =
            text;

    }


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;


    return message;

}


/* ============================================================
   THINKING ANIMATION
   ============================================================ */

function createThinkingAnimation() {

    const message =
        document.createElement(
            "div"
        );


    message.classList.add(
        "message",
        "ai-message"
    );


    message.innerHTML =
        '<span class="thinking-dot">●</span> ' +
        '<span class="thinking-dot">●</span> ' +
        '<span class="thinking-dot">●</span>';


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;


    return message;

}


/* ============================================================
   SAVE MESSAGE TO SUPABASE
   ============================================================ */

async function saveMessageToSupabase(
    chatId,
    role,
    content
) {

    const user =
        await getCurrentUser();


    if (!user) {

        console.error(
            "Нет авторизованного пользователя."
        );

        return null;

    }


    /*
     * Проверяем, что чат действительно принадлежит
     * текущему пользователю.
     */

    const {
        data:
            chatOwner,
        error:
            ownerError
    } =
        await supabaseClient
            .from(CHATS_TABLE)
            .select("id")
            .eq(
                "id",
                chatId
            )
            .eq(
                "user_id",
                user.id
            )
            .single();


    if (ownerError || !chatOwner) {

        console.error(
            "Чат не принадлежит текущему пользователю."
        );

        return null;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(MESSAGES_TABLE)
            .insert({

                chat_id:
                    chatId,

                role:
                    role,

                content:
                    content

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Ошибка сохранения сообщения:",
            error
        );

        return null;

    }


    return data;

}


/* ============================================================
   AI
   ============================================================ */

async function sendMessage() {

    try {

        const text =
            messageInput.value.trim();


        if (text === "") {
            return;
        }


        if (!currentUser) {

            addMessage(
                "Сначала войдите в аккаунт.",
                "ai"
            );

            openAuth("login");

            return;

        }


        if (!currentChatId) {

            await startNewChat();

        }


        const chatId =
            currentChatId;


        const currentChat =
            chats.find(
                function (c) {

                    return c.id === chatId;

                }
            );


        if (currentChat) {

            if (
                currentChat.title ===
                "Новый чат"
            ) {

                const newTitle =
                    text.length > 20
                        ? text.substring(
                            0,
                            20
                        ) + "..."
                        : text;


                currentChat.title =
                    newTitle;


                await updateChatTitle(
                    chatId,
                    newTitle
                );

            }

        }


        addMessage(
            text,
            "user"
        );


        messageInput.value =
            "";

        sendButton.disabled =
            true;


        /*
         * Сначала сохраняем сообщение пользователя.
         */

        await saveMessageToSupabase(
            chatId,
            "user",
            text
        );


        const thinkingMessage =
            createThinkingAnimation();


        conversation.push({

            role:
                "user",

            content:
                text

        });


        /*
         * Запрос к AI.
         */

        const { data, error } =
    await supabaseClient.functions.invoke("chat", {
        body: {
            messages: conversation
        }
    });

if (error) {
    thinkingMessage.remove();

    addMessage(
        "Ошибка AI: " + error.message,
        "ai"
    );

    console.error(error);

    return;
}

thinkingMessage.remove();

        const answer =
            data
                .choices?.[0]
                ?.message?.content;


        if (!answer) {

            addMessage(
                "AI не вернул ответ.",
                "ai"
            );

            console.log(data);

            return;

        }


        addMessage(
            answer,
            "ai"
        );


        conversation.push({

            role:
                "assistant",

            content:
                answer

        });


        /*
         * Сохраняем ответ AI.
         */

        await saveMessageToSupabase(
            chatId,
            "assistant",
            answer
        );


    }

    catch (error) {

        addMessage(
            "Ошибка JavaScript: " +
            error.message,
            "ai"
        );


        console.error(error);

    }

    finally {

        sendButton.disabled =
            false;

    }

}


/* ============================================================
   SEND / ENTER
   ============================================================ */

sendButton.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


/* ============================================================
   START
   ============================================================ */

async function initApp() {

    try {

        const user =
            await loadSavedUser();


        if (!user) {

            /*
             * Гость не получает чаты.
             * Можно оставить пустой экран.
             */

            chats = [];

            currentChatId = null;

            chat.innerHTML = "";

            chatList.innerHTML = "";

            return;

        }


        await loadChatsFromSupabase();

    }

    catch (error) {

        console.error(
            "Ошибка запуска приложения:",
            error
        );

    }

}


initApp();
