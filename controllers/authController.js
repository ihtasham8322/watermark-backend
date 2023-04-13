const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const cookies = req.cookies;
    const { email, password: pwd } = req.body;

    if (!email || !pwd) return res.status(400).json({ 'message': 'Email and password are required.' });
    
    const foundUser = await User.findOne({ email: email }).exec();
  
    if (!foundUser) return res.status(404).json({
        'message': 'User not found.'
    }); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean);
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "email": foundUser.email,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10h' }
        );
        console.log("accessToken",accessToken)
        const newRefreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '15s' }
        );

        // Changed to let keyword
        let newRefreshTokenArray =
            !cookies?.jwt
                ? foundUser.refreshToken
                : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

        if (cookies?.jwt) {

            /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
            const refreshToken = cookies.jwt;
            console.log("refreshToken",refreshToken)
            const foundToken = await User.findOne({ refreshToken }).exec();

            // Detected refresh token reuse!
            if (!foundToken) {
                // clear out ALL previous refresh tokens
                newRefreshTokenArray = [];
            }

            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        }

        // Saving refreshToken with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        // Send authorization roles and access token to user
        foundUser.password = undefined;
        foundUser.refreshToken = undefined;

        res.json({ message: "Login Successfull", user: foundUser, token: { accessToken, refreshToken: newRefreshToken } });

    } else {
        res.status(401).json({ 'message': 'Invalid credentials.' });
    }
}

const handleNewUser = async (req, res) => {
 
    const { email, password: pwd } = req.body;
    if (!email || !pwd) return res.status(400).json({ 'message': 'Email and password are required.' });
    
    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ email: email }).exec();
     console.log("duplicate",duplicate)
    if (duplicate) return res.sendStatus(409); //Conflict 
    
    try {
         console.log("result",pwd)
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
      
        //create and store the new user
        const result = await User.create({
            ...req.body,
            password: hashedPwd,
        });
         

        res.status(201).json({ 'success': `New user ${email} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const foundUser = await User.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); //Forbidden
                // Delete refresh tokens of hacked user
                const hackedUser = await User.findOne({ username: decoded.username }).exec();
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
            }
        )
        return res.sendStatus(403); //Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                // expired refresh token
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

            // Refresh token was still valid
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s' }
            );

            const newRefreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '15s' }
            );
            // Saving refreshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();

            // Creates Secure Cookie with refresh token
            res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            res.json({ accessToken })
        }
    );
}

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);;
    const result = await foundUser.save();
    console.log(result);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

module.exports = { handleLogin, handleNewUser, handleRefreshToken, handleLogout };