import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.tsx'
import LoginPage from './pages/LoginPage.tsx';
import NotFoundPage from './pages/404.tsx'
import Settings from './pages/Settings.tsx';
import AddTUO from './pages/AddTUO.tsx';
import TuoPage from './pages/TuoPage.tsx';
import LoadTestData from './pages/LoadTestData.tsx';
import { HandleMessages } from './styling/components.tsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './styling/fonts.css';

const theme = createTheme({
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#42a5f5', // Slightly lighter blue than default
      contrastText: '#fff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HandleMessages>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/home" element={<Home/>}/>
              <Route path="/settings" element={<Settings/>}/>
              <Route path="/add-tuo" element={<AddTUO/>}/>
              <Route path="/tuo/:tuoId" element={<TuoPage />} />
              <Route path="/loadtestdata" element={<LoadTestData />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </HandleMessages>
    </ThemeProvider>
  )
}

export default App;