import { useState } from "react";
import "./CadastrarProduto.css";
import { useNavigate } from "react-router-dom";

function CadastrarProduto() {
    const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");

  function cadastrarProduto(e){
    e.preventDefault();

    fetch("http://localhost:3000/api/products", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },

      body: JSON.stringify({
        nome,
        preco,
        categoria,
        store_id: 1
      })
    })
    .then(res => res.json())
    .then(data => {
      alert("Produto cadastrado!");

      setNome("");
      setPreco("");
      setCategoria("");
    });
  }

  return (
    <div className="cadastro-produto">

      <form onSubmit={cadastrarProduto} className="form-produto">

        <h2>Cadastrar Produto</h2>

        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <input
          type="text"
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />

        <div className="botoes-form">

  <button
    type="button"
    className="btn-voltar"
    onClick={() => navigate("/")}
  >
    Voltar
  </button>

  <button type="submit">
    Cadastrar
  </button>

</div>
      </form>

    </div>
  );
}

export default CadastrarProduto;