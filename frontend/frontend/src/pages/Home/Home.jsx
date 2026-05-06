import { useEffect, useState } from "react";
import "./Home.css";

function Home() {
  const [produtos, setProdutos] = useState([]);

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProdutos(data));
  }, []);

  function adicionarCarrinho(id) {
    fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        product_id: id,
        quantidade: 1
      })
    });
  }

  return (
    <div>
      <h1>Produtos</h1>

      {produtos.map(p => (
        <div key={p.id}>
          <h3>{p.nome}</h3>
          <p>R$ {p.preco}</p>

          <button onClick={() => adicionarCarrinho(p.id)}>
            Adicionar
          </button>
        </div>
      ))}
    </div>
  );
}

export default Home;