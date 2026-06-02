import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Modal, Box } from '@mui/material';

const SchemeCard = ({ scheme }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card sx={{ m: 1, cursor: 'pointer' }} onClick={() => setOpen(true)}>
        <CardContent>
          <Typography variant="h6">{scheme.name}</Typography>
          <Typography color="text.secondary">{scheme.description}</Typography>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6">{scheme.name}</Typography>
          <Typography sx={{ mt: 2 }}>Eligibility: {scheme.eligibility}</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>Apply Now</Button>
        </Box>
      </Modal>
    </>
  );
};

export default SchemeCard;