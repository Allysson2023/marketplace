import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PedidoStatus.css";

function PedidoStatus() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [pedido, setPedido] = useState(null);
    const [itens, setItens] = useState([]);

    const token = localStorage.getItem("token");

    // ===============================
    // CARREGAR PEDIDO
    // ===============================
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
        return <h2>Carregando...</h2>;
    }



    // ===============================
    // ABRIR CHAT (SEM MENSAGEM AUTOMÁTICA)
    // ===============================
    //function abrirChat() {

        // apenas abre o chat
    //    navigate(`/chat/${pedido.id}`);
    //}

    async function abrirChat() {

    try {

        const res = await fetch(
            "http://localhost:3000/api/chat/abrir",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    loja_id: pedido.loja_id
                })
            }
        );

        const data = await res.json();

        if (!data.chat_id) {
            alert("Erro ao abrir chat");
            return;
        }

        navigate(`/chat/${data.chat_id}`);

    } catch (err) {
        console.log(err);
    }
}



    return (

        <div className="pagina-pedido">

            <div className="topo-pedido">

                <button onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <h1>Pedido #{pedido.id}</h1>

                <h2>🏪 {pedido.loja_nome}</h2>
            </div>



            <div className="status-pedido">

                <h2>⏳ {pedido.status}</h2>

                <div className="botoes-contato">

    {/* WhatsApp (opcional mantém) */}
    {pedido.whatsapp && (
        <a
            className="btn-whatsapp"
            href={`https://wa.me/${pedido.whatsapp.replace(/\D/g, "")}?text=Olá,%20tenho%20uma%20dúvida%20sobre%20o%20pedido%20%23${pedido.id}`}
            target="_blank"
            rel="noreferrer"
        >
            💬 WhatsApp da Loja
        </a>
    )}

    {/* CHAT INTERNO */}
    <button
    className="btn-chat-interno"
    onClick={() => abrirChat()}
>
    💬 Falar com a Loja (Chat Interno)
</button>

</div>

                

            </div>



            <div className="info-entrega">

                <h2>📍 Informações do Pedido</h2>

                {pedido.tipo_pedido === "entrega" && pedido.dadosEntrega && (
                    <div className="card-entrega">

                        <p><b>Nome:</b> {pedido.dadosEntrega.nome}</p>
                        <p><b>Endereço:</b> {pedido.dadosEntrega.endereco}</p>
                        <p><b>Número:</b> {pedido.dadosEntrega.numero}</p>
                        <p><b>Bairro:</b> {pedido.dadosEntrega.bairro}</p>
                        <p><b>Pagamento:</b> {pedido.dadosEntrega.pagamento}</p>

                    </div>
                )}

                {pedido.tipo_pedido === "retirada" && pedido.dadosEntrega && (
                    <div className="card-entrega">

                        <p><b>Nome:</b> {pedido.dadosEntrega.nome}</p>
                        <p><b>CPF:</b> {pedido.dadosEntrega.cpf}</p>
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

                            <p>Quantidade: {item.quantidade}</p>

                            <span>R$ {item.preco}</span>

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