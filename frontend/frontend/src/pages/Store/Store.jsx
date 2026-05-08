import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Store.css";

function Store(){

    const { id } = useParams();

    const [produtos, setProdutos] = useState([]);

    useEffect(() => {

        fetch(`http://localhost:3000/api/stores/${id}/products`)
        .then(res => res.json())
        .then(data => setProdutos(data));

    }, [id]);

    return(

        <div className="store-page">

            {/* PERFIL DA LOJA */}
            <div className="store-header">

                <img
                    className="store-banner"
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                    alt="banner"
                />

                <div className="store-overlay"></div>

                <div className="store-profile">

                    <img
                        className="store-logo"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl55ZXLSARGsTv4qgCQBC_UD8wwSrV-3I-qg&s"
                        alt="logo"
                    />

                    <div className="store-info">

                        <h1>Minha Loja</h1>

                        <p>
                            Produtos incríveis com os melhores preços.
                        </p>

                        <div className="store-stats">

                            <span>
                                {produtos.length} Produtos
                            </span>

                            <span>
                                Marketplace Premium
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            {/* PRODUTOS */}
            <div className="store-products">

                <h2>Produtos da Loja</h2>

                <div className="products-grid">

                    {produtos.map(produto => (

                        <div
                            key={produto.id}
                            className="product-card"
                        >

                            <img
                                src={`http://localhost:3000/uploads/produtos/${produto.imagem}`}
                                alt={produto.nome}
                            />

                            <div className="product-info">

                                <h3>{produto.nome}</h3>

                                <p className="product-price">
                                    R$ {produto.preco}
                                </p>

                                <button className="btn-buy">
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