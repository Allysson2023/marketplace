import { useEffect, useState } from "react";
import "./PainelPedidos.css";

function PainelPedidos() {

    const [pedidos, setPedidos] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {

        fetch("http://localhost:3000/api/loja/pedidos", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {

            console.log(data);

            if (Array.isArray(data)) {
                setPedidos(data);
            }

        })
        .catch(err => console.log(err));

    }, [token]);

    return (

        <div className="painel-container">

            <div className="topo-painel">

                <h1>Painel de Pedidos</h1>

                <p>
                    Gerencie os pedidos da sua loja
                </p>

            </div>

            <div className="cards-info">

                <div className="info-card">
                    <h2>{pedidos.length}</h2>
                    <span>Pedidos</span>
                </div>

                <div className="info-card">
                    <h2>
                        R$ {
                            pedidos
                            .reduce((acc, item) =>
                                acc + Number(item.total), 0
                            )
                            .toFixed(2)
                        }
                    </h2>

                    <span>Faturamento</span>
                </div>

            </div>

            <div className="lista-pedidos">

                {
                    pedidos.length === 0 ? (

                        <div className="sem-pedidos">

                            <h2>
                                Nenhum pedido encontrado
                            </h2>

                        </div>

                    ) : (

                        pedidos.map((pedido) => (

                            <div
                                className="card-pedido"
                                key={pedido.id}
                            >

                                <div className="pedido-topo">

                                    <div>

                                        <h2>
                                            Pedido #{pedido.id}
                                        </h2>

                                        <p>
                                            Cliente: {pedido.username}
                                        </p>

                                    </div>

                                    <span className={`status ${pedido.status}`}>
                                        {pedido.status}
                                    </span>

                                </div>

                                <div className="pedido-info">

                                    <p>
                                        Tipo:
                                        <strong>
                                            {" "}
                                            {pedido.tipo_pedido}
                                        </strong>
                                    </p>

                                    <p>
                                        Total:
                                        <strong>
                                            {" "}
                                            R$ {pedido.total}
                                        </strong>
                                    </p>

                                </div>

                                <div className="pedido-acoes">

                                    <button className="btn-aceitar">
                                        Aceitar
                                    </button>

                                    <button className="btn-recusar">
                                        Recusar
                                    </button>

                                </div>

                            </div>

                        ))

                    )
                }

            </div>

        </div>

    );

}

export default PainelPedidos;