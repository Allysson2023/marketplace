import { useState, useEffect } from "react";
import "./CadastrarProduto.css";
import { useNavigate } from "react-router-dom";

function CadastrarProduto() {

  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {

    fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

  }, []);

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
        categoria
      })
    })
    .then(res => res.json())
    .then(data => {

      setMensagem("Produto cadastrado com sucesso!");

      setNome("");
      setPreco("");
      setCategoria("");

    });
  }

  return (
    <div className="cadastro-produto">

      <form onSubmit={cadastrarProduto} className="form-produto">

        <h2>Cadastrar Produto</h2>

        {mensagem && (
          <div className="mensagem-sucesso">
            {mensagem}
          </div>
        )}

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

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >

          <option value="">
            Escolha uma categoria
          </option>

          {categorias.map(cat => (

            <option
              key={cat.id}
              value={cat.nome}
            >
              {cat.nome}
            </option>

          ))}

        </select>

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