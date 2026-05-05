import { useEffect, useState } from "react";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhbGx5c3NvbiIsImlhdCI6MTc3Nzk4NDY5NywiZXhwIjoxNzc3OTg4Mjk3fQ.tObnDsYMQcFREfiKqfHtDWRBlZekrX9VI0fCeVQlYgk";

function App() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
    .then(res => res.json())
    .then(data => setProdutos(data));
  }, []);

  return (
    <div>
      <h1>🛒 Produtos </h1>

      {produtos.map(p => (
        <div key={p.id}>
          <h3>{p.nome}</h3>
          <p>R$ {p.preco}</p>

          <button onClick={() => adicionarCarrinho(p.id)} >
            Adicionar ao carrinho
          </button>

          <hr />
        </div>
      ))}
    </div>
  )
}

function adicionarCarrinho(id){
  fetch("http://localhost:3000/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer" + token
    },
    body: JSON.stringify({
      product_id: id,
      quantidade: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);
    alert("Produto adicionado ao carrinho!");
  })
  .catch(err => {
    console.error(err);
  });
}

export default App;