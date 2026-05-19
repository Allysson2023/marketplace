import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PedidoStatus.css";

function PedidoStatus() {

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

    if (!pedido) {
  return <h2>Carregando...</h2>
}

    const infoPedido = pedido;

    return (

        <div className="pagina-pedido">

            <div className="topo-pedido">

                <button onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <h1>Pedido #{infoPedido.id}</h1>

            </div>

            <div className="status-pedido">

    <h2>
        ⏳ {infoPedido.status}
    </h2>




    <button
        className="btn-chat-loja"
        onClick={() => navigate(`/chat/${pedido.id}`)}
    >
        💬 Falar com Loja
    </button>

</div>
            <div className="info-entrega">

    <h2>📍 Informações do Pedido</h2>

    {infoPedido.tipo_pedido === "entrega" && infoPedido.dadosEntrega && (
        <div className="card-entrega">

            <p><b>Nome:</b> {infoPedido.dadosEntrega.nome}</p>

            <p><b>Endereço:</b> {infoPedido.dadosEntrega.endereco}</p>

            <p><b>Número:</b> {infoPedido.dadosEntrega.numero}</p>

            <p><b>Bairro:</b> {infoPedido.dadosEntrega.bairro}</p>

            <p><b>Pagamento:</b> {infoPedido.dadosEntrega.pagamento}</p>

        </div>
    )}

    {infoPedido.tipo_pedido === "retirada" && infoPedido.dadosEntrega && (
        <div className="card-entrega">

            <p><b>Nome:</b> {infoPedido.dadosEntrega.nome}</p>

            <p><b>CPF:</b> {infoPedido.dadosEntrega.cpf}</p>

            <p><b>Tipo:</b> Retirada na loja</p>

        </div>
    )}

</div>

            <div className="lista-produtos">

                {itens.map(item => (

                    <div
                        key={`${item.id}-${item.nome}`}
                        className="card-produto-pedido"
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

            <div className="footer-pedido">

                <h2>Total: R$ {pedido.total}</h2>

            </div>

        </div>

    );

}

export default PedidoStatus;