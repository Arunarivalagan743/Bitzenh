require('dotenv').config();
const mongoose = require('mongoose');

async function fixAllImageFormats() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('questions');
    
    console.log('Starting comprehensive image format migration...');
    
    // Find all questions
    const allQuestions = await collection.find({}).toArray();
    console.log(`Found ${allQuestions.length} total questions`);
    
    let migrated = 0;
    let alreadyMigrated = 0;
    let errors = 0;
    
    for (const question of allQuestions) {
      try {
        console.log(`\nProcessing question: ${question._id} - "${question.title}"`);
        
        // Check if already has new format
        if (question.imageUrls && question.imagePublicIds) {
          console.log('✅ Already has new format (imageUrls/imagePublicIds arrays)');
          alreadyMigrated++;
          continue;
        }
        
        // Prepare update object
        const updateObj = {};
        const unsetObj = {};
        
        // Handle imageUrl -> imageUrls
        if (question.imageUrl !== undefined) {
          if (question.imageUrl === null || question.imageUrl === '') {
            updateObj.imageUrls = [];
            console.log('🔄 Converting null/empty imageUrl to empty imageUrls array');
          } else {
            updateObj.imageUrls = [question.imageUrl];
            console.log(`🔄 Converting single imageUrl to array: [${question.imageUrl}]`);
          }
          unsetObj.imageUrl = "";
        } else if (!question.imageUrls) {
          updateObj.imageUrls = [];
          console.log('🔄 Adding missing imageUrls as empty array');
        }
        
        // Handle imagePublicId -> imagePublicIds
        if (question.imagePublicId !== undefined) {
          if (question.imagePublicId === null || question.imagePublicId === '') {
            updateObj.imagePublicIds = [];
            console.log('🔄 Converting null/empty imagePublicId to empty imagePublicIds array');
          } else {
            updateObj.imagePublicIds = [question.imagePublicId];
            console.log(`🔄 Converting single imagePublicId to array: [${question.imagePublicId}]`);
          }
          unsetObj.imagePublicId = "";
        } else if (!question.imagePublicIds) {
          updateObj.imagePublicIds = [];
          console.log('🔄 Adding missing imagePublicIds as empty array');
        }
        
        // Build final update query
        const finalUpdate = {};
        if (Object.keys(updateObj).length > 0) {
          finalUpdate.$set = updateObj;
        }
        if (Object.keys(unsetObj).length > 0) {
          finalUpdate.$unset = unsetObj;
        }
        
        // Only update if there are changes
        if (Object.keys(finalUpdate).length > 0) {
          const result = await collection.updateOne(
            { _id: question._id },
            finalUpdate
          );
          
          if (result.modifiedCount > 0) {
            console.log('✅ Successfully migrated');
            migrated++;
          } else {
            console.log('⚠️ No changes made (already correct?)');
          }
        } else {
          console.log('ℹ️ No migration needed');
        }
        
      } catch (error) {
        console.error(`❌ Error processing question ${question._id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Total questions: ${allQuestions.length}`);
    console.log(`✅ Successfully migrated: ${migrated}`);
    console.log(`ℹ️ Already migrated: ${alreadyMigrated}`);
    console.log(`❌ Errors: ${errors}`);
    
    // Verify the results
    console.log('\n=== VERIFICATION ===');
    const afterMigration = await collection.find({}).toArray();
    
    let hasNewFormat = 0;
    let hasOldFormat = 0;
    
    for (const q of afterMigration) {
      if (q.imageUrls !== undefined && q.imagePublicIds !== undefined) {
        hasNewFormat++;
      }
      if (q.imageUrl !== undefined || q.imagePublicId !== undefined) {
        hasOldFormat++;
        console.log(`⚠️ Question ${q._id} still has old format fields`);
      }
    }
    
    console.log(`Questions with new format: ${hasNewFormat}/${afterMigration.length}`);
    console.log(`Questions with old format: ${hasOldFormat}/${afterMigration.length}`);
    
    if (hasOldFormat === 0) {
      console.log('🎉 All questions successfully migrated to new format!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the migration
fixAllImageFormats().catch(console.error);