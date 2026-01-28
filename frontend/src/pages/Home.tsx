import React, { useEffect, useState } from 'react';
import { postUser } from '../API/userAPI.ts';
import { Button } from '@mui/material';                // UI component for layout
import test from 'node:test';


const Home: React.FC = () => {
  const handlePostUser = async () => {
        await postUser(
          {
            name:"test",
            role:"test",
            email:"test",
            password:"test"
          }
        )
  
  };
    return (
          <div className="main">
              <button onClick={handlePostUser}>
                  Register
              </button>
          </div>
    );
};
export default Home;
