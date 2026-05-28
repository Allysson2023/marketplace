const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "segredo_super");

        // 🔥 garante padrão de usuário
        req.user = {
            id: decoded.id,
            email: decoded.email,
            storeId: decoded.storeId // se existir no token
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
}

module.exports = authMiddleware;