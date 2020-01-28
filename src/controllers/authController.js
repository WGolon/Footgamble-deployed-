import User from '../models/user';
import jwt from 'jsonwebtoken';

export default {
        async register (req, res, next) {
        const { firstName, lastName, email, password, isPro, username} = req.body;
        const user = new User ({firstName, lastName, password, email,isPro, username});
        // Aby email i username byly unikatowe
        await User.findOne({email: email}) 
        .then( el => {
            if(!el){
                User.register(user, password)
                .then(el=>{
                    res.status(201).json({
                      message: 'User was succesfully created. Now log in.'});
                }) // passportlocalmongoose dodal ta metode, jest asynchroniczna bo sprawdza czy w 
                .catch(err=>{
                    res.status(400).json({
                        message: err.message
                    })
                })
            } else {
                res.status(400).json({
                    message: 'User with specified email is alredy registered'});
            }
        })
        .catch(err => {
            res.status(400).json({
                message: 'Something went wrong with registration'});
        })
    
    },

    async login (req, res, next) {
        const isPro = req.user.isPro;
        const isAdmin = req.user.isAdmin;
        const username = req.user.username;
        const token = jwt.sign({ id: req.user._id }, 'LdPQgZMB5wuet8q', {expiresIn: 5000});
        return res.send({token, username, isPro, isAdmin});
    },
}
