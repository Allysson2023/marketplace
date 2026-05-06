import { useEffect, useState } from "react";
import Login from "./pages/Login";

const token = localStorage.getItem("token");

function App() {
  const [carrinho, setCarrinho] = useState([]);
  const [produtos, setProdutos] = useState([]);
  
  const token = localStorage.getItem("token");
    
    if (!token) {
      return <Login/>;
    }

  function adicionarCarrinho(id) {

    const token = localStorage.getItem("token");

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
    const token = localStorage.getItem("token");

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
      .then(data => setProdutos(data))

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