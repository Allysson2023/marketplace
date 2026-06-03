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
    const [mostrarModal, setMostrarModal] = useState(false);

    const abrirConfirmacao = (e) => {
    e.preventDefault();

    setErro("");

    if (!username) {
        setErro("Preencha o usuário");
        return;
    }

    setMostrarModal(true);
};


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

    const atualizar = async () => {

    setErro("");
    setSucesso("");

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

        setSucesso("Dados atualizados com sucesso!");

        localStorage.removeItem("token");

        setTimeout(() => {
            navigate("/login");
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
                onSubmit={abrirConfirmacao}
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

            {
    mostrarModal && (
        <div className="modal-overlay">
            <div className="modal-confirmacao">

                <h3>Confirmar Alteração</h3>

                <p>
                    Tem certeza que deseja atualizar seus dados?
                    Você precisará fazer login novamente.
                </p>

                <div className="modal-botoes">

                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={() => setMostrarModal(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="btn-confirmar"
                        onClick={() => {
                            setMostrarModal(false);
                            atualizar();
                        }}
                    >
                        Confirmar
                    </button>

                </div>

            </div>
        </div>
    )
}


        </div>

    );
}

export default AtualizarCliente;