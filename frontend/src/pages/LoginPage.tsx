import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Paper } from '@mui/material';
import './../styling/LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // TODO: Replace dummy authentication with an actual API call to your backend
            // Example:
            // await userAPI.login({ username, password });
            
            if (username === 'John' && password === 'Doe') {
                navigate('/home');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred during login');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} className="login-paper">
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    {error && (
                        <Typography color="error" variant="body2" align="center" style={{ marginTop: '10px' }}>
                            {error}
                        </Typography>
                    )}
                    <form className="login-form" noValidate onSubmit={handleLogin}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className="login-submit"
                        >
                            Sign In
                        </Button>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};

export default LoginPage;
