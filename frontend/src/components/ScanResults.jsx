// frontend/src/components/ScanResults.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Chip, CircularProgress,
  Alert, Grid, Card, CardContent, Divider,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, LinearProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { scanService } from '../services/api';
import { green } from '@mui/material/colors';

const ScanResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScanStatus = async () => {
      try {
        const data = await scanService.getScanStatus(id);
        setScan(data);
        if (data.status === 'running') {
          setTimeout(fetchScanStatus, 3000);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch scan status');
      } finally {
        setLoading(false);
      }
    };
    fetchScanStatus();
  }, [id]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      default: return '#28a745';
    }
  };

  const vulnerabilityCount = scan?.results?.vulnerabilities?.length || 0;

  // Simple Security Score Formula
  const securityScore = vulnerabilityCount === 0
    ? 100
    : Math.max(10, 100 - vulnerabilityCount * 10);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error || !scan) {
    return <Alert severity="error">{error || 'Scan not found'}</Alert>;
  }

  return (
    <Box sx={{ px: 2, py: 4 }}>

      {/* HEADER */}
      <Box
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 4,
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Security Scan Report
        </Typography>
        <Typography sx={{ opacity: 0.9 }}>
          Target: {scan.target_url}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">
            Security Score: {securityScore}/100
          </Typography>
          <LinearProgress
            variant="determinate"
            value={securityScore}
            sx={{
              height: 10,
              borderRadius: 5,
              mt: 1,
              backgroundColor: '#ffffff40',
              '& .MuiLinearProgress-bar': {
                backgroundColor:
                  securityScore > 80
                    ? '#28a745'
                    : securityScore > 50
                    ? '#ffc107'
                    : '#dc3545'
              }
            }}
          />
        </Box>
      </Box>

      {/* STATUS */}
      {scan.status === 'running' && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography gutterBottom>
            Scan in Progress...
          </Typography>
          <LinearProgress variant="determinate" value={scan.progress || 0} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {scan.progress}% completed
          </Typography>
        </Paper>
      )}

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }} >
        {[
          { label: 'Vulnerabilities', value: vulnerabilityCount },
          { label: 'URLs Crawled', value: scan.results?.target_data?.urls_crawled || 0 },
          { label: 'Forms Found', value: scan.results?.target_data?.forms_found || 0 },
          { label: 'Input Fields', value: scan.results?.target_data?.input_fields || 0 }
        ].map((item, index) => (
          <Grid item xs={12} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-6px)' }
              }}
            >
              <CardContent>
                <Typography color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* VULNERABILITY TABLE */}
      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <SecurityIcon sx={{ mr: 1 }} />
          Detected Vulnerabilities
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {vulnerabilityCount === 0 ? (
          <Alert severity="success">
            No vulnerabilities found! Your application appears secure.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Severity</b></TableCell>
                  <TableCell><b>Type</b></TableCell>
                  <TableCell><b>URL</b></TableCell>
                  <TableCell><b>Parameter</b></TableCell>
                  <TableCell><b>Evidence</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scan.results.vulnerabilities.map((vuln, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Chip
                        label={vuln.severity}
                        size="small"
                        sx={{
                          backgroundColor: getSeverityColor(vuln.severity),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>{vuln.type}</TableCell>
                    <TableCell>{vuln.url}</TableCell>
                    <TableCell>{vuln.parameter || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {vuln.evidence}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* REPORT DOWNLOAD */}
      {scan.results?.reports && (
        <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Download Reports
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              href={`http://localhost:5000/reports/${scan.results.reports.json}`}
              target="_blank"
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              JSON Report
            </Button>

            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              href={`http://localhost:5000/reports/${scan.results.reports.html}`}
              target="_blank"
              sx={{ borderRadius: 3 }}
            >
              HTML Report
            </Button>
          </Box>
        </Paper>
      )}

      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        sx={{ borderRadius: 3 }}
      >
        Back to Dashboard
      </Button>

    </Box>
  );
};

export default ScanResults;




















// frontend/src/components/ScanResults.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Paper, Typography, Box, Chip, CircularProgress,
//   Alert, Grid, Card, CardContent, Divider,
//   Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Button, LinearProgress
// } from '@mui/material';
// import {
//   Security as SecurityIcon,
//   Warning as WarningIcon,
//   Error as ErrorIcon,
//   Info as InfoIcon,
//   Description as DescriptionIcon,  // Added missing import
//   PictureAsPdf as PictureAsPdfIcon  // Added missing import
// } from '@mui/icons-material';
// import { scanService } from '../services/api';

// const ScanResults = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [scan, setScan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchScanStatus = async () => {
//       try {
//         const data = await scanService.getScanStatus(id);
//         setScan(data);

//         // If scan is still running, poll for updates
//         if (data.status === 'running') {
//           setTimeout(fetchScanStatus, 3000);
//         }
//       } catch (err) {
//         setError(err.message || 'Failed to fetch scan status');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchScanStatus();
//   }, [id]);

//   const getSeverityIcon = (severity) => {
//     switch (severity?.toLowerCase()) {
//       case 'critical': return <ErrorIcon sx={{ color: '#dc3545' }} />;
//       case 'high': return <WarningIcon sx={{ color: '#fd7e14' }} />;
//       case 'medium': return <InfoIcon sx={{ color: '#ffc107' }} />;
//       default: return <InfoIcon sx={{ color: '#28a745' }} />;
//     }
//   };

//   const getSeverityColor = (severity) => {
//     switch (severity?.toLowerCase()) {
//       case 'critical': return 'error';
//       case 'high': return 'warning';
//       case 'medium': return 'info';
//       default: return 'success';
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error || !scan) {
//     return (
//       <Alert severity="error" sx={{ mt: 2 }}>
//         {error || 'Scan not found'}
//       </Alert>
//     );
//   }

//   return (
//     <Box>
//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           <Typography variant="h4">
//             Scan Results
//           </Typography>
//           <Chip
//             label={scan.status.toUpperCase()}
//             color={scan.status === 'completed' ? 'success' : 'warning'}
//           />
//         </Box>

//         {scan.status === 'running' && (
//           <Box sx={{ width: '100%', mt: 2 }}>
//             <LinearProgress variant="determinate" value={scan.progress || 0} />
//             <Typography variant="body2" sx={{ mt: 1 }}>
//               Scanning in progress... {scan.progress}%
//             </Typography>
//           </Box>
//         )}

//         <Grid container spacing={3} sx={{ mt: 1 }}>
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardContent>
//                 <Typography color="textSecondary" gutterBottom>
//                   Target
//                 </Typography>
//                 <Typography variant="h6">
//                   {scan.target_url}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardContent>
//                 <Typography color="textSecondary" gutterBottom>
//                   Started At
//                 </Typography>
//                 <Typography variant="h6">
//                   {new Date(scan.created_at).toLocaleString()}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Paper>

//       {scan.results && (
//         <>
//           {/* Summary Cards */}
//           <Grid container spacing={3} sx={{ mb: 3 }}>
//             <Grid item xs={12} md={3}>
//               <Card sx={{ bgcolor: '#f8f9fa' }}>
//                 <CardContent>
//                   <Typography color="textSecondary" gutterBottom>
//                     Total Vulnerabilities
//                   </Typography>
//                   <Typography variant="h3">
//                     {scan.results.vulnerabilities?.length || 0}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Card sx={{ bgcolor: '#f8f9fa' }}>
//                 <CardContent>
//                   <Typography color="textSecondary" gutterBottom>
//                     URLs Crawled
//                   </Typography>
//                   <Typography variant="h3">
//                     {scan.results.target_data?.urls_crawled || 0}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Card sx={{ bgcolor: '#f8f9fa' }}>
//                 <CardContent>
//                   <Typography color="textSecondary" gutterBottom>
//                     Forms Found
//                   </Typography>
//                   <Typography variant="h3">
//                     {scan.results.target_data?.forms_found || 0}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Card sx={{ bgcolor: '#f8f9fa' }}>
//                 <CardContent>
//                   <Typography color="textSecondary" gutterBottom>
//                     Input Fields
//                   </Typography>
//                   <Typography variant="h3">
//                     {scan.results.target_data?.input_fields || 0}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* Vulnerabilities Table */}
//           <Paper sx={{ p: 3 }}>
//             <Typography variant="h5" gutterBottom>
//               <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//               Detected Vulnerabilities
//             </Typography>
//             <Divider sx={{ mb: 2 }} />

//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Severity</TableCell>
//                     <TableCell>Type</TableCell>
//                     <TableCell>URL</TableCell>
//                     <TableCell>Parameter</TableCell>
//                     <TableCell>Evidence</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {scan.results.vulnerabilities?.map((vuln, index) => (
//                     <TableRow key={index}>
//                       <TableCell>
//                         <Chip
//                           icon={getSeverityIcon(vuln.severity)}
//                           label={vuln.severity}
//                           color={getSeverityColor(vuln.severity)}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>{vuln.type}</TableCell>
//                       <TableCell>{vuln.url}</TableCell>
//                       <TableCell>{vuln.parameter || 'N/A'}</TableCell>
//                       <TableCell>
//                         <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
//                           {vuln.evidence}
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             {(!scan.results.vulnerabilities || scan.results.vulnerabilities.length === 0) && (
//               <Alert severity="success" sx={{ mt: 2 }}>
//                 No vulnerabilities found! Your application appears to be secure.
//               </Alert>
//             )}
//           </Paper>

//           {/* Report Links */}
//           {scan.results?.reports && (
//             <Paper sx={{ p: 3, mt: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Download Reports
//               </Typography>
//               <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                 <Button
//                   variant="contained"
//                   startIcon={<DescriptionIcon />}
//                   href={`http://localhost:5000/reports/${scan.results.reports.json}`}
//                   target="_blank"
//                   sx={{
//                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
//                   }}
//                 >
//                   Download JSON Report
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   startIcon={<PictureAsPdfIcon />}
//                   href={`http://localhost:5000/reports/${scan.results.reports.html}`}
//                   target="_blank"
//                 >
//                   Download HTML Report
//                 </Button>
//               </Box>
//             </Paper>
//           )}
//         </>
//       )}

//       <Box sx={{ mt: 3 }}>
//         <Button variant="outlined" onClick={() => navigate('/')}>
//           Back to Dashboard
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default ScanResults;