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
    { id: 1, nome: "Arroz", tipo: "Alimento", preco: 5.99, marca: "Tio João", quantidade: 50, descricao: "Arroz branco 5kg" },
    { id: 2, nome: "Feijão", tipo: "Alimento", preco: 7.50, marca: "Camil", quantidade: 40, descricao: "Feijão preto 1kg" },
    { id: 3, nome: "Macarrão", tipo: "Alimento", preco: 3.20, marca: "Renata", quantidade: 60, descricao: "Espaguete 500g" },
    { id: 4, nome: "Leite", tipo: "Bebida", preco: 4.80, marca: "Itambé", quantidade: 30, descricao: "Leite integral 1L" },
    { id: 5, nome: "Coca-Cola", tipo: "Bebida", preco: 6.99, marca: "Coca-Cola", quantidade: 25, descricao: "Refrigerante 2L" },
    { id: 6, nome: "Sabonete", tipo: "Higiene", preco: 2.10, marca: "Dove", quantidade: 70, descricao: "Sabonete em barra 90g" },
    { id: 7, nome: "Shampoo", tipo: "Higiene", preco: 12.90, marca: "Seda", quantidade: 20, descricao: "Shampoo 325ml" },
    { id: 8, nome: "Detergente", tipo: "Limpeza", preco: 1.99, marca: "Ypê", quantidade: 80, descricao: "Detergente líquido 500ml" },
    { id: 9, nome: "Papel Higiênico", tipo: "Higiene", preco: 8.50, marca: "Neve", quantidade: 35, descricao: "Pacote com 4 rolos" },
    { id: 10, nome: "Biscoito", tipo: "Alimento", preco: 3.50, marca: "Nestlé", quantidade: 45, descricao: "Biscoito recheado 140g" }
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
    loadClientPurchases(); // Carrega histórico do cliente
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
    loadClientPurchases(); // Atualiza histórico do cliente
}

// Histórico de Compras - Cliente
function loadClientPurchases() {
    const historyDiv = document.getElementById("purchaseHistory");
    if (!historyDiv) return;

    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const clientPurchases = pedidos.filter(p => p.cliente === usuarioAtual.nome);
    historyDiv.innerHTML = "<h2>Seu Histórico de Compras</h2>";
    clientPurchases.forEach(p => {
        historyDiv.innerHTML += `
            <div class="produto">
                <h3>Pedido #${p.id} - ${p.data}</h3>
                <p>Itens: ${p.itens.map(i => `${i.nome} (${i.quantidade}x R$${i.preco})`).join(", ")}</p>
                <p>Total: R$ ${p.total.toFixed(2)}</p>
            </div>
        `;
    });
}

// Histórico de Compras - Lojista
function exibirPedidos() {
    const pedidosDiv = document.getElementById("pedidos");
    if (!pedidosDiv) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedidosLoja = pedidos.filter(p => p.loja === usuario.nome);
    pedidosDiv.innerHTML = "";
    pedidosLoja.forEach((pedido, index) => {
        pedidosDiv.innerHTML += `
            <div class="produto">
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
}

// Confirmar Pedido
function confirmarPedido(index) {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedidosLoja = pedidos.filter(p => p.loja === usuario.nome);
    pedidosLoja[index].confirmado = true;
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    const chaveChat = `${pedidosLoja[index].cliente}-${usuario.nome}`;
    if (!chatHistorico[chaveChat]) chatHistorico[chaveChat] = [];
    chatHistorico[chaveChat].push({ autor: "lojista", conteudo: "Pedido confirmado!" });
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
            return `<div class="${classe}">${msg.conteudo}</div>`;
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
    }

    if (chaveChat) {
        if (!chatHistorico[chaveChat]) chatHistorico[chaveChat] = [];
        chatHistorico[chaveChat].push({ autor, conteudo: mensagem });
        localStorage.setItem("chatHistorico", JSON.stringify(chatHistorico));
        exibirChat();
        mensagemInput.value = "";
    }
}

function openChat(cliente) {
    document.getElementById("clienteChat").value = cliente;
    exibirChat();
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
                chatHistorico[chaveChat].push({ autor: "cliente", conteudo: `<audio controls src="${audioURL}"></audio>` });
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
    const clientes = pedidos.filter(p => p.loja === usuarioAtual.nome).map(p => p.cliente);
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
    const descricao = document.getElementById("descricao").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (!produtos[usuario.nome]) produtos[usuario.nome] = [];
    const produto = { id: Date.now(), nome, descricao, preco, quantidade };
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
    estoque.innerHTML = "";
    produtosLoja.forEach(produto => {
        estoque.innerHTML += `
            <div class="produto">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <p>Preço: R$ ${produto.preco}</p>
                <p>Quantidade: ${produto.quantidade}</p>
            </div>
        `;
    });
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
    loadClientPurchases(); // Carrega histórico do cliente ao entrar
});
