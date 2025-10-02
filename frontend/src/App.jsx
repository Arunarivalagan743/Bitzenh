import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Questions from './pages/Questions'
import AddQuestion from './pages/AddQuestion'
import SearchResults from './pages/SearchResults'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/level/:level" element={<Questions />} />
            <Route path="/add-question" element={<AddQuestion />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
