import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as TUOAPI from '../API/trackedUserObjectAPI.ts';
import {
    AppBar,
    Box,
    Fab,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Toolbar,
    Typography
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// Mock TUO interface until it's defined in an API file
interface TUO {
    id: string;
    name: string;
    status: string; // e.g., "Available", "Assigned to Worker X"
    tags: string[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tuos, setTuos] = useState<TUO[]>([]);
  const [filteredTuos, setFilteredTuos] = useState<TUO[]>([]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    // In a real app, you'd also clear any user session/token here
    navigate('/');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const handleAddTUO = () => {
    handleClose();
    navigate('/add-tuo');
  };

  const handleTuoClick = (tuoId: string) => {
    navigate(`/tuo/${tuoId}`);
  };

  // --- Data Fetching and Filtering ---

  // Fetch initial data
  useEffect(() => {
    const fetchTuos = async () => {
        const mockTuos: TUO[] = [
            { id: 'tuo-001', name: 'GPS Tracker Alpha', status: 'Available', tags: ['gps', 'vehicle'] },
            { id: 'tuo-002', name: 'Asset Tag 54', status: 'Assigned to Alice', tags: ['asset', 'internal'] },
            { id: 'tuo-003', name: 'Vehicle Unit 7', status: 'In Repair', tags: ['gps', 'vehicle'] },
            { id: 'tuo-004', name: 'GPS Tracker Bravo', status: 'Available', tags: ['gps', 'high-value'] },
            { id: 'tuo-005', name: 'Container Seal 99', status: 'Assigned to Bob', tags: ['seal', 'shipping'] },
        ];

        let realTuos: TUO[] = [];
        try {
            const data = await TUOAPI.getAllTUOs();
            realTuos = (data || []).map((item: any) => {
                let parsedTags: string[] = [];
                try { parsedTags = item.description ? JSON.parse(item.description) : []; } 
                catch (e) { parsedTags = item.description ? [item.description] : []; }

                // Check for user assignment dynamically
                let currentStatus = 'Available';
                if (item.User?.name || item.user?.name) {
                    currentStatus = `Assigned to ${item.User?.name || item.user?.name}`;
                } else if (item.userId || item.UserId) {
                    currentStatus = 'Assigned';
                } else if (item.is_locked) {
                    currentStatus = 'Locked';
                }

                return {
                    id: item.id?.toString(),
                    name: item.name || 'Unnamed TUO',
                    status: currentStatus,
                    tags: parsedTags
                };
            });
        } catch (error) { console.error("Failed to fetch TUOs", error); }

        setTuos([...realTuos, ...mockTuos]);
    };
    fetchTuos();
  }, []);

  // Filter TUOs based on search query
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
        setFilteredTuos(tuos);
    } else {
        // Split the search query into individual terms to allow for multi-word searching
        const searchTerms = lowercasedQuery.split(/\s+/).filter(term => term.length > 0);

        const filtered = tuos.filter(tuo => {
            // A TUO is a match if it satisfies ALL search terms
            return searchTerms.every(term => {
                // A term is satisfied if it's found in the name, status, or any of the tags
                const inName = tuo.name.toLowerCase().includes(term);
                const inStatus = tuo.status.toLowerCase().includes(term);
                const inTags = tuo.tags.some(tag => tag.toLowerCase().includes(term));
                return inName || inStatus || inTags;
            });
        });
        setFilteredTuos(filtered);
    }
  }, [searchQuery, tuos]);

  return (
        <div className="main" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ArcPoint
              </Typography>
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleSettings}>Settings</MenuItem>
                  <MenuItem onClick={handleAddTUO}>Add TUO</MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </Menu>
              </div>
            </Toolbar>
          </AppBar>

          {/* Search Bar */}
          <Paper elevation={1} sx={{ p: '4px 12px', mx: '1rem', my: '1rem', display: 'flex', alignItems: 'center', borderRadius: '24px' }}>
            <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search by name, status, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>

          {/* TUO List */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', pb: '1rem' }}>
            <List>
                {filteredTuos.map((tuo) => (
                    <ListItem key={tuo.id} disablePadding sx={{ pl: '1rem', pr: '1rem', pb: '0.5rem' }}>
                        <Paper elevation={2} sx={{ width: '100%' }}>
                            <ListItemButton onClick={() => handleTuoClick(tuo.id)}>
                                <ListItemText primary={tuo.name} secondary={tuo.status} />
                            </ListItemButton>
                        </Paper>
                    </ListItem>
                ))}
            </List>
          </Box>

          {/* Add TUO FAB */}
          <Fab 
            color="primary" 
            aria-label="add" 
            onClick={handleAddTUO}
            sx={{ 
                position: 'fixed', 
                bottom: 24, 
                right: 24 
            }}
          >
            <AddIcon />
          </Fab>
        </div>
  );
};
export default Home;
