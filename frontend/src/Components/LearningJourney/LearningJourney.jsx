import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Grid, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider } from '@mui/material';
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
  const [dateError, setDateError] = useState('');

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

  const handleOpenModal = (journey) => {
    setSelectedJourney(journey);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJourney(null);
  };

  const handleEdit = (journey) => {
    setSelectedJourney(journey);
    
    // Extract just the date part from the ISO string (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      return dateString.split('T')[0];
    };

    setEditFormData({
      title: journey.title,
      description: journey.description,
      startDate: formatDateForInput(journey.startDate),
      endDate: formatDateForInput(journey.endDate),
      estimatedDuration: journey.estimatedDuration,
      skillLevel: journey.skillLevel
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });

    // Validate dates when either start or end date changes
    if (name === 'startDate' || name === 'endDate') {
      if (editFormData.startDate && editFormData.endDate) {
        const start = new Date(editFormData.startDate);
        const end = new Date(editFormData.endDate);
        if (end < start) {
          setDateError('End date must be greater than or equal to start date');
        } else {
          setDateError('');
        }
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates before submission
    if (editFormData.startDate && editFormData.endDate) {
      const start = new Date(editFormData.startDate);
      const end = new Date(editFormData.endDate);
      if (end < start) {
        setDateError('End date must be greater than or equal to start date');
        return;
      }
    }

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Format dates to include time component for LocalDateTime
      const formattedData = {
        ...editFormData,
        startDate: `${editFormData.startDate}T00:00:00`,
        endDate: `${editFormData.endDate}T00:00:00`
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/learning-journeys/${selectedJourney.id}`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        await loadJourneys();
        setEditDialogOpen(false);
        setSelectedJourney(null);
        setError(null);
        setDateError('');
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error updating journey:', err);
      setError(err.response?.data?.message || 'Failed to update learning journey. Please try again.');
    }
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
          Track your learning goals and achievements
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {journeys.map((journey, index) => {
          const startDate = new Date(journey.startDate).toLocaleDateString();
          const endDate = new Date(journey.endDate).toLocaleDateString();
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
                        size="small"
                        onClick={() => handleEdit(journey)}
                        disabled={isCompleted}
                        sx={{ 
                          color: isCompleted ? 'text.disabled' : 'primary.main',
                          '&:hover': { 
                            backgroundColor: isCompleted ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                            cursor: isCompleted ? 'not-allowed' : 'pointer'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(journey.id)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Learning Journey</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
                fullWidth
                disabled
                helperText="Title cannot be modified"
              />
              <TextField
                label="Description"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                multiline
                rows={4}
                required
                fullWidth
              />
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={editFormData.startDate}
                onChange={handleEditChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
              />
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={editFormData.endDate}
                onChange={handleEditChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError}
              />
              <TextField
                label="Estimated Duration (hours)"
                name="estimatedDuration"
                type="number"
                value={editFormData.estimatedDuration}
                onChange={handleEditChange}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Skill Level"
                name="skillLevel"
                value={editFormData.skillLevel}
                onChange={handleEditChange}
                select
                required
                fullWidth
                SelectProps={{
                  native: true
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        {selectedJourney && (
          <>
            <DialogTitle>{selectedJourney.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" paragraph>
                  {selectedJourney.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={selectedJourney.skillLevel}
                    size="small"
                    icon={<SchoolIcon fontSize="small" />}
                    sx={{ 
                      fontSize: '0.875rem',
                      height: '32px',
                      '& .MuiChip-label': { px: 2 }
                    }}
                  />
                  <Chip
                    label={`${new Date(selectedJourney.startDate).toLocaleDateString()} - ${new Date(selectedJourney.endDate).toLocaleDateString()}`}
                    size="small"
                    icon={<AccessTimeIcon fontSize="small" />}
                    sx={{ 
                      fontSize: '0.875rem',
                      height: '32px',
                      '& .MuiChip-label': { px: 2 }
                    }}
                  />
                  <Chip
                    label={`${selectedJourney.estimatedDuration} hours`}
                    size="small"
                    icon={<AccessTimeIcon fontSize="small" />}
                    sx={{ 
                      fontSize: '0.875rem',
                      height: '32px',
                      '& .MuiChip-label': { px: 2 }
                    }}
                  />
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
    </div>
  );
};

export default LearningJourney; 