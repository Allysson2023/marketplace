import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Store.css";

function Store() {
    
    const { id } = useParams();
    const navigate = useNavigate();

    const [produtos, setProdutos] = useState([]);
    const [store, setStore] = useState(null);
    const [busca, setBusca] = useState("");

    useEffect(() => {

        fetch(`http://localhost:3000/api/stores/${id}/products`)
            .then(res => res.json())
            .then(data => setProdutos(data));

        fetch(`http://localhost:3000/api/stores/${id}`)
            .then(res => res.json())
            .then(data => setStore(data));

    }, [id]);

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase().trim())
    );

    return (

        <div className="store-page">

            {/* BOTÃO VOLTAR */}
            <button
                className="btn-back"
                onClick={() => navigate("/")}
            >
                ← Voltar
            </button>

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

                        <p>Produtos incríveis com os melhores preços.</p>

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

                                <button
                                    className="btn-buy"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Adicionar ao carrinho:", produto.id);
                                    }}
                                >
                                    Comprar
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );
}

export default Store;