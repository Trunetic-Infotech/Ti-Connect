import jwt from "jsonwebtoken";

// Middleware of Admin Authentication

export const isAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      if (decoded.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
