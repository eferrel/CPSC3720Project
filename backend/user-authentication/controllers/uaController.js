// Controller handles all user-authentication operations (handling logins, registrations,
// and logouts. Connects to the user-authentication module layer for database access and returns structured
// JSON responsees to the routes.


// Requirements
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { connectToDatabase, queryFullDatabase, createDatabaseTable, addUser, getUser, verifyPassword } = require('../models/uaModel.js');

// Constants used for jwt
const EXPIRATION_VAL = "30m";
const JWT_VAL = "waffle-house";

// Handles request to retrieve users from database and returns as JSON response
// Params: req - the request object
// Params: res - response object to send current user
// Return: None because responds with server status
// Side Effects: Calls getUser() and sends JSON
const userRegister = async (req, res) => {

    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "Email and password required to register for TigerTix."})
        }

        const alreadyExists = await getUser(email);
        if (alreadyExists) {
            return res.status(400).json({message: "You've already registered for TigerTix with the entered credentials!"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await addUser(email, hashedPassword); // maybe need to await?

        return res.status(201).json({message: "You've successfully registered for TigerTix!"});

    } catch (err) {
        console.error("Error detected in userRegister: ", err);
        return res.status(500).json({message: "Server error"})
    }
};

// Handles request to login to the website. Function extracts user's email and password, calls verifyPassword() to 
// validate login, and creates a valid jwt token to be used for authentication.
// Params: req - request object to contain the email and password of the given user
// Params: res - response object to send success or error
// Return: None because responds directly with status
// Side Effects: Creates a jsonwebtoken, stores it in a cookie, and sends JSON response.
const userLogin = async (req, res) => {

    try {
        const {email, password} = req.body;

        const user = await verifyPassword(email, password);

        if (!user) {
            return res.status(400).json({ message: "You entered an invalid email or password." });
        }

        const token = jwt.sign(
            {id: user.id, email: user.email},
            JWT_VAL,
            {expiresIn : EXPIRATION_VAL}
        );

        res.cookie("userAuthenticationToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 60 * 1000
        });

        return res.json({message: "TigerTix login successful!"});




    } catch (err) {
        console.error("Login error: ", err);
        return res.status(500).json({message: "Server error with logging in"});
    }
  
};


// Handles request to logout of the website. 
// Params: req - request object to contain the email and password of the given user
// Params: res - response object to send success or error
// Return: None because responds directly with status
// Side Effects: Clears cookies
const userLogout = async (req, res) => {
    res.clearCookie("userAuthenticationToken");
    res.json({message: "Logged out of TigerTix successfully!"});
};


// Handles validating secure events with a valid jsonwebtoken.
// Params: req - request object to contain the email and password of the given user
// Params: res - response object to send success or error
// Params: next - object allowing express to go on to the next function called in the app.post request
// Return: None because responds directly with status
// Side Effects: Gets the current token from stored cookies, verifies that against cookie for current user
const verifyUsingJWT = async (req, res, next) => {
    const token = req.cookies?.userAuthenticationToken;

    if (!token) {
        return res.status(401).json({message: "Action is not currently allowed via failed authentication."});
    }

    try {
        const decodedUser = jwt.verify(token, JWT_VAL);
        req.user = decodedUser;
        return next();

    } catch (err) {
        return res.status(401).json({message: "User's JWT token either invalid or expired."});
    }

};

module.exports = { userRegister, userLogin, userLogout, verifyUsingJWT }