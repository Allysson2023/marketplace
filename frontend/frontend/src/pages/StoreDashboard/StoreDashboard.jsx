import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);
  const [pedidosPorDia, setPedidosPorDia] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // 📦 CARREGAR DASHBOARD
  // =========================
  const carregarDashboard = async () => {

    try {

      const response = await fetch(
        `http://localhost:3000/api/stores/${id}/dashboard`
      );

      const data = await response.json();

      setResumo(data);

      setPedidosPorDia(data.pedidosPorDia || []);

      setLoading(false);

    } catch (err) {

      console.log(err);

      setLoading(false);

    }

  };

  // =========================
  // 🚀 LOAD INICIAL
  // =========================
  useEffect(() => {

    carregarDashboard();

  }, [id]);

  // =========================
  // 🔥 SOCKET TEMPO REAL
  // =========================
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

  // =========================
  // ⏳ LOADING
  // =========================
  if (loading) {

    return (
      <div className="dashboard-loading">
        <p>Carregando dashboard...</p>
      </div>
    );

  }

  // =========================
  // ❌ ERRO
  // =========================
  if (!resumo) {

    return (
      <div className="dashboard-loading">
        <p>Erro ao carregar dados.</p>
      </div>
    );

  }

  // =========================
  // 📊 UI
  // =========================
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

      </div>

      {/* CARDS */}
      <div className="cards">

        <div className="card">
  <h3>Hoje</h3>

  <p>
    {Number(resumo.faturamentoHoje || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    )}
  </p>
</div>

<div className="card">
  <h3>Mês</h3>

  <p>
    {Number(resumo.faturamentoMes || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    )}
  </p>
</div>

<div className="card">
  <h3>Ano</h3>

  <p>
    {Number(resumo.faturamentoAno || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    )}
  </p>
</div>

      </div>

      {/* AÇÕES */}
      <div className="quick-actions">

        <div
          className="quick-card"
          onClick={() => navigate("/cadastrar-produto")}
        >
          <span>➕</span>
          <h3>Novo Produto</h3>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate(`/store/${id}/admin/produtos`)}
        >
          <span>📦</span>
          <h3>Produtos</h3>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate(`/store/${id}/pedidos`)}
        >
          <span>🛒</span>
          <h3>Pedidos</h3>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate(`/editar-loja/${id}`)}
        >
          <span>🏪</span>
          <h3>Editar Loja</h3>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate("/atualizar-perfil")}
        >
          <span>👤</span>
          <h3>Perfil</h3>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate("/chats")}
        >
          <span>💬</span>
          <h3>Chats</h3>
        </div>

      </div>

      {/* GRÁFICO VENDAS */}
      <div className="section chart-section">

        <div className="section-header">
          <h2>📈 Vendas dos últimos 7 dias</h2>
        </div>

        <div className="chart-container">

          <ResponsiveContainer width="100%" height={320}>

            <LineChart
              data={resumo.vendasPorDia || []}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 0
              }}
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

      {/* GRÁFICO PEDIDOS */}
      <div className="section chart-section">

        <div className="section-header">
          <h2>🛒 Pedidos por dia (tempo real)</h2>
        </div>

        <div className="chart-container">

          <ResponsiveContainer width="100%" height={300}>

            <LineChart
              data={pedidosPorDia}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 0
              }}
            >

              <XAxis dataKey="data" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
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

          {resumo.topProdutos?.length === 0 ? (

            <p>Nenhum produto vendido ainda.</p>

          ) : (

            <ul className="product-list">

              {resumo.topProdutos?.map((p) => (

                <li
                  key={p.id}
                  className="product-item"
                >

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

          {resumo.estoqueBaixo?.length === 0 ? (

            <p>Estoque OK 👍</p>

          ) : (

            <ul className="product-list">

              {resumo.estoqueBaixo?.map((p) => (

                <li
                  key={p.id}
                  className="product-item"
                >

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