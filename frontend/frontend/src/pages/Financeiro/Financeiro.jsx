import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Financeiro.css";

function Financeiro() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/stores/${id}/financeiro`)
      .then(r => r.json())
      .then(setDados);
  }, []);

  const total = dados.reduce((acc, item) => {
    return acc + Number(item.total);
  }, 0);

  const media = dados.length
    ? total / dados.length
    : 0;

  return (
    <div className="financeiro-container">

      <div className="financeiro-topo">

        <div>
          <h1 className="financeiro-title">
            Painel Financeiro
          </h1>

          <p className="financeiro-subtitle">
            Controle financeiro da sua loja
          </p>
        </div>

        <div className="financeiro-header-icon">
          💰
        </div>

      </div>

      <button
        className="btn-voltar"
        onClick={() => navigate(-1)}
      >
        ⬅ Voltar
      </button>

      <div className="cards-financeiro">

        <div className="card-financeiro">
          <span>Total Faturado</span>
          <h2>
            R$ {total.toFixed(2)}
          </h2>
        </div>

        <div className="card-financeiro">
          <span>Total de Registros</span>
          <h2>{dados.length}</h2>
        </div>

        <div className="card-financeiro">
          <span>Média por Venda</span>
          <h2>
            R$ {media.toFixed(2)}
          </h2>
        </div>

      </div>

      <div className="financeiro-lista">

        <h3>Últimas Movimentações</h3>

        {dados.length === 0 ? (
          <div className="financeiro-vazio">
            Nenhuma movimentação encontrada.
          </div>
        ) : (

          dados.map((d, i) => (

            <div className="financeiro-item" key={i}>

              <div>
                <div className="financeiro-data">
                  📅 {new Date(d.data).toLocaleDateString("pt-BR")}
                </div>
              </div>

              <div className="financeiro-valor">
                R$ {Number(d.total).toFixed(2)}
              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default Financeiro;