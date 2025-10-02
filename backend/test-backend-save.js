require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

async function testQuestionCreation() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const testQuestion = {
      level: 2,
      title: "Test Multiple Images Backend",
      statement: "Testing if backend saves arrays correctly",
      imageUrls: [
        "https://res.cloudinary.com/test/image/upload/test1.jpg",
        "https://res.cloudinary.com/test/image/upload/test2.jpg"
      ],
      imagePublicIds: [
        "college-portal-questions/test1",
        "college-portal-questions/test2"
      ],
      answers: [{
        language: "javascript",
        code: "console.log('test');",
        explanation: "This is a test"
      }],
      tags: ["test"]
    };
    
    console.log('Creating question with data:', JSON.stringify(testQuestion, null, 2));
    
    const question = new Question(testQuestion);
    const savedQuestion = await question.save();
    
    console.log('Saved question:', JSON.stringify(savedQuestion, null, 2));
    
    // Check what was actually saved in the database
    const retrievedQuestion = await Question.findById(savedQuestion._id);
    console.log('Retrieved question from DB:', JSON.stringify(retrievedQuestion, null, 2));
    
    // Clean up - delete the test question
    await Question.findByIdAndDelete(savedQuestion._id);
    console.log('Test question deleted');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

testQuestionCreation();