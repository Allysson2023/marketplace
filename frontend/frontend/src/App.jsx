import { useEffect, useState } from "react";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhbGx5c3NvbiIsImlhdCI6MTc3ODAyNDM5OCwiZXhwIjoxNzc4MTk3MTk4fQ.qLOsDfOywULqRbpKgRTI_rpV1lVUtLIDlIH97U01qWQ";

function App() {
  const [carrinho, setCarrinho] = useState([]);
  const [produtos, setProdutos] = useState([]);

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
    })
      .then(res => res.json())
      .then(() => {
        alert("Produto adicionado ao carrinho!");
        carregarCarrinho();
      });
  }

  function carregarCarrinho() {
    fetch("http://localhost:3000/api/cart", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => {
        if(!res.ok) {
          throw new Error("Erro " + res.status);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCarrinho(data);
        } else {
          console.error("Resposta errada:", data);
          setCarrinho([]);
        }
      })
      .catch(err => {
        console.error("Erro no carrinho:", err);
        setCarrinho([]);
      });
  }

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProdutos(data));

    carregarCarrinho();
  }, []);

  return (
    <div>
      <h1>🛒 Produtos</h1>

      {produtos.map(p => (
        <div key={p.id}>
          <h3>{p.nome}</h3>
          <p>R$ {p.preco}</p>

          <button onClick={() => adicionarCarrinho(p.id)}>
            Adicionar ao carrinho
          </button>

          <hr />
        </div>
      ))}

      <h2>Carrinho</h2>

      {carrinho.map(item => (
        <div key={item.id}>
          <p>Nome: {item.nome}</p>
          <p>Preço: {item.preco}</p>
          <p>Quantidade: {item.quantidade}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;