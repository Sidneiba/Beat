function logout() {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (usuario && usuario.tipoUsuario === "lojista") {
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        usuarios = usuarios.map(u => u.id === usuario.id ? { ...u, online: false, geoAtiva: false } : u);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
    localStorage.removeItem("usuarioAtual");
    localStorage.removeItem("lojistaSelecionado");
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
        alert("Nome de usuário já existe! Escolha outro.");
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

    const usuario = {
        id: Date.now(),
        nome,
        endereco,
        cep,
        telefone,
        senha,
        tipoUsuario,
        online: tipoUsuario === "lojista" ? false : null,
        geoAtiva: false,
        bloqueados: []
    };
    geocoderEndereco(endereco + ", Brasil", (coords) => {
        if (coords) {
            usuario.lat = coords.lat;
            usuario.lon = coords.lon;
            usuarios.push(usuario);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuario, online: tipoUsuario === "lojista" ? true : null }));
            if (usuario.tipoUsuario === "lojista") {
                usuarios = usuarios.map(u => u.id === usuario.id ? { ...u, online: true } : u);
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
            }
            alert("Cadastro realizado com sucesso!");
            window.location.href = tipoUsuario === "cliente" ? "client.html" : "caixa.html";
        } else {
            alert("Erro ao geocodificar endereço. Tente novamente.");
        }
    });
});

document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("loginNome").value.trim();
    const senha = document.getElementById("loginSenha").value;

    const usuario = usuarios.find(u => u.nome.toLowerCase() === nome.toLowerCase() && u.senha === senha);
    if (usuario) {
        localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuario, online: usuario.tipoUsuario === "lojista" ? true : null }));
        if (usuario.tipoUsuario === "lojista") {
            usuarios = usuarios.map(u => u.id === usuario.id ? { ...u, online: true } : u);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
        }
        alert("Login realizado com sucesso!");
        window.location.href = usuario.tipoUsuario === "cliente" ? "client.html" : "caixa.html";
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
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (produtos.some(p => p.codigo === codigo && p.lojistaId === usuarioAtual.id)) {
        alert("Código já existe para esta loja! Escolha outro.");
        return;
    }
    const produto = {
        id: Date.now(),
        lojistaId: usuarioAtual.id,
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
    exibirCatalogo();
});

function exibirEstoque() {
    const estoqueDiv = document.getElementById("estoque");
    if (!estoqueDiv) return;
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    estoqueDiv.innerHTML = "";
    const produtosLojista = produtos.filter(p => p.lojistaId === usuarioAtual.id);
    const total = produtosLojista.reduce((sum, p) => sum + p.quantidade * p.preco, 0);
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
    produtosLojista.forEach(produto => {
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

function exibirCatalogo() {
    const catalogoDiv = document.getElementById("catalogo");
    if (!catalogoDiv) return;
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    const lojistaSelecionado = JSON.parse(localStorage.getItem("lojistaSelecionado"));
    catalogoDiv.innerHTML = "";
    const isEstoque = window.location.pathname.includes("stock.html");
    let produtosExibir = produtos;

    if (usuarioAtual.tipoUsuario === "cliente" && lojistaSelecionado) {
        produtosExibir = produtos.filter(p => p.lojistaId === lojistaSelecionado.id);
    } else if (usuarioAtual.tipoUsuario === "lojista") {
        produtosExibir = produtos.filter(p => p.lojistaId === usuarioAtual.id);
    }

    if (produtosExibir.length === 0 && usuarioAtual.tipoUsuario === "cliente") {
        catalogoDiv.innerHTML = "<p>Nenhum produto disponível para esta loja.</p>";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = isEstoque ? `
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
    ` : `
        <thead>
            <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    produtosExibir.forEach(produto => {
        if (produto.quantidade > 0 || isEstoque) {
            const row = document.createElement("tr");
            row.className = "estoque-item";
            if (isEstoque) {
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
            } else {
                row.innerHTML = `
                    <td>${produto.nome} ${produto.marca} ${produto.unidade}</td>
                    <td>R$${produto.preco.toFixed(2)}</td>
                    <td><button onclick="adicionarAoCarrinho(${produto.id})"><i class="fas fa-cart-plus"></i> Adicionar</button></td>
                `;
            }
            tbody.appendChild(row);
        }
    });
    catalogoDiv.appendChild(table);
}

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
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
        carrinho.push({ id: id, nome: `${produto.nome} ${produto.marca} ${produto.unidade}`, preco: produto.preco, quantidade: 1 });
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
                <th>Produto</th>
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
    const lojistaSelecionado = JSON.parse(localStorage.getItem("lojistaSelecionado"));
    const total = carrinho.reduce((sum, item) => sum + item.quantidade * item.preco, 0);
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    let vendasPendentes = JSON.parse(localStorage.getItem("vendasPendentes")) || [];
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || {};
    if (!historico[usuario.nome]) historico[usuario.nome] = [];
    const compra = {
        id: Date.now(),
        itens: [...carrinho],
        total: total,
        data: new Date().toLocaleString(),
        cliente: usuario.nome,
        lojistaId: lojistaSelecionado.id,
        confirmada: false
    };
    const lojistaOnline = usuarios.some(u => u.id === lojistaSelecionado.id && u.online);
    if (lojistaOnline) {
        vendas.push(compra);
        compra.confirmada = true;
    } else {
        vendasPendentes.push(compra);
    }
    historico[usuario.nome].push(compra);
    localStorage.setItem("vendas", JSON.stringify(vendas));
    localStorage.setItem("vendasPendentes", JSON.stringify(vendasPendentes));
    localStorage.setItem("historicoCompras", JSON.stringify(historico));
    alert(`Compra ${lojistaOnline ? "finalizada" : "enviada como encomenda"}! Total: R$${total.toFixed(2)}`);
    carrinho = [];
    salvarCarrinho();
    exibirCarrinho();
    exibirCatalogo();
    exibirVendasPendentes();
}

let fluxoCaixa = JSON.parse(localStorage.getItem("fluxoCaixa")) || [];

function salvarFluxoCaixa() {
    localStorage.setItem("fluxoCaixa", JSON.stringify(fluxoCaixa));
}

document.getElementById("movimentoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipo = document.getElementById("tipoMovimento").value;
    const valor = parseFloat(document.getElementById("valorMovimento").value);
    const descricao = document.getElementById("descricaoMovimento").value.trim();
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    fluxoCaixa.push({
        id: Date.now(),
        lojistaId: usuarioAtual.id,
        tipo,
        valor,
        descricao,
        data: new Date().toLocaleString()
    });
    salvarFluxoCaixa();
    document.getElementById("movimentoForm").reset();
    exibirFluxoCaixa();
});

function exibirFluxoCaixa() {
    const fluxoDiv = document.getElementById("fluxoCaixa");
    if (!fluxoDiv) return;
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    fluxoDiv.innerHTML = "";
    const fluxoLojista = fluxoCaixa.filter(f => f.lojistaId === usuarioAtual.id);
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Descrição</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    fluxoLojista.forEach(mov => {
        const row = document.createElement("tr");
        row.className = "estoque-item";
        row.innerHTML = `
            <td>${mov.data}</td>
            <td>${mov.tipo === "entrada" ? "Entrada" : "Saída"}</td>
            <td>R$${mov.valor.toFixed(2)}</td>
            <td>${mov.descricao}</td>
        `;
        tbody.appendChild(row);
    });
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendas.filter(v => v.lojistaId === usuarioAtual.id).forEach(venda => {
        const row = document.createElement("tr");
        row.className = "estoque-item";
        let itens = venda.itens.map(item => `${item.nome} (Qtd: ${item.quantidade})`).join(", ");
        row.innerHTML = `
            <td>${venda.data}</td>
            <td>Venda</td>
            <td>R$${venda.total.toFixed(2)}</td>
            <td>Venda para ${venda.cliente}: ${itens}</td>
        `;
        tbody.appendChild(row);
    });
    fluxoDiv.appendChild(table);
}

function exibirVendasPendentes() {
    const vendasDiv = document.getElementById("vendasPendentes");
    if (!vendasDiv) return;
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    vendasDiv.innerHTML = "";
    let vendasPendentes = JSON.parse(localStorage.getItem("vendasPendentes")) || [];
    vendasPendentes = vendasPendentes.filter(v => v.lojistaId === usuarioAtual.id);
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    vendasPendentes.forEach(venda => {
        const row = document.createElement("tr");
        row.className = "estoque-item";
        let itens = venda.itens.map(item => `${item.nome} (Qtd: ${item.quantidade})`).join(", ");
        row.innerHTML = `
            <td>${venda.data}</td>
            <td>${venda.cliente}</td>
            <td>${itens}</td>
            <td>R$${venda.total.toFixed(2)}</td>
            <td><button onclick="confirmarVenda(${venda.id})">Confirmar</button></td>
        `;
        tbody.appendChild(row);
    });
    vendasDiv.appendChild(table);
}

function confirmarVenda(id) {
    let vendasPendentes = JSON.parse(localStorage.getItem("vendasPendentes")) || [];
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || {};
    const venda = vendasPendentes.find(v => v.id === id);
    if (venda) {
        venda.confirmada = true;
        vendas.push(venda);
        vendasPendentes = vendasPendentes.filter(v => v.id !== id);
        historico[venda.cliente] = historico[venda.cliente].map(compra =>
            compra.id === id ? { ...compra, confirmada: true } : compra
        );
        localStorage.setItem("vendas", JSON.stringify(vendas));
        localStorage.setItem("vendasPendentes", JSON.stringify(vendasPendentes));
        localStorage.setItem("historicoCompras", JSON.stringify(historico));
        alert("Venda confirmada!");
        exibirVendasPendentes();
        exibirFluxoCaixa();
    }
}

let mensagens = JSON.parse(localStorage.getItem("mensagens")) || {};

function carregarClientesChat() {
    const select = document.getElementById("clienteChat");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    usuarios.filter(u => u.tipoUsuario === "cliente" && !usuarioAtual.bloqueados.includes(u.id)).forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.nome;
        option.textContent = cliente.nome;
        select.appendChild(option);
    });
}

function exibirLojistas() {
    const select = document.getElementById("lojistaSelect");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um lojista</option>';
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || {};
    let mensagensEnviadas = mensagens[`${usuarioAtual.nome}-lojista`] || [];
    let lojistas = usuarios.filter(u => u.tipoUsuario === "lojista" && !usuarioAtual.bloqueados.includes(u.id));
    let favoritos = [];
    let proximos = [];
    let outros = [];

    lojistas.forEach(lojista => {
        const comprou = historico[usuarioAtual.nome]?.some(compra => compra.lojistaId === lojista.id);
        const conversou = mensagensEnviadas.some(msg => msg.para === lojista.nome);
        const distancia = usuarioAtual.lat && lojista.lat ? calcularDistancia(
            usuarioAtual.lat, usuarioAtual.lon,
            lojista.lat, lojista.lon
        ) : Infinity;

        if (comprou || conversou) {
            favoritos.push({ ...lojista, distancia });
        } else if (distancia <= 5) {
            proximos.push({ ...lojista, distancia });
        } else {
            outros.push({ ...lojista, distancia });
        }
    });

    favoritos.sort((a, b) => a.nome.localeCompare(b.nome));
    proximos.sort((a, b) => a.distancia - b.distancia);
    outros.sort((a, b) => a.nome.localeCompare(b.nome));

    const todos = [...favoritos, ...proximos, ...outros];
    todos.forEach(lojista => {
        const option = document.createElement("option");
        option.value = lojista.id;
        option.textContent = `${lojista.nome}${favoritos.includes(lojista) ? ' (Favorito)' : ''}`;
        select.appendChild(option);
    });
}

function selecionarLojista(id) {
    const lojista = usuarios.find(u => u.id === parseInt(id));
    if (lojista) {
        localStorage.setItem("lojistaSelecionado", JSON.stringify(lojista));
        exibirCatalogo();
        exibirChat();
    }
}

function bloquearUsuario(id) {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    usuarios = usuarios.map(u => u.id === usuarioAtual.id ? { ...u, bloqueados: [...u.bloqueados, id] } : u);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuarioAtual, bloqueados: [...usuarioAtual.bloqueados, id] }));
    exibirLojistas();
    exibirClientesGeo();
    exibirChat();
}

function desbloquearUsuario(id) {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    usuarios = usuarios.map(u => u.id === usuarioAtual.id ? { ...u, bloqueados: u.bloqueados.filter(b => b !== id) } : u);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuarioAtual, bloqueados: usuarioAtual.bloqueados.filter(b => b !== id) }));
    exibirLojistas();
    exibirClientesGeo();
    exibirChat();
}

function exibirChat() {
    const chatDiv = document.getElementById("chat");
    const mensagemInput = document.getElementById("mensagemInput");
    const enviarBtn = document.getElementById("enviarMensagem");
    if (!chatDiv || !mensagemInput || !enviarBtn) return;
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
    const lojistaSelecionado = JSON.parse(localStorage.getItem("lojistaSelecionado"));
    const clienteSelecionado = document.getElementById("clienteChat")?.value;
    chatDiv.innerHTML = "";
    let chatId, parceiro;
    if (usuario.tipoUsuario === "cliente") {
        if (!lojistaSelecionado) return;
        chatId = `${usuario.nome}-lojista`;
        parceiro = lojistaSelecionado.nome;
    } else {
        if (!clienteSelecionado) return;
        chatId = `${clienteSelecionado}-lojista`;
        parceiro = clienteSelecionado;
    }
    if (mensagens[chatId]) {
        mensagens[chatId].forEach(msg => {
            if ((msg.de === usuario.nome && msg.para === parceiro) || (msg.de === parceiro && msg.para === usuario.nome)) {
                const div = document.createElement("div");
                div.className = `mensagem ${msg.de === usuario.nome ? 'enviada' : 'recebida'}`;
                div.innerHTML = `<span class="nome">~${msg.de}~</span>${msg.texto}`;
                chatDiv.appendChild(div);
            }
        });
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
    enviarBtn.onclick = () => {
        const texto = mensagemInput.value.trim();
        if (texto) {
            if (!mensagens[chatId]) mensagens[chatId] = [];
            mensagens[chatId].push({
                de: usuario.nome,
                para: parceiro,
                texto,
                tipo: "texto",
                data: new Date().toLocaleString()
            });
            localStorage.setItem("mensagens", JSON.stringify(mensagens));
            mensagemInput.value = "";
            exibirChat();
        }
    };
}

function geocoderEndereco(endereco, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    fetch(url, { headers: { 'User-Agent': 'MercadoDoBairro/1.0' } })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                callback({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
            } else {
                callback(null);
            }
        })
        .catch(() => callback(null));
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toggleGeocodificacao() {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!usuarioAtual || usuarioAtual.tipoUsuario !== "lojista") return;
    usuarios = usuarios.map(u => u.id === usuarioAtual.id ? { ...u, geoAtiva: !u.geoAtiva } : u);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuarioAtual, geoAtiva: !usuarioAtual.geoAtiva }));
    exibirClientesGeo();
    exibirLojistas();
}

function exibirClientesGeo() {
    const clientesGeoDiv = document.getElementById("clientesGeo");
    if (!clientesGeoDiv) return;
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    clientesGeoDiv.innerHTML = "";
    if (!usuarioAtual.geoAtiva || !usuarioAtual.lat || !usuarioAtual.lon) {
        clientesGeoDiv.innerHTML = "<p>Geocodificação desligada ou sem localização.</p>";
        document.getElementById("geoToggle").classList.add("off");
        document.getElementById("geoToggle").textContent = "Ligar Geocodificação";
        return;
    }
    document.getElementById("geoToggle").classList.remove("off");
    document.getElementById("geoToggle").textContent = "Desligar Geocodificação";
    const clientes = usuarios.filter(u => u.tipoUsuario === "cliente" && u.lat && u.lon && !usuarioAtual.bloqueados.includes(u.id));
    const clientesProximos = clientes.filter(cliente => {
        const distancia = calcularDistancia(
            usuarioAtual.lat, usuarioAtual.lon,
            cliente.lat, cliente.lon
        );
        return distancia <= 5;
    });
    if (clientesProximos.length === 0) {
        clientesGeoDiv.innerHTML = "<p>Nenhum cliente dentro de 5 km.</p>";
    } else {
        clientesProximos.forEach(cliente => {
            const div = document.createElement("div");
            div.textContent = `${cliente.nome} (${cliente.endereco})`;
            div.innerHTML += ` <button onclick="bloquearUsuario(${cliente.id})">Bloquear</button>`;
            clientesGeoDiv.appendChild(div);
        });
    }
}

window.addEventListener("load", () => {
    exibirEstoque();
    exibirCatalogo();
    exibirCarrinho();
    exibirFluxoCaixa();
    exibirVendasPendentes();
    carregarClientesChat();
    exibirChat();
    exibirLojistas();
    exibirClientesGeo();
});
