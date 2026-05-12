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

  // =========================
  // CATEGORIAS
  // =========================
  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategorias(data);
      })
      .catch(err => console.log(err));
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

          <button onClick={() => navigate("/carrinho")} className="btn-carrinho">
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

        </div>
      </header>

      {/* MENU */}
      {menuAberto && (
        <div className="menu-dropdown">
          <a href="/cadastrar-produto">Cadastrar Produto</a>
          <a href="/atualizar-perfil">Atualizar Perfil</a>
        </div>
      )}

      {/* LOJAS */}
      <h3>Nossas Lojas</h3>

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

      {/* PRODUTOS */}
      <h2>Produtos</h2>

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

            <h3>{produto.nome}</h3>
            <p>{produto.nomeLoja}</p>
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

    </div>
  );
}

export default Home;