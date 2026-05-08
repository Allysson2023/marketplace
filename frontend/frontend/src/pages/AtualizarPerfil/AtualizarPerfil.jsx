import {useEffect, useState } from "react";
import "./AtualizarPerfil.css";

function AtualizarPerfil(){

    const [username, setUsername] = useState("");
    const [nomeLoja, setNomeLoja] = useState("");
    const [categoria, setCategoria] = useState("");
    const [mensagem, setMensagem] = useState("");
    const token = localStorage.getItem("token");

useEffect(() => {
    fetch("http://localhost:3000/api/profile", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        setUsername(data.username || "");
        setNomeLoja(data.nomeLoja || "");
        setCategoria(data.categoria || "");
    });
}, []);

    async function atualizarPerfil(e){

    e.preventDefault();

    const confirmar = window.confirm(
        "Tem certeza que deseja atualizar o perfil?"
    );

    if(!confirmar){
        return;
    }

    try{

        const resposta = await fetch(
            "http://localhost:3000/api/update-profile",
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    username,
                    nomeLoja,
                    categoria
                })

            }
        );

        const dados = await resposta.json();

        if(resposta.ok){

            alert("Perfil atualizado com sucesso!");

            localStorage.removeItem("token");

            window.location.href = "/login";

        }else{

            setMensagem(dados.error);

        }

    }catch(err){

        setMensagem("Erro no servidor");

    }

}

    return(

        <div className="perfil-container">
            <form
                className="perfil-form"
                onSubmit={atualizarPerfil}
            >
                <h2>Atualizar Perfil</h2>
                <input
                    type="text"
                    placeholder="Novo usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nome da loja"
                    value={nomeLoja}
                    onChange={(e) => setNomeLoja(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Categoria da loja"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                />
                <div className="botoes">

    <button type="submit">
        Atualizar
    </button>

    <button
        type="button"
        className="btn-voltar"
        onClick={() => window.location.href = "/"}
    >
        Voltar
    </button>

</div>
                <p>{mensagem}</p>
            </form>
        </div>
    );
}

export default AtualizarPerfil;