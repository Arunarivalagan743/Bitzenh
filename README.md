# College Programming Portal 🎓

A comprehensive MERN stack application for learning programming concepts through structured levels and interactive questions.

## Features ✨

### 🏠 Home Page
- Modern, responsive design with gradient backgrounds
- Overview of all 4 difficulty levels
- Feature highlights and navigation

### 📚 Level-Based Learning
- **Level 1**: Basic programming concepts and syntax
- **Level 2**: Control structures and functions  
- **Level 3**: Data structures and algorithms
- **Level 4**: Complex problem solving and advanced concepts

### 💻 Interactive Questions
- Clean question cards with expandable answers
- Syntax-highlighted code examples
- Detailed explanations for each solution
- Optional image support for visual context
- Multiple programming language support

### ➕ Add Questions
- User-friendly form to contribute new questions
- Level selection (1-4)
- Programming language selection
- **Dual image support**: Upload from device OR use image URL
- **File upload validation**: Max 5MB, supports JPG/PNG/GIF
- **Image preview**: See your image before submitting
- Code and explanation fields
- Real-time validation

## Tech Stack 🛠️

### Frontend
- **React 18** with Vite for fast development
- **React Router DOM** for navigation
- **React Syntax Highlighter** for beautiful code display
- **CSS3** with modern styling (gradients, animations, responsive design)

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Multer** for file upload handling
- **File storage** with automatic uploads directory creation
- **CORS** enabled for cross-origin requests
- **Express middleware** for JSON parsing and static file serving

### Development Tools
- **Nodemon** for auto-restarting development server
- **ESLint** for code quality
- **Git** for version control

## Installation & Setup 🚀

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd POrtalQuestionAndAnswer
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the backend directory:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/college-portal
PORT=5000
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`

### 4. Database Seeding (Optional)
Add sample questions to get started:
\`\`\`bash
cd backend
node seedData.js
\`\`\`

## Running the Application 🏃‍♂️

### Development Mode

**Terminal 1 - Backend Server:**
\`\`\`bash
cd backend
npm run dev
# Server runs on http://localhost:5000
\`\`\`

**Terminal 2 - Frontend Development Server:**
\`\`\`bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
\`\`\`

### Production Mode

**Backend:**
\`\`\`bash
cd backend
npm start
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm run build
npm run preview
\`\`\`

## API Endpoints 📡

### Questions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get all questions |
| GET | `/api/questions/:level` | Get questions by level (1-4) |
| POST | `/api/questions` | Add a new question |
| POST | `/api/upload` | Upload image file (returns image URL) |

### Request/Response Examples

**GET /api/questions/1**
\`\`\`json
[
  {
    "_id": "...",
    "level": 1,
    "title": "Hello World Program",
    "statement": "Write a program that prints 'Hello, World!' to the console.",
    "code": "console.log('Hello, World!');",
    "explanation": "This program uses console.log()...",
    "language": "javascript",
    "imageUrl": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
\`\`\`

**POST /api/questions**
\`\`\`json
{
  "level": 2,
  "title": "Calculate Sum",
  "statement": "Write a function to calculate sum of two numbers",
  "code": "function sum(a, b) { return a + b; }",
  "explanation": "This function takes two parameters and returns their sum",
  "language": "javascript",
  "imageUrl": "https://example.com/image.jpg"
}
\`\`\`

## Project Structure 📁

\`\`\`
POrtalQuestionAndAnswer/
├── backend/
│   ├── models/
│   │   └── Question.js          # MongoDB schema
│   ├── routes/
│   │   └── questions.js         # API routes
│   ├── server.js               # Express server setup
│   ├── seedData.js            # Sample data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation component
│   │   │   ├── QuestionCard.jsx # Question display component
│   │   │   ├── Navbar.css
│   │   │   └── QuestionCard.css
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Homepage
│   │   │   ├── Questions.jsx   # Level questions page
│   │   │   ├── AddQuestion.jsx # Add question form
│   │   │   └── *.css          # Page styles
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css            # Global styles
│   │   └── main.jsx           # React entry point
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md
\`\`\`

## Features in Detail 🔍

### Question Card Component
- **Expandable Design**: Click "View Answer" to reveal solution
- **Syntax Highlighting**: Code is beautifully formatted with proper syntax highlighting
- **Multi-language Support**: Supports JavaScript, Python, Java, C++, and more
- **Responsive Layout**: Works perfectly on desktop and mobile devices

### Add Question Form
- **Level Selection**: Choose from 4 difficulty levels
- **Language Selection**: Support for 10+ programming languages
- **Image Support**: Optional image URLs for visual aids
- **Validation**: Client-side and server-side validation
- **Success Feedback**: Confirmation message and automatic redirect

### Navigation
- **Responsive Navbar**: Clean navigation with hover effects
- **Level-based Routing**: Direct links to each level
- **Active States**: Visual feedback for current page

## Database Schema 🗄️

### Question Model
\`\`\`javascript
{
  level: Number (1-4, required),
  title: String (required),
  statement: String (required),
  imageUrl: String (optional),
  code: String (required),
  explanation: String (required),
  language: String (required, default: 'javascript'),
  createdAt: Date (auto-generated)
}
\`\`\`

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## Future Enhancements 🚀

- [ ] User authentication and profiles
- [ ] Question ratings and reviews
- [ ] Search and filter functionality
- [ ] Categories and tags
- [ ] Progress tracking
- [ ] Discussion forums
- [ ] Code execution environment
- [ ] Video explanations
- [ ] Achievement system
- [ ] Mobile app

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

If you have any questions or need help with setup, please open an issue or contact the development team.

---

**Happy Coding! 🎉**