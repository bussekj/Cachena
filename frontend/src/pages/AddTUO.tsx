import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as TUOAPI from '../API/trackedUserObjectAPI.ts';
import * as userAPI from '../API/userAPI.ts';
// import * as userAPI from '../API/userAPI.ts';

const AddTUO: React.FC = () => {
    const navigate = useNavigate();

    // --- Form State ---
    const [name, setName] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    // --- Mock Data for Workers ---
    const [workers, setWorkers] = useState([
        { id: '1', name: 'Alice (Worker)' },
        { id: '2', name: 'Bob (Worker)' }
    ]);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const [fetchedWorkers, fetchedAdmins] = await Promise.all([
                    userAPI.getUsersByRole('worker'),
                    userAPI.getUsersByRole('admin')]);
                
                setWorkers([...fetchedWorkers, ...fetchedAdmins]);
             } 
             catch (error) { 
                console.error("Error fetching workers:", error); 
            }
        };
        fetchWorkers();
    }, []);

    // --- Action Handlers ---
    const handleAddTag = () => {
        if (currentTag.trim() !== '' && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const handleDeleteTag = (tagToDelete: string) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            console.error("Name is required");
            return;
        }

        try {
            const newTuo = await TUOAPI.postTUO({
                name: name,
                description: JSON.stringify(tags), 
                is_locked: false
            });

            if (assignedTo) {
                const tuoId = newTuo?.id || newTuo?.TUO?.id || newTuo?.trackedUserObject?.id || newTuo?.data?.id; // Safely extract ID based on backend response format
                if (tuoId) {
                    await TUOAPI.assignTUO(tuoId, assignedTo);
                    console.log(`TUO ${name} assigned to ${assignedTo}`);
                }
            }

            // Navigate back to home or show success message upon completion
            navigate('/home');
        } catch (error) {
            console.error("Failed to create TUO", error);
        }
    };

    return (
        <div style={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} aria-label="back">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                        Add TUO
                    </Typography>
                </Toolbar>
            </AppBar>

            <div style={{ padding: '1rem' }}>
                <Paper style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Typography variant="h6">Create Tracked Object</Typography>

                    <TextField label="Name" required fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />

                    <FormControl fullWidth size="small">
                        <InputLabel>Assigned To (Optional)</InputLabel>
                        <Select value={assignedTo} label="Assigned To (Optional)" onChange={(e) => setAssignedTo(e.target.value as string)}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {workers.map((worker) => <MenuItem key={worker.id} value={worker.id}>{typeof worker.name === 'object' ? JSON.stringify(worker.name) : worker.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Tags (Optional)</Typography>
                        <Box display="flex" gap="0.5rem" mb={1}>
                            <TextField label="New Tag" size="small" fullWidth value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} />
                            <Button variant="contained" color="secondary" onClick={handleAddTag}>Add</Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap="0.5rem">
                            {tags.map((tag, index) => <Chip key={index} label={tag} onDelete={() => handleDeleteTag(tag)} color="primary" variant="outlined" />)}
                        </Box>
                    </Box>

                    <Button variant="contained" color="primary" size="large" onClick={handleSubmit}>Create TUO</Button>
                </Paper>
            </div>
        </div>
    );
};
export default AddTUO;