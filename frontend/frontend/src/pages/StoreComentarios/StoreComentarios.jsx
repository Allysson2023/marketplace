import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StoreComentarios.css";

function StoreComentarios() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [avaliacoesLoja, setAvaliacoesLoja] = useState([]);

    const [resumoAvaliacoes, setResumoAvaliacoes] = useState({
    media: 0,
    total: 0
});

    useEffect(() => {

        fetch(`http://localhost:3000/api/stores/${id}/comentarios`)
            .then(res => res.json())
            .then(data => {

                if (Array.isArray(data)) {
                    setAvaliacoesLoja(data);
                }

            })
            .catch(err => console.log(err));

    }, [id]);

    useEffect(() => {

    fetch(`http://localhost:3000/api/stores/${id}/avaliacoes`)
        .then(res => res.json())
        .then(data => {
            setResumoAvaliacoes(data);
        })
        .catch(err => console.log(err));

}, [id]);

    const formatarData = (data) => {

        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

    };

    return (
        <div className="storeReviewsPage">

            <div className="storeReviewsHeader">

                <button
                    className="storeReviewsBackBtn"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <div>
                    <h1 className="storeReviewsTitle">
                        Avaliações da Loja
                    </h1>

                    <p className="storeReviewsSubtitle">
                        Veja a opinião dos clientes
                    </p>
                </div>

            </div>

            <div className="storeReviewsSummary">

    <div className="storeReviewsScore">
        ⭐ {resumoAvaliacoes.media}
    </div>

    <div className="storeReviewsTotal">

        {resumoAvaliacoes.total}

        {resumoAvaliacoes.total === 1
            ? " avaliação"
            : " avaliações"}

    </div>

</div>

            {avaliacoesLoja.length === 0 ? (

                <div className="storeReviewsEmpty">

                    <div className="storeReviewsEmptyIcon">
                        ⭐
                    </div>

                    <h2>Nenhuma avaliação ainda</h2>

                    <p>
                        Esta loja ainda não recebeu avaliações.
                    </p>

                </div>

            ) : (

                <div className="storeReviewsList">

                    {avaliacoesLoja.map(avaliacao => (

                        <div
                            key={avaliacao.id}
                            className="storeReviewCard"
                        >

                            <div className="storeReviewTop">

                                <div>

                                    <h3 className="storeReviewUser">
                                        {avaliacao.username}
                                    </h3>

                                    <span className="storeReviewDate">
                                        {formatarData(avaliacao.created_at)}
                                    </span>

                                </div>

                                <div className="storeReviewStars">

                                    {"⭐".repeat(avaliacao.nota)}

                                </div>

                            </div>

                            <div className="storeReviewComment">

                                {avaliacao.comentario || "Sem comentário"}

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default StoreComentarios;