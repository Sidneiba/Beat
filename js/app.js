function logout() {
    localStorage.removeItem("usuarioAtual");
    window.location.href = "login.html";
}

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

document.getElementById("cadastroForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value;
    const tipoUsuario = document.getElementById("tipoUsuario").value;

    if (usuarios.some(u => u.nome.toLowerCase() === nome.toLowerCase())) {
        alert("Nome de usuário já existe!");
        return;
    }
    if (!cep.match(/^[0-9]{5}-[0-9]{3}$/)) {
        alert("CEP inválido! Use o formato 12345-678.");
        return;
    }
    if (telefone.length < 10) {
        alert("Telefone inválido! Inclua o DDD.");
        return;
    }
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    const usuario = { nome, endereco, cep, telefone, senha, tipoUsuario };
    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioAtual", JSON.stringify(usuario));
    alert("Cadastro realizado com sucesso!");
    window.location.href = tipoUsuario === "cliente" ? "client.html" : "stock.html";
});

document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("loginNome").value.trim();
    const senha = document.getElementById("loginSenha").value;

    const usuario = usuarios.find(u => u.nome.toLowerCase() === nome.toLowerCase() && u.senha === senha);
    if (usuario) {
        localStorage.setItem("usuarioAtual", JSON.stringify(usuario));
        alert("Login realizado com sucesso!");
        window.location.href = "index.html";
    } else {
        alert("Nome ou senha incorretos.");
    }
});

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

document.getElementById("produtoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigoProduto").value.trim();
    if (produtos.some(p => p.codigo === codigo)) {
        alert("Código já existe! Escolha outro.");
        return;
    }
    const produto = {
        id: Date.now(),
        nome: document.getElementById("nomeProduto").value.trim(),
        tipo: document.getElementById("tipoProduto").value.trim(),
        unidade: document.getElementById("unidadeProduto").value.trim(),
        marca: document.getElementById("marcaProduto").value.trim(),
        codigo: codigo,
        quantidade: parseInt(document.getElementById("quantidadeProduto").value),
        preco: parseFloat(document.getElementById("precoProduto").value),
    };
    produtos.push(produto);
    salvarDados();
    document.getElementById("produtoForm").reset();
    exibirEstoque();
});

function exibirEstoque() {
    const estoqueDiv = document.getElementById("estoque");
    if (!estoqueDiv) return;
    estoqueDiv.innerHTML = "";
    const total = produtos.reduce((sum, p) => sum + p.quantidade * p.preco, 0);
    const totalDiv = document.createElement("div");
    totalDiv.textContent = `Valor total do estoque: R$${total.toFixed(2)}`;
    totalDiv.style.fontWeight = "bold";
    totalDiv.style.marginBottom = "10px";
    estoqueDiv.appendChild(totalDiv);

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Unidade</th>
                <th>Código</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    produtos.forEach(produto => {
        const row = document.createElement("tr");
        row.className = `estoque-item ${produto.quantidade < 5 ? 'estoque-baixo' : ''}`;
        row.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.tipo}</td>
            <td>${produto.marca}</td>
            <td>${produto.unidade}</td>
            <td>${produto.codigo}</td>
            <td>${produto.quantidade}</td>
            <td>R$${produto.preco.toFixed(2)}</td>
            <td><button class="trash" onclick="removerProduto(${produto.id})"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(row);
    });
    estoqueDiv.appendChild(table);
}

function removerProduto(id) {
    if (confirm("Deseja remover este produto?")) {
        produtos = produtos.filter(p => p.id !== id);
        carrinho = carrinho.filter(item => item.id !== id);
        salvarDados();
        salvarCarrinho();
        exibirEstoque();
        exibirCatalogo();
    }
}

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function exibirCatalogo() {
    const catalogoDiv = document.getElementById("catalogo");
    if (!catalogoDiv) return;
    catalogoDiv.innerHTML = "";
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Unidade</th>
                <th>Código</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    produtos.forEach(produto => {
        if (produto.quantidade > 0) {
            const row = document.createElement("tr");
            row.className = "estoque-item";
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.tipo}</td>
                <td>${produto.marca}</td>
                <td>${produto.unidade}</td>
                <td>${produto.codigo}</td>
                <td>${produto.quantidade}</td>
                <td>R$${produto.preco.toFixed(2)}</td>
                <td><button onclick="adicionarAoCarrinho(${produto.id})"><i class="fas fa-cart-plus"></i> Adicionar</button></td>
            `;
            tbody.appendChild(row);
        }
    });
    catalogoDiv.appendChild(table);
}

function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto || produto.quantidade <= 0) {
        alert("Produto indisponível!");
        return;
    }
    const itemCarrinho = carrinho.find(item => item.id === id);
    if (itemCarrinho) {
        if (itemCarrinho.quantidade >= produto.quantidade) {
            alert("Não há mais estoque disponível!");
            return;
        }
        itemCarrinho.quantidade++;
    } else {
        carrinho.push({ id: id, nome: produto.nome, preco: produto.preco, quantidade: 1 });
    }
    produto.quantidade--;
    salvarCarrinho();
    salvarDados();
    exibirCarrinho();
    exibirCatalogo();
}

function exibirCarrinho() {
    const carrinhoDiv = document.getElementById("carrinho");
    const totalSpan = document.getElementById("totalCarrinho");
    if (!carrinhoDiv || !totalSpan) return;
    carrinhoDiv.innerHTML = "";
    let total = 0;
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Preço Unitário</th>
                <th>Subtotal</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    carrinho.forEach(item => {
        const produto = produtos.find(p => p.id === item.id);
        if (produto) {
            const subtotal = item.quantidade * item.preco;
            total += subtotal;
            const row = document.createElement("tr");
            row.className = "estoque-item";
            row.innerHTML = `
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
                <td>R$${item.preco.toFixed(2)}</td>
                <td>R$${subtotal.toFixed(2)}</td>
                <td><button class="trash" onclick="removerDoCarrinho(${item.id})"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(row);
        }
    });
    carrinhoDiv.appendChild(table);
    totalSpan.textContent = total.toFixed(2);
}

function removerDoCarrinho(id) {
    const itemCarrinho = carrinho.find(item => item.id === id);
    const produto = produtos.find(p => p.id === id);
    if (itemCarrinho && produto) {
        produto.quantidade += itemCarrinho.quantidade;
        carrinho = carrinho.filter(item => item.id !== id);
        salvarCarrinho();
        salvarDados();
        exibirCarrinho();
        exibirCatalogo();
    }
}

function realizarCheckout() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const total = carrinho.reduce((sum, item) => sum + item.quantidade * item.preco, 0);
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || {};
    if (!historico[usuario.nome]) historico[usuario.nome] = [];
    const compra = {
        id: Date.now(),
        itens: [...carrinho],
        total: total,
        data: new Date().toLocaleString(),
        cliente: usuario.nome
    };
    vendas.push(compra);
    historico[usuario.nome].push(compra);
    localStorage.setItem("vendas", JSON.stringify(vendas));
    localStorage.setItem("historicoCompras", JSON.stringify(historico));
    alert(`Compra finalizada! Total: R$${total.toFixed(2)}`);
    carrinho = [];
    salvarCarrinho();
    exibirCarrinho();
    exibirCatalogo();
    exibirHistorico();
}

function exibirHistorico() {
    const historicoDiv = document.getElementById("purchaseHistory");
    if (!historicoDiv) return;
    historicoDiv.innerHTML = "";
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || {};
    if (historico[usuario.nome]) {
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");
        historico[usuario.nome].forEach(compra => {
            const row = document.createElement("tr");
            row.className = "estoque-item";
            let itens = compra.itens.map(item => `${item.nome} (Qtd: ${item.quantidade})`).join(", ");
            row.innerHTML = `
                <td>${compra.data}</td>
                <td>${itens}</td>
                <td>R$${compra.total.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
        historicoDiv.appendChild(table);
    }
}

function confirmarDeletarHistorico() {
    const dialog = document.getElementById("confirmDialog");
    if (dialog) dialog.style.display = "block";
}

function deletarHistorico() {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || {};
    historico[usuario.nome] = [];
    localStorage.setItem("historicoCompras", JSON.stringify(historico));
    exibirHistorico();
    cancelarDeletar();
}

function cancelarDeletar() {
    const dialog = document.getElementById("confirmDialog");
    if (dialog) dialog.style.display = "none";
}

function exibirVendas() {
    const vendasDiv = document.getElementById("vendas");
    if (!vendasDiv) return;
    vendasDiv.innerHTML = "";
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    vendas.forEach(venda => {
        const row = document.createElement("tr");
        row.className = "estoque-item";
        let itens = venda.itens.map(item => `${item.nome} (Qtd: ${item.quantidade})`).join(", ");
        row.innerHTML = `
            <td>${venda.data}</td>
            <td>${venda.cliente}</td>
            <td>${itens}</td>
            <td>R$${venda.total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
    vendasDiv.appendChild(table);
}

function confirmarDeletarVendas() {
    const dialog = document.getElementById("confirmDialog");
    if (dialog) dialog.style.display = "block";
}

function deletarVendas() {
    localStorage.setItem("vendas", JSON.stringify([]));
    exibirVendas();
    cancelarDeletar();
}

let mensagens = JSON.parse(localStorage.getItem("mensagens")) || {};
let mensagensFixadas = JSON.parse(localStorage.getItem("mensagensFixadas")) || {};

function carregarClientesChat() {
    const select = document.getElementById("clienteChat");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    usuarios.filter(u => u.tipoUsuario === "cliente").forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.nome;
        option.textContent = cliente.nome;
        select.appendChild(option);
    });
}

function exibirChat() {
    const chatDiv = document.getElementById("chat");
    const mensagemInput = document.getElementById("mensagemInput");
    const enviarBtn = document.getElementById("enviarMensagem");
    if (!chatDiv || !mensagemInput || !enviarBtn) return;
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const clienteSelecionado = document.getElementById("clienteChat")?.value;
    chatDiv.innerHTML = "";
    let chatId = usuario.tipoUsuario === "cliente" ? `${usuario.nome}-lojista` : `${clienteSelecionado}-lojista`;
    if (mensagensFixadas[usuario.tipoUsuario === "cliente" ? "lojista" : clienteSelecionado]) {
        const fixada = document.createElement("div");
        fixada.className = "mensagem fixada";
        fixada.textContent = `Fixada: ${mensagensFixadas[usuario.tipoUsuario === "cliente" ? "lojista" : clienteSelecionado]}`;
        chatDiv.appendChild(fixada);
    }
    if (mensagens[chatId]) {
        mensagens[chatId].forEach(msg => {
            const div = document.createElement("div");
            div.className = `mensagem ${msg.de === usuario.nome ? 'enviada' : 'recebida'}`;
            div.textContent = `${msg.de}: ${msg.texto}`;
            chatDiv.appendChild(div);
        });
    }
    enviarBtn.onclick = () => {
        const texto = mensagemInput.value.trim();
        if (texto) {
            if (!mensagens[chatId]) mensagens[chatId] = [];
            mensagens[chatId].push({ de: usuario.nome, texto, data: new Date().toLocaleString() });
            localStorage.setItem("mensagens", JSON.stringify(mensagens));
            mensagemInput.value = "";
            exibirChat();
        }
    };
}

function salvarMensagemFixada() {
    const mensagem = document.getElementById("mensagemFixada")?.value;
    if (!mensagem) return;
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    mensagensFixadas[usuario.nome] = mensagem;
    localStorage.setItem("mensagensFixadas", JSON.stringify(mensagensFixadas));
    alert("Mensagem fixada salva!");
}

if (document.getElementById("estoque")) exibirEstoque();
if (document.getElementById("catalogo")) exibirCatalogo();
if (document.getElementById("carrinho")) exibirCarrinho();
if (document.getElementById("purchaseHistory")) exibirHistorico();
if (document.getElementById("vendas")) exibirVendas();
if (document.getElementById("clienteChat")) carregarClientesChat();
if (document.getElementById("chat")) exibirChat();
