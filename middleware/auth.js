const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
    const token = req.headers['authorization'];
    if(!token) return res.send({error:"Accès refusé"});

    try{
        const decoded = jwt.verify(token, "SECRET123");
        req.user = decoded;
        next();
    }catch{
        res.send({error:"Token invalide"});
    }
}
