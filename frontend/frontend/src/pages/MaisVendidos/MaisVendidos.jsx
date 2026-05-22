import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MaisVendidos.css";

function MaisVendidos() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {

    try {

      const res = await fetch(
        `http://localhost:3000/api/stores/${id}/mais-vendidos`
      );

      const data = await res.json();
      setProdutos(data);

    } catch (err) {
      console.log(err);
    }

  };

  return (
    <div className="mv-container">

      {/* HEADER */}
      <div className="mv-header">

        <button className="btn-voltar" onClick={() => navigate(-1)}>
          ⬅ Voltar
        </button>

        <div>
          <h1>🔥 Mais Vendidos</h1>
          <p>Ranking dos produtos mais vendidos da sua loja</p>
        </div>

      </div>

      {/* RANKING */}
      <div className="mv-list">

        {produtos.length === 0 ? (
          <div className="mv-empty">
            Nenhum produto vendido ainda
          </div>
        ) : (

          produtos.map((p, index) => (

            <div key={p.id} className="mv-item">

              <div className="mv-left">

                <span className="mv-rank">
                  #{index + 1}
                </span>

                <div>
                  <p className="mv-name">{p.nome}</p>
                  <small>{p.total_vendido} vendas</small>
                </div>

              </div>

              <div className="mv-badge">
                {p.total_vendido}
              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default MaisVendidos;