import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Financeiro.css";

function Financeiro() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);

useEffect(() => {

  const carregarFinanceiro = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/stores/${id}/financeiro`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      console.log(data);

      setDados(Array.isArray(data) ? data : []);

    } catch (err) {

      console.log(err);

    }

  };

  carregarFinanceiro();

}, [id]);

  const total = dados.reduce((acc, item) => {
    return acc + Number(item.total);
  }, 0);

  const media = dados.length
    ? total / dados.length
    : 0;

    const movimentacoesOrdenadas = [...dados].sort(
  (a, b) => new Date(b.data) - new Date(a.data)
);

const formatarMoeda = (valor) => {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};
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
            {formatarMoeda(total)}
          </h2>
        </div>

        <div className="card-financeiro">
          <span>Total de Registros</span>
          <h2>{dados.length}</h2>
        </div>

        <div className="card-financeiro">
          <span>Média por Venda</span>
          <h2>
            {formatarMoeda(media)}
          </h2>
        </div>

      </div>

      <div className="financeiro-lista">

        <h3>Últimas Movimentações</h3>

        {dados.length === 0 ? (
          <div className="financeiro-item" key={i}>

  <div className="financeiro-info">

  <div className="financeiro-data">
    📅 {new Date(d.data).toLocaleString("pt-BR")}
  </div>

  <div className="financeiro-status">
    Pedido finalizado
  </div>

</div>

  <div className="financeiro-valor">
    {formatarMoeda(d.total)}
  </div>

</div>
        ) : (

          movimentacoesOrdenadas.map((d, i) => (

            <div className="financeiro-item" key={i}>

              <div>
                <div className="financeiro-data">
                  📅 {new Date(d.data).toLocaleString("pt-BR")}
                </div>
              </div>

              <div className="financeiro-valor">
                {formatarMoeda(d.total)}
              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default Financeiro;