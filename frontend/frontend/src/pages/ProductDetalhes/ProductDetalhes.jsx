import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetalhes.css";

function ProdutoDetalhe(){

    const { id } = useParams();
    const navigate = useNavigate();
    const [modalSucesso, setModalSucesso] = useState(false);
    const [produto, setProduto] = useState(null);

    const adicionarAoCarrinho = () => {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const index = cart.findIndex(
    item => item.id === produto.id
  );

  if(index !== -1){

    cart[index].quantidade += 1;

  }else{

    cart.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: 1
    });

  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // ABRIR MODAL
  setModalSucesso(true);
};

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

                <button
  className="btn-carrinho"
  onClick={adicionarAoCarrinho}
>
  Adicionar ao Carrinho
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