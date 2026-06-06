const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "photo-sharing-secret-key";

function authMiddleware(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
    next();
  } catch (err) {
    return response.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = authMiddleware;
