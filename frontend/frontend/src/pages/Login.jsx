import { useState } from "react";

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

                setMensagem("Login realizado com sucesso!");

                window.location.reload();
            } else {
                setMensagem(dados.error || "Erro no loogin");
            }
        } catch (erro) {
            console.error(erro);
            setMensagem("Erro ao conectar com servidor");
        }
    }

    return(
        <div style={{ textAlign: "center", marginTop: "100px"}}>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input 
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                <br /><br />

                <input 
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <br /><br />

                <button type="submit"> Entra</button>

            </form>
            <p>{mensagem}</p>
        </div>
    );

}
export default Login;