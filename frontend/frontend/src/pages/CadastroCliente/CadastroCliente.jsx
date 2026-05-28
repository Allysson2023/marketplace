import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastroCliente.css";

function CadastroCliente() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const cadastrar = async (e) => {

        e.preventDefault();

        if (!username || !password) {

            alert("Preencha todos os campos");

            return;

        }

        try {

            setLoading(true);

            const res = await fetch(
                "http://localhost:3000/api/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {

                alert(data.error || "Erro ao criar conta");

                return;

            }

            alert("Conta criada com sucesso!");

            navigate("/login");

        } catch (err) {

            console.log(err);

            alert("Erro no servidor");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="cadastro-container">

            <form
                className="cadastro-form"
                onSubmit={cadastrar}
            >

                <h2>Criar Conta</h2>

                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button type="submit">

                    {loading
                        ? "Criando..."
                        : "Criar Conta"}

                </button>

                <span
                    className="link-login"
                    onClick={() => navigate("/login")}
                >
                    Já tenho conta
                </span>

            </form>

        </div>

    );

}

export default CadastroCliente;