import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./StoreDashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
function StoreDashboard() {

  const { id } = useParams();
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch(`http://localhost:3000/api/stores/${id}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setResumo(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });

  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (!resumo) {
    return <p>Erro ao carregar dados.</p>;
  }

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">📊 Dashboard da Loja</h1>

      <div className="section">

  <h2>📈 Vendas dos últimos 7 dias</h2>

  <div style={{ width: "50%", height: 300 }}>

    <ResponsiveContainer>
      <LineChart data={resumo.vendasPorDia || []}>

        <XAxis dataKey="data" 
        tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip formatter={(value) => `R$ ${value}`} />

        <Line
  type="monotone"
  dataKey="total"
  stroke="#4f46e5"
  strokeWidth={3}
  dot={{ r: 4 }}
/>

      </LineChart>
    </ResponsiveContainer>

  </div>

</div>

      <div className="cards">

        <div className="card">
          <h3>Hoje</h3>
          <p>R$ {resumo.faturamentoHoje}</p>
        </div>

        <div className="card">
          <h3>Mês</h3>
          <p>R$ {resumo.faturamentoMes}</p>
        </div>

        <div className="card">
          <h3>Ano</h3>
          <p>R$ {resumo.faturamentoAno}</p>
        </div>

      </div>

      <div className="section">

        <h2>🔥 Produtos mais vendidos</h2>

        {resumo.topProdutos.length === 0 ? (
          <p>Nenhum produto vendido ainda.</p>
        ) : (
          <ul>
            {resumo.topProdutos.map((p) => (
              <li key={p.id}>
                {p.nome} — <b>{p.quantidade}</b>
              </li>
            ))}
          </ul>
        )}

      </div>

      <div className="section">

        <h2>⚠️ Estoque baixo</h2>

        {resumo.estoqueBaixo.length === 0 ? (
          <p>Estoque OK 👍</p>
        ) : (
          <ul>
            {resumo.estoqueBaixo.map((p) => (
              <li key={p.id}>
                {p.nome} — {p.estoque} unidades
              </li>
            ))}
          </ul>
        )}

      </div>

    </div>
  );
}

export default StoreDashboard;