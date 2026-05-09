import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetalhes.css";

function ProdutoDetalhe(){

    const { id } = useParams();
    const navigate = useNavigate();

    const [produto, setProduto] = useState(null);

    useEffect(() => {

        fetch(`http://localhost:3000/api/products/${id}`)
        .then(res => res.json())
        .then(data => setProduto(data));

    }, [id]);

    if(!produto){
        return <p>Carregando...</p>;
    }

    return(

    <div className="pagina-produto">

        <div className="topo-detalhe">

            <button
                className="btn-voltar"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button>

        </div>

        <div className="produto-detalhe">

            <div className="galeria">

                <img
                    className="imagem-principal"
                    src={`http://localhost:3000/uploads/produtos/${produto.imagem}`}
                    alt={produto.nome}
                />

                <div className="miniaturas">

                    {produto.imagem2 && (
                        <img
                            src={`http://localhost:3000/uploads/produtos/${produto.imagem2}`}
                            alt=""
                        />
                    )}

                    {produto.imagem3 && (
                        <img
                            src={`http://localhost:3000/uploads/produtos/${produto.imagem3}`}
                            alt=""
                        />
                    )}

                </div>

            </div>

            <div className="info-produto">

                <h1>{produto.nome}</h1>

                <p className="loja">
                    Loja: {produto.nomeLoja}
                </p>

                <p className="descricao">
                    {produto.descricao}
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

                <p className="estoque">
                    Estoque disponível: {produto.estoque}
                </p>

                <button className="btn-comprar">
                    Comprar Agora
                </button>

            </div>

        </div>

    </div>

);
}

export default ProdutoDetalhe;