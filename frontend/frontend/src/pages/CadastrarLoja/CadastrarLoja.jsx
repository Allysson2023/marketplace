import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastrarLoja.css";

function CadastrarLoja() {

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

}, []);

  function cadastrarLoja(e){
    e.preventDefault();

    fetch("http://localhost:3000/api/stores", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },

      body: JSON.stringify({
        nome,
        categoria
      })
    })
    .then(res => res.json())
    .then(data => {

      alert("Loja criada com sucesso!");

      navigate("/");
    });
  }

  return (
    <div className="cadastro-loja">

      <form
        onSubmit={cadastrarLoja}
        className="form-loja"
      >

        <h2>Cadastrar Loja</h2>

        <input
          type="text"
          placeholder="Nome da loja"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
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

        <button type="submit">
          Criar Loja
        </button>

      </form>

    </div>
  );
}

export default CadastrarLoja;