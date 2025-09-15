import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  }
  next();
};
