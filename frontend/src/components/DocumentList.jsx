import React, { useState } from 'react';
import { Box, Typography, List, ListItem, Button, Modal, TextField } from '@mui/material';
import { Description, Upload } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const DocumentList = ({ documents }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Typography variant="h6">Documents</Typography>
      <Button startIcon={<Upload />} onClick={() => setOpen(true)}>Upload</Button>
      <List>
        {documents.map((doc) => (
          <ListItem key={doc.id}>
            <Description sx={{ mr: 2 }} />
            <Typography>{doc.name}</Typography>
          </ListItem>
        ))}
      </List>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2 }}>Upload Document</Typography>
          <TextField type="file" fullWidth />
          <Button variant="contained" sx={{ mt: 2 }}>Submit</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default DocumentList;