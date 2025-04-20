import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createLearningJourney } from '../../Store/LearningJourney/Action';
import axios from 'axios';
import { API_BASE_URL } from '../../Config/apiConfig';

const LearningJourneyForm = ({ open, onClose, postId }) => {
  const dispatch = useDispatch();
  const { learningJourney } = useSelector(store => store);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    estimatedDuration: '',
    skillLevel: 'Beginner'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [post, setPost] = useState(null);
  const [existingJourney, setExistingJourney] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (postId) {
        try {
          // Fetch post details
          const postResponse = await axios.get(`${API_BASE_URL}/api/twits/${postId}`);
          const postContent = postResponse.data.content;
          setPost(postResponse.data);

          // Check if a learning journey already exists for this post
          const existingJourneys = learningJourney?.learningJourneys?.filter(
            journey => journey.postId === postId
          );

          if (existingJourneys?.length > 0) {
            setExistingJourney(existingJourneys[0]);
            setError('A learning journey already exists for this post');
          } else {
            // Set initial title and description from twit content
            setFormData(prev => ({
              ...prev,
              title: postContent,
              description: postContent
            }));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch post details');
        }
      }
    };

    if (open) {
      fetchData();
    } else {
      // Reset form when closing
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        estimatedDuration: '',
        skillLevel: 'Beginner'
      });
      setError(null);
      setSuccess(false);
      setExistingJourney(null);
    }
  }, [postId, open, learningJourney?.learningJourneys]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        setError('End date must be after start date');
        return;
      }

      // Validate duration
      const duration = parseInt(formData.estimatedDuration);
      if (isNaN(duration) || duration <= 0) {
        setError('Estimated duration must be a positive number');
        return;
      }

      const journeyData = {
        ...formData,
        postId,
        estimatedDuration: duration
      };

      await dispatch(createLearningJourney(journeyData));
      setSuccess(true);
      
      // Reset form and close after a short delay
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          estimatedDuration: '',
          skillLevel: 'Beginner'
        });
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error creating learning journey:', error);
      setError(error.message || 'Failed to create learning journey. Please try again.');
    }
  };

  if (existingJourney) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Learning Journey Exists</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              A learning journey already exists for this post. You can only create one learning journey per post.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Create Learning Journey
        </Typography>
        {post?.content && (
          <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
            Post: {post.content}
          </Typography>
        )}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Learning journey created successfully!
              </Alert>
            )}

            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              helperText="Title is pre-filled with post content but can be modified"
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
              helperText="You can modify the description if needed"
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Estimated Duration (hours)"
              name="estimatedDuration"
              type="number"
              value={formData.estimatedDuration}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Skill Level"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
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
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={success}
          >
            {success ? 'Created!' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LearningJourneyForm; 