import { useEffect, useState } from "react";
import "./Carrinho.css";

function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/api/cart", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setCarrinho(data));
  }, []);

  return (
    <div>
      <h1>Carrinho</h1>

      {carrinho.map(item => (
        <div key={item.id}>
          <p>{item.nome}</p>
          <p>Qtd: {item.quantidade}</p>
        </div>
      ))}
    </div>
  );
}

export default Carrinho;