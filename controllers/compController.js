const delete_comp = async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCompetition = await Competition.findById(id);
  
      if (!deletedCompetition) {
        res.status(404).render('404', { title: "Competition not found" });
      }
  
      // Find all users who have the competition ID in their competitions field
      const usersToUpdate = await User.find({ competitions: id });
  
      // Remove the competition ID from each user's competitions field
      const updateUserPromises = usersToUpdate.map(async (user) => {
        user.competitions = user.competitions.filter(compId => compId.toString() !== id);
        await user.save();
      });
  
      // Wait for all users to be updated
      await Promise.all(updateUserPromises);
  
      // Delete the competition document
      await Competition.findByIdAndDelete(id);
  
      res.json({ redirect: '/competitions/home' });
      // res.redirect('/competitions/home');
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  