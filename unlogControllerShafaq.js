const {User, Admin, Applicant, Competition} = require('../models/schemas');
const timeutils = require('../timeutensils.js');


const get_index = (req, res)=>{
    res.render('index', {title: 'Welcome'});
};
  

const get_login = (req, res)=>{
    res.render('login', {title: 'Login'});
};
  

const get_signup = (req, res)=>{
    res.render('signup', {title: 'signup'});
};
  

const get_forgotpass = (req, res)=>{
    res.render('forgotpass', {title: 'Reset Password'});
};


const get_signout = (req, res) => {
    // Destroy the session to clear the user information
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error signing out');
        } else {
         
            res.redirect('/');
        }
    });
};


const post_login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        let authenticatedUser;
        if (!user) {
            authenticatedUser = await Admin.findOne({ email });
        } else {
            authenticatedUser = user;
        }

        if (!authenticatedUser) {
            return res.status(400).json({ error: 'User or admin not found' });
        }

        const isPasswordValid = (password === authenticatedUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        req.session.user = authenticatedUser;

        res.redirect('/competitions/home');

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

  
const post_signup = async (req, res) => {
    try {
        const { fullname, username, dob, email, password, confirmpassword, securityquestion, securityanswer } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const newUser = new User({
            fullname,
            username,
            email,
            password,
            dob,
            securityQuestion: {
                question: securityquestion,
                answer: securityanswer
            }
        });


        await newUser.save();

        res.redirect('/login');

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const post_resetPassword = async (req, res) => {
    try {
        const { email, securityquestion, securityanswer, firsttry, secondtry } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

       
        if (user.securityQuestion.question !== securityquestion || user.securityQuestion.answer !== securityanswer) {
            return res.status(400).json({ error: 'Incorrect security question or answer' });
        }

        if (firsttry !== secondtry) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Update the user's password
        user.password = firsttry;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};






module.exports = {
    get_index,
    get_login,
    get_signup,
    get_forgotpass,
    get_signout, 
    post_signup,
    post_login,
    post_resetPassword,

};