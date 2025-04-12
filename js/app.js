// Logout
function logout() {
    localStorage.removeItem("usuarioAtual");
    window.location.href = "login.html";
}

// Cadastro
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
        alert("CEP inválido! Use o formato 00000-000.");
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

// Login
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("loginNome").value.trim();
    const senha = document.getElementById("loginSenha").value;

    const usuario = usuarios.find(u => u.nome.toLowerCase() === nome.toLowerCase() && u.senha === senha);
    if (usuario) {
        localStorage.setItem("usuarioAtual", JSON.stringify(usuario));
        alert("Login realizado com sucesso!");
        window.location.href = usuario.tipoUsuario === "cliente" ? "client.html" : "stock.html";
    } else {
        alert("Nome ou senha incorretos.");
    }
});

// Estoque
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
        volume: document.getElementById("volumeProduto").value.trim(),
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
    produtos.forEach(produto => {
        const item = document.createElement("div");
        item.className = `estoque-item ${produto.quantidade < 5 ? 'estoque-baixo' : ''}`;
        item.innerHTML = `
            ${produto.nome} (${produto.tipo}, ${produto.volume}, ${produto.marca}, ${produto.codigo}) - 
            Qtd: ${produto.quantidade} - R$${produto.preco.toFixed(2)}
            <button onclick="removerProduto(${produto.id})"><i class="fas fa-trash"></i></button>
        `;
        estoqueDiv.appendChild(item);
    });
}

function removerProduto(id) {
    if (confirm("Deseja remover este produto?")) {
        produtos = produtos.filter(p => p.id !== id);
        salvarDados();
        exibirEstoque();
    }
}
