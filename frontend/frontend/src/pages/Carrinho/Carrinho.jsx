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

  }, []);

  const total = carrinho.reduce((acc, item) => {
    return acc + (Number(item.preco) * item.quantidade);
  }, 0);
console.log(carrinho[0]);
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

            {carrinho.map((item) => (

              <div
                key={item.id}
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