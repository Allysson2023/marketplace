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
import socket from "../../socket";

function StoreDashboard() {

  const { id } = useParams();
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FUNÇÃO PRA BUSCAR DADOS
  const carregarDashboard = () => {
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
  };

  // 🔥 CARREGAMENTO INICIAL
  useEffect(() => {
    carregarDashboard();
  }, [id]);

  // 🔥 TEMPO REAL
  useEffect(() => {

    const handleUpdate = (data) => {

      if (data.lojaId === Number(id)) {
        carregarDashboard();
      }

    };

    socket.on("dashboard_update", handleUpdate);

    return () => {
      socket.off("dashboard_update", handleUpdate);
    };

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

    {/* HEADER */}
    <div className="dashboard-header">

      <div>
        <h1 className="dashboard-title">
          📊 Dashboard da Loja
        </h1>

        <p className="dashboard-subtitle">
          Visão geral das vendas e desempenho
        </p>
      </div>

      <div className="dashboard-actions">

        <button>➕ Novo Produto</button>
        <button>📦 Produtos</button>
        <button>🛒 Pedidos</button>

      </div>

    </div>

    {/* CARDS */}
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

    {/* GRÁFICO */}
    <div className="section chart-section">

      <div className="section-header">
        <h2>📈 Vendas dos últimos 7 dias</h2>
      </div>

      <div className="chart-container">

        <ResponsiveContainer width="100%" height={320}>

          <LineChart
            data={resumo.vendasPorDia || []}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >

            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 5 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

    {/* GRID */}
    <div className="dashboard-grid">

      {/* TOP PRODUTOS */}
      <div className="section">

        <h2>🔥 Produtos mais vendidos</h2>

        {resumo.topProdutos.length === 0 ? (
          <p>Nenhum produto vendido ainda.</p>
        ) : (
          <ul className="product-list">

            {resumo.topProdutos.map((p) => (

              <li key={p.id} className="product-item">

                <span>{p.nome}</span>

                <b>{p.quantidade} vendas</b>

              </li>

            ))}

          </ul>
        )}

      </div>

      {/* ESTOQUE */}
      <div className="section">

        <h2>⚠️ Estoque baixo</h2>

        {resumo.estoqueBaixo.length === 0 ? (
          <p>Estoque OK 👍</p>
        ) : (
          <ul className="product-list">

            {resumo.estoqueBaixo.map((p) => (

              <li key={p.id} className="product-item">

                <span>{p.nome}</span>

                <b>{p.estoque} un.</b>

              </li>

            ))}

          </ul>
        )}

      </div>

    </div>

  </div>
);
}

export default StoreDashboard;