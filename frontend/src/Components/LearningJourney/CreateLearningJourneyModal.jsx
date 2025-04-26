import React, { useState } from 'react';
import {
  Box,
  Modal,
  TextField,
  Button,
  MenuItem,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: 'none',
};

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const CreateLearningJourneyModal = ({ open, handleClose, postContent }) => {
  const [formData, setFormData] = useState({
    title: postContent || '',
    description: '',
    skillLevel: 'beginner',
    estimatedDuration: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to save learning journey
    console.log('Form submitted:', formData);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-learning-journey-modal"
    >
      <Box sx={style}>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" component="h2">
            Create Learning Journey
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />

          <TextField
            fullWidth
            select
            label="Skill Level"
            name="skillLevel"
            value={formData.skillLevel}
            onChange={handleChange}
            required
          >
            {skillLevels.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Estimated Duration (in hours)"
            name="estimatedDuration"
            type="number"
            value={formData.estimatedDuration}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <TextField
            fullWidth
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <Box className="flex justify-end mt-4">
            <Button
              variant="contained"
              type="submit"
              sx={{
                bgcolor: '#1d9bf0',
                '&:hover': {
                  bgcolor: '#1a8cd8',
                },
              }}
            >
              Create Journey
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateLearningJourneyModal; 