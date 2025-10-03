import React, { useEffect, useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Questions from './pages/Questions'
import AddQuestion from './pages/AddQuestion'
import SearchResults from './pages/SearchResults'
import './App.css'
import { apiFetch } from './api/client'

let hasRecordedSiteView = false

function App() {
  const [siteViewCount, setSiteViewCount] = useState(null)

  const refreshSiteViewCount = useCallback(async () => {
    try {
      const data = await apiFetch('/stats/views')
      if (data && typeof data.totalViews === 'number') {
        setSiteViewCount(data.totalViews)
      }
      return data
    } catch (error) {
      console.error('Failed to fetch site view count', error)
      throw error
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const incrementSiteView = async () => {
      try {
        if (!hasRecordedSiteView) {
          hasRecordedSiteView = true
          const data = await apiFetch('/stats/views', { method: 'POST' })
          if (!ignore && data && typeof data.totalViews === 'number') {
            setSiteViewCount(data.totalViews)
            return
          }
        }

        if (!ignore) {
          await refreshSiteViewCount()
        }
      } catch (error) {
        console.error('Failed to increment site views', error)
        if (!ignore) {
          try {
            await refreshSiteViewCount()
          } catch (err) {
            console.error('Fallback site view fetch failed', err)
          }
        }
      }
    }

    incrementSiteView()

    return () => {
      ignore = true
    }
  }, [refreshSiteViewCount])

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Home siteViewCount={siteViewCount} onRefreshSiteViews={refreshSiteViewCount} />}
            />
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
