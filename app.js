// Dados iniciais
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || {};
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let mensagensFixadas = JSON.parse(localStorage.getItem("mensagensFixadas")) || {};

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

// Listar Lojas Próximas
function listarLojas() {
    const lojaSelect = document.getElementById("lojaEscolhida");
    if (!lojaSelect) return;

    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const lojistas = usuarios.filter(u => u.tipoUsuario === "lojista");
    lojaSelect.innerHTML = "<option value=''>Selecione uma loja</option>";

    lojistas.forEach(lojista => {
        if (Math.abs(parseInt(lojista.cep.replace("-", "")) - parseInt(usuarioAtual.cep.replace("-", ""))) < 10000) {
            lojaSelect.innerHTML += `<option value="${lojista.nome}">${lojista.nome}</option>`;
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
                <p>${produto.descricao}</p>
                <p>Preço: R$ ${produto.preco}</p>
                <button onclick="adicionarCarrinho(${produto.id})">Adicionar ao Carrinho</button>
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
        carrinho.push(produto);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        exibirCarrinho();
    }
}

function removerCarrinho(index) {
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    exibirCarrinho();
}

function exibirCarrinho() {
    const carrinhoDiv = document.getElementById("carrinho");
    if (!carrinhoDiv) return;

    carrinhoDiv.innerHTML = "";
    carrinho.forEach((produto, index) => {
        carrinhoDiv.innerHTML += `
            <div class="produto-carrinho">
                <h4>${produto.nome}</h4>
                <p>Preço: R$ ${produto.preco}</p>
                <button class="remover-btn" onclick="removerCarrinho(${index})">Remover</button>
            </div>
        `;
    });
    const total = carrinho.reduce((acc, p) => acc + parseFloat(p.preco), 0);
    carrinhoDiv.innerHTML += `<h3>Total: R$ ${total.toFixed(2)}</h3>`;
}

// Finalizar Compra
function realizarCheckout() {
    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedido = { id: Date.now(), cliente: usuario.nome, loja: lojaAtual, itens: [...carrinho], total: carrinho.reduce((acc, p) => acc + parseFloat(p.preco), 0) };
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    carrinho = [];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert("Compra finalizada! Use o chat para ajustar os detalhes com o lojista.");
    exibirCarrinho();
}

// Chat
function exibirChat() {
    const chat = document.getElementById("chat");
    if (!chat || !lojaAtual) return;

    chat.innerHTML = mensagensFixadas[lojaAtual] ? `<div class="mensagem-fixada">${mensagensFixadas[lojaAtual]}</div>` : "";
}

document.getElementById("enviarMensagem")?.addEventListener("click", function() {
    const mensagem = document.getElementById("mensagemInput").value;
    if (mensagem && lojaAtual) {
        const chat = document.getElementById("chat");
        chat.innerHTML += `<div class="mensagem-cliente">${mensagem}</div>`;
        chat.scrollTop = chat.scrollHeight;
        document.getElementById("mensagemInput").value = "";
    }
});

document.getElementById("enviarAudio")?.addEventListener("click", function() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.start();

            setTimeout(() => {
                recorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 3000);

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                const audioURL = URL.createObjectURL(blob);
                const chat = document.getElementById("chat");
                chat.innerHTML += `<div class="mensagem-cliente"><audio controls src="${audioURL}"></audio></div>`;
                chat.scrollTop = chat.scrollHeight;
            };
        })
        .catch(err => alert("Erro ao gravar áudio: " + err));
});

// Adicionar Produto ao Estoque
document.getElementById("produtoForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const nome = document.getElementById("nomeProduto").value;
    const descricao = document.getElementById("descricao").value;
    const preco = document.getElementById("preco").value;
    const quantidade = document.getElementById("quantidade").value;

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

// Exibir Pedidos
function exibirPedidos() {
    const pedidosDiv = document.getElementById("pedidos");
    if (!pedidosDiv) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const pedidosLoja = pedidos.filter(p => p.loja === usuario.nome);
    pedidosDiv.innerHTML = "";
    pedidosLoja.forEach(pedido => {
        pedidosDiv.innerHTML += `
            <div class="produto">
                <h3>Pedido #${pedido.id}</h3>
                <p>Cliente: ${pedido.cliente}</p>
                <p>Total: R$ ${pedido.total.toFixed(2)}</p>
            </div>
        `;
    });
}

// Salvar Mensagem Fixada
function salvarMensagemFixada() {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const mensagem = document.getElementById("mensagemFixada").value;
    if (mensagem) {
        mensagensFixadas[usuario.nome] = mensagem;
        localStorage.setItem("mensagensFixadas", JSON.stringify(mensagensFixadas));
        alert("Mensagem fixada salva!");
    }
}

// Inicializar páginas
document.addEventListener("DOMContentLoaded", function() {
    listarLojas();
    exibirCatalogo();
    exibirCarrinho();
    exibirChat();
    exibirEstoque();
    exibirPedidos();
});
