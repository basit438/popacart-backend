const roleMiddleware = (...alowRoles) => (req, res, next) => {
  if (alowRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json(
      { 
        success: false,
        message: "Access denied" });
  }
};

export default roleMiddleware;