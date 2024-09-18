const jwt = require("jsonwebtoken");

const authMiddleware = {
  authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  },

  checkRole(roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  },

  checkAdminOrSelf(req, res, next) {
    if (req.user.role === "admin" || req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json({
        message: "Access denied. You can only delete your own account!",
      });
    }
  },
};

module.exports = authMiddleware;
