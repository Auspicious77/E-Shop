function checkAdmin(req, res, next) {
    if (req.auth && req.auth.isAdmin) {
        next();
    } else {
        return res.status(403).json({data: null, message: 'Access denied. Admins only.' });
    }
}

module.exports = checkAdmin;
