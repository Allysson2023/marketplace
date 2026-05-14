import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminProdutos.css";
function AdminProdutos() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {

    fetch(`http://localhost:3000/api/stores/${id}/products`)
      .then(res => res.json())
      .then(data => setProdutos(data));

  }, [id]);

  const excluir = async (produtoId) => {

    if (!window.confirm("Deseja excluir?")) return;

    await fetch(`http://localhost:3000/api/products/${produtoId}`, {
      method: "DELETE"
    });

    setProdutos(prev => prev.filter(p => p.id !== produtoId));

  };

  return (

    <div className="admin-page">

      <button
      className="btn-back"
      onClick={() => navigate(-1)}
    >
      ← Voltar
    </button>

      <h1>Gerenciar Produtos</h1>

      {produtos.map(produto => (

        <div className="admin-card" key={produto.id}>

          <img
            src={`http://localhost:3000/uploads/produtos/${produto.imagem}`}
          />

          <div>
            <h3>{produto.nome}</h3>
            <p>R$ {produto.preco}</p>
          </div>

          <div className="admin-buttons">

            <button
              onClick={() => navigate(`/admin/produto/${produto.id}`)}
            >
              ✏️ Editar
            </button>

            <button onClick={() => excluir(produto.id)}>
              🗑 Excluir
            </button>

          </div>

        </div>

      ))}

    </div>

  );

}

export default AdminProdutos;