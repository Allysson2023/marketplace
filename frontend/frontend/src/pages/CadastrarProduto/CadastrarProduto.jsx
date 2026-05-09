import { useState, useEffect } from "react";
import "./CadastrarProduto.css";
import { useNavigate } from "react-router-dom";

function CadastrarProduto() {

  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [mensagem, setMensagem] = useState("")
  const [descricao, setDescricao] = useState("");
  const [precoAntigo, setPrecoAntigo] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagem2, setImagem2] = useState(null);
const [imagem3, setImagem3] = useState(null);

  useEffect(() => {

    fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

  }, []);

async function cadastrarProduto(e){

    e.preventDefault();

    const formData = new FormData();

    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("preco", preco);
    formData.append("preco_antigo", precoAntigo);
    formData.append("estoque", estoque);
    formData.append("categoria", categoria);

    if(imagem){
    formData.append("imagem", imagem);
}

if(imagem2){
    formData.append("imagem2", imagem2);
}

if(imagem3){
    formData.append("imagem3", imagem3);
}

    const resposta = await fetch(
        "http://localhost:3000/api/products",
        {
            method: "POST",

            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },

            body: formData
        }
    );

    const data = await resposta.json();

    setMensagem(data.message);

    setNome("");
    setDescricao("");
    setPreco("");
    setPrecoAntigo("");
    setEstoque("");
    setCategoria("");
    setImagem(null);

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


      <p>Imagem principal do produto</p>

<input
    type="file"
    onChange={(e) => setImagem(e.target.files[0])}
/>

<p>Imagem extra 1 (detalhes)</p>

<input
    type="file"
    onChange={(e) => setImagem2(e.target.files[0])}
/>

<p>Imagem extra 2 (detalhes)</p>

<input
    type="file"
    onChange={(e) => setImagem3(e.target.files[0])}
/>

        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <textarea
    placeholder="Descrição do produto"
    value={descricao}
    onChange={(e) => setDescricao(e.target.value)}
/>

<input
    type="number"
    placeholder="Preço antigo"
    value={precoAntigo}
    onChange={(e) => setPrecoAntigo(e.target.value)}
/>

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

<input
    type="number"
    placeholder="Quantidade em estoque"
    value={estoque}
    onChange={(e) => setEstoque(e.target.value)}
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