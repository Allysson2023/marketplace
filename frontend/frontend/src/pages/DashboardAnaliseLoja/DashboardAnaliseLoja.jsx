import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DashboardAnaliseLoja.css";

function DashboardAnaliseLoja() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [dados, setDados] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {

        const resposta = await fetch(
            `http://localhost:3000/api/funcionario/loja-dashboard/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await resposta.json();
        setDados(data);
    };

    if (!dados) {
        return <div className="loading">Carregando análise...</div>;
    }

    return (
        <div className="dashboard-container">

            <button className="btn-voltar" onClick={() => navigate(-1)}>
                ← Voltar
            </button>

            <h1>📊 {dados.nome}</h1>

            <div className="cards">

                <div className="card">
                    <h3>💰 Faturamento</h3>
                    <p>R$ {dados.faturamento}</p>
                </div>

                <div className="card">
                    <h3>🛒 Pedidos</h3>
                    <p>{dados.total_pedidos}</p>
                </div>

                <div className="card">
                    <h3>📦 Produtos</h3>
                    <p>{dados.total_produtos}</p>
                </div>

                <div className="card">
                    <h3>📈 Ticket Médio</h3>
                    <p>
                        R$ {(dados.faturamento / (dados.total_pedidos || 1)).toFixed(2)}
                    </p>
                </div>

            </div>

            <div className="status">
                Status:
                <span className={dados.faturamento > 1000 ? "green" : "red"}>
                    {dados.faturamento > 1000 ? " 🟢 Boa" : " 🔴 Baixa"}
                </span>
            </div>

        </div>
    );
}

export default DashboardAnaliseLoja;