import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

function Home() {

  const navigate = useNavigate();
  const location = useLocation();

  const [lojas, setLojas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSair, setModalSair] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [temMaisProdutos, setTemMaisProdutos] = useState(true);
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);

  const [modalCarrinhoVazio, setModalCarrinhoVazio] = useState(false);
  const [mostrarBoasVindas, setMostrarBoasVindas] =
    useState(false);

const [usuarioLogado, setUsuarioLogado] =
    useState(null);

  const token = localStorage.getItem("token");
const estaLogado = !!token;

const user = JSON.parse(localStorage.getItem("user"));
const tipoUsuario = user?.tipo;

  const menuRef = useRef(null);

  // =========================
  // FECHAR MENU
  // =========================
  useEffect(() => {

    

    function handleClickFora(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuAberto(false);
      }

    }

    document.addEventListener("mousedown", handleClickFora);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFora
      );
    };

  }, []);

  useEffect(() => {

  const userSalvo =
    localStorage.getItem("user");

  const boasVindasMostrada =
    sessionStorage.getItem("boasVindas");


  if (
    userSalvo &&
    !boasVindasMostrada
  ) {

    setUsuarioLogado(
      JSON.parse(userSalvo)
    );

    setMostrarBoasVindas(true);

    sessionStorage.setItem(
      "boasVindas",
      "true"
    );
  }

}, []);

  // =========================
  // SAIR
  // =========================
  const sair = () => {

  localStorage.removeItem("token");

  sessionStorage.removeItem("boasVindas");

  setModalSair(false);

  navigate("/login");

};

  




  // =========================
  // CATEGORIAS
  // =========================
  useEffect(() => {

    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategorias(data);
      })
      .catch(err => console.log(err));

  }, []);

  // =========================
  // LOJAS
  // =========================
  useEffect(() => {

    fetch(`http://localhost:3000/api/stores?busca=${busca}`)
      .then(res => res.json())
      .then(data => {

        if (Array.isArray(data)) {
          setLojas(data);
        }

      })
      .catch(err => console.log(err));

  }, [busca]);

  // =========================
  // PRODUTOS
  // =========================
  useEffect(() => {

    let url = `http://localhost:3000/api/products?pagina=${pagina}`;

    if (busca) {
      url += `&busca=${busca}`;
    }

    if (categoriaSelecionada) {
      url += `&categoria=${categoriaSelecionada}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {

        if (Array.isArray(data)) {

          if (pagina === 1) {
            setProdutos(data);
          } else {
            setProdutos(prev => [...prev, ...data]);
          }

          setTemMaisProdutos(data.length >= 30);

        } else {

          setProdutos([]);

        }

      })
      .catch(err => console.log(err));

  }, [categoriaSelecionada, busca, pagina]);

  // =========================
  // CARRINHO
  // =========================
  
  useEffect(() => {

  const token = localStorage.getItem("token");

  if (!token) {
    setQuantidadeCarrinho(0);
    return;
  }

  fetch("http://localhost:3000/api/cart", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {

      if (Array.isArray(data)) {

        const total = data.reduce(
          (acc, item) => acc + item.quantidade,
          0
        );

        setQuantidadeCarrinho(total);

      }

    })
    .catch(() => setQuantidadeCarrinho(0));

}, [location]);

  // =========================
  // ABRIR CARRINHO
  // =========================
  const abrirCarrinho = async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    setModalCarrinhoVazio(true);
    return;
  }

  try {

    const res = await fetch("http://localhost:3000/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      setModalCarrinhoVazio(true);
      return;
    }

    navigate("/carrinho");

  } catch (err) {
    console.log(err);
  }

};

  // =========================
  // ALERTA PEDIDO
  // =========================
  useEffect(() => {

    if (location.state?.pedidoSucesso) {
      alert("Pedido realizado com sucesso!");
    }

  }, []);

  let tipoExibicao = "";

if (usuarioLogado?.tipo === "cliente") {
  tipoExibicao = "Cliente";
}

if (usuarioLogado?.tipo === "lojista") {
  tipoExibicao = "Lojista";
}

if (usuarioLogado?.tipo === "funcionario") {
  tipoExibicao = "Funcionário";
}

if (usuarioLogado?.tipo === "admin") {
  tipoExibicao = "Administrador";
}

  return (
    <div className="home">

      {/* TOPO */}
      <header className="topo">
        <h2>Economica</h2>

        <div className="acoes-topo">

          <input
            type="text"
            placeholder="Buscar lojas ou produtos..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />

         <button onClick={abrirCarrinho} className="btn-carrinho">
  🛒 Carrinho

  <span className="cart-badge">
    {quantidadeCarrinho}
  </span>
</button>

          

          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="btn-mais"
          >
            +
          </button>
          <button
    className="btn-notificacao"
    onClick={() => navigate("/notificacoes")}
    disabled={!estaLogado}
>
    🔔
</button>

        </div>
      </header>

      {/* MENU */}
      {menuAberto && (
  <div className="menu-dropdown" ref={menuRef}>

    {!estaLogado ? (
      <>
      
        <div
          className="menu-item"
          onClick={() => navigate("/login")}
        >
          🔑 Entrar
        </div>

        <div
          className="menu-item"
          onClick={() => navigate("/cadastro")}
        >
          👤 Criar Conta
        </div>

      </>
    ) : (
      <>

{tipoUsuario === "funcionario" && (
  <div
    className="menu-item"
    onClick={() => navigate("/funcionario/dashboard")}
  >
    🏢 Painel Administrativo
  </div>
)}

{tipoUsuario === "lojista" && (
  <div
    className="menu-item"
    onClick={() => navigate(`/store/${user.loja_id}/dashboard`)}
  >
    🏪 Painel da Loja
  </div>
)}

      <div
  className="menu-item"
  onClick={() => navigate("/mensagens")}
>
  💬 Minhas Conversas
</div>
      
        <div
          className="menu-item"
          onClick={() => navigate("/meus-pedidos")}
        >
          📦 Histórico de Pedidos
        </div>

        <div
    className="menu-item"
    onClick={() => navigate("/perfil")}
  >
    👤 Meu Perfil
  </div>

        <div
          className="menu-item"
          onClick={() => setModalSair(true)}
        >
          🚪 Sair do Login
        </div>

      </>
    )}

  </div>
)}

      {/* LOJAS */}
      <h3 className="centraliza-titulo" >Nossas Lojas</h3>

      <div className="carrossel">
        {lojas.map((loja) => (
          <div
            key={loja.id}
            className="card-loja"
            onClick={() => navigate(`/store/${loja.id}`)}
          >
            <img
              src={
                loja.imagem
                  ? `http://localhost:3000/uploads/lojas/${loja.imagem}`
                  : "https://dummyimage.com/300x300"
              }
              alt={loja.nome}
            />
            <p>{loja.nome}</p>

<div className="loja-avaliacao">
  ⭐ {loja.media_avaliacao}

  <span>
    ({loja.total_avaliacoes}
    {loja.total_avaliacoes === 1
      ? " avaliação"
      : " avaliações"})
  </span>
</div>
          </div>
        ))}
      </div>

      {/* CATEGORIAS */}
<div className="menu">

  <span
    className={`categoria-item ${
  categoriaSelecionada === "" ? "categoria-ativa" : ""
}`}
    onClick={() => {
      setCategoriaSelecionada("");
      setPagina(1);
    }}
  >
    Todos
  </span>

  {categorias.map((cat, index) => {


  return (
    <span
      key={cat.nome}
      className={`categoria-item ${
        categoriaSelecionada === cat.nome
          ? "categoria-ativa"
          : ""
      }`}
      onClick={() => {
        setCategoriaSelecionada(cat.nome);
        setPagina(1);
      }}
    >
      {cat.nome}
    </span>
  );

})}

</div>

      {/* PRODUTOS */}
      <h2 className="centraliza-titulo"> Produtos </h2>

      <div className="produto-grid">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="card-produto"
            onClick={() => navigate(`/product/${produto.id}`)}
          >
            <img
              src={
                produto.imagem
                  ? `http://localhost:3000/uploads/produtos/${produto.imagem}`
                  : "https://dummyimage.com/300x300"
              }
              alt={produto.nome}
            /> 



                <h3 className="produto-title-safe">{produto.nome}</h3>

<p className="produto-store-safe">{produto.nomeLoja}</p>

<div className="produto-footer-safe">

  <div className="produto-likes-safe">
    ❤️ {produto.curtidas}
  </div>

  <div className="produto-price-safe">
    <span className="price-current-safe">
      R$ {Number(produto.preco).toFixed(2)}
    </span>

    {produto.preco_antigo && (
      <span className="price-old-safe">
        R$ {Number(produto.preco_antigo).toFixed(2)}
      </span>
    )}
  </div>

</div>


          </div>
        ))}
      </div>
        {/* PAGINAÇÃO */}
        
        <div className="paginacao">
        
          {pagina > 1 && (
        
            <button
              className="btn-carregar"
              onClick={() => setPagina(pagina - 1)}
            >
              Voltar
            </button>
        
          )}
        
          {temMaisProdutos && (
        
            <button
              className="btn-carregar"
              onClick={() => setPagina(pagina + 1)}
            >
              Próximo
            </button>
        
          )}
        
        </div>

      {modalSair && (

  <div className="modal-overlay">

    <div className="modal-sair">

      <h3>Deseja realmente sair?</h3>

      <p>
        Você será desconectado da sua conta.
      </p>

      <div className="modal-botoes">

        <button
          className="btn-cancelar"
          onClick={() => setModalSair(false)}
        >
          Não
        </button>

        <button
          className="btn-confirmar"
          onClick={sair}
        >
          Sim
        </button>

      </div>
    </div>

  </div>

)}

{modalCarrinhoVazio && (

  <div className="modal-overlay">

    <div className="modal">

      <h3>Seu carrinho está vazio 🧺</h3>

      <p>Adicione produtos antes de continuar.</p>

      <button
        onClick={() => setModalCarrinhoVazio(false)}
        className="btn-ok"
      >
        OK
      </button>

    </div>

  </div>

)}
{ mostrarBoasVindas && (

  <div className="welcome-overlay">

    <div className="welcome-card">

      <div className="welcome-icon">
        🎉
      </div>

      <h2 className="welcome-title">
        Bem-vindo ao Econômica
      </h2>

      <p className="welcome-user">
        Olá, <strong>{usuarioLogado?.username}</strong>
      </p>

      <div className="welcome-role">
        {tipoExibicao}
      </div>

      <p className="welcome-text">
        Seu acesso foi realizado com sucesso.
        Aproveite todos os recursos da plataforma
        e tenha uma excelente experiência.
      </p>

      <button
        className="welcome-button"
        onClick={() => setMostrarBoasVindas(false)}
      >
        Entrar no Sistema
      </button>

    </div>

  </div>

)}

    </div>
  );
}

export default Home;