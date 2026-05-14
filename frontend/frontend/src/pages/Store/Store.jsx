import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Store.css";

function Store() {
    
    const { id } = useParams();
    const navigate = useNavigate();

    const [produtos, setProdutos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [temMaisProdutos, setTemMaisProdutos] = useState(true);
    const [store, setStore] = useState(null);
    const [busca, setBusca] = useState("");
    const [menuConfig, setMenuConfig] = useState(false);
    const [modoAdmin, setModoAdmin] = useState(true); // depois você pode controlar por usuário dono

    useEffect(() => {

  fetch(`http://localhost:3000/api/stores/${id}/products?pagina=${pagina}`)
    .then(res => res.json())
    .then(data => {

      if (Array.isArray(data)) {

        if (pagina === 1) {
          setProdutos(data);
        } else {
          setProdutos(prev => [...prev, ...data]);
        }

        setTemMaisProdutos(data.length >= 20);
      }

    });

}, [id, pagina]);

useEffect(() => {
  fetch(`http://localhost:3000/api/stores/${id}`)
    .then(res => res.json())
    .then(data => setStore(data))
    .catch(err => console.log(err));
}, [id]);

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase().trim())
    );

    const excluirProduto = async (id) => {

  const confirmar = window.confirm("Deseja realmente excluir este produto?");

  if (!confirmar) return;

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setProdutos(prev => prev.filter(p => p.id !== id));

  } catch (err) {
    console.log(err);
  }

};

const isLojaAberta = () => {
  if (!store?.horario_abertura || !store?.horario_fechamento) return false;

  const agora = new Date();

  const [hA, mA] = store.horario_abertura.split(":");
  const [hF, mF] = store.horario_fechamento.split(":");

  const abertura = new Date();
  abertura.setHours(hA, mA, 0);

  const fechamento = new Date();
  fechamento.setHours(hF, mF, 0);

  return agora >= abertura && agora <= fechamento;
};



    return (

        <div className="store-page">

            <div className="store-top-bar">

    <button
        className="btn-back"
        onClick={() => navigate("/")}
    >
        ← Voltar
    </button>

    <div className="top-actions">

        <button
            className="btn-config-top"
            onClick={() => setMenuConfig(!menuConfig)}
        >
            ⚙️
        </button>

        {menuConfig && (
            <div className="dropdown-config-top">

                <button onClick={() => navigate(`/editar-loja/${id}`)}>
                    ✏️ Editar Loja
                </button>

                <button onClick={() => navigate(`/store/${id}/admin/produtos`)}>
  🛠 Gerenciar Produtos
</button>

                <button onClick={() => navigate(`/pedidos/${store.id}`)}>
                    📦 Pedidos
                </button>

                <button onClick={() => navigate(`/config-loja/${store.id}`)}>
                    ⚙️ Configurações
                </button>

            </div>
        )}

    </div>

</div>

            {/* HEADER */}
            <div className="store-header">

                <img
                    className="store-banner"
                    src={
                        store?.imagem
                            ? `http://localhost:3000/uploads/lojas/${store.imagem}`
                            : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                    }
                    alt="banner"
                />

                <div className="store-overlay"></div>

                <div className="store-profile">

                    <img
                        className="store-logo"
                        src={
                            store?.imagem
                                ? `http://localhost:3000/uploads/lojas/${store.imagem}`
                                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl55ZXLSARGsTv4qgCQBC_UD8wwSrV-3I-qg&s"
                        }
                        alt="logo"
                    />


                    <div className="store-info">

                        <h1>{store?.nome}</h1>

                       <p>
  {store?.descricao || "Produtos incríveis com os melhores preços."}
</p>

<div className="horario-loja">

                    <div className={`store-status ${isLojaAberta() ? "open" : "closed"}`}>
  <span className="dot"></span>

  {isLojaAberta() ? "LOJA ABERTA AGORA" : "LOJA FECHADA"}
</div>
  <span>
    🕒 {store?.horario_abertura} às {store?.horario_fechamento}
  </span>

</div>

                        <div className="store-stats">
                            <span>{produtos.length} Produtos</span>
                            <span>Marketplace Premium</span>
                        </div>

                    </div>

                </div>
            </div>

            {/* PRODUTOS */}
            <div className="store-products">

                {/* BUSCA */}
                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Buscar produtos da loja..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                </div>

                <h2>Produtos da Loja</h2>

                <div className="products-grid">

                    {produtosFiltrados.map(produto => (

                        <div
                            key={produto.id}
                            className="product-card"
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

                            <div className="product-info">

                                <h3>{produto.nome}</h3>

                                <p className="product-price">
                                    R$ {produto.preco}
                                </p>

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
      ← Voltar
    </button>

  )}

  {temMaisProdutos && (

    <button
      className="btn-carregar"
      onClick={() => setPagina(pagina + 1)}
    >
      Próximo →
    </button>

  )}

</div>



            </div>

        </div>

    );
}

export default Store;