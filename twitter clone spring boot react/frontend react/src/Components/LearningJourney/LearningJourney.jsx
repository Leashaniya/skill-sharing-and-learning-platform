import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Chip, CircularProgress, Grid, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLearningJourneys } from '../../Store/LearningJourney/Action';
import axios from 'axios';
import { API_BASE_URL } from '../../Config/apiConfig';

const LearningJourney = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector(store => store);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [journeys, setJourneys] = useState([]);
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

  const loadJourneys = async () => {
    if (!auth.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/learning-journeys`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('API Response:', response.data);
      
      let journeysData = [];
      if (Array.isArray(response.data)) {
        journeysData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.journeys)) {
          journeysData = response.data.journeys;
        } else if (Array.isArray(response.data.content)) {
          journeysData = response.data.content;
        } else if (Array.isArray(response.data.data)) {
          journeysData = response.data.data;
        } else {
          journeysData = Object.values(response.data);
        }
      }

      const validJourneys = journeysData.filter(journey => 
        journey && 
        typeof journey === 'object' &&
        journey.title &&
        journey.description &&
        journey.startDate &&
        journey.endDate &&
        journey.estimatedDuration &&
        journey.skillLevel
      );

      if (validJourneys.length > 0) {
        setJourneys(validJourneys);
      } else {
        console.error('No learning journeys found:', response.data);
        setError('No learning journeys found');
        setJourneys([]);
      }
    } catch (error) {
      console.error('Error loading learning journeys:', error);
      setError('Failed to load learning journeys. Please try again later.');
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJourneys();
  }, [dispatch, auth.user?.id]);

  const handleComplete = async (journeyId) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.put(
        `${API_BASE_URL}/api/learning-journeys/${journeyId}/complete`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh the journeys list
      loadJourneys();
    } catch (error) {
      console.error('Error completing journey:', error);
      setError('Failed to mark journey as completed');
    }
  };

  const handleDelete = async (journeyId) => {
    if (!window.confirm('Are you sure you want to delete this learning journey?')) {
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(
        `${API_BASE_URL}/api/learning-journeys/${journeyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh the journeys list
      loadJourneys();
    } catch (error) {
      console.error('Error deleting journey:', error);
      setError('Failed to delete learning journey');
    }
  };

  const calculateProgress = (startDate, endDate, status) => {
    if (status === 'COMPLETED') {
        return 100;
    }
    if (!startDate || !endDate) return 0;
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
    if (progress === 100) return '#4CAF50';
    if (progress >= 75) return '#2196F3';
    if (progress >= 50) return '#FFC107';
    return '#F44336';
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
        startDate: journey.startDate ? new Date(journey.startDate).toISOString().split('T')[0] : '',
        endDate: journey.endDate ? new Date(journey.endDate).toISOString().split('T')[0] : '',
        estimatedDuration: journey.estimatedDuration,
        skillLevel: journey.skillLevel
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Format the data according to the backend expectations
      const formattedData = {
        title: editFormData.title,
        description: editFormData.description,
        startDate: new Date(editFormData.startDate).toISOString(),
        endDate: new Date(editFormData.endDate).toISOString(),
        estimatedDuration: parseInt(editFormData.estimatedDuration),
        skillLevel: editFormData.skillLevel
      };

      console.log('Sending update request with data:', formattedData);

      const response = await axios.put(
        `${API_BASE_URL}/api/learning-journeys/${selectedJourney.id}`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      if (response.data) {
        // Instead of just updating the specific journey, reload the entire list
        await loadJourneys();
        
        // Close the edit dialog and clear the selected journey
        setEditDialogOpen(false);
        setSelectedJourney(null);
        
        // Show success message
        setError(null);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error updating journey:', err);
      setError(err.response?.data?.message || 'Failed to update learning journey. Please try again.');
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
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <Box className="mb-8">
          <Typography variant="h4" className="font-bold mb-2">
            My Learning Journey
          </Typography>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      </div>
    );
  }

  if (!Array.isArray(journeys) || journeys.length === 0) {
    return (
      <div className="p-5">
        <Box className="mb-8">
          <Typography variant="h4" className="font-bold mb-2">
            My Learning Journey
          </Typography>
          <Typography variant="body1" color="textSecondary">
            No learning journeys yet. Start by clicking the + button on any post!
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div className="p-5">
      <Box className="mb-8">
        <Typography variant="h4" className="font-bold mb-2">
          My Learning Journey
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track your progress and continue learning
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {journeys.map((journey, index) => {
          const progress = calculateProgress(journey.startDate, journey.endDate, journey.status);
          const startDate = new Date(journey.startDate).toLocaleDateString();
          const endDate = new Date(journey.endDate).toLocaleDateString();
          const progressColor = getProgressColor(progress);
          const isCompleted = journey.status === 'COMPLETED';
          
          return (
            <Grid item xs={12} key={index}>
              <Card className="hover:shadow-lg transition-shadow" sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" className="font-bold" sx={{ fontSize: '1.2rem', mb: 0.5 }}>
                        {journey.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ 
                          fontSize: '0.875rem',
                          maxWidth: '800px'
                        }}
                      >
                        {journey.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                        {journey.estimatedDuration} hours
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: progressColor
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={journey.skillLevel}
                      size="small"
                      icon={<SchoolIcon fontSize="small" />}
                      sx={{ 
                        fontSize: '0.875rem',
                        height: '32px',
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                    <Chip
                      label={`${startDate} - ${endDate}`}
                      size="small"
                      icon={<AccessTimeIcon fontSize="small" />}
                      sx={{ 
                        fontSize: '0.875rem',
                        height: '32px',
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                    {isCompleted && (
                      <Chip
                        label="Completed"
                        size="small"
                        icon={<CheckCircleIcon fontSize="small" />}
                        sx={{ 
                          fontSize: '0.875rem',
                          height: '32px',
                          '& .MuiChip-label': { px: 2 }
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    {!isCompleted && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleComplete(journey.id)}
                        size="small"
                        sx={{ 
                          py: 0.5,
                          px: 2,
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          minWidth: '150px',
                          height: '32px'
                        }}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={(e) => handleEditClick(journey, e)}
                        size="small"
                        sx={{ 
                          width: '32px',
                          height: '32px',
                          color: journey.status === 'PENDING' ? 'primary.main' : 'grey.400',
                          '&:hover': {
                            backgroundColor: journey.status === 'PENDING' ? 'primary.light' : 'grey.100'
                          },
                          cursor: journey.status === 'PENDING' ? 'pointer' : 'not-allowed'
                        }}
                        disabled={journey.status !== 'PENDING'}
                        title={journey.status !== 'PENDING' ? 'Only PENDING journeys can be edited' : 'Edit journey'}
                      >
                        <EditIcon sx={{ fontSize: '1.25rem' }} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(journey.id);
                        }}
                        size="small"
                        sx={{ 
                          width: '32px',
                          height: '32px'
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '1.25rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

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
                      value={calculateProgress(selectedJourney.startDate, selectedJourney.endDate, selectedJourney.status)}
                      color={getProgressColor(calculateProgress(selectedJourney.startDate, selectedJourney.endDate, selectedJourney.status))}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                      {calculateProgress(selectedJourney.startDate, selectedJourney.endDate, selectedJourney.status)}% Complete
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
                        handleComplete(selectedJourney.id);
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
    </div>
  );
};

export default LearningJourney; 