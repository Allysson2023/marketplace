import { useNavigate } from "react-router-dom";
import "./FuncionarioDashboard.css";

function FuncionarioDashboard() {

  const navigate = useNavigate();

  return (
    <div className="funcionario-container">

      <div className="topo-dashboard">
        <button
          className="btn-voltarr"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <div>
          <h1>Painel do Funcionário</h1>
          <p>
            Gerencie lojas, acompanhe vendas e monitore o crescimento do marketplace.
          </p>
        </div>
      </div>

      <div className="resumo-dashboard">

        <div className="resumo-card">
          <h3>🏪 Lojas</h3>
          <span>0</span>
        </div>

        <div className="resumo-card">
          <h3>📦 Produtos</h3>
          <span>0</span>
        </div>

        <div className="resumo-card">
          <h3>💰 Vendas</h3>
          <span>R$ 0,00</span>
        </div>

        <div className="resumo-card">
          <h3>📈 Crescimento</h3>
          <span>0%</span>
        </div>

      </div>

      <div className="cards-dashboard">

        <div className="card-funcionario">
          <div className="icone-card">🏪</div>
          <h2>Minhas Lojas</h2>
          <p>
            Visualize todas as lojas cadastradas e acompanhe suas atividades.
          </p>
          <button
    onClick={() => navigate("/minhas-lojas")}
  >
    Visualizar
  </button>
        </div>

        <div className="card-funcionario"
        onClick={() => navigate("/cadastrar-loja")}>
          <div className="icone-card">➕</div>
          <h2>Cadastrar Loja</h2>
          <p>
            Crie novas lojas e configure seus limites de produtos.
          </p>
          <button>Cadastrar</button>
        </div>

        

        <div className="card-funcionario">
          <div className="icone-card">⭐</div>
          <h2>Top Lojas</h2>
          <p>
            Ranking das lojas com melhor desempenho no marketplace.
          </p>
          <button
            onClick={() => navigate("/top-lojas")}
          >
            Visualizar
            </button>
        </div>

      </div>

    </div>
  );
}

export default FuncionarioDashboard;