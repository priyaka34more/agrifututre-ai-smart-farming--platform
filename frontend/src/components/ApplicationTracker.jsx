import React, { useState } from 'react';
import { Box, Typography, Paper, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const ApplicationTracker = ({ applications }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>My Applications</Typography>
      {applications.map((app) => (
        <Paper key={app.id} sx={{ mb: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontWeight="bold">{app.scheme}</Typography>
            <IconButton onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
              {expandedId === app.id ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Typography color="text.secondary">{app.status}</Typography>
          <Collapse in={expandedId === app.id}>
            <Typography sx={{ mt: 1 }}>Last updated: {app.date}</Typography>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );
};

export default ApplicationTracker;