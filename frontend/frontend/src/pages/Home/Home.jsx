import { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function adicionarAoCarrinho(produto) {
  let cart = getCart();

  const index = cart.findIndex(item => item.id === produto.id);

  if (index !== -1) {
    cart[index].quantidade += 1;
  } else {
    cart.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: 1
    });
  }

  saveCart(cart);
}

function sair() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

function Home() {

  const [lojas, setLojas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSair, setModalSair] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [temMaisProdutos, setTemMaisProdutos] = useState(true);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  // =========================
  // VALIDAR TOKEN
  // =========================

  useEffect(() => {

    try {

      if (token) {

        const payload = JSON.parse(
          atob(token.split(".")[1])
        );

        const expiracao = payload.exp * 1000;

        const agora = Date.now();

        if (agora >= expiracao) {

          localStorage.removeItem("token");

          window.location.href = "/login";

        }

      }

    } catch (error) {

      localStorage.removeItem("token");

      window.location.href = "/login";

    }

  }, [token]);

  // =========================
  // CATEGORIAS
  // =========================

  useEffect(() => {

    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(data => {

        if (Array.isArray(data)) {
          setCategorias(data);
        }

      })
      .catch(err => {
        console.log(err);
      });

  }, []);

  // =========================
  // LOJAS
  // =========================

  useEffect(() => {

    fetch(`http://localhost:3000/api/stores?busca=${busca}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {

        if (res.status === 401) {

          localStorage.removeItem("token");

          window.location.href = "/login";

          return null;

        }

        return res.json();

      })
      .then(data => {

        if (Array.isArray(data)) {
          setLojas(data);
        }

      })
      .catch(err => {
        console.log(err);
      });

  }, [busca, token]);

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

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {

        if (res.status === 401) {

          localStorage.removeItem("token");

          window.location.href = "/login";

          return null;

        }

        return res.json();

      })
      .then(data => {

        console.log("Produtos recebidos:", data);

        if (Array.isArray(data)) {

          // PRIMEIRA PAGINA
          if (pagina === 1) {

            setProdutos(data);

          } else {

            // ADICIONA MAIS PRODUTOS
            setProdutos((prev) => [...prev, ...data]);

          }

          setTemMaisProdutos(data.length >= 30);

        } else {

          setProdutos([]);

        }

      })
      .catch(err => {

        console.log(err);

      });

  }, [categoriaSelecionada, busca, pagina, token]);

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
          <button onClick={() => navigate("/cart")} className="btn-carrinho">
  🛒 Carrinho
   <span className="cart-badge">2</span>
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

          <a href="/cadastrar-produto">
            Cadastrar Produto
          </a>

          <a href="/atualizar-perfil">
            Atualizar Perfil
          </a>

        </div>

      )}

      {/* LOJAS */}

      <h3 className="titulo-secao">
        Nossas Lojas
      </h3>

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
                  : "https://dummyimage.com/300x300/cccccc/000000&text=Loja"
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
          className={`categoria-item ${categoriaSelecionada === ""
              ? "categoria-ativa"
              : ""
            }`}
          onClick={() => {

            setCategoriaSelecionada("");

            setPagina(1);

          }}
        >
          Todos
        </span>

        {categorias.map((categoria) => (

          <span
            key={categoria.id}
            className={`categoria-item ${categoriaSelecionada === categoria.nome
                ? "categoria-ativa"
                : ""
              }`}
            onClick={() => {

              setCategoriaSelecionada(categoria.nome);

              setPagina(1);

            }}
          >
            {categoria.nome}
          </span>

        ))}

      </div>

      {/* PRODUTOS */}

      <h2 className="produto-titulo">
        Produtos
      </h2>

      <div className="produto-grid">

        {produtos.length > 0 ? (

          produtos.map((produto) => (

            <div
              key={produto.id}
              className="card-produto"
              onClick={() => navigate(`/product/${produto.id}`)}
            >

              <img
                src={
                  produto.imagem
                    ? `http://localhost:3000/uploads/produtos/${produto.imagem}`
                    : "https://dummyimage.com/300x300/cccccc/000000&text=Sem+Imagem"
                }
                alt={produto.nome}
              />

              <h3>{produto.nome}</h3>

              <p className="nome-loja">
                {produto.nomeLoja}
              </p>

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

          ))

        ) : (

          <p className="sem-produtos">
            Nenhum produto encontrado.
          </p>

        )}

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
            Carregar Mais
          </button>

        )}

      </div>

      {/* MODAL */}

      {modalSair && (

        <div className="modal-overlay">

          <div className="modal-sair">

            <h3>Deseja sair?</h3>

            <p>
              Você realmente deseja encerrar a sessão?
            </p>

            <div className="modal-botoes">

              <button
                className="btn-cancelar"
                onClick={() => setModalSair(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-confirmar"
                onClick={sair}
              >
                Sair
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Home;