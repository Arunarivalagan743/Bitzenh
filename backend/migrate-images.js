// Migration script to convert single image fields to arrays
require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Question schema for migration
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model('Question', questionSchema);

async function migrateImages() {
  try {
    console.log('Starting image field migration...');
    
    // Find all questions with old single image fields
    const questionsToUpdate = await Question.find({
      $or: [
        { imageUrl: { $exists: true, $ne: null } },
        { imagePublicId: { $exists: true, $ne: null } }
      ]
    });

    console.log(`Found ${questionsToUpdate.length} questions to migrate`);

    for (const question of questionsToUpdate) {
      const updates = {};
      
      // Convert single imageUrl to array
      if (question.imageUrl && !question.imageUrls) {
        updates.imageUrls = [question.imageUrl];
        updates.$unset = { imageUrl: 1 };
      }
      
      // Convert single imagePublicId to array
      if (question.imagePublicId && !question.imagePublicIds) {
        updates.imagePublicIds = [question.imagePublicId];
        if (!updates.$unset) updates.$unset = {};
        updates.$unset.imagePublicId = 1;
      }

      if (Object.keys(updates).length > 0) {
        await Question.updateOne({ _id: question._id }, updates);
        console.log(`Migrated question: ${question._id}`);
      }
    }

    console.log('Migration completed successfully!');
    
    // Show updated questions
    const updatedQuestions = await Question.find({
      imageUrls: { $exists: true }
    }).select('title imageUrls imagePublicIds');
    
    console.log('Updated questions:');
    updatedQuestions.forEach(q => {
      console.log(`- ${q.title}: ${q.imageUrls?.length || 0} images`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateImages();