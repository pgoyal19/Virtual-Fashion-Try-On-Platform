const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).redirect('/auth/login');
    }
    next();
};

module.exports = auth; 