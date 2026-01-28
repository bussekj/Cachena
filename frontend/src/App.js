import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx'
import NotFoundPage from './pages/404.tsx'
import { HandleMessages } from './styling/components.tsx';

function App() {
  return (
    <HandleMessages>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </HandleMessages>
  )
}

export default App;