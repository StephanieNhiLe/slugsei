import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SlugSei from './components/SlugSei';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/baseball-ai" element={<SlugSei />} />
      </Routes>
    </Router>
  );
};

export default App;
