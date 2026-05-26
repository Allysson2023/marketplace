import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mensagens.css";

function Mensagens() {

  const [conversas, setConversas] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {

    fetch("http://localhost:3000/api/chat/cliente", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {

        console.log("CHAT CLIENTE:", data);

        setConversas(Array.isArray(data) ? data : []);

      })
      .catch(err => console.log(err));

  }, [token]);

  return (
    <div className="mensagens-container">

      <h2>📩 Minhas Conversas</h2>

      {conversas.length === 0 ? (
        <p>Nenhuma conversa ainda</p>
      ) : (
        conversas.map((c) => (

          <div
            key={c.chatId}
            className="chat-card"
            onClick={() =>
              navigate(`/chat/${c.chatId}/cliente`)
            }
          >

            <h3>
              {c.nomeLoja || `Loja #${c.loja_id}`}
            </h3>

            <p>
              {c.ultimaMensagem ||
                "Sem mensagens ainda"}
            </p>

          </div>

        ))
      )}

    </div>
  );
}

export default Mensagens;