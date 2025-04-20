import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Chip,
    CircularProgress,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const LearningJourney = () => {
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedJourney, setSelectedJourney] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        estimatedDuration: '',
        skillLevel: ''
    });

    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        if (user) {
            loadJourneys();
        }
    }, [user]);

    const loadJourneys = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/learning-journeys/user/${user.id}`);
            if (Array.isArray(response.data)) {
                setJourneys(response.data);
            } else {
                setError('Invalid data format received from server');
            }
        } catch (err) {
            setError('Failed to load learning journeys');
            console.error('Error loading journeys:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        
        if (now >= end) return 100;
        if (now <= start) return 0;
        
        const total = end - start;
        const elapsed = now - start;
        return Math.round((elapsed / total) * 100);
    };

    const getProgressColor = (progress) => {
        if (progress === 100) return 'success';
        if (progress >= 75) return 'info';
        if (progress >= 50) return 'warning';
        return 'error';
    };

    const handleCompleteJourney = async (journeyId) => {
        try {
            await axios.put(`${API_BASE_URL}/api/learning-journeys/${journeyId}/status`, {
                status: 'COMPLETED'
            });
            loadJourneys();
        } catch (err) {
            console.error('Error completing journey:', err);
        }
    };

    const handleDeleteJourney = async (journeyId) => {
        if (window.confirm('Are you sure you want to delete this learning journey?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/learning-journeys/${journeyId}`);
                loadJourneys();
            } catch (err) {
                console.error('Error deleting journey:', err);
            }
        }
    };

    const handleOpenModal = (journey) => {
        setSelectedJourney(journey);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedJourney(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditClick = (journey, e) => {
        e.stopPropagation();
        if (journey.status === 'PENDING') {
            setSelectedJourney(journey);
            setEditFormData({
                title: journey.title,
                description: journey.description,
                startDate: journey.startDate.split('T')[0],
                endDate: journey.endDate.split('T')[0],
                estimatedDuration: journey.estimatedDuration,
                skillLevel: journey.skillLevel
            });
            setEditDialogOpen(true);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/learning-journeys/${selectedJourney.id}`, editFormData);
            setJourneys(journeys.map(journey => 
                journey.id === selectedJourney.id ? response.data : journey
            ));
            setEditDialogOpen(false);
            setSelectedJourney(null);
        } catch (err) {
            console.error('Error updating journey:', err);
        }
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!journeys.length) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6">No learning journeys found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Learning Journeys
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title & Description</TableCell>
                            <TableCell align="center">Duration</TableCell>
                            <TableCell align="center">Start Date</TableCell>
                            <TableCell align="center">End Date</TableCell>
                            <TableCell align="center">Progress</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {journeys.map((journey) => (
                            <TableRow
                                key={journey.id}
                                onClick={() => handleOpenModal(journey)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        cursor: 'pointer'
                                    },
                                    height: '180px'
                                }}
                            >
                                <TableCell sx={{ py: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {journey.title}
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        color="text.secondary" 
                                        sx={{ 
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {journey.description}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', py: 3, fontWeight: 'bold', textAlign: 'center' }}>
                                    {journey.estimatedDuration} hours
                                </TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', py: 3, textAlign: 'center' }}>
                                    {formatDate(journey.startDate)}
                                </TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', py: 3, textAlign: 'center' }}>
                                    {formatDate(journey.endDate)}
                                </TableCell>
                                <TableCell sx={{ py: 3 }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={calculateProgress(journey.startDate, journey.endDate)}
                                            color={getProgressColor(calculateProgress(journey.startDate, journey.endDate))}
                                            sx={{ 
                                                height: 15, 
                                                borderRadius: 5,
                                                mb: 2
                                            }}
                                        />
                                        <Typography variant="h6" color="text.secondary" align="center">
                                            {calculateProgress(journey.startDate, journey.endDate)}% Complete
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 3, textAlign: 'center' }}>
                                    <Chip 
                                        label={journey.status} 
                                        color={
                                            journey.status === 'COMPLETED' ? 'success' :
                                            journey.status === 'IN_PROGRESS' ? 'primary' :
                                            'default'
                                        }
                                        sx={{ 
                                            fontSize: '1.1rem',
                                            height: '40px',
                                            '& .MuiChip-label': { px: 3 }
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ py: 3 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 2, 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%'
                                    }}>
                                        {journey.status !== 'COMPLETED' && (
                                            <Button 
                                                variant="contained" 
                                                color="success"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCompleteJourney(journey.id);
                                                }}
                                                sx={{ 
                                                    py: 1.5,
                                                    px: 3,
                                                    fontSize: '1.1rem',
                                                    textTransform: 'none',
                                                    minWidth: '180px',
                                                    height: '45px'
                                                }}
                                            >
                                                Mark as Completed
                                            </Button>
                                        )}
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <IconButton
                                                onClick={(e) => handleEditClick(journey, e)}
                                                sx={{ 
                                                    color: journey.status === 'PENDING' ? 'primary.main' : 'grey.400',
                                                    width: '45px',
                                                    height: '45px',
                                                    cursor: journey.status === 'PENDING' ? 'pointer' : 'not-allowed'
                                                }}
                                                disabled={journey.status !== 'PENDING'}
                                                title={journey.status !== 'PENDING' ? 'Only PENDING journeys can be edited' : 'Edit journey'}
                                            >
                                                <EditIcon sx={{ fontSize: '1.8rem' }} />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteJourney(journey.id);
                                                }}
                                                sx={{ 
                                                    color: 'error.main',
                                                    '&:hover': { backgroundColor: 'error.light' },
                                                    width: '45px',
                                                    height: '45px'
                                                }}
                                            >
                                                <DeleteIcon sx={{ fontSize: '1.8rem' }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={openModal} 
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
            >
                {selectedJourney && (
                    <>
                        <DialogTitle>
                            <Typography variant="h5" component="div">
                                {selectedJourney.title}
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {selectedJourney.description}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Start Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedJourney.startDate)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom>
                                            End Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedJourney.endDate)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Progress
                                    </Typography>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={calculateProgress(selectedJourney.startDate, selectedJourney.endDate)}
                                            color={getProgressColor(calculateProgress(selectedJourney.startDate, selectedJourney.endDate))}
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                                            {calculateProgress(selectedJourney.startDate, selectedJourney.endDate)}% Complete
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Status
                                        </Typography>
                                        <Chip 
                                            label={selectedJourney.status} 
                                            color={
                                                selectedJourney.status === 'COMPLETED' ? 'success' :
                                                selectedJourney.status === 'IN_PROGRESS' ? 'primary' :
                                                'default'
                                            }
                                            sx={{ 
                                                fontSize: '0.9rem',
                                                height: '32px',
                                                '& .MuiChip-label': { px: 2 }
                                            }}
                                        />
                                    </Box>
                                    {selectedJourney.status !== 'COMPLETED' && (
                                        <Button 
                                            variant="contained" 
                                            color="success"
                                            onClick={() => {
                                                handleCompleteJourney(selectedJourney.id);
                                                handleCloseModal();
                                            }}
                                        >
                                            Mark as Completed
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseModal}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog 
                open={editDialogOpen} 
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedJourney(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h5">Edit Learning Journey</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Title"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditChange}
                            fullWidth
                            required
                            disabled
                            helperText="Title cannot be modified"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            fullWidth
                            multiline
                            rows={4}
                            required
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Date"
                                name="startDate"
                                type="date"
                                value={editFormData.startDate}
                                onChange={handleEditChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="End Date"
                                name="endDate"
                                type="date"
                                value={editFormData.endDate}
                                onChange={handleEditChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Estimated Duration (hours)"
                                name="estimatedDuration"
                                type="number"
                                value={editFormData.estimatedDuration}
                                onChange={handleEditChange}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                            />
                            <TextField
                                label="Skill Level"
                                name="skillLevel"
                                value={editFormData.skillLevel}
                                onChange={handleEditChange}
                                fullWidth
                                required
                                select
                            >
                                <MenuItem value="BEGINNER">Beginner</MenuItem>
                                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                                <MenuItem value="ADVANCED">Advanced</MenuItem>
                            </TextField>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditDialogOpen(false);
                        setSelectedJourney(null);
                    }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleEditSubmit}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LearningJourney; 