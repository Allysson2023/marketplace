import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MinhasLojas.css";

function MinhasLojas() {

    const navigate = useNavigate();
    const [lojas, setLojas] = useState([]);

    useEffect(() => {
        carregarLojas();
    }, []);

    const carregarLojas = async () => {

        const resposta = await fetch(
            "http://localhost:3000/api/funcionario/minhas-lojas",
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const dados = await resposta.json();
        setLojas(dados);
    };

    // função simples para simular status da loja
    const isAberta = (loja) => {
        const agora = new Date();
        const hora = agora.getHours();

        const abertura = parseInt(loja.horario_abertura?.split(":")[0] || 0);
        const fechamento = parseInt(loja.horario_fechamento?.split(":")[0] || 24);

        return hora >= abertura && hora < fechamento;
    };

    return (
        <div className="minhas-lojas-container">

            <div className="topo-lojas">
                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <div>
                    <h1>Minhas Lojas</h1>
                    <p>Gerencie e acompanhe o desempenho das lojas cadastradas</p>
                </div>
            </div>

            <div className="lista-lojas">

                {lojas.map(loja => {

                    const aberta = isAberta(loja);

                    return (
                        <div key={loja.id} className="card-loja">

                            <div className="status-line">
                                <span className={aberta ? "status aberta" : "status fechada"}>
                                    {aberta ? "🟢 Aberta" : "🔴 Fechada"}
                                </span>

                                <span className="categoria">
                                    {loja.categoria}
                                </span>
                            </div>

                            <h2>{loja.nome}</h2>

                            <div className="info-loja">

                                <div className="box">
                                    <span>📦 Produtos</span>
                                    <strong>{loja.total_produtos}</strong>
                                </div>

                                <div className="box">
                                    <span>🛒 Pedidos</span>
                                    <strong>{loja.total_pedidos}</strong>
                                </div>

                                <div className="box destaque">
                                    <span>💰 Faturamento</span>
                                    <strong>
                                        R$ {Number(loja.faturamento).toFixed(2)}
                                    </strong>
                                </div>

                            </div>

                            <button
                                className="btn-analisar"
                                onClick={() => navigate(`/dashboard-loja/${loja.id}`)}
                            >
                                Ver Análise
                            </button>

                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default MinhasLojas;