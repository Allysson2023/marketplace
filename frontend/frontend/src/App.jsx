import { useEffect, useState } from "react";

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
          <hr />
        </div>
      ))}
    </div>
  )
}
export default App;