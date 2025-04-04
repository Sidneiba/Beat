// Dados iniciais
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || {};
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let mensagensFixadas = JSON.parse(localStorage.getItem("mensagensFixadas")) || {};
let chatHistorico = JSON.parse(localStorage.getItem("chatHistorico")) || {};

// Loja e Cliente de Simulação
const lojaSimulacao = {
    nome: "Loja Simulação",
    endereco: "Rua Teste, 123",
    cep: "12345-000",
    telefone: "11999999999",
    senha: "123",
    tipoUsuario: "lojista"
};

const clienteSimulacao = {
    nome: "Cliente Simulação",
    endereco: "Rua Cliente, 456",
    cep: "12345-111",
    telefone: "11888888888",
    senha: "123",
    tipoUsuario: "cliente"
};

const catalogoSimulacao = [
    { id: 1, nome: "Arroz", tipo: "Branco", volume: "5kg", marca: "Tio João", codigo: "COD101", quantidade: 50, preco: 5.99 },
    { id: 2, nome: "Feijão", tipo: "Preto", volume: "1kg", marca: "Camil", codigo: "COD102", quantidade: 40, preco: 7.50 },
    { id: 3, nome: "Macarrão", tipo: "Espaguete", volume: "500g", marca: "Renata", codigo: "COD103", quantidade: 60, preco: 3.20 },
    { id: 4, nome: "Leite", tipo: "Integral", volume: "1L", marca: "Itambé", codigo: "COD104", quantidade: 30, preco: 4.80 },
    { id: 5, nome: "Coca-Cola", tipo: "Refrigerante", volume: "2L", marca: "Coca-Cola", codigo: "COD105", quantidade: 25, preco: 6.99 }
];

// Inicializar Simulação
function inicializarSimulacao() {
    if (!usuarios.find(u => u.nome === "Loja Simulação")) {
        usuarios.push(lojaSimulacao);
        produtos["Loja Simulação"] = catalogoSimulacao;
    }
    if (!usuarios.find(u => u.nome === "Cliente Simulação")) {
        usuarios.push(clienteSimulacao);
    }
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

// Cadastro
document.getElementById("cadastroForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const endereco = document.getElementById("endereco").value;
    const cep = document.getElementById("cep").value;
    const telefone = document.getElementById("telefone").value;
    const senha = document.getElementById("senha").value;
    const tipoUsuario = document.getElementById("tipoUsuario").value;

    if (!cep.match(/^[0-9]{5}-[0-9]{3}$/)) {
        alert("CEP inválido! Use o formato 00000-000.");
        return;
    }

    const usuario = { nome, endereco, cep, telefone, senha, tipoUsuario };
    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Cadastro realizado com sucesso!");
    window.location.href = tipoUsuario === "cliente" ? "client.html" : "stock.html";
});

// Login
document.getElementById("loginForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const nome = document.getElementById("loginNome").value;
    const senha = document.getElementById("loginSenha").value;

    const usuario = usuarios.find(u => u.nome === nome && u.senha === senha);
    if (usuario) {
        localStorage.setItem("usuarioAtual", JSON.stringify(usuario));
        window.location.href = usuario.tipoUsuario === "cliente" ? "client.html" : "stock.html";
    } else {
        alert("Nome ou senha incorretos.");
    }
});

// Simular Compra como Cliente
function simularCompraCliente() {
    localStorage.setItem("usuarioAtual", JSON.stringify(clienteSimulacao));
    window.location.href = "client.html";
}

// Listar Lojas Próximas
function listarLojas() {
    const lojaSelect = document.getElementById("lojaEscolhida");
    if (!lojaSelect) return;

    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const lojistas = usuarios.filter(u => u.tipoUsuario === "lojista");
    lojaSelect.innerHTML = "<option value=''>Selecione uma loja</option>";

    lojistas.forEach(lojista => {
        const distancia = Math.abs(parseInt(lojista.cep.replace("-", "")) - parseInt(usuarioAtual.cep.replace("-", "")));
        if (distancia < 10000 || lojista.nome === "Loja Simulação") {
            lojaSelect.innerHTML += `<option value="${lojista.nome}">${lojista.nome} (${distancia/1000} km)</option>`;
        }
    });
}

// Selecionar Loja
let lojaAtual = null;
function selecionarLoja() {
    lojaAtual = document.getElementById("lojaEscolhida").value;
    carrinho = [];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    exibirCatalogo();
    exibirCarrinho();
    exibirChat();
    loadClientPurchases();
}

// Catálogo de Produtos
function exibirCatalogo() {
    const catalogo = document.getElementById("catalogo");
    if (!catalogo || !lojaAtual) return;

    catalogo.innerHTML = "";
    const produtosLoja = produtos[lojaAtual] || [];
    produtosLoja.forEach(produto => {
        const produtoHTML = `
            <div class="produto">
                <h3>${produto.nome}</h3>
                <p>Tipo: ${produto.tipo}</p>
                <p>Volume: ${produto.volume}</p>
                <p>Marca: ${produto.marca}</p>
                <p>Preço: R$ ${produto.preco}</p>
                <button onclick="adicionarCarrinho(${produto.id})"><i class="fas fa-plus"></i> Adicionar</button>
            </div>
        `;
        catalogo.innerHTML += produtoHTML;
    });
}

// Carrinho de Compras
function adicionarCarrinho(produtoId) {
    const produtosLoja = produtos[lojaAtual] || [];
    const produto = produtosLoja.find(p => p.id === produtoId);
    if (produto) {
        const itemExistente = carrinho.find(i => i.id === produtoId);
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        exibirCarrinho();
    }
}

function ajustarQuantidade(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    exibirCarrinho();
}

function exibirCarrinho() {
    const carrinhoDiv = document.getElementById("carrinho");
    if (!carrinhoDiv) return;

    carrinhoDiv.innerHTML = "";
    carrinho.forEach((item, index) => {
        carrinhoDiv.innerHTML += `
            <div class="produto-carrinho">
                <div>
                    <h4>${item.nome}</h4>
                    <p>Preço: R$ ${item.preco} x ${item.quantidade} = R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
                </div>
                <div>
                    <button class="ajustar-btn" onclick="ajustarQuantidade(${index}, -1)"><i class="fas fa-minus"></i></button>
                    <span>${item.quantidade}</span>
                    <button class="ajustar-btn" onclick="ajustarQuantidade(${index}, 1)"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        `;
    });
    const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    carrinhoDiv.innerHTML += `<h3>Total: R$ ${total.toFixed(2)}</h3>`;
}

// Finalizar Compra
function realizarCheckout() {
    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedido = {
        id: Date.now(),
        cliente: usuario.nome,
        endereco: usuario.endereco,
        cep: usuario.cep,
        loja: lojaAtual,
        itens: [...carrinho],
        total: carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
        data: new Date().toLocaleString(),
        confirmado: false
    };
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    carrinho = [];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert("Compra finalizada! Use o chat para ajustar os detalhes com o lojista.");
    exibirCarrinho();
    loadClientPurchases();
}

// Histórico de Compras - Cliente
function loadClientPurchases() {
    const historyFrame = document.getElementById("purchaseHistory");
    if (!historyFrame) return;

    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const clientPurchases = pedidos.filter(p => p.cliente === usuarioAtual.nome);
    historyFrame.innerHTML = "<h2>Seu Histórico de Compras</h2>";
    clientPurchases.forEach(p => {
        historyFrame.innerHTML += `
            <div class="history-item" data-id="${p.id}">
                <h3>Pedido #${p.id} - ${p.data}</h3>
                <p>Itens: ${p.itens.map(i => `${i.nome} (${i.quantidade}x R$${i.preco})`).join(", ")}</p>
                <p>Total: R$ ${p.total.toFixed(2)}</p>
            </div>
        `;
    });
    addHistoryListeners(historyFrame);
}

// Histórico de Compras - Lojista (Caixa)
function exibirPedidos() {
    const pedidosFrame = document.getElementById("pedidos");
    if (!pedidosFrame) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedidosLoja = pedidos.filter(p => p.loja === usuario.nome);
    pedidosFrame.innerHTML = "<h2>Pedidos</h2>";
    pedidosLoja.forEach((pedido, index) => {
        pedidosFrame.innerHTML += `
            <div class="history-item" data-id="${pedido.id}">
                <h3>Pedido #${pedido.id} - ${pedido.data}</h3>
                <p>Cliente: ${pedido.cliente}</p>
                <p>Endereço: ${pedido.endereco} (CEP: ${pedido.cep})</p>
                <p>Itens: ${pedido.itens.map(i => `${i.nome} (${i.quantidade}x R$${i.preco})`).join(", ")}</p>
                <p>Total: R$ ${pedido.total.toFixed(2)}</p>
                <p>Status: ${pedido.confirmado ? "Confirmado" : "Pendente"}</p>
                ${!pedido.confirmado ? `<button class="confirmar-btn" onclick="confirmarPedido(${index})"><i class="fas fa-check"></i> Confirmar</button>` : ""}
                <button onclick="openChat('${pedido.cliente}')"><i class="fas fa-comments"></i> Chat</button>
            </div>
        `;
    });
    addHistoryListeners(pedidosFrame);
}

// Adicionar Listeners ao Histórico
function addHistoryListeners(frame) {
    const items = frame.querySelectorAll(".history-item");
    const deleteBtn = document.getElementById("deleteHistoryBtn");
    const confirmDialog = document.getElementById("confirmDialog");
    let selectedId = null;
    let timeoutId = null;

    frame.addEventListener("click", () => {
        frame.classList.toggle("expanded");
    });

    items.forEach(item => {
        item.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            timeoutId = setTimeout(() => {
                if (selectedId === item.dataset.id) {
                    item.classList.remove("selected");
                    selectedId = null;
                    deleteBtn.style.display = "none";
                } else {
                    items.forEach(i => i.classList.remove("selected"));
                    item.classList.add("selected");
                    selectedId = item.dataset.id;
                    deleteBtn.style.display = "block";
                }
            }, 500); // 0,5s
        });

        item.addEventListener("mouseup", () => clearTimeout(timeoutId));
        item.addEventListener("mouseleave", () => clearTimeout(timeoutId));
    });

    deleteBtn?.addEventListener("click", () => {
        confirmDialog.style.display = "block";
    });

    document.getElementById("confirmYes")?.addEventListener("click", () => {
        const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
        if (usuarioAtual.tipoUsuario === "cliente") {
            pedidos = pedidos.filter(p => p.cliente !== usuarioAtual.nome || p.id !== parseInt(selectedId));
        } else {
            pedidos = pedidos.filter(p => p.loja !== usuarioAtual.nome || p.id !== parseInt(selectedId));
        }
        localStorage.setItem("pedidos", JSON.stringify(pedidos));
        confirmDialog.style.display = "none";
        deleteBtn.style.display = "none";
        selectedId = null;
        usuarioAtual.tipoUsuario === "cliente" ? loadClientPurchases() : exibirPedidos();
    });

    document.getElementById("confirmNo")?.addEventListener("click", () => {
        confirmDialog.style.display = "none";
        items.forEach(i => i.classList.remove("selected"));
        deleteBtn.style.display = "none";
        selectedId = null;
    });
}

// Confirmar Pedido
function confirmarPedido(index) {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedidosLoja = pedidos.filter(p => p.loja === usuario.nome);
    pedidosLoja[index].confirmado = true;
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    const chaveChat = `${pedidosLoja[index].cliente}-${usuario.nome}`;
    if (!chatHistorico[chaveChat]) chatHistorico[chaveChat] = [];
    chatHistorico[chaveChat].push({ autor: "lojista", conteudo: "Pedido confirmado!", timestamp: Date.now() });
    localStorage.setItem("chatHistorico", JSON.stringify(chatHistorico));
    exibirPedidos();
    exibirChat();
}

// Chat
function exibirChat() {
    const chatDiv = document.getElementById("chat");
    if (!chatDiv) return;

    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    let chaveChat;
    if (usuarioAtual.tipoUsuario === "cliente") {
        chaveChat = `${usuarioAtual.nome}-${lojaAtual}`;
    } else {
        const clienteSelecionado = document.getElementById("clienteChat")?.value;
        chaveChat = clienteSelecionado ? `${clienteSelecionado}-${usuarioAtual.nome}` : null;
    }

    chatDiv.innerHTML = mensagensFixadas[lojaAtual] ? `<div class="mensagem-fixada">${mensagensFixadas[lojaAtual]}</div>` : "";
    if (chaveChat && chatHistorico[chaveChat]) {
        chatDiv.innerHTML += chatHistorico[chaveChat].map(msg => {
            const classe = msg.autor === "cliente" ? "mensagem-cliente" : "mensagem-lojista";
            return `<div class="${classe}">${msg.conteudo} (${new Date(msg.timestamp).toLocaleTimeString()})</div>`;
        }).join("");
    }
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function enviarMensagem() {
    const mensagemInput = document.getElementById("mensagemInput");
    if (!mensagemInput) return;
    const mensagem = mensagemInput.value.trim();
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!mensagem || !usuarioAtual) return;

    let chaveChat, autor;
    if (usuarioAtual.tipoUsuario === "cliente") {
        chaveChat = `${usuarioAtual.nome}-${lojaAtual}`;
        autor = "cliente";
    } else {
        const clienteSelecionado = document.getElementById("clienteChat")?.value;
        chaveChat = clienteSelecionado ? `${clienteSelecionado}-${usuarioAtual.nome}` : null;
        autor = "lojista";
        if (!podeLojistaEnviar(chaveChat, clienteSelecionado)) {
            alert("Você só pode responder clientes que compraram ou iniciaram contato nas últimas 24h!");
            return;
        }
    }

    if (chaveChat) {
        if (!chatHistorico[chaveChat]) chatHistorico[chaveChat] = [];
        chatHistorico[chaveChat].push({ autor, conteudo: mensagem, timestamp: Date.now() });
        localStorage.setItem("chatHistorico", JSON.stringify(chatHistorico));
        exibirChat();
        mensagemInput.value = "";
    }
}

function openChat(cliente) {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (usuarioAtual.tipoUsuario === "lojista" && !podeLojistaEnviar(`${cliente}-${usuarioAtual.nome}`, cliente)) {
        alert("Você só pode abrir chat com clientes que compraram ou iniciaram contato nas últimas 24h!");
        return;
    }
    document.getElementById("clienteChat").value = cliente;
    exibirChat();
}

function podeLojistaEnviar(chaveChat, cliente) {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const temCompra = pedidos.some(p => p.loja === usuarioAtual.nome && p.cliente === cliente);
    const historico = chatHistorico[chaveChat] || [];
    const ultimaMensagemCliente = historico.filter(m => m.autor === "cliente").pop();
    if (!temCompra && !ultimaMensagemCliente) return false;
    if (ultimaMensagemCliente) {
        const agora = Date.now();
        const limite = 24 * 60 * 60 * 1000; // 24h em milissegundos
        return (agora - ultimaMensagemCliente.timestamp) <= limite;
    }
    return temCompra;
}

function enviarAudio() {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!usuarioAtual || usuarioAtual.tipoUsuario !== "cliente") return;

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.start();
            setTimeout(() => {
                recorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 5000);
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                const audioURL = URL.createObjectURL(blob);
                const chaveChat = `${usuarioAtual.nome}-${lojaAtual}`;
                if (!chatHistorico[chaveChat]) chatHistorico[chaveChat] = [];
                chatHistorico[chaveChat].push({ autor: "cliente", conteudo: `<audio controls src="${audioURL}"></audio>`, timestamp: Date.now() });
                localStorage.setItem("chatHistorico", JSON.stringify(chatHistorico));
                exibirChat();
            };
        })
        .catch(err => alert("Erro ao gravar áudio: " + err));
}

// Configurar Eventos do Chat
document.addEventListener("DOMContentLoaded", function() {
    const enviarMensagemBtn = document.getElementById("enviarMensagem");
    const enviarAudioBtn = document.getElementById("enviarAudio");
    if (enviarMensagemBtn) enviarMensagemBtn.onclick = enviarMensagem;
    if (enviarAudioBtn) enviarAudioBtn.onclick = enviarAudio;
});

// Listar Clientes no Chat do Lojista
function listarClientesChat() {
    const clienteSelect = document.getElementById("clienteChat");
    if (!clienteSelect) return;

    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const clientes = pedidos.filter(p => p.loja === usuario.nome).map(p => p.cliente);
    const clientesUnicos = [...new Set(clientes)];
    clienteSelect.innerHTML = "<option value=''>Selecione um cliente</option>";
    clientesUnicos.forEach(cliente => {
        clienteSelect.innerHTML += `<option value="${cliente}">${cliente}</option>`;
    });
}

// Adicionar Produto ao Estoque
document.getElementById("produtoForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const nome = document.getElementById("nomeProduto").value;
    const tipo = document.getElementById("tipoProduto").value;
    const volume = document.getElementById("volumeProduto").value;
    const marca = document.getElementById("marcaProduto").value;
    const codigo = document.getElementById("codigoProduto").value;
    const quantidade = parseInt(document.getElementById("quantidadeProduto").value);
    const preco = parseFloat(document.getElementById("precoProduto").value);

    if (!produtos[usuario.nome]) produtos[usuario.nome] = [];
    const produto = { id: Date.now(), nome, tipo, volume, marca, codigo, quantidade, preco };
    produtos[usuario.nome].push(produto);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    alert("Produto adicionado!");
    exibirEstoque();
    this.reset();
});

// Exibir Estoque
function exibirEstoque() {
    const estoque = document.getElementById("estoque");
    if (!estoque) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const produtosLoja = produtos[usuario.nome] || [];
    estoque.innerHTML = "<h2>Estoque</h2><div class='estoque-lista'>";
    produtosLoja.forEach(produto => {
        estoque.innerHTML += `
            <div class="estoque-item">
                [${produto.nome}] [${produto.tipo}] [${produto.volume}] [${produto.marca}] [${produto.codigo}] [Qtd ${produto.quantidade}]
                <button class="remover-btn" onclick="removerProduto(${produto.id})"><i class="fas fa-trash"></i> Excluir</button>
            </div>
        `;
    });
    estoque.innerHTML += "</div>";
}

// Remover Produto do Estoque
function removerProduto(produtoId) {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    produtos[usuario.nome] = produtos[usuario.nome].filter(p => p.id !== produtoId);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    exibirEstoque();
}

// Inicializar páginas
document.addEventListener("DOMContentLoaded", function() {
    inicializarSimulacao();
    listarLojas();
    exibirCatalogo();
    exibirCarrinho();
    exibirChat();
    exibirEstoque();
    exibirPedidos();
    listarClientesChat();
    loadClientPurchases();
});
