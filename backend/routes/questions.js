const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions - Get all questions with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, language, level } = req.query;
    let query = {};
    
    // Add level filter
    if (level) {
      query.level = parseInt(level);
    }
    
    // Add language filter
    if (language) {
      query.languages = { $in: [language] };
    }
    
    // Add search functionality - comprehensive text search
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive search
      query.$or = [
        { title: searchRegex },
        { statement: searchRegex },
        { tags: { $in: [searchRegex] } },
        { 'answers.explanation': searchRegex },
        { 'answers.code': searchRegex }
      ];
    }
    
    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/questions/:id - Get single question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/questions/level/:level - Get questions by level
router.get('/level/:level', async (req, res) => {
  try {
    const level = parseInt(req.params.level);
    if (level < 1 || level > 4) {
      return res.status(400).json({ message: 'Level must be between 1 and 4' });
    }
    
    const { search, language } = req.query;
    let query = { level };
    
    // Add language filter
    if (language) {
      query.languages = { $in: [language] };
    }
    
    // Add search functionality - comprehensive text search
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive search
      query.$or = [
        { title: searchRegex },
        { statement: searchRegex },
        { tags: { $in: [searchRegex] } },
        { 'answers.explanation': searchRegex },
        { 'answers.code': searchRegex }
      ];
    }
    
    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /languages - Get all available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await Question.distinct('languages');
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/questions - Add a new question
router.post('/', async (req, res) => {
  try {
    const { level, title, statement, imageUrl, imagePublicId, answers, tags } = req.body;
    
    // Validation
    if (!level || !title || !statement || !answers || answers.length === 0) {
      return res.status(400).json({ 
        message: 'Level, title, statement, and at least one answer are required' 
      });
    }
    
    if (level < 1 || level > 4) {
      return res.status(400).json({ message: 'Level must be between 1 and 4' });
    }
    
    // Extract languages from answers
    const languages = answers.map(answer => answer.language);
    
    const question = new Question({
      level,
      title,
      statement,
      imageUrl,
      imagePublicId,
      answers,
      tags: tags || [],
      languages
    });
    
    const savedQuestion = await question.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/questions/:id - Replace full question (except createdAt)
router.put('/:id', async (req, res) => {
  try {
    const { level, title, statement, imageUrl, imagePublicId, answers, tags } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'At least one answer required' });
    }
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    question.level = level ?? question.level;
    question.title = title ?? question.title;
    question.statement = statement ?? question.statement;
    if (imageUrl !== undefined) question.imageUrl = imageUrl; // allow null to clear
    if (imagePublicId !== undefined) question.imagePublicId = imagePublicId;
    question.answers = answers;
    if (tags) question.tags = tags;

    const saved = await question.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/questions/:id - Partial update (no answers modification here unless provided)
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['level','title','statement','imageUrl','imagePublicId','tags','answers'];
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key) && req.body[key] !== undefined) {
        question[key] = req.body[key];
      }
    }
    const saved = await question.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/questions/:id/answers - Add or update single language answer
router.post('/:id/answers', async (req, res) => {
  try {
    const { language, code, explanation } = req.body;
    
    if (!language || !code || !explanation) {
      return res.status(400).json({ 
        message: 'Language, code, and explanation are required' 
      });
    }
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Check if answer for this language already exists
    const existingAnswerIndex = question.answers.findIndex(answer => answer.language === language);
    
    if (existingAnswerIndex !== -1) {
      // Update existing answer
      question.answers[existingAnswerIndex] = { language, code, explanation };
    } else {
      // Add new answer
      question.answers.push({ language, code, explanation });
      
      // Add language to languages array if not exists
      if (!question.languages.includes(language)) {
        question.languages.push(language);
      }
    }
    
    const savedQuestion = await question.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/questions/:id/answers/:language - remove specific language answer
router.delete('/:id/answers/:language', async (req, res) => {
  try {
    const { id, language } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const originalLen = question.answers.length;
    question.answers = question.answers.filter(a => a.language !== language.toLowerCase());
    if (question.answers.length === originalLen) {
      return res.status(404).json({ message: 'Answer language not found' });
    }
    if (question.answers.length === 0) return res.status(400).json({ message: 'Cannot remove last remaining answer' });
    const saved = await question.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;