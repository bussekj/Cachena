import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, CircularProgress, IconButton, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as userAPI from '../API/userAPI.ts';
import * as TUOAPI from '../API/trackedUserObjectAPI.ts';
import { testUsers, testTuos } from '../API/testData.ts';

const LoadTestData: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLoadData = async () => {
        setLoading(true);
        setMessage('');
        
        let successUserCount = 0;
        let failUserCount = 0;
        let successTuoCount = 0;
        let failTuoCount = 0;

        for (let user of testUsers) {
            try {
                await userAPI.postUser(user);
                successUserCount++;
            } catch (e) {
                // Silently ignore duplicate user validation errors
                failUserCount++;
            }
        }
        
        for (let tuo of testTuos) {
            try {
                await TUOAPI.postTUO(tuo);

                successTuoCount++;
            } catch (e) {
                failTuoCount++;
            }
        }
        
        setMessage(`Done! Added ${successUserCount} users (${failUserCount} failed) and ${successTuoCount} TUOs (${failTuoCount} failed).`);
        setLoading(false);
    };

    return (
        <div style={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} aria-label="back">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                        Load Test Data
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" color="primary" size="large" onClick={handleLoadData} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Load Test Data'}
                </Button>
                {message && (
                    <Typography variant="body1" color={message.includes('Done') ? 'success.main' : 'textSecondary'}>
                        {message}
                    </Typography>
                )}
            </Box>
        </div>
    );
};

export default LoadTestData;