import { useState } from "react";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

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
      localStorage.setItem("user", JSON.stringify(dados.user));
      localStorage.setItem("lojaId", dados.user.loja_id);

      if (dados.user.tipo === "cliente") {

  window.location.href = "/";

} else {

  fetch("http://localhost:3000/api/minha-loja", {

    headers: {
      Authorization: `Bearer ${dados.token}`
    }

  })
  .then(res => res.json())
  .then(loja => {

    if (loja.existe) {

      window.location.href = "/";

    } else {

      window.location.href = "/cadastrar-loja";

    }

  });

}

    } else {

      setMensagemErro(dados.error);

    }

  } catch (err) {

    setMensagemErro("Erro no servidor");

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
{mensagemErro && (
  <div className="mensagem-erro">
    {mensagemErro}
  </div>
)}
        <button>Entrar</button>
      </form>

    </div>
    </div>
  );
}

export default Login;