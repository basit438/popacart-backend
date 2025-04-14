import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaching user info to request object
    next(); // proceed to the next middleware or controller
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}