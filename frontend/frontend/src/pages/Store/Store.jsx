import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Store.css";

function Store() {

    
    const { id } = useParams();
    const navigate = useNavigate();

    let user = null;

try {
  const storedUser = localStorage.getItem("user");
  user = storedUser ? JSON.parse(storedUser) : null;
} catch (err) {
  user = null;
  localStorage.removeItem("user");
}

const isLogged = !!user;
const isLojista = user?.tipo === "lojista";
const isDonoDaLoja = isLojista && user?.loja_id === Number(id);
    
const [produtos, setProdutos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [temMaisProdutos, setTemMaisProdutos] = useState(true);
    const [store, setStore] = useState(null);
    const [busca, setBusca] = useState("");
    const [menuConfig, setMenuConfig] = useState(false);

    const menuRef = useRef(null);

    // =========================
    // FECHAR MENU AO CLICAR FORA
    // =========================
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuConfig(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // =========================
    // CARREGAR PRODUTOS
    // =========================
    useEffect(() => {
        fetch(`http://localhost:3000/api/stores/${id}/public/products?pagina=${pagina}`)
            .then(res => res.json())
            .then(data => {

                if (!Array.isArray(data)) return;

                if (pagina === 1) {
                    setProdutos(data);
                } else {
                    setProdutos(prev => [...prev, ...data]);
                }

                setTemMaisProdutos(data.length >= 20);
            });
    }, [id, pagina]);

    



    // =========================
    // CARREGAR LOJA
    // =========================
    useEffect(() => {
    fetch(`http://localhost:3000/api/stores/${id}/public`)
        .then(res => res.json())
        .then(data => setStore(data))
        .catch(err => console.log(err));
}, [id]);

    // =========================
    // FILTRO PRODUTOS
    // =========================
    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase().trim())
    );

    // =========================
    // LOJA ABERTA / FECHADA
    // =========================
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

    const handleDashboard = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login-lojista");
    return;
  }

  if (user.tipo !== "lojista") {
    alert("Acesso negado");
    return;
  }

  if (user.loja_id !== Number(id)) {
    alert("Você não é dono desta loja");
    return;
  }

  navigate(`/store/${id}/dashboard`);
};

    return (
        <div className="store-page">

            {/* TOP BAR */}
            <div className="store-top-bar">

                <button className="btn-back" onClick={() => navigate("/")}>
                    ← Voltar
                </button>

                <div className="top-actions" ref={menuRef}>

                   {isDonoDaLoja && (
  <button
    className="btn-mais"
    onClick={() => setMenuConfig(prev => !prev)}
  >
    +
  </button>
)}

{isDonoDaLoja && menuConfig && (
  <div className="dropdown-config-top">
    <button onClick={handleDashboard}>
      📊 Painel da Loja
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

                        <p>{store?.descricao}</p>

                        {/* =========================
                            STATUS + HORÁRIO (VOLTOU)
                        ========================= */}
                        <div className="horario-loja">

                            <div className={`store-status ${isLojaAberta() ? "open" : "closed"}`}>
                                <span className="dot"></span>
                                {isLojaAberta()
                                    ? "LOJA ABERTA AGORA"
                                    : "LOJA FECHADA"}
                            </div>

                            <span>
                                🕒 {store?.horario_abertura} às {store?.horario_fechamento}
                            </span>

                        </div>

                        {/* =========================
                            STATS (VOLTOU)
                        ========================= */}
                        {/* =========================
    REDES SOCIAIS (NOVO BLOCO)
========================= */}
{(store?.facebook || store?.instagram) && (
    <div className="store-social">

        {store?.facebook && (
            <a
                href={store.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn facebook"
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                    alt="Facebook"
                />
                Facebook
            </a>
        )}

        {store?.instagram && (
            <a
                href={store.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram"
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                    alt="Instagram"
                />
                Instagram
            </a>
        )}

{/* =========================
    STATS (AGORA LIMPO)
========================= */}
<div className="store-stats">
    <span>{produtos.length} Produtos</span>
    <span>Marketplace Premium</span>
</div>
    </div>
)}


                    </div>
                </div>
            </div>

            {/* PRODUTOS */}
            <div className="store-products">

                <div className="search-box">
                    <input
                        placeholder="Buscar produtos..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <h2>Produtos</h2>

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
                                        : "https://dummyimage.com/300x300"
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