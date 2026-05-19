import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";

function ChatCliente() {

    const { chatId } = useParams();

    const [mensagem, setMensagem] = useState("");

    const [mensagens, setMensagens] = useState([]);

    const token = localStorage.getItem("token");



    // ENTRAR NO CHAT
    useEffect(() => {

        socket.emit("entrar_chat", chatId);

    }, [chatId]);




    // CARREGAR MENSAGENS
    useEffect(() => {

        fetch(`http://localhost:3000/api/chat/${chatId}/mensagens`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {

            setMensagens(data);
        });

    }, [chatId]);




    // RECEBER MENSAGEM TEMPO REAL
    useEffect(() => {

        socket.on("nova_mensagem", (novaMensagem) => {

            setMensagens((prev) => [...prev, novaMensagem]);
        });

        return () => {

            socket.off("nova_mensagem");
        };

    }, []);




    // ENVIAR MENSAGEM
    async function enviarMensagem() {

        if (!mensagem.trim()) return;

        const novaMensagem = {

            chatId: Number(chatId),
            mensagem,
            tipo: "texto",
            remetente_tipo: "cliente"
        };



        // SALVAR NO BANCO
        await fetch("http://localhost:3000/api/chat/mensagem", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                chat_id: chatId,
                mensagem,
                tipo: "texto",
                remetente_tipo: "cliente"
            })
        });




        // SOCKET TEMPO REAL
        socket.emit("enviar_mensagem", novaMensagem);




        setMensagem("");
    }




    return (

        <div>

            <h1>Chat Cliente</h1>




            <div>

                {mensagens.map((msg, index) => (

                    <div key={index}>

                        <strong>
                            {msg.remetente_tipo}
                        </strong>

                        <p>
                            {msg.mensagem}
                        </p>

                    </div>
                ))}

            </div>




            <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite..."
            />



            <button onClick={enviarMensagem}>
                Enviar
            </button>

        </div>
    );
}

export default ChatCliente;