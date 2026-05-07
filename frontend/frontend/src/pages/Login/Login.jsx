import { useState } from "react";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function handleLogin(e) {

  e.preventDefault();

  try {

    const resposta = await fetch("http://localhost:3000/api/login", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username,
        password
      })

    });

    const dados = await resposta.json();

    if (resposta.ok) {

      localStorage.setItem("token", dados.token);

      fetch("http://localhost:3000/api/minha-loja", {

        headers: {
          Authorization: `Bearer ${dados.token}`
        }

      })
      .then(res => res.json())
      .then(loja => {

        if(loja.existe){

          window.location.href = "/";

        } else {

          window.location.href = "/cadastrar-loja";

        }

      });

    } else {

      setMensagem(dados.error);

    }

  } catch (err) {

    setMensagem("Erro no servidor");

  }

}

  return (
    <div className="container-geral">

    <div className="login-container">
      <h2>Economica</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button>Entrar</button>
      </form>

      <p>{mensagem}</p>
    </div>
    </div>
  );
}

export default Login;