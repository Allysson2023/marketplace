import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Carrinho.css";

function Carrinho() {

  const navigate = useNavigate();

  const [carrinho, setCarrinho] = useState([]);

  const token = localStorage.getItem("token");

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
          setCarrinho(data);
        }

      })
      .catch(err => console.log(err));

  }, [token]);

  const total = carrinho.reduce((acc, item) => {
    return acc + (Number(item.preco) * item.quantidade);
  }, 0);

const aumentar = (id) => {

  fetch(`http://localhost:3000/api/cart/increase/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {

    setCarrinho(prev =>
      prev.map(item =>
        item.product_id === id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );

  });

};

const diminuir = (id) => {

  fetch(`http://localhost:3000/api/cart/decrease/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {

    setCarrinho(prev =>
      prev
        .map(item =>
          item.product_id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    );

  });

};

const remover = (id) => {

  fetch(`http://localhost:3000/api/cart/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {

    setCarrinho(prev =>
      prev.filter(item => item.product_id !== id)
    );

  });

};

const limparCarrinho = () => {

  fetch("http://localhost:3000/api/cart/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => setCarrinho([]));

};

  return (

    <div className="pagina-carrinho">

      <div className="topo-carrinho">

        <button
          className="btn-voltar"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <h1>Meu Carrinho</h1>

      </div>

      {carrinho.length === 0 ? (

        <div className="cart-vazio">

          <h2>Seu carrinho está vazio</h2>

        </div>

      ) : (

        <>
        
          <div className="lista-carrinho">

            <button
  className="btn-limpar"
  onClick={limparCarrinho}
>
  🧹 Limpar Carrinho
</button>

            {carrinho.map((item) => (

              <div
                key={item.product_id}
                className="card-carrinho"
              >

                <img
                  src={`http://localhost:3000/uploads/produtos/${item.imagem}`}
                  alt={item.nome}
                />

                <div className="info-carrinho">

                  <h3>{item.nome}</h3>

                  <p>
                    Quantidade: {item.quantidade}
                  </p>

                  <span>
                    R$ {item.preco}
                  </span>

                </div>

                <div className="actions">

  <button className="btn-menos" onClick={() => diminuir(item.product_id)}>
    -
  </button>

  <span>{item.quantidade}</span>

  <button className="btn-mais" onClick={() => aumentar(item.product_id)}>
    +
  </button>

  <button className="btn-delete" onClick={() => remover(item.product_id)}>
    🗑
  </button>

</div>

              </div>

            ))}

          </div>

          <div className="footer-carrinho">

            <h2>
              Total: R$ {total.toFixed(2)}
            </h2>

            <button className="btn-finalizar">
              Finalizar Compra
            </button>

          </div>

        </>

      )}

    </div>

  );

}

export default Carrinho;