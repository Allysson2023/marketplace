import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AtualizarCliente.css";

function AtualizarCliente() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        buscarCliente();
    }, []);

    const buscarCliente = async () => {

        try {

            const token = localStorage.getItem("token");

const res = await fetch(
    `http://localhost:3000/api/users/${id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

            const data = await res.json();

            if (!res.ok) {
                setErro("Cliente não encontrado");
                return;
            }

            setUsername(data.username);

        } catch {
            setErro("Erro ao carregar cliente");
        } finally {
            setCarregando(false);
        }
    };

    const atualizar = async (e) => {

        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!username) {
            setErro("Preencha o usuário");
            return;
        }

        try {

            setLoading(true);

            const body = {
                username
            };

            if (password.trim()) {
                body.password = password;
            }

            const token = localStorage.getItem("token");

const res = await fetch(
    `http://localhost:3000/api/users/${id}`,
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    }
);

            const data = await res.json();

            if (!res.ok) {
                setErro(data.error || "Erro ao atualizar");
                return;
            }

            setSucesso("Cliente atualizado com sucesso!");

            setTimeout(() => {
                navigate("/clientes");
            }, 1200);

        } catch {

            setErro("Erro no servidor");

        } finally {

            setLoading(false);

        }
    };

    if (carregando) {
        return (
            <div className="atualizar-container">
                <div className="atualizar-form">
                    <h2>Carregando...</h2>
                </div>
            </div>
        );
    }

    return (

        <div className="atualizar-container">

            <form
                className="atualizar-form"
                onSubmit={atualizar}
            >

                <h2>Atualizar Cliente</h2>

                <p className="atualizar-subtitulo">
                    Atualize os dados da conta.
                </p>

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
                    placeholder="Nova senha (opcional)"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                {erro &&
                    <div className="msg-erro">
                        {erro}
                    </div>
                }

                {sucesso &&
                    <div className="msg-sucesso">
                        {sucesso}
                    </div>
                }

                <button type="submit">

                    {loading
                        ? "Salvando..."
                        : "Salvar Alterações"}

                </button>

                <span
                    className="link-voltar"
                    onClick={() => navigate(-1)}
                >
                    Voltar
                </span>

            </form>

        </div>

    );
}

export default AtualizarCliente;