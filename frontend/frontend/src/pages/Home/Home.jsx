import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

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

  const token = localStorage.getItem("token");

  const sair = () => {
  localStorage.removeItem("token");

  setModalSair(false);

  navigate("/login");

  window.location.reload();
};

  // =========================
  // PROTEÇÃO DE ROTA
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, []);

  // =========================
  // TOKEN EXPIRADO
  // =========================
  useEffect(() => {
    try {
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiracao = payload.exp * 1000;

      if (Date.now() >= expiracao) {
        localStorage.removeItem("token");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 50);
      }
    } catch (error) {
      localStorage.removeItem("token");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 50);
    }
  }, []);

useEffect(() => {
  fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => {
      console.log("CATEGORIAS VINDAS DO BACKEND:", data);
      setCategorias(data);
    })
    .catch(err => console.log("ERRO CATEGORIAS:", err));
}, []);

  // =========================
  // LOJAS
  // =========================
  useEffect(() => {
    fetch(`http://localhost:3000/api/stores?busca=${busca}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLojas(data);
      })
      .catch(err => console.log(err));
  }, [busca]);

  // =========================
  // PRODUTOS
  // =========================
  useEffect(() => {
    let url = `http://localhost:3000/api/products?pagina=${pagina}`;

    if (busca) url += `&busca=${busca}`;
    if (categoriaSelecionada) url += `&categoria=${categoriaSelecionada}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return null;
        }
        return res.json();
      })
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

  useEffect(() => {

  fetch("http://localhost:3000/api/cart", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {

      console.log(data);

      if(Array.isArray(data)){

        const total = data.reduce(
          (acc, item) => acc + item.quantidade,
          0
        );

        setQuantidadeCarrinho(total);

      }

    })
    .catch(err => console.log(err));

}, []);

const [modalCarrinhoVazio, setModalCarrinhoVazio] = useState(false);

const abrirCarrinho = async () => {

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

useEffect(() => {
  if (location.state?.pedidoSucesso) {
    alert("Pedido realizado com sucesso!");
  }
}, []);

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
  onClick={() => setModalSair(true)}
  className="btn-sair"
>
  Sair
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
>
    🔔
</button>

        </div>
      </header>

      {/* MENU */}
      {menuAberto && (
        <div className="menu-dropdown">
          <a href="/cadastrar-produto">Cadastrar Produto</a>
          <a href="/atualizar-perfil">Atualizar Perfil</a>
          <a href="/meus-pedidos" className="menu-item">📦 Histórico de Pedidos</a>
          
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

  console.log(cat);

  return (
    <span
      key={index}
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
      <h2 className="centraliza-titulo" >Produtos</h2>

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

            <h3 className="centraliza-titulo" >{produto.nome}</h3>
            <p className="centraliza-titulo" >{produto.nomeLoja}</p>
           <div className="precos">

                    {produto.preco_antigo && (
                        <span className="preco-antigo">
                            R$ {produto.preco_antigo}
                        </span>
                    )}

                    <span className="preco-atual">
                        R$ {produto.preco}
                    </span>

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

    </div>
  );
}

export default Home;