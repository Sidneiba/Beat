


let userType = null, username = "", users = JSON.parse(localStorage.getItem("users")) || {};
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let stores = JSON.parse(localStorage.getItem("stores")) || [
    { name: "Loja do Zé", cep: "12345-678", online: true, products: [
        { name: "Arroz 5kg", price: 25.00 },
        { name: "Feijão 1kg", price: 8.50 },
        { name: "Leite 1L", price: 4.20 }
    ]},
    { name: "Mercado da Maria", cep: "12345-679", online: false, products: [
        { name: "Macarrão 500g", price: 3.50 },
        { name: "Óleo 900ml", price: 7.00 }
    ]}
];
let cashEntries = JSON.parse(localStorage.getItem("cashEntries")) || [];
let mediaRecorder, audioChunks = [];

document.addEventListener("DOMContentLoaded", () => {
    const introScreen = document.getElementById("intro-screen");
    if (introScreen) {
        introScreen.classList.add("door-open");
        setTimeout(() => {
            introScreen.style.display = "none";
            document.getElementById("login-container").style.display = "block";
        }, 2000);
    }
    if (document.getElementById("username")) initClientPage();
    if (document.getElementById("messages")) initChatPage();
    if (document.getElementById("cash-table")) updateCashTable();
});

function setUserType(type) {
    userType = type;
    alert(`Selecionado: ${type === "client" ? "Cliente" : "Lojista"}. Agora clique em "Cadastrar"!`);
}

function registerUser() {
    const name = document.getElementById("name-input").value.trim();
    const cep = document.getElementById("cep-input").value.trim();
    const address = document.getElementById("address-input").value.trim();
    const phone = document.getElementById("phone-input").value.trim();
    const password = document.getElementById("password-input").value.trim();

    if (!name || !cep || !address || !phone || !password) {
        alert("Preencha todos os campos!");
        return;
    }

    if (!/^\d{5}-?\d{3}$/.test(cep)) {
        alert("CEP inválido! Use o formato 12345-678.");
        return;
    }

    if (!/^\d{10,11}$/.test(phone)) {
        alert("Telefone inválido! Use 10 ou 11 dígitos (ex.: 11987654321).");
        return;
    }

    if (!userType) {
        alert("Selecione se você é Cliente ou Lojista!");
        return;
    }

    if (users[name]) {
        alert("Esse nome já está cadastrado! Use outro.");
        return;
    }

    users[name] = { type: userType, cep, address, phone, password };
    localStorage.setItem("users", JSON.stringify(users));
    username = name;
    goToMainPage();
}

function loginUser() {
    const name = document.getElementById("login-name").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!name || !password) {
        alert("Preencha nome e senha!");
        return;
    }

    const user = users[name];
    if (!user) {
        alert("Usuário não encontrado!");
        return;
    }

    if (user.password !== password) {
        alert("Senha incorreta!");
        return;
    }

    userType = user.type;
    username = name;
    goToMainPage();
}

function goToMainPage() {
    if (userType === "client") window.location.href = "client.html";
    if (userType === "store") window.location.href = "store.html";
}

function showTab(tab) {
    document.getElementById("login-container").style.display = tab === "login" ? "block" : "none";
    document.getElementById("register-container").style.display = tab === "register" ? "block" : "none";
}

function initClientPage() {
    document.getElementById("username").textContent = username;
    const userCep = users[username].cep.replace(/\D/g, '');
    const storeList = document.getElementById("store-list");
    storeList.innerHTML = "<h3>Lojas Disponíveis</h3>";

    stores.forEach(store => {
        if (store.online && isWithinRange(userCep, store.cep.replace(/\D/g, ''))) {
            const div = document.createElement("div");
            div.className = "store-item";
            div.textContent = store.name;
            div.onclick = () => showCatalog(store);
            storeList.appendChild(div);
        }
    });

    if (localStorage.getItem("paymentConfirmed") === "true") {
        document.getElementById("pay-btn").classList.remove("btn-cancel");
        document.getElementById("pay-btn").classList.add("btn-confirm");
        document.getElementById("pay-btn").textContent = "Finalizar Pagamento";
        document.getElementById("pay-btn").onclick = () => {
            alert("Pagamento finalizado com sucesso!");
            cart = [];
            updateCart();
            localStorage.removeItem("paymentConfirmed");
            document.getElementById("pay-btn").classList.remove("btn-confirm");
            document.getElementById("pay-btn").classList.add("btn-cancel");
            document.getElementById("pay-btn").textContent = "Pagar";
        };
    }
}

function isWithinRange(cep1, cep2) {
    const diff = Math.abs(parseInt(cep1) - parseInt(cep2));
    return diff >= 2000 && diff <= 10000;
}

function showCatalog(store) {
    document.getElementById("store-list").style.display = "none";
    const catalog = document.getElementById("catalog");
    const cartDiv = document.getElementById("cart");
    catalog.style.display = "block";
    cartDiv.style.display = "block";
    document.getElementById("selected-store").textContent = store.name;

    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    store.products.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-item";
        div.textContent = `${product.name} - R$${product.price.toFixed(2)}`;
        div.onclick = () => addToCart(product.name, product.price);
        productList.appendChild(div);
    });
}

function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.textContent = `${item.name} - R$${item.price.toFixed(2)}`;
        div.onclick = () => removeFromCart(index);
        cartItems.appendChild(div);
    });
    document.getElementById("cart-total").textContent = total.toFixed(2);
    document.getElementById("pay-btn").disabled = cart.length === 0;
}

function sendToChat() {
    let cartText = "Meu pedido:\n";
    let total = 0;
    cart.forEach(item => {
        cartText += `${item.name} - R$${item.price.toFixed(2)}\n`;
        total += item.price;
    });
    cartText += `Total: R$${total.toFixed(2)}`;
    localStorage.setItem("cartMessage", cartText);
    window.location.href = "chat.html";
}

function initChatPage() {
    const cartMessage = localStorage.getItem("cartMessage");
    if (cartMessage) {
        addMessage(cartMessage, "user");
        setTimeout(() => {
            addMessage("Compra confirmada! Pode pagar agora.", "bot");
            localStorage.removeItem("cartMessage");
            localStorage.setItem("paymentConfirmed", "true");
        }, 2000);
    }
}

function addMessage(text, sender, isAudio = false, audioUrl = null) {
    const messagesDiv = document.getElementById("messages");
    if (!messagesDiv) return;
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    if (isAudio && audioUrl) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = audioUrl;
        messageDiv.classList.add("audio-message");
        messageDiv.appendChild(audio);
    } else {
        messageDiv.textContent = text;
    }
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const text = document.getElementById("chat-input").value.trim();
    if (text) {
        addMessage(text, "user");
        document.getElementById("chat-input").value = "";
        setTimeout(() => addMessage("Recebido! Como posso ajudar?", "bot"), 1000);
    }
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.onstop = sendAudioMessage;
            mediaRecorder.start();
            document.getElementById("record-btn").disabled = true;
            document.getElementById("stop-btn").disabled = false;
        })
        .catch(err => console.error("Erro ao gravar áudio:", err));
}

function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    document.getElementById("record-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;
}

function sendAudioMessage() {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);
    addMessage("", "user", true, audioUrl);
    setTimeout(() => addMessage("Áudio recebido! Respondendo em breve...", "bot"), 1000);
}

function addCashEntry(type) {
    const desc = document.getElementById("cash-desc").value.trim();
    const amount = parseFloat(document.getElementById("cash-amount").value);
    if (!desc || isNaN(amount) || amount <= 0) {
        alert("Preencha a descrição e um valor válido!");
        return;
    }

    const date = new Date().toLocaleDateString();
    cashEntries.push({ date, desc, entrada: type === "entrada" ? amount : 0, saida: type === "saida" ? amount : 0 });
    localStorage.setItem("cashEntries", JSON.stringify(cashEntries));
    updateCashTable();
    document.getElementById("cash-desc").value = "";
    document.getElementById("cash-amount").value = "";
}

function updateCashTable() {
    const tbody = document.getElementById("cash-body");
    tbody.innerHTML = "";
    let balance = 0;

    cashEntries.forEach(entry => {
        balance += entry.entrada - entry.saida;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.desc}</td>
            <td>${entry.entrada > 0 ? "R$" + entry.entrada.toFixed(2) : "-"}</td>
            <td>${entry.saida > 0 ? "R$" + entry.saida.toFixed(2) : "-"}</td>
            <td class="${balance < 0 ? 'negative' : ''}">R$${balance.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("cash-balance").textContent = `R$${balance.toFixed(2)}`;
}
