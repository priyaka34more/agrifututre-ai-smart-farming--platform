import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { checkEligibility } from '../services/api';

const EligibilityWidget = () => {
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!income || isNaN(income)) {
      setError('Please enter a valid income (numbers only)');
      return;
    }
    setError('');
    const res = await checkEligibility(income);
    setResult(res);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6">Check Eligibility</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Income (INR)"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
        error={!!error}
      />
      <Button variant="contained" onClick={handleCheck} fullWidth>
        Check
      </Button>
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography>✅ Eligible: {result.eligible.join(', ')}</Typography>
          <Typography>❌ Ineligible: {result.ineligible.join(', ')}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default EligibilityWidget;