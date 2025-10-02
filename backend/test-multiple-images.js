const fetch = require('node-fetch');

const testData = {
  level: 3,
  title: "Test Multiple Images",
  statement: "Testing multiple image upload functionality",
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

async function testMultipleImages() {
  try {
    console.log('Sending test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMultipleImages();