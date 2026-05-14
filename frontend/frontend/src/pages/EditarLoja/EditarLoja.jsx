import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditarLoja.css";

function EditarLoja(){

    const { id } = useParams();

    const navigate = useNavigate();

    const [loja, setLoja] = useState(null);

    useEffect(() => {

        fetch(`http://localhost:3000/api/stores/${id}`)
        .then(res => res.json())
        .then(data => setLoja(data));

    }, [id]);

    if(!loja){
        return <p>Carregando...</p>;
    }

    const salvar = async () => {

        const token = localStorage.getItem("token");

        const res = await fetch(
            `http://localhost:3000/api/stores/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(loja)
            }
        );

        if(!res.ok){
            alert("Erro ao salvar");
            return;
        }

        alert("Loja atualizada!");

    };

    return(

        <div className="edit-loja-page">

            <button
                className="btn-back"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button>

            <div className="edit-loja-card">

                <h1>Editar Loja</h1>

                <div className="form-group">

                    <label>Nome da Loja</label>

                    <input
                        value={loja.nome || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                nome: e.target.value
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Descrição</label>

                    <textarea
                        value={loja.descricao || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                descricao: e.target.value
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Horário Abertura</label>

                    <input
                        type="time"
                        value={loja.horario_abertura || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                horario_abertura: e.target.value
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Horário Fechamento</label>

                    <input
                        type="time"
                        value={loja.horario_fechamento || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                horario_fechamento: e.target.value
                            })
                        }
                    />

                </div>

                <button
                    className="btn-save"
                    onClick={salvar}
                >
                    Salvar Loja
                </button>

            </div>

        </div>

    );

}

export default EditarLoja;