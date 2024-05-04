const {User, Applicant} = require('../models/schemas');

const get_adminUsers =  async (req, res) => {
    try {
      const user = req.session.user;
      const users = await User.find();

      res.render('admins/adminUsers', { title: "All Users", users: users, user });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


const get_authenticate = async (req, res) => {
  try {
      const user = req.session.user;
      const applicants = await Applicant.find();

      res.render('admins/authenticate', { title: "Applicants", applicants, user });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};


const post_acceptApplicant = async (req, res) => {
  try {
    const applicantID = req.body.applicantID;

    const applicant = await Applicant.findById(applicantID);
    const userId = applicant.user;

    // Update hostAuth
    await User.findByIdAndUpdate(userId, { hostAuth: true });

    // Delete applicant
    await Applicant.deleteOne({ _id: applicantID });

  
    res.redirect(`/admins/authenticate`);
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const post_rejectApplicant = async (req, res) => {
  try {
    const applicantID = req.body.applicantID;

    const applicant = await Applicant.findById(applicantID);
    const userId = applicant.user;

    // Delete applicant
    await Applicant.deleteOne({ _id: applicantID });

    res.redirect(`/admins/authenticate`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const delete_user = async (req, res) => {
    const userId = req.params.id;

    try {
        // Delete
        await User.findByIdAndDelete(userId);
        
        res.redirect(`/admins/adminUsers`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
  get_adminUsers,
  delete_user,
  get_authenticate,
  post_acceptApplicant,
  post_rejectApplicant
};