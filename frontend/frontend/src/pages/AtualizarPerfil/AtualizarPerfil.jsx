import {useEffect, useState } from "react";
import "./AtualizarPerfil.css";

function AtualizarPerfil(){

    const [username, setUsername] = useState("");
    const [nomeLoja, setNomeLoja] = useState("");
    const [categoria, setCategoria] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [imagem, setImagem] = useState(null);
    const [imagemAtual, setImagemAtual] = useState("");
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
        setImagemAtual(data.imagem || "");
    });
}, []);

useEffect(() => {

    fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

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

        const formData = new FormData();

        formData.append("username", username);
        formData.append("nomeLoja", nomeLoja);
        formData.append("categoria", categoria);

        if(imagem){
            formData.append("imagem", imagem);
        }

        const resposta = await fetch(
            "http://localhost:3000/api/update-profile",
            {

                method: "PUT",

                headers: {
                    Authorization: `Bearer ${token}`
                },

                body: formData

            }
        );

        const dados = await resposta.json();

        if(resposta.ok){

            alert("Perfil Atualizado com sucesso!")

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

                {imagemAtual && (

    <img
        className="preview-perfil"
        src={`http://localhost:3000/uploads/lojas/${imagemAtual}`}
        alt="Perfil"
    />

)}

                <input
                    type="file"
                    onChange={(e) => setImagem(e.target.files[0])}
                />

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
                <select value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}>

                <option value="">
                        Escolha uma categoria
                </option>

                {categorias.map(cat => (

                <option
                    key={cat.id}
                    value={cat.nome}
                >
                {cat.nome}
                </option>         
    ))}
    

        </select>
                <div className="botoes">

        <button
            type="button"
            className="btn-voltar"
            onClick={() => window.location.href = "/"} >
            Voltar
        </button>

        <button type="submit">
            Atualizar
        </button>


</div>
                <p>{mensagem}</p>
            </form>
        </div>
    );
}

export default AtualizarPerfil;