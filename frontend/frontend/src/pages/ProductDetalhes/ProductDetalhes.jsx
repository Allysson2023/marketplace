import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetalhes.css";

function ProdutoDetalhe(){

    const { id } = useParams();
    const navigate = useNavigate();
    const [modalSucesso, setModalSucesso] = useState(false);
    const [produto, setProduto] = useState(null);
    const [imagemPrincipal, setImagemPrincipal] = useState("");

   const adicionarAoCarrinho = async () => {

    if(produto.estoque <= 0){

        alert(
            "Produto indisponível no momento.\n\nFale com a loja para saber quando haverá reposição."
        );

        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:3000/api/cart",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    product_id: produto.id,
                    quantidade: 1
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if(response.ok){

            setModalSucesso(true);

        }else{

            alert(data.message || "Erro ao adicionar no carrinho");

        }

    } catch (error) {

        console.log(error);

        alert("Erro no servidor");

    }

};

    useEffect(() => {

    fetch(`http://localhost:3000/api/products/${id}`)
    .then(res => res.json())
    .then(data => {

        setProduto(data);

        setImagemPrincipal(
            `http://localhost:3000/uploads/produtos/${data.imagem}`
        );

    });

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
        src={imagemPrincipal}
        alt={produto.nome}
    />

    <div className="miniaturas">

        <img
            className={
                imagemPrincipal ===
                `http://localhost:3000/uploads/produtos/${produto.imagem}`
                ? "miniatura ativa"
                : "miniatura"
            }
            src={`http://localhost:3000/uploads/produtos/${produto.imagem}`}
            alt=""
            onClick={() =>
                setImagemPrincipal(
                    `http://localhost:3000/uploads/produtos/${produto.imagem}`
                )
            }
        />

        {produto.imagem2 && (
            <img
                className={
                    imagemPrincipal ===
                    `http://localhost:3000/uploads/produtos/${produto.imagem2}`
                    ? "miniatura ativa"
                    : "miniatura"
                }
                src={`http://localhost:3000/uploads/produtos/${produto.imagem2}`}
                alt=""
                onClick={() =>
                    setImagemPrincipal(
                        `http://localhost:3000/uploads/produtos/${produto.imagem2}`
                    )
                }
            />
        )}

        {produto.imagem3 && (
            <img
                className={
                    imagemPrincipal ===
                    `http://localhost:3000/uploads/produtos/${produto.imagem3}`
                    ? "miniatura ativa"
                    : "miniatura"
                }
                src={`http://localhost:3000/uploads/produtos/${produto.imagem3}`}
                alt=""
                onClick={() =>
                    setImagemPrincipal(
                        `http://localhost:3000/uploads/produtos/${produto.imagem3}`
                    )
                }
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

                {
    produto.estoque <= 0 ? (

        <p className="indisponivel">
            Produto indisponível
        </p>

    ) : (

        <p className="estoque">
            Estoque disponível: {produto.estoque}
        </p>

    )
}

                <button
  className="btn-carrinho"
  onClick={adicionarAoCarrinho}
  disabled={produto.estoque <= 0}
>
  {
    produto.estoque <= 0
      ? "Produto Indisponível"
      : "Adicionar ao Carrinho"
  }
</button>

            </div>

        </div>

        {modalSucesso && (

  <div className="modal-overlay">

    <div className="modal-sucesso">

      <h3>Produto adicionado!</h3>

      <p>
        Produto adicionado ao carrinho com sucesso.
      </p>

      <button
        className="btn-ok"
        onClick={() => setModalSucesso(false)}
      >
        OK
      </button>

    </div>

  </div>

)}

    </div>

);
}

export default ProdutoDetalhe;