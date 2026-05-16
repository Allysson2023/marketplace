import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminPedido.css";

function AdminPedido() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [pedido, setPedido] = useState(null);
    const [itens, setItens] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {

        fetch(`http://localhost:3000/api/pedidos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {

            setPedido(data.pedido);
            setItens(data.itens);

        })
        .catch(err => console.log(err));

    }, [id, token]);

    async function atualizarStatus(status) {

        try {

            const res = await fetch(`http://localhost:3000/api/pedidos/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setPedido(prev => ({
                ...prev,
                status
            }));

        } catch (err) {
            console.log(err);
        }

    }

    if (!pedido) {
        return <h1>Carregando...</h1>;
    }

    return (

        <div className="admin-pedido">

            <div className="topo-admin">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <div>

                    <h1>Pedido #{pedido.id}</h1>

                    <span className={`status ${pedido.status}`}>
                        {pedido.status}
                    </span>

                </div>

            </div>

            <div className="grid-admin">

                <div className="card-admin">

                    <h2>Cliente</h2>

                    <p>
                        <strong>Nome:</strong> {pedido.username}
                    </p>

                    {pedido.dadosEntrega && (
                        <>
                            <p>
                                <strong>Telefone:</strong> {pedido.dadosEntrega.telefone}
                            </p>

                            <p>
                                <strong>Pagamento:</strong> {pedido.dadosEntrega.pagamento}
                            </p>
                        </>
                    )}

                </div>

                <div className="card-admin">

                    <h2>Entrega</h2>

                    {pedido.tipo_pedido === "entrega" && pedido.dadosEntrega && (

                        <>
                            <p>
                                <strong>Endereço:</strong> {pedido.dadosEntrega.endereco}
                            </p>

                            <p>
                                <strong>Número:</strong> {pedido.dadosEntrega.numero}
                            </p>

                            <p>
                                <strong>Bairro:</strong> {pedido.dadosEntrega.bairro}
                            </p>
                        </>

                    )}

                    {pedido.tipo_pedido === "retirada" && (

                        <p>
                            Cliente vai retirar na loja
                        </p>

                    )}

                </div>

            </div>

            <div className="produtos-admin">

                <h2>Produtos do Pedido</h2>

                {itens.map(item => (

                    <div
                        key={item.id}
                        className="produto-item"
                    >

                        <img
                            src={`http://localhost:3000/uploads/produtos/${item.imagem}`}
                            alt={item.nome}
                        />

                        <div>

                            <h3>{item.nome}</h3>

                            <p>
                                Quantidade: {item.quantidade}
                            </p>

                            <span>
                                R$ {item.preco}
                            </span>

                        </div>

                    </div>

                ))}

            </div>

            <div className="acoes-status">

                <button
                    className="btn-status aceito"
                    onClick={() => atualizarStatus("aceito")}
                >
                    Aceitar
                </button>

                <button
                    className="btn-status separacao"
                    onClick={() => atualizarStatus("separacao")}
                >
                    Em Separação
                </button>

                <button
                    className="btn-status rota"
                    onClick={() => atualizarStatus("rota")}
                >
                    Em Rota
                </button>

                <button
                    className="btn-status finalizado"
                    onClick={() => atualizarStatus("finalizado")}
                >
                    Finalizar
                </button>

                <button
                    className="btn-status recusado"
                    onClick={() => atualizarStatus("recusado")}
                >
                    Recusar
                </button>

            </div>

            <div className="footer-admin">

                <h2>
                    Total: R$ {pedido.total}
                </h2>

            </div>

        </div>

    );

}

export default AdminPedido;