import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Chip, CircularProgress, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigationIcon from '@mui/icons-material/Navigation';
import * as TUOAPI from '../API/trackedUserObjectAPI.ts';
import * as trackerAPI from '../API/trackerAPI.ts';

interface Coordinates {
    lat: number;
    lng: number;
}

// --- Math Helpers (Haversine formula for distance, and bearing calculation) ---
const toRad = (value: number) => (value * Math.PI) / 180;
const toDeg = (value: number) => (value * 180) / Math.PI;

const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};

const calcBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
              Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    const brng = Math.atan2(y, x);
    return (toDeg(brng) + 360) % 360;
};

const TuoPage: React.FC = () => {
    const { tuoId } = useParams<{ tuoId: string }>();
    const navigate = useNavigate();

    const [trackingStarted, setTrackingStarted] = useState(false);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [tuoLocation, setTuoLocation] = useState<Coordinates | null>(null);
    const [deviceHeading, setDeviceHeading] = useState<number>(0);
    const [tuoName, setTuoName] = useState<string | null>(null);
    const [trackerUUID, setTrackerUUID] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    
    const [distance, setDistance] = useState<number | null>(null);
    const [bearing, setBearing] = useState<number | null>(null);

    // --- 0. Fetch TUO Details ---
    useEffect(() => {
        const fetchTuoDetails = async () => {
            if (tuoId) {
                try {
                    const tuoData = await TUOAPI.getTUO(tuoId);
                    // Safely extract the name depending on how your backend wraps the response
                    const name = tuoData?.name || tuoData?.TUO?.name || tuoData?.trackedUserObject?.name;
                    if (name) setTuoName(name);

                    // Extract tags from description
                    const description = tuoData?.description || tuoData?.TUO?.description || tuoData?.trackedUserObject?.description;
                    let parsedTags: string[] = [];
                    try { parsedTags = description ? JSON.parse(description) : []; }
                    catch (e) { parsedTags = description ? [description] : []; }
                    setTags(parsedTags);

                    // Safely extract the associated tracker's UUID from the Eager Loaded data
                    const uuid = tuoData?.Tracker?.trackerUUID || tuoData?.tracker?.trackerUUID || tuoData?.trackerUUID;
                    if (uuid) setTrackerUUID(uuid);
                } catch (error) {
                    console.error("Failed to fetch TUO details:", error);
                }
            }
        };
        fetchTuoDetails();
    }, [tuoId]);

    // --- 1. Start Tracking & Compass Permissions ---
    const handleStartTracking = async () => {
        // iOS 13+ requires explicit permission for device orientation
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    console.warn("Compass permission denied");
                }
            } catch (err) { console.error(err); }
        } else {
            // Non iOS 13+ devices
            window.addEventListener('deviceorientationabsolute', handleOrientation);
        }
        setTrackingStarted(true);
    };

    const handleOrientation = useCallback((event: any) => {
        let heading = 0;
        // iOS uses webkitCompassHeading, Android/Standard uses alpha
        if (event.webkitCompassHeading) {
            heading = event.webkitCompassHeading;
        } else if (event.alpha !== null) {
            // The alpha value is 0-360, representing rotation around z-axis. 0 is North.
            heading = 360 - event.alpha; // Convert counter-clockwise alpha to clockwise heading
        }
        setDeviceHeading(heading);
    }, []);

    // --- 2. Watch User Location ---
    useEffect(() => {
        if (!trackingStarted) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => console.error("Error watching position", err),
            { enableHighAccuracy: true, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [trackingStarted]);

    // --- 3. Poll TUO Location ---
    useEffect(() => {
        if (!trackingStarted || !trackerUUID) return;

        const fetchTuoLocation = async () => {
            try {
                const response = await trackerAPI.getTracker(trackerUUID);
                if (response && response.tracker) {
                    const { latitude, longitude } = response.tracker;
                    if (latitude !== undefined && longitude !== undefined) {
                        setTuoLocation({ lat: latitude, lng: longitude });
                    }
                }
            } catch(error) { 
                console.error("Failed to fetch TUO location:", error); 
            }
        };

        fetchTuoLocation(); // Initial fetch
        const intervalId = setInterval(fetchTuoLocation, 3000); // Poll every 3 seconds

        return () => clearInterval(intervalId);
    }, [trackingStarted, trackerUUID]);

    // --- 4. Calculate Distance and Bearing ---
    useEffect(() => {
        if (userLocation && tuoLocation) {
            const dist = calcDistance(userLocation.lat, userLocation.lng, tuoLocation.lat, tuoLocation.lng);
            const brng = calcBearing(userLocation.lat, userLocation.lng, tuoLocation.lat, tuoLocation.lng);
            setDistance(dist);
            setBearing(brng);
        }
    }, [userLocation, tuoLocation]);

    // --- 5. Cleanup Listeners ---
    useEffect(() => {
        // This function is returned from useEffect and will run when the component unmounts
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
        };
    }, [handleOrientation]);

    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(2)} km`;
    };

    // The arrow rotates to point toward the TUO relative to the device's physical heading
    const arrowRotation = bearing !== null ? (bearing - deviceHeading) : 0;

    return (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar sx={{ position: 'relative', justifyContent: 'center' }}>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} aria-label="back" sx={{ position: 'absolute', left: 16 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" textAlign="center">
                        Locating {tuoName || tuoId}
                    </Typography>
                </Toolbar>
            </AppBar>
            
            {/* Tags Display */}
            {tags.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, p: 1.5, flexWrap: 'wrap', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 1 }}>
                    {tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" />
                    ))}
                </Box>
            )}

            {!trackingStarted ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
                    <Paper sx={{ p: 4, borderRadius: 4, maxWidth: '400px' }} elevation={3}>
                        <Typography variant="h5" gutterBottom>Find Tracker</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                            To point you in the right direction, we need access to your device's location and compass orientation.
                        </Typography>
                        <Button variant="contained" color="primary" size="large" onClick={handleStartTracking} fullWidth>
                            Start Tracking
                        </Button>
                    </Paper>
                </Box>
            ) : (!userLocation || !tuoLocation || distance === null) ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>Acquiring Signal...</Typography>
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', p: 3 }}>
                    
                    {/* The Compass Arrow */}
                    <Box sx={{ 
                        width: 280, 
                        height: 280, 
                        borderRadius: '50%', 
                        backgroundColor: 'white', 
                        boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <NavigationIcon 
                            color="primary" 
                            sx={{ 
                                fontSize: 160, 
                                transform: `rotate(${arrowRotation}deg)`, 
                                transition: 'transform 0.2s ease-out' 
                            }} 
                        />
                    </Box>

                    {/* Distance Text */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" fontWeight="fontWeightBold" color="primary">
                            {formatDistance(distance)}
                        </Typography>
                        <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                            Away
                        </Typography>
                    </Box>
                </Box>
            )}
        </div>
    );
};
export default TuoPage;