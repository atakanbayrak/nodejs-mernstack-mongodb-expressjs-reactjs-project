const AuthSchema = require('../models/auth.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const register = async(req,res) => {
    try {
        const {username, password,email} = req.body
        const emailFilter = {email:email}
        const emailControl = await AuthSchema.findOne(emailFilter)

        const usernameFilter = {username:username}
        const usernameControl = await AuthSchema.findOne(usernameFilter)

        console.log(emailControl)
        console.log(usernameControl)
        if(emailControl){
            return res.status(500).json({msg:"Böyle bir email sisteme zaten kayıtlı"})
        }

        if(usernameControl){
            return res.status(500).json({msg:"Bu kullanıcı adı daha önce alınmış"})
        }
        
        if(password.length < 6){
            return res.status(500).json({msg:"Şifreniz 6 karakterden küçük olmamalı"})
        }

        if(!isEmail(email)){
            return res.status(500).json({msg:"Mail formatı dışında bir email girildi"})
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = await AuthSchema.create({username, email, password:passwordHash})

        const token = jwt.sign({id: newUser._id}, "SECRET_KEY", {expiresIn: '1h'})

        res.status(201).json({
            status:"OK",
            newUser,
            token
        })

        
    } catch (error) {
        return res.status(500).json({msg:error.message})
    }
}

const login = async(req,res) => {
    try {
        const {email,password} = req.body
        const filter = {email:email}
        const user = await AuthSchema.findOne(filter)

        if(!user){
            return res.status(500).json({msg:"Böyle bir kullanıcı yok"})
        }

        const passwordCompare = await bcrypt.compare(password, user.password)

        if(!passwordCompare){
            return res.status(500).json({msg:"Girilen şifre yanlış"})  
        }

        const token = jwt.sign({id: user._id}, "SECRET_KEY", {expiresIn: '1h'})

        res.status(200).json({
            status:"OK",
            user,
            token
        })
    } catch (error) {
        return res.status(500).json({msg:error.message})
    }
}


function isEmail(emailAdress){
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if(emailAdress.match(regex)){
        return true
    }
    else {
        return false
    }
}

module.exports = {register,login}