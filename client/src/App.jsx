import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './components/landing';
import Prediction from './components/prediction';

function App() {
  return (
    <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Landing/>}/>
            <Route path="/predict" element={<Prediction/>}/>
          </Routes>
        </div>
      </Router>
  )
}

export default App