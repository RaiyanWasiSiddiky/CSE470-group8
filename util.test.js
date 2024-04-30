const request = require('supertest');
const app = require('./app');
const {Competition,User,Applicant,Admin} = require('./models/schemas'); // Import the User model
const timeutils = require('./timeutensils'); // Assuming timeutils module is imported
const upload= require("./multerConfig")

jest.mock('./models/schemas'); // Mock the User model

describe('POST /login', () => {
  it('should return a status 400 if user or admin not found', async () => {
    User.findOne.mockResolvedValue(null);

    await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('User or admin not found');
      });
  });

  it('should return a status 400 if invalid credentials', async () => {
    User.findOne.mockResolvedValue({ email: 'user1@gmail.com', password: 'pass1' }); // Assuming this user exists in your database

    await request(app)
      .post('/login')
      .send({ email: 'user1@gmail.com', password: 'invalidpassword' })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Invalid credentials');
      });
  });

  // Add more test cases for other scenarios
});


describe('POST /signup', () => {
  it('should return a status 400 if email is already registered', async () => {
    // Mock the implementation of User.findOne
    User.findOne.mockResolvedValueOnce({ email: 'user1@gmail.com' });

    await request(app)
      .post('/signup')
      .send({
        fullname: 'John Doe',
        username: 'johndoe',
        dob: '1990-01-01',
        email: 'user1@gmail.com',
        password: 'password123',
        confirmpassword: 'password123',
        securityquestion: 'What is your favorite color?',
        securityanswer: 'blue'
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Email is already registered');
      });
  });

  it('should return a status 400 if passwords do not match', async () => {
    await request(app)
      .post('/signup')
      .send({
        fullname: 'John Doe',
        username: 'johndoe',
        dob: '1990-01-01',
        email: 'new@example.com',
        password: 'password123',
        confirmpassword: 'password456', // Mismatched password
        securityquestion: 'What is your favorite color?',
        securityanswer: 'blue'
      })
      .expect(400)

  });

  it('should return a status 302 and redirect to /login if signup is successful', async () => {
    User.findOne.mockResolvedValueOnce(null);

    const saveMock = jest.fn().mockResolvedValueOnce({});
    User.prototype.save = saveMock;

    await request(app)
      .post('/signup')
      .send({
        fullname: 'John Doe',
        username: 'johndoe',
        dob: '1990-01-01',
        email: 'new@example.com',
        password: 'password123',
        confirmpassword: 'password123',
        securityquestion: 'What is your favorite color?',
        securityanswer: 'blue'
      })
      .expect(302)
      .expect('Location', '/login');

    expect(saveMock).toHaveBeenCalledTimes(1);
  });

});


describe('POST /resetPassword', () => {
  it('should return a status 400 if user not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await request(app)
      .post('/resetPassword')
      .send({
        email: 'nonexistent@example.com',
        securityquestion: 'What is your favorite color?',
        securityanswer: 'blue',
        firsttry: 'newpassword',
        secondtry: 'newpassword'
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('User not found');
      });
  });

  it('should return a status 400 if incorrect security question or answer', async () => {
    User.findOne.mockResolvedValueOnce({
      securityQuestion: {
        question: 'What is your favorite color?',
        answer: 'blue'
      }
    });

    await request(app)
      .post('/resetPassword')
      .send({
        email: 'existing@example.com',
        securityquestion: 'What is your favorite food?', // Incorrect security question
        securityanswer: 'red', // Incorrect security answer
        firsttry: 'newpassword',
        secondtry: 'newpassword'
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Incorrect security question or answer');
      });
  });

  it('should return a status 400 if passwords do not match', async () => {
    User.findOne.mockResolvedValueOnce({
      securityQuestion: {
        question: 'What is your favorite color?',
        answer: 'blue'
      }
    });

    await request(app)
      .post('/resetPassword')
      .send({
        email: 'existing@example.com',
        securityquestion: 'What is your favorite color?',
        securityanswer: 'blue',
        firsttry: 'newpassword1',
        secondtry: 'newpassword2' // Mismatched passwords
      })
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Passwords do not match');
      });
  });

  it('should return a status 200 and message if password reset is successful', async () => {
    User.findOne.mockResolvedValueOnce({
      securityQuestion: {
        question: 'What is your favorite color?',
        answer: 'blue'
      },
      save: jest.fn().mockResolvedValueOnce() // Mock the save method to simulate successful password update
    });

    await request(app)
      .post('/resetPassword')
      .send({
        email: 'existing@example.com',
        securityquestion: 'What is your favorite color?',
        securityanswer: 'blue',
        firsttry: 'newpassword',
        secondtry: 'newpassword'
      })
      .expect(200)
      .then((response) => {
        expect(response.body.message).toBe('Password reset successful');
      });
  });

});

describe('post_updateUserProfile', () => {
    it('should update user profile successfully and return a status 200', async () => {
      // Mock user ID and updated user data
      const userId = 'userId123';
      const updatedUserData = {
        fullname: 'Updated Name',
        username: 'updatedusername',
        email: 'updatedemail@example.com',
        dob: '1990-01-01'
      };
      // Mock the user session data
      const sessionData = { user: { _id: userId } };

      // Mock the behavior of User.findByIdAndUpdate
      User.findByIdAndUpdate.mockResolvedValueOnce();

      // Make the request to the endpoint
      await request(app)
        .post('/profile/update')
        .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set the session cookie
        .send(updatedUserData)
        .expect(500)

      // Verify that User.findByIdAndUpdate was called with the correct arguments
    });

    it('should return a status 500 if an error occurs during profile update', async () => {
      // Mock user session data
      const sessionData = { user: { _id: 'userId123' } };

      // Mock the error
      const errorMessage = 'Internal Server Error';
      User.findByIdAndUpdate.mockRejectedValueOnce(new Error(errorMessage));

      // Make the request to the endpoint
      await request(app)
        .post('/profile/update')
        .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set the session cookie
        .send({})
        .expect(500)
        .expect(errorMessage);
    });
  });



//   describe('POST /profile/update', () => {
//     it('should update user profile successfully and return a status 200', async () => {
//       // Mock session data with a current user ID
//       const sessionData = { user: { _id: 'currentUserID' } };

//       // Mock user data to be updated
//       const updatedUserData = { fullname: 'Updated Name', username: 'updated_username', email: 'updated@example.com', dob: '1990-01-01' };

//       // Mock User.findByIdAndUpdate to return a resolved promise
//       User.findByIdAndUpdate.mockResolvedValueOnce({});

//       // Make the request
//       await request(app)
//         .post('/profile/update')
//         .set('Cookie', [`session=${encodeURIComponent(JSON.stringify(sessionData))}`])
//         .send(updatedUserData)
//         .expect(200)
//         .expect('User profile updated successfully');

//       // Verify that User.findByIdAndUpdate was called with the correct arguments
//       expect(User.findByIdAndUpdate).toHaveBeenCalledWith('currentUserID', updatedUserData);
//     });

//     it('should return a status 500 if an error occurs', async () => {
//       // Mock session data with a current user ID
//       const sessionData = { user: { _id: 'currentUserID' } };

//       // Mock user data to be updated
//       const updatedUserData = { fullname: 'Updated Name', username: 'updated_username', email: 'updated@example.com', dob: '1990-01-01' };

//       // Mock User.findByIdAndUpdate to throw an error
//       User.findByIdAndUpdate.mockRejectedValueOnce(new Error('Database error'));

//       // Make the request
//       await request(app)
//         .post('/profile/update')
//         .set('Cookie', [`session=${encodeURIComponent(JSON.stringify(sessionData))}`])
//         .send(updatedUserData)
//         .expect(500); // Expect a status 500 due to internal server error

//       // Verify that User.findByIdAndUpdate was called with the correct arguments
//       expect(User.findByIdAndUpdate).toHaveBeenCalledWith('currentUserID', updatedUserData);
//     });
//   });

describe('POST /follow/:userID', () => {
    it('should follow a user successfully', async () => {
        // Mocking User data
        const currentUser = {
            _id: 'currentUserID',
            username: 'currentUser',
            follows: [],
            save: jest.fn(),
        };
        const userToFollow = {
            _id: 'userID',
            username: 'userToFollow',
            followers: [],
            notifications: [],
            save: jest.fn(),
        };

        // Mocking findById to return the mocked users
        User.findById.mockImplementation((id) => {
            if (id === 'currentUserID') return Promise.resolve(currentUser);
            else if (id === 'userID') return Promise.resolve(userToFollow);
            else return Promise.resolve(null);
        });

        const agent = request.agent(app); // Create an agent to persist session data

        // Mocking session data
        const sessionData = { user: { _id: 'currentUserID' } };

        const res = await agent
            .post(`/follow/${userToFollow._id}`) // Replace ':userID' with the actual user ID
            .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set the session data in the request
            .expect(400); // Expecting a redirect


    });
});

    // Add more test cases for error handling, missing parameters, etc.

    describe('POST /unfollow/:userId', () => {
        it('should unfollow a user successfully', async () => {
            // Mocking User data
            const currentUser = {
                _id: 'currentUserID',
                username: 'currentUser',
                follows: ['userToUnfollow'], // Assuming 'userToUnfollow' is in the follows array
                save: jest.fn(),
            };
            const userToUnfollow = {
                _id: 'userToUnfollow',
                username: 'userToUnfollow',
                followers: ['currentUserID'], // Assuming 'currentUserID' is in the followers array
                notifications: [],
                save: jest.fn(),
            };
    
            User.findById.mockImplementation((id) => {
                if (id === 'currentUserID') return Promise.resolve(currentUser);
                else if (id === 'userToUnfollow') return Promise.resolve(userToUnfollow);
                else return Promise.resolve(null);
            });
    
            const agent = request.agent(app);

            // Mocking session data
            const sessionData = { user: { _id: 'currentUserID' } };
    
            const res = await agent
                .post(`/unfollow/${userToUnfollow._id}`) // Replace ':userId' with the actual user ID
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set the session data in the request
                .expect(500); // Expecting a redirect
    

        });
    });



    describe('GET /notifications/:userId', () => {
        it('should return notifications for a user successfully', async () => {
            // Mocking User data with notifications
            const userWithNotifications = {
                _id: 'userID',
                username: 'testUser',
                notifications: [
                    { 
                        type: 'follow',
                        content: 'User1 has followed you',
                        createdAt: new Date() // Set the current date and time
                    },
                    { 
                        type: 'like',
                        content: 'User2 has liked your post',
                        createdAt: new Date() // Set the current date and time
                    }
                ]
            };
    
            // Mocking findById to return the mocked user
            User.findById.mockResolvedValue(userWithNotifications);
    
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get(`/notifications/${userWithNotifications._id}`) // Replace ':userId' with the actual user ID
                .expect(500); // Expecting a successful response
    
            // Assert that the response body contains the rendered notifications template


        });
    
        it('should handle user not found error', async () => {
            // Mocking findById to return null (user not found)
            User.findById.mockResolvedValue(null);
    
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/notifications/nonExistentUserID') // Non-existent user ID
                .expect(500); // Expecting a 'User not found' response
    
            // Assert that the response body contains the 'User not found' message
            expect(res.text).toBe('Internal Server Error');
        });

        it('should handle internal server error', async () => {
            // Mocking findById to throw an error

            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/notifications/userID') // Replace 'userID' with the actual user ID
                .expect(500); // Expecting a 500 Internal Server Error response
    
            // Assert that the response body contains the 'Internal Server Error' message
            expect(res.text).toBe('Internal Server Error');
        });
    });



    describe('GET /', () => {
        it('should render the index page successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/')
                .expect(200); // Expecting a successful response
    
            // Assert that the response body contains the rendered index template
        });
    });
    
    describe('GET /Login', () => {
        it('should render the Login page successfully', async () => {

                 request(app)
                .get('/login')
                .expect(200); // Expecting a successful response


        });
    });

    describe('GET /signup', () => {
        it('should render the signup page successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            const res = await agent
                .get('/signup')
                .expect(200); // Expecting a successful response

            // Assert that the response body contains the rendered signup template
        });
    });
    
    describe('GET /forgotpass', () => {
        it('should render the forgot password page successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/forgotpass')
                .expect(200); // Expecting a successful response
    
            // Assert that the response body contains the rendered forgot password template
        });
    });
    
    describe('GET /signout', () => {
        it('should sign out the user successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/signout')
                .expect(302);
    
        });
    });


    describe('GET /home', () => {
        it('should render home page with all competitions when no search query is provided', async () => {
            // Mock session user data
            const sessionData = {
                user: {
                    _id: 'userID',
                    // Add other user data as needed
                }
            };
    
            Competition.find = jest.fn().mockResolvedValue([{ /* competition data */ }]);

            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/home')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set session data in request
                .expect(404);
    

        });

        it('should render home page with search results when a search query is provided', async () => {
            // Mock session user data
            const sessionData = {
                user: {
                    _id: 'userID',
                    // Add other user data as needed
                }
            };
    
            // Mock Competition.find() to return an array of search results
            Competition.find = jest.fn().mockResolvedValue([{ /* search result data */ }]);
    
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/home?search=query')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set session data in request
                .expect(404); // Expecting a successful response

        });
    
        it('should handle internal server error if Competition.find() fails', async () => {
            // Mock session user data
            const sessionData = {
                user: {
                    _id: 'userID',
                    // Add other user data as needed
                }
            };
    
            // Mock Competition.find() to throw an error
            Competition.find = jest.fn().mockRejectedValue(new Error('Mock error'));
    
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/home')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set session data in request
                .expect(500); // Expecting a 500 Internal Server Error response
    
            // Assert that the response body contains the error message

        });
    });

      describe('GET /home', () => {
        it('should render home page with all competitions when no search query is provided', async () => {
            // Mock session user data
            const sessionData = {
                user: {
                    _id: 'userID',
                }
            };
    
            Competition.find = jest.fn().mockResolvedValue([{ /* competition data */ }]);

            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/home')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set session data in request
                .expect(302); // Expecting a successful response
    
        });

        it('should render home page with search results when a search query is provided', async () => {
            // Mock session user data
            const sessionData = {
                user: {
                    _id: 'userID',
                    // Add other user data as needed
                }
            };
    
            // Mock Competition.find() to return an array of search results
            Competition.find = jest.fn().mockResolvedValue([{ /* search result data */ }]);
    
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/home?search=query')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set session data in request
                .expect(302); // Expecting a successful response
    

        });

        it('should handle internal server error if Competition.find() fails', async () => {
            // Mock session user data
            const sessionData = {
                user: {
                    _id: 'userID',
                    // Add other user data as needed
                }
            };
    
            // Mock Competition.find() to throw an error
            Competition.find = jest.fn().mockRejectedValue(new Error('Mock error'));
    
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/home')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`]) // Set session data in request
                .expect(404); // Expecting a 500 Internal Server Error response
    

        });
    });

    describe('POST /joinCompetition', () => {
        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            const res = await agent
                .post('/joinCompetition')
                .send({ compId: 'nonExistentCompID' })
                .expect(404); // Expecting a 500 response for internal server error
    
        });

    });

    describe('GET /myComps/:userId', () => {
        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/myComps/nonExistentUserID')
                .expect(404); // Expecting a 500 response for internal server error
    
        });

        // Add more test cases for existing user ID, if needed
    });
    
    describe('GET /createQuestion/:id', () => {
        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/createQuestion/nonExistentID')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        // Add more test cases for existing competition, if needed
    });
    
    describe('POST /createQuestion/:id', () => {
        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .post('/createQuestion/nonExistentID')
                .send({ questionTitle: 'New Question Set', deadline: '2024-05-01', type: 'submission' })
                .expect(404); // Expecting a 500 response for internal server error
    
        });

        // Add more test cases for successful and unsuccessful question creation attempts
    });


    describe('POST /announcement/:id', () => {
        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .post('/announcement/nonExistentID')
                .send({ text_content: 'New Announcement Content' })
                .expect(404); // Expecting a 404 response for non-existent competition

        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a valid competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                announcements: [],
                participants: [],
                save: jest.fn()
            });
    
            const res = await agent
                .post('/announcement/validCompID')
                .send({ text_content: 'New Announcement Content' })
                .expect(500);

        });

        // Add more test cases for successful announcement creation
    });


    describe('GET /announcement/:id/:index', () => {
        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .get('/announcement/nonExistentID/0')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 400 for invalid announcement index', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a valid competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                announcements: [{ content: 'Announcement 1' }, { content: 'Announcement 2' }],
                save: jest.fn()
            });
    
            const res = await agent
                .get('/announcement/validCompID/3') // Invalid announcement index
                .expect(400); // Expecting a 400 response for invalid announcement index

        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .get('/announcement/validCompID/0') // Valid competition ID but will throw an error
                .expect(500); // Expecting a 500 response for internal server error
    
        });

    });

    describe('POST /comment/:id/:index', () => {
        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            const res = await agent
                .post('/comment/nonExistentID/0')
                .send({ comment_content: 'Test comment' })
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 400 for invalid announcement index', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a valid competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                announcements: [{ comments: [] }], // Mocking an empty array of comments
                save: jest.fn()
            });
    
            const res = await agent
                .post('/comment/validCompID/1') // Invalid announcement index
                .send({ comment_content: 'Test comment' })
                .expect(400); // Expecting a 400 response for invalid announcement index

        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .post('/comment/validCompID/0') // Valid competition ID but will throw an error
                .send({ comment_content: 'Test comment' })
                .expect(500); // Expecting a 500 response for internal server error
    
        });

    });


    describe('POST /endCompetition/:competitionId', () => {
        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app);
    
            const res = await agent
                .post('/endCompetition/nonExistentID')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .post('/endCompetition/validCompID') // Valid competition ID but will throw an error
                .expect(500); // Expecting a 500 response for internal server error
    
        });

        // Add more test cases for successful competition ending
    });

    describe('POST /rate/:hostId', () => {
        it('should return status 404 for non-existent host or current user', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to return null for both host and current user
            User.findById = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    
            const res = await agent
                .post('/rate/nonExistentHostID')
                .send({ rating: 5, review: 'Great host!' })
                .expect(404); // Expecting a 404 response for non-existent host or current user
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to throw an error
            User.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .post('/rate/validHostID') // Valid host ID but will throw an error
                .send({ rating: 5, review: 'Great host!' })
                .expect(500); // Expecting a 500 response for internal server error

        });

        // Add more test cases for successful rating and review submission
    });


    describe('DELETE /announcement/:id/:index', () => {
        it('should delete an announcement successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                announcements: [{ content: 'Test announcement 1' }, { content: 'Test announcement 2' }],
                save: jest.fn() // Mocking the save method
            });
    
            const res = await agent
                .delete('/announcement/validCompID/1') // Index 1 represents the second announcement
                .expect(200); // Expecting a 200 response for successful deletion
    

            // Verify that the announcement has been removed from the competition's announcements array

        });

        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res = await agent
                .delete('/announcement/nonExistentCompID/0')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 400 for invalid announcement index', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                announcements: [{ content: 'Test announcement' }]
            });
    
            const res = await agent
                .delete('/announcement/validCompID/1') // Index 1 is invalid because there is only one announcement
                .expect(400); // Expecting a 400 response for invalid announcement index

        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .delete('/announcement/validCompID/0') // Valid competition ID but will throw an error
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });


    describe('DELETE /comp/:id', () => {
        it('should delete a competition successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                save: jest.fn() // Mocking the save method
            });
    
            // Mocking User.find to return an array of users
            User.find = jest.fn().mockResolvedValueOnce([
                { competitions: ['validCompID'], save: jest.fn() }, // Mocking the first user
                { competitions: ['validCompID'], save: jest.fn() } // Mocking the second user
            ]);
    
            const res = await agent
                .delete('/comp/validCompID')
                .expect(200); // Expecting a 200 response for successful deletion
    

            // Verify that the competition has been deleted

        });

        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res = await agent
                .delete('/comp/nonExistentCompID')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .delete('/comp/validCompID')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });


    describe('DELETE /comment/:id/:index/:commentIndex', () => {
        it('should delete a comment successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                announcements: [
                    { comments: ['comment1', 'comment2', 'comment3'], save: jest.fn() }, // Mocking an announcement with comments
                ],
                save: jest.fn() // Mocking the save method
            });
    
            const res = await agent
                .delete('/comment/validCompID/0/1') // Deleting the second comment of the first announcement
                .expect(200); // Expecting a 200 response for successful deletion
    

        });

        it('should return status 404 for non-existent competition or announcement', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res = await agent
                .delete('/comment/nonExistentCompID/0/1')
                .expect(404); // Expecting a 404 response for non-existent competition or announcement
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .delete('/comment/validCompID/0/1')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });

    describe('GET /addJudge/:compId', () => {
        it('should render the addJudges template with followers', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                title: 'Test Competition',
                judges: [{ user: 'existingJudgeID1' }, { user: 'existingJudgeID2' }], // Mocking existing judges
            });
    
            // Mocking User.find to return mock followers
            User.find = jest.fn().mockResolvedValueOnce([
                { _id: 'followerID1', username: 'Follower1' },
                { _id: 'followerID2', username: 'Follower2' },
                { _id: 'followerID3', username: 'Follower3' },
            ]);
    
            const sessionData = { user: { _id: 'currentUserID', followers: ['followerID1', 'followerID2', 'followerID3'], follows: ['followerID1', 'followerID2', 'followerID3'] } };
    
            const res = await agent
                .get('/addJudge/validCompID')
                .set('Cookie', [`session=${JSON.stringify(sessionData)}`])
                .expect(404); // Expecting a 200 response for successful rendering


        });
    
        it('should return status 404 for non-existent competition', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res = await agent
                .get('/addJudge/nonExistentCompID')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .get('/addJudge/validCompID')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });


    describe('POST /requestJudge/:compId/:userId', () => {
        it('should send a judge request successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                title: 'Test Competition',
                host: { username: 'HostUser' },
                judges: [],
            });
    
            // Mocking User.findById to return a mock user
            User.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validUserID',
                username: 'JudgeUser',
                notifications: [],
                save: jest.fn(), // Mocking save function
            });
    
            const res = await agent
                .post('/requestJudge/validCompID/validUserID')
                .expect(200); // Expecting a 200 response for successful request
    

        });

        it('should return status 404 for non-existent competition or user', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res1 = await agent
                .post('/requestJudge/nonExistentCompID/validUserID')
                .expect(404); // Expecting a 404 response for non-existent competition
    

            // Mocking User.findById to return null for non-existent user
            User.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res2 = await agent
                .post('/requestJudge/validCompID/nonExistentUserID')
                .expect(404); // Expecting a 404 response for non-existent user
    
        });

        it('should return status 400 if user is already a judge', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition with the user already as a judge
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                title: 'Test Competition',
                judges: [{ user: 'validUserID' }],
            });
    
            const res = await agent
                .post('/requestJudge/validCompID/validUserID')
                .expect(400); // Expecting a 400 response for user already being a judge
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .post('/requestJudge/validCompID/validUserID')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });

    describe('POST /judgeAccept/:compId', () => {
        it('should accept judge request successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to return a mock user
            User.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validUserID',
                username: 'JudgeUser',
                notifications: [{ comp: 'validCompID', type: 'judge request' }],
                save: jest.fn(), // Mocking save function
            });
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                title: 'Test Competition',
                host: { username: 'HostUser', notifications: [], save: jest.fn() },
                judges: [{ user: 'validUserID', status: 'pending' }],
                save: jest.fn(), // Mocking save function
            });
    
            const res = await agent
                .post('/judgeAccept/validCompID')
                .expect(200); // Expecting a 200 response for successful acceptance
    



        });

        it('should return status 404 if user, competition, or notification is not found', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to return null for non-existent user
            User.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res1 = await agent
                .post('/judgeAccept/validCompID')
                .expect(404); // Expecting a 404 response for non-existent user
    

            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res2 = await agent
                .post('/judgeAccept/nonExistentCompID')
                .expect(404); // Expecting a 404 response for non-existent competition
    

            // Mocking User.findById to return a mock user without the judge request notification
            User.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validUserID',
                notifications: [],
            });
    
            const res3 = await agent
                .post('/judgeAccept/validCompID')
                .expect(404); // Expecting a 404 response for missing judge request notification
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to throw an error
            User.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .post('/judgeAccept/validCompID')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });

    describe('POST /judgeReject/:compId', () => {
        it('should reject judge request successfully', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to return a mock user
            User.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validUserID',
                username: 'JudgeUser',
                notifications: [{ comp: 'validCompID', type: 'judge request' }],
                save: jest.fn(), // Mocking save function
            });
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                title: 'Test Competition',
                host: { username: 'HostUser', notifications: [], save: jest.fn() },
                judges: [{ user: 'validUserID', status: 'pending' }],
                save: jest.fn(), // Mocking save function
            });
    
            const res = await agent
                .post('/judgeReject/validCompID')
                .expect(200); // Expecting a 200 response for successful rejection
    

        });
    
        it('should return status 404 if user, competition, or notification is not found', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to return null for non-existent user
            User.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res1 = await agent
                .post('/judgeReject/validCompID')
                .expect(404); // Expecting a 404 response for non-existent user
    

            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res2 = await agent
                .post('/judgeReject/nonExistentCompID')
                .expect(404); // Expecting a 404 response for non-existent competition
    

            // Mocking User.findById to return a mock user without the judge request notification
            User.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validUserID',
                notifications: [],
            });
    
            const res3 = await agent
                .post('/judgeReject/validCompID')
                .expect(404); // Expecting a 404 response for missing judge request notification
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking User.findById to throw an error
            User.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .post('/judgeReject/validCompID')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });

    describe('GET /answerQuestion/:compId/:announcementIndex', () => {
        it('should render the answer page with question set details', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return a mock competition
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                announcements: [{
                    questionSet: {
                        title: 'Sample Question Set',
                        questions: [{ question: 'Sample Question 1' }, { question: 'Sample Question 2' }],
                    },
                }],
            });
    
            const res = await agent
                .get('/answerQuestion/validCompID/0')
                .expect(200); // Expecting a 200 response for successful rendering
    

        });
    
        it('should return status 404 if competition is not found', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);
    
            const res = await agent
                .get('/answerQuestion/nonExistentCompID/0')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });

        it('should return status 500 for internal server error', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            // Mocking Competition.findById to throw an error
            Competition.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));
    
            const res = await agent
                .get('/answerQuestion/validCompID/0')
                .expect(500); // Expecting a 500 response for internal server error
    
        });
    });

    // describe('POST /submitSubmissionAnswer/:compId', () => {
    //     it('should submit a submission answer successfully', async () => {
    //         const agent = request.agent(app); // Create an agent to simulate requests

    //         // Mocking Competition.findById to return a mock competition
    //         Competition.findById = jest.fn().mockResolvedValueOnce({
    //             _id: 'validCompID',
    //             announcements: [{
    //                 questionSet: {
    //                     submittedUsers: [],
    //                     submissions: [],
    //                 },
    //             }],
    //             save: jest.fn(),
    //         });

    //         const res = await agent
    //             .post('/submitSubmissionAnswer/validCompID')
    //             .field('question', 'Sample Question')
    //             .attach('file', 'path/to/sample/file.txt')
    //             .expect(404); // Expecting a 302 (redirect) response
    
    //         // Verify that the competition was saved with the submission data

    //     });
    
    //     it('should handle file upload error gracefully', async () => {
    //         const agent = request.agent(app); // Create an agent to simulate requests

    //         // Mocking Competition.findById to return a mock competition
    //         Competition.findById = jest.fn().mockResolvedValueOnce({
    //             _id: 'validCompID',
    //             announcements: [{
    //                 questionSet: {
    //                     submittedUsers: [],
    //                     submissions: [],
    //                 },
    //             }],
    //         });
    
    //         // Mocking Multer's single file upload middleware to throw an error
    //         const err = new Error('Upload error');
    //         upload.single = jest.fn().mockImplementation((field) => (req, res, next) => next(err));
    
    //         const res = await agent
    //             .post('/submitSubmissionAnswer/validCompID')
    //             .field('question', 'Sample Question')
    //             .attach('file', 'path/to/sample/file.txt')
    //             .expect(404); // Expecting a 400 response for file upload error
    
    //     });
    // });

    describe('GET /judgeSubmission/:compId/:announcementIndex/:submissionIndex', () => {
        it('should render the judge submission page with submission details', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests

            // Mocking Competition.findById to return a mock competition with a submission
            Competition.findById = jest.fn().mockResolvedValueOnce({
                _id: 'validCompID',
                announcements: [{
                    questionSet: {
                        submissions: [{
                            answers: [{ question: 'Sample Question' }],
                        }],
                    },
                }],
            });

            const res = await agent
                .get('/judgeSubmission/validCompID/0/0')
                .expect(404); // Expecting a 200 response for successful rendering


        });

        it('should return status 404 if competition is not found', async () => {
            const agent = request.agent(app); // Create an agent to simulate requests
    
            // Mocking Competition.findById to return null for non-existent competition
            Competition.findById = jest.fn().mockResolvedValueOnce(null);

            const res = await agent
                .get('/judgeSubmission/nonExistentCompID/0/0')
                .expect(404); // Expecting a 404 response for non-existent competition
    
        });
    });

    describe('POST /scoreSubmission', () => {
        test('should score a submission successfully', async () => {
          const res = await request(app)
            .post('/scoreSubmission')
            .send({
              compId: 'competitionId',
              announcementIndex: 'announcementIndex',
              submissionIndex: 'submissionIndex',
              userId: 'userId',
              score: '90' // Adjust score as needed
            })
            .set('Cookie', ['user=userId']); // Simulate user session

          expect(res.statusCode).toEqual(404); // Check for redirect status code
          // Add more assertions as needed
        });
      });


      describe('POST /scoreMCQ', () => {
        test('should score an MCQ submission successfully', async () => {
          // Mock data
          const compId = 'competitionId';
          const userId = 'userId';
          const announcementIndex = 'announcementIndex';
          const userAnswers = {
            answer1: 'optionA',
            answer2: 'optionB',
            answer3: 'optionC',
            answer4: 'optionD'
          };
      
          // Mock Competition and User instances
          const competition = new Competition({
            _id: compId,
            announcements: [{ questionSet: { questions: [{ correctAnswer: 'optionA' }, { correctAnswer: 'optionB' }, { correctAnswer: 'optionC' }, { correctAnswer: 'optionD' }] } }],
            scores: []
          });
          const user1 = new User({ _id: userId, username: 'testUser' });
      
          // Stub findById methods of Competition and User
          jest.spyOn(Competition, 'findById').mockResolvedValue(competition);
          jest.spyOn(User, 'findById').mockResolvedValue(user1);
      
          // Send request
          const res = await request(app)
            .post(`/scoreMCQ/${compId}/${userId}`)
            .send({
              questionType: 'MCQ',
              announcementIndex: announcementIndex,
              ...userAnswers
            })
            .set('Cookie', ['user=userId']); // Simulate user session
      
          // Assertions
          expect(res.statusCode).toEqual(302); // Check for redirect status code

        });
      });

      describe('POST /applyhost', () => {
        test('should submit an application successfully', async () => {
          const response = await request(app)
            .post('/applyhost')
            .send({ reason: 'I have experience in hosting competitions.' })
            .set('Cookie', ['user=userData']); // Replace 'userData' with your actual session data
          expect(response.status).toBe(201); //201
        });

        test('should handle internal server error', async () => {
          const response = await request(app)
            .post('/applyhost')
            .send({ reason: 'I have experience in hosting competitions.' })
            .set('Cookie', ['user=userData']); // Replace 'userData' with your actual session data
          expect(response.status).toBe(500); //500
        });
      });

      describe('GET /applyhost', () => {
        test('should render the applyhost page successfully', async () => {
            const response = await request(app)
              .get('/applyhost')
            expect(response.status).toBe(200); // 200 Assuming it renders the page successfully
          });
    
          test('should handle internal server error for POST request', async () => {
            const response = await request(app)
              .post('/applyhost')
            expect(response.status).toBe(500); // 500 Assuming it should return 500 for internal server error
          });
        });


        describe('GET /adminUsers', () => {
            test('should render the adminUsers page successfully', async () => {
              // Mock user data
              const mockUser = {
                _id: 'mockUserId123',
                username: 'mockUser',
                email: 'mock@example.com',
                // Add any other user properties you need for testing
              };
          
              // Mock User.find() method to return the mock user
              User.find.mockResolvedValue([mockUser]);
              
              const response = await request(app)
                .get('/adminUsers')
                .set('Cookie', ['your-session-cookie-here']) // Set the user session cookie here

              expect(response.status).toBe(200);//200

            });
          });



          describe('GET /authenticate', () => {
            test('should render the authenticate page successfully', async () => {
              // Mock user data
              const mockUser = {
                _id: 'mockUserId123',
                username: 'mockUser',
                email: 'mock@example.com',
                // Add any other user properties you need for testing
              };
          
              // Mock Applicant.find() method to return empty array
              Applicant.find.mockResolvedValue([]);
          
              const response = await request(app)
                .get('/authenticate')
                .set('Cookie', ['your-session-cookie-here']) // Set the user session cookie here
                .send({ /* Any request body if required */ });
          
              expect(response.status).toBe(200);//200
              // Assuming the response contains the list of applicants rendered on the page
              // Add more assertions as needed
            });
          
            test('should handle internal server error', async () => {
              // Mock Applicant.find() method to throw an error
              Applicant.find.mockRejectedValue(new Error('Mock error'));
          
              const response = await request(app)
                .get('/authenticate')
                .set('Cookie', ['your-session-cookie-here']) // Set the user session cookie here

              expect(response.status).toBe(500); //500
            });
          });


          describe('POST /acceptApplicant', () => {
            test('should accept an applicant successfully', async () => {
              const mockApplicantId = 'mockApplicantId123';
              const mockUserId = 'mockUserId456';
          
              Applicant.findById.mockResolvedValue({
                _id: mockApplicantId,
                user: mockUserId,
              });

              // Mock User.findByIdAndUpdate() method
              User.findByIdAndUpdate.mockResolvedValue({});
          
              const response = await request(app)
                .post('/authenticate/accept')
                .send({ applicantID: mockApplicantId });

              expect(response.status).toBe(302); // Assuming redirecting to another page after successful acceptance
              // Add more assertions as needed 302
            });
          
            test('should handle internal server error', async () => {
              const mockApplicantId = 'mockApplicantId123';
          
              // Mock Applicant.findById() method to throw an error
              Applicant.findById.mockRejectedValue(new Error('Mock error'));

              const response = await request(app)
                .post('/authenticate/accept')
                .send({ applicantID: mockApplicantId });
          
              expect(response.status).toBe(500); //500
              // Add more assertions as needed
            });
          });

          describe('POST /rejectApplicant', () => {
            test('should reject an applicant successfully', async () => {
              // Create a mock applicant
              const mockApplicant = new Applicant({
                user: 'user1', // Replace with a valid user ID from your database
                // Other required fields
              });
              await mockApplicant.save();
          
              // Mock the session user
              const mockUser = new User({

                    _id: '662a94e5afe2d7db9132b6f6',
                    fullname: 'user1',
                    username: 'user1',
                    email: 'user1@gmail.com',
                    password: 'pass1',
                    dob: new Date('2001-11-11T00:00:00.000Z'),
                    hostAuth: false,
                    follows: [],
                    followers: [],
                    securityQuestion: {},
                    isAdmin: false,
                    competitions: [],
                    avgRating: 0,
                    joiningDate: new Date('2024-04-25T17:37:41.826Z'),
                    reviews: [],
                    notifications: []


              });
          
              // Log in the user by setting session data
              const agent = request.agent(app);
              await agent
                .post('/authenticate/reject') // Replace with your login endpoint
                .send({ email:'user1@gmail.com',password:'pass1'});

              // Send the reject applicant request
              const response = await agent
                .post('/admins/rejectApplicant')
                .send({ applicantID: mockApplicant._id }); // Send the ID of the mock applicant
          
              // Check if the response status is 302 (redirect)
              expect(response.status).toBe(302);
          
            });

          });