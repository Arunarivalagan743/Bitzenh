// Quick test to check API endpoints
const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing basic questions endpoint...');
    const response = await fetch(`${API_BASE}/questions`);
    const data = await response.json();
    console.log('All questions:', data);
    
    console.log('Testing search endpoint...');
    const searchResponse = await fetch(`${API_BASE}/questions?search=char`);
    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);
    
    console.log('Testing languages endpoint...');
    const langResponse = await fetch(`${API_BASE}/questions/languages`);
    const langData = await langResponse.json();
    console.log('Languages:', langData);
    
    console.log('Testing tags endpoint...');
    const tagResponse = await fetch(`${API_BASE}/questions/tags`);
    const tagData = await tagResponse.json();
    console.log('Tags:', tagData);
    
  } catch (error) {
    console.error('API test error:', error);
  }
}

testAPI();