const mongoose = require('mongoose');
const Schema = mongoose.Schema;
  
const userSchema = new Schema({
  cname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  question1: {
    type: String,
    required: true
  },
  question2: {
    type: String,
    required: true
  },
  question3: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  rank: {
    type: Number,
    required:true,
    default:0
  },
  rating:{
    type:Number,
    require:false,
    default:0
  },
  count: {
    type: Number,
    required:false,
    default:0
  },
  review: {
    reviewText: [{
      type: String,
      required: false
    }],
    reviewer: {
      type: String,
      required: false
    }
  }
});


const competitionSchema = new Schema({
  question: [{
    type: String,
    required: true
  }],
  genre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  addedJudges: [{  
    type: String, 
    required: true
  }]
});


const applicantSchema = new Schema({
  details: {
    type: mongoose.Schema.Types.Mixed  
  }
});


const scoreSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: false
  },
  score: {
    type: Number,
    default: 0
  }
});


const rankSchema = new Schema({
  email: {
    type: String,
    required: true
  },

  rank: {
    type: Number,
    default: 0
  }
});


const submissionSchema = new Schema({
  organizerEmail: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true
  },
  submissions: [{
      type: String,
      required: true
  }],
  vote: {
      numberOfVotes: {
          type: Number,
          default: 0
      },
      votedBy: [{
          type: String
      }]
  }
});

const User = mongoose.model('users', userSchema);
const Question = mongoose.model('competitions', competitionSchema);
const Applicant = mongoose.model('applicant', applicantSchema);
const Score = mongoose.model('scores', scoreSchema);
const Ranking = mongoose.model('rank', rankSchema);
const Submission = mongoose.model('Submissions', submissionSchema);

module.exports = {
  User,
  Question,
  Applicant,
  Score,
  Ranking,
  Submission
};