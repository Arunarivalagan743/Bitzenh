require('dotenv').config();
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model('Question', questionSchema);

async function finalCleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all questions that still have the old imageUrl or imagePublicId fields
    const questionsToUpdate = await Question.find({
      $or: [
        { imageUrl: { $exists: true } },
        { imagePublicId: { $exists: true } }
      ]
    });
    
    console.log(`Found ${questionsToUpdate.length} questions with old image fields`);
    
    for (const question of questionsToUpdate) {
      console.log(`Processing question: ${question._id} - "${question.title}"`);
      
      const updateFields = {};
      const unsetFields = {};
      
      // Ensure imageUrls and imagePublicIds exist as arrays
      if (!question.imageUrls || !Array.isArray(question.imageUrls)) {
        updateFields.imageUrls = [];
      }
      if (!question.imagePublicIds || !Array.isArray(question.imagePublicIds)) {
        updateFields.imagePublicIds = [];
      }
      
      // If there's an old imageUrl, move it to imageUrls array
      if (question.imageUrl && question.imageUrl !== null) {
        updateFields.imageUrls = [question.imageUrl];
        unsetFields.imageUrl = "";
      } else if (question.imageUrl === null) {
        unsetFields.imageUrl = "";
      }
      
      // If there's an old imagePublicId, move it to imagePublicIds array
      if (question.imagePublicId && question.imagePublicId !== null) {
        updateFields.imagePublicIds = [question.imagePublicId];
        unsetFields.imagePublicId = "";
      } else if (question.imagePublicId === null) {
        unsetFields.imagePublicId = "";
      }
      
      // Apply the update
      const updateQuery = { $set: updateFields };
      if (Object.keys(unsetFields).length > 0) {
        updateQuery.$unset = unsetFields;
      }
      
      await Question.updateOne({ _id: question._id }, updateQuery);
      console.log(`Updated question ${question._id}`);
    }
    
    console.log('Final cleanup completed!');
    
    // Verify the results
    const finalCheck = await Question.find({
      $or: [
        { imageUrl: { $exists: true } },
        { imagePublicId: { $exists: true } }
      ]
    });
    
    console.log(`Questions still with old fields: ${finalCheck.length}`);
    
    const allQuestions = await Question.find({});
    console.log(`Total questions: ${allQuestions.length}`);
    
    for (const q of allQuestions) {
      console.log(`Question ${q._id}: imageUrls=${q.imageUrls?.length || 0}, imagePublicIds=${q.imagePublicIds?.length || 0}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

finalCleanup();