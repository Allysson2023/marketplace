import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './EditarProduto.css'

function EditarProduto() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {

    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduto(data));

  }, [id]);

  useEffect(() => {

  fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data))
    .catch(err => console.log(err));

}, []);

  if (!produto) return <p>Carregando...</p>;
  

  const salvar = async () => {

  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:3000/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      preco_antigo: produto.preco_antigo,
      estoque: produto.estoque,
      categoria: produto.categoria
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert("Erro ao salvar");
    return;
  }

  alert("Produto atualizado!");
};

  return (

    <div>

      <button
      className="btn-back"
      onClick={() => navigate(-1)}
    >
      ← Voltar
    </button>

      <div className="edit-container">

  <h1>Editar Produto</h1>

  <div className="form-group">
    <label>Nome</label>
    <input value={produto.nome}
      onChange={(e) =>
        setProduto({ ...produto, nome: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Descrição</label>
    <textarea
  value={produto.descricao || ""}
  onChange={(e) =>
    setProduto({ ...produto, descricao: e.target.value })
  }

      onChange={(e) =>
        setProduto({ ...produto, descricao: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Preço</label>
    <input
  type="number"
  step="0.01"
  value={produto.preco}
      onChange={(e) =>
        setProduto({ ...produto, preco: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Preço Antigo</label>
    <input
  type="number"
  step="0.01"
  value={produto.preco_antigo || ""}
      onChange={(e) =>
        setProduto({ ...produto, preco_antigo: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Estoque</label>
    <input
  type="number"
  value={produto.estoque}
      onChange={(e) =>
        setProduto({ ...produto, estoque: e.target.value })
      }
    />
  </div>

  <div className="form-group">

  <label>Categoria</label>

  <select
  required
  value={produto.categoria || ""}
  onChange={(e) =>
    setProduto({ ...produto, categoria: e.target.value })
  }
>

    <option value="">
      Selecione uma categoria
    </option>

    {categorias.map((categoria, index) => (

      <option
        key={index}
        value={categoria}
      >
        {categoria}
      </option>

    ))}

  </select>

</div>

  <button className="btn-save" onClick={salvar}>
    Salvar
  </button>

</div>

    </div>

  );

}

export default EditarProduto;