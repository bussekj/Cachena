import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User , TUO} from '../API/interfaces.ts'
import { testUsers } from '../API/testData.ts'
import {
    AppBar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as userAPI from '../API/userAPI.ts';
import * as TUOAPI from '../API/trackedUserObjectAPI.ts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
const Settings: React.FC = () => {
    
    const navigate = useNavigate();

    // --- State for Data Fetching ---
    // Initialize with mock data for display purposes until GET endpoints are implemented
    const [workers, setWorkers] = useState<User[]>([]);
    const [tuos, setTuos] = useState<TUO[]>([]);

    // --- API Integration Hooks ---
    // Fetch initial data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (true)
                {
                    for (let user of testUsers)
                    {
                        await userAPI.postUser(user);
                        console.log("you have gotten here");
                    }
                }
                
                const [fetchedWorkers, fetchedAdmins] = await Promise.all([
                    userAPI.getUsersByRole('worker'),
                    userAPI.getUsersByRole('admin')
                ]);
                setWorkers([...fetchedWorkers, ...fetchedAdmins]);

                const fetchedTUOs = await TUOAPI.getAllTUOs();
                setTuos(fetchedTUOs);
            } catch (error) { console.error("Error fetching data:", error); }
        };
        fetchData();
    }, []);

    // Add Worker Form State
    const [newWorkerName, setNewWorkerName] = useState('');
    const [newWorkerEmail, setNewWorkerEmail] = useState('');
    const [newWorkerPassword, setNewWorkerPassword] = useState('');

    // Assignment Form State
    const [selectedWorker, setSelectedWorker] = useState('');
    const [selectedTUO, setSelectedTUO] = useState('');

    // --- Menu State for Worker Actions ---
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedWorkerForMenu, setSelectedWorkerForMenu] = useState<null | string>(null);

    // --- Delete Worker Dialog State ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [workerToDelete, setWorkerToDelete] = useState<User | null>(null);
    const [deletePassword, setDeletePassword] = useState('');

    // --- Make Admin Dialog State ---
    const [makeAdminDialogOpen, setMakeAdminDialogOpen] = useState(false);
    const [workerToMakeAdmin, setWorkerToMakeAdmin] = useState<User | null>(null);
    const [makeAdminPassword, setMakeAdminPassword] = useState('');

    const handleWorkerMenuOpen = (event: React.MouseEvent<HTMLElement>, workerId: string) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedWorkerForMenu(workerId);
    };

    const handleWorkerMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedWorkerForMenu(null);
    };

    // --- Action Handlers ---
    const handleAddWorker = async () => {
        try {
            // TODO: Ensure error handling is robust in userAPI.postUser
            await userAPI.postUser({
                name: newWorkerName,
                email: newWorkerEmail,
                password: newWorkerPassword,
                role: 'worker' // Explicitly assigning the worker role
            });

            // Locally update the list to reflect the change visually
            // setWorkers([...workers, { id: Date.now().toString(), name: newWorkerName }]);
            // updateWorkerData();
            setNewWorkerName('');
            setNewWorkerEmail('');
            setNewWorkerPassword('');
        } catch (error) {
            console.error("Failed to add worker", error);
        }
    };

    const confirmDeleteWorker = async () => {
        if (workerToDelete) {
            try {
                const isDeleted = await userAPI.deleteUser({
                    id: workerToDelete.id,
                    password: deletePassword,
                    name: '',
                    email: '',
                    role: ''
                });
                
                if (isDeleted) {
                    setWorkers(workers.filter(worker => worker.id !== workerToDelete.id));
                }
            } catch (error) {
                console.error("Failed to remove worker", error);
            }
        }
        setDeleteDialogOpen(false);
        setDeletePassword('');
        setWorkerToDelete(null);
    };

    const confirmMakeAdmin = async () => {
        if (workerToMakeAdmin) {
            try {
                const isAdmin = await userAPI.makeAdmin({
                    id: workerToMakeAdmin.id,
                    password: makeAdminPassword,
                    name: '',
                    email: '',
                    role: ''
                });
                
                if (isAdmin) {
                    setWorkers(workers.map(worker => 
                        worker.id === workerToMakeAdmin.id ? { ...worker, role: 'admin' } : worker
                    ));
                }
            } catch (error) {
                console.error("Failed to make worker an admin", error);
            }
        }
        setMakeAdminDialogOpen(false);
        setMakeAdminPassword('');
        setWorkerToMakeAdmin(null);
    };

    const handleMakeAdminFromMenu = () => {
        if (selectedWorkerForMenu) {
            const worker = workers.find(w => w.id === selectedWorkerForMenu);
            if (worker) {
                setWorkerToMakeAdmin(worker);
                setMakeAdminDialogOpen(true);
            }
        }
        handleWorkerMenuClose();
    };

    const handleRemoveWorkerFromMenu = () => {
        if (selectedWorkerForMenu) {
            const worker = workers.find(w => w.id === selectedWorkerForMenu);
            if (worker) {
                setWorkerToDelete(worker);
                setDeleteDialogOpen(true);
            }
        }
        handleWorkerMenuClose();
    };

    const handleAssignTUO = async () => {
        if (selectedWorker && selectedTUO) {
            try {
                await TUOAPI.assignTUO(selectedTUO, selectedWorker);
                setSelectedWorker('');
                setSelectedTUO('');
            } catch (error) {
                console.error("Failed to assign TUO", error);
            }
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
                        Settings (Admin)
                    </Typography>
                </Toolbar>
            </AppBar>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Add Worker Form */}
                <Paper style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Typography variant="h6">Add New Worker</Typography>
                    <TextField label="Name" size="small" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
                    <TextField label="Email" size="small" type="email" value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} />
                    <TextField label="Password" size="small" type="password" value={newWorkerPassword} onChange={e => setNewWorkerPassword(e.target.value)} />
                    <Button variant="contained" color="primary" onClick={handleAddWorker}>
                        Add Worker
                    </Button>
                </Paper>

                {/* Manage Existing Workers */}
                <Paper style={{ padding: '1rem' }}>
                    <Typography variant="h6">Manage Workers</Typography>
                    <List>
                        {workers.map((worker) => (
                            <React.Fragment key={worker.id}>
                                <ListItem>
                                    <ListItemText primary={worker.name + (worker.role === 'admin' ? ' (A)' : '')} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="more" onClick={(e) => handleWorkerMenuOpen(e, worker.id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleWorkerMenuClose}
                >
                    <MenuItem onClick={handleMakeAdminFromMenu}>Make Admin</MenuItem>
                    <MenuItem onClick={handleRemoveWorkerFromMenu}>Remove Worker</MenuItem>
                </Menu>

                {/* Assign TUO Section */}
                <Paper style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Typography variant="h6">Assign TUO to Worker</Typography>
                    <FormControl fullWidth size="small">
                        <InputLabel>Worker</InputLabel>
                        <Select value={selectedWorker} label="Worker" onChange={(e) => setSelectedWorker(e.target.value as string)}>
                            {workers.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Tracker</InputLabel>
                        <Select value={selectedTUO} label="Tracker" onChange={(e) => setSelectedTUO(e.target.value as string)}>
                            {tuos.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="secondary" onClick={handleAssignTUO}>
                        Assign TUO
                    </Button>
                </Paper>
            </div>

            {/* Delete Worker Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setDeletePassword(''); setWorkerToDelete(null); }}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the password for <strong>{workerToDelete?.name}</strong> to confirm deletion.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDeleteDialogOpen(false); setDeletePassword(''); setWorkerToDelete(null); }} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteWorker} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Make Admin Confirmation Dialog */}
            <Dialog open={makeAdminDialogOpen} onClose={() => { setMakeAdminDialogOpen(false); setMakeAdminPassword(''); setWorkerToMakeAdmin(null); }}>
                <DialogTitle>Confirm Make Admin</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the password for <strong>{workerToMakeAdmin?.name}</strong> to confirm making them an admin.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={makeAdminPassword}
                        onChange={(e) => setMakeAdminPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setMakeAdminDialogOpen(false); setMakeAdminPassword(''); setWorkerToMakeAdmin(null); }} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmMakeAdmin} color="primary" variant="contained">
                        Make Admin
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Settings;