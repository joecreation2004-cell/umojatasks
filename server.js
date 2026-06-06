const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const auth = require('./middleware/auth');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log("Erreur MongoDB :", err));

// INSCRIPTION
app.post('/register', async (req,res)=>{
    const hash = await bcrypt.hash(req.body.password,10);
    const code = Math.random().toString(36).substring(7);

    const user = new User({
        email:req.body.email,
        password:hash,
        referralCode:code,
        referredBy:req.body.ref
    });

    await user.save();

    if(req.body.ref){
        const ref = await User.findOne({referralCode:req.body.ref});
        if(ref){
            ref.balance += 2000;
            await ref.save();
        }
    }

    res.send({message:"Compte créé"});
});

// LOGIN
app.post('/login', async (req,res)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user) return res.send({error:"Utilisateur introuvable"});

    const valid = await bcrypt.compare(req.body.password,user.password);
    if(!valid) return res.send({error:"Mot de passe incorrect"});

    const token = jwt.sign({id:user._id},"SECRET123");

    res.send({token});
});

// DASHBOARD
app.get('/me', auth, async (req,res)=>{
    const user = await User.findById(req.user.id);
    res.send(user);
});

// TÂCHE VIDÉO
app.post('/task/video', auth, async (req,res)=>{
    const user = await User.findById(req.user.id);

    const now = new Date();
    if(user.lastVideo && (now - user.lastVideo) < 180000){
        return res.send({error:"Attends 3 min"});
    }

    user.balance += 2500;
    user.lastVideo = now;

    await user.save();
    res.send(user);
});

// RETRAIT
app.post('/withdraw', auth, async (req,res)=>{
    const user = await User.findById(req.user.id);

    if(user.balance < 50000){
        return res.send({error:"Minimum 50 000 FC"});
    }

    user.balance -= req.body.amount;

    await user.save();
    res.send({message:"Paiement en cours"});
});

app.listen(3000, ()=>console.log("PRO SERVER ON"));
