import React, { useEffect, useState } from 'react';
import * as userAPI from '../API/userAPI.ts';
import * as TUOAPI from '../API/trackedUserObjectAPI.ts';
import { Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';

const Home: React.FC = () => {

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [input4, setInput4] = useState('');

  const inputForm =
      <div style={{display:"flex"}}>
            <TextField className='Form'
                label="input1"
                value={input1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setInput1(event.target.value);
                }}
            />
            <TextField className='Form'
                label="input2"
                value={input2}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setInput2(event.target.value);
                }}
            />
            <TextField className='Form'
                label="input3"
                value={input3}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setInput3(event.target.value);
                }}
            />
            <TextField className='Form'
                label="input4"
                value={input4}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setInput4(event.target.value);
                }}
            />
      </div>

  // --- User API calls
  const handlePostUser = async () => {
        await userAPI.postUser(
          {
            name:input1,
            role:input2,
            email:input3,
            password:input4
          }
        )
  };
  const handleGetUser = async () => {
        await userAPI.getUser(
          {
            name:input1,
            password:input2,
          }
        )
  };

  const userButtons =
    <div>
      <Button onClick={handlePostUser}>
          Post User
      </Button>
      <Button onClick={handleGetUser}>
          Get User
      </Button>
      <Button onClick={handleGetUser}>
          Get TUOs by User
      </Button>
    </div>

  // --- TUO API calls
  const handlePostTUO = async () => {
        await TUOAPI.postTUO(
          {
            name :  input1,
            description : input2,
            is_locked : false
          }
        )
  };
  const handleGetTUO = async () => {
        await TUOAPI.getTUO( input1 )
  };
  const handleGetTrackersbyUser = async () => {
        await TUOAPI.getTUOsByUser(input1)
  };
  const handleAssignTUO = async () => {
        await TUOAPI.assignTUO(input1,input2)
  };
  const trackerButtons =
    <div>
      <Button onClick={handlePostTUO}>
          Post TUO
      </Button>
      <Button onClick={handleGetTUO}>
          Get TUO
      </Button>
      <Button onClick={handleGetTrackersbyUser}>
          Get TUO by User
      </Button>
      <Button onClick={handleAssignTUO}>
          Assign TUO to User
      </Button>
    </div>

  return (
        <div className="main">
          <br/>
            {inputForm}
          <br/>
          {userButtons}
          {trackerButtons}
        </div>
  );
};
export default Home;
