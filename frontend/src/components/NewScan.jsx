// frontend/src/components/NewScan.jsx
import React, { useState } from 'react';
import {
  Paper, Typography, TextField, Button, Box,
  Alert, CircularProgress, Stepper, Step, StepLabel,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewScan = ({ onScanCreated }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const steps = ['Enter URL', 'Initialize', 'Scan Running'];

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrl(targetUrl)) {
      setError('Please enter a valid URL including http:// or https://');
      return;
    }

    setLoading(true);
    setError('');
    setActiveStep(1);

    try {
      const response = await axios.post('http://localhost:5000/api/scans', {
        target_url: targetUrl
      });

      setSuccess(true);
      setActiveStep(2);

      if (onScanCreated && typeof onScanCreated === 'function') {
        onScanCreated();
      }

      setTimeout(() => {
        navigate(`/scan/${response.data.scan_id}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start scan');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4 }}>

      {/* HEADER */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Start New Security Scan
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Scan your web application for vulnerabilities and security risks
        </Typography>
      </Box>

      {/* MAIN CARD */}
      <Paper
        sx={{
          p: 4,
          maxWidth: 650,
          mx: 'auto',
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Scan started successfully! Redirecting to results...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Target Website URL"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading || success}
            error={!!error}
            helperText="Include http:// or https://"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3
              }
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || success || !targetUrl}
              sx={{
                minWidth: 220,
                py: 1.2,
                borderRadius: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Start Scan'
              )}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
          </Box>

          {activeStep === 1 && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Initializing scan engine...
              </Typography>
            </Box>
          )}
        </form>

        {/* TIPS SECTION */}
        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#f8f9ff',
            border: '1px solid #e3e8ff'
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Scan Best Practices
          </Typography>

          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Only scan websites you own or have permission to test</li>
              <li>Ensure the site is publicly accessible</li>
              <li>Include proper protocol (https recommended)</li>
              <li>Scanner crawls up to 20 internal pages</li>
              <li>Results may take several minutes depending on site size</li>
            </ul>
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
};

export default NewScan;



















// frontend/src/components/NewScan.jsx
// import React, { useState } from 'react';
// import {
//   Paper, Typography, TextField, Button, Box,
//   Alert, CircularProgress, Stepper, Step, StepLabel
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const NewScan = ({ onScanCreated }) => {
//   const [targetUrl, setTargetUrl] = useState('https://lookindharamshala.in/');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [activeStep, setActiveStep] = useState(0);
//   const navigate = useNavigate();

//   const steps = ['Enter URL', 'Configure Scan', 'Start Scanning'];

//   const validateUrl = (url) => {
//     try {
//       new URL(url);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate URL
//     if (!validateUrl(targetUrl)) {
//       setError('Please enter a valid URL including http:// or https://');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setActiveStep(1);

//     try {
//       const response = await axios.post('http://localhost:5000/api/scans', {
//         target_url: targetUrl
//       });

//       setSuccess(true);
//       setActiveStep(2);
      
//       // Call onScanCreated if it's a function
//       if (onScanCreated && typeof onScanCreated === 'function') {
//         onScanCreated();
//       }
      
//       // Redirect to scan results
//       setTimeout(() => {
//         navigate(`/scan/${response.data.scan_id}`);
//       }, 2000);
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to start scan');
//       setActiveStep(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
//       <Typography variant="h4" gutterBottom align="center">
//         New Vulnerability Scan
//       </Typography>

//       <Stepper activeStep={activeStep} sx={{ my: 4 }}>
//         {steps.map((label) => (
//           <Step key={label}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {error && (
//         <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
//           {error}
//         </Alert>
//       )}

//       {success && (
//         <Alert severity="success" sx={{ mb: 3 }}>
//           Scan started successfully! Redirecting to results...
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit}>
//         <Box sx={{ mb: 3 }}>
//           <TextField
//             fullWidth
//             label="Target URL"
//             variant="outlined"
//             value={targetUrl}
//             onChange={(e) => setTargetUrl(e.target.value)}
//             placeholder="https://example.com"
//             required
//             disabled={loading || success}
//             error={!!error}
//             helperText="Enter the full URL including http:// or https://"
//             InputProps={{
//               startAdornment: (
//                 <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
//                   🌐
//                 </Box>
//               )
//             }}
//           />
//         </Box>

//         <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
//           <Button
//             type="submit"
//             variant="contained"
//             disabled={loading || success || !targetUrl}
//             sx={{
//               minWidth: 200,
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               '&:hover': {
//                 background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
//               }
//             }}
//           >
//             {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Scan'}
//           </Button>
          
//           <Button
//             variant="outlined"
//             onClick={() => navigate('/')}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </Box>

//         {activeStep === 1 && (
//           <Box sx={{ mt: 3, textAlign: 'center' }}>
//             <Typography variant="body2" color="textSecondary">
//               Initializing scan... This may take a moment.
//             </Typography>
//           </Box>
//         )}
//       </form>

//       {/* Tips Section */}
//       <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
//         <Typography variant="subtitle2" gutterBottom>
//           📝 Tips for better results:
//         </Typography>
//         <Typography variant="body2" component="div">
//           <ul style={{ margin: 0, paddingLeft: 20 }}>
//             <li>Make sure the website is accessible</li>
//             <li>Include http:// or https:// in the URL</li>
//             <li>Only scan websites you own or have permission to test</li>
//             <li>The scanner will crawl up to 20 pages</li>
//           </ul>
//         </Typography>
//       </Box>
//     </Paper>
//   );
// };

// export default NewScan;