// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, AppBar, Toolbar, Typography, Button,
  CssBaseline, ThemeProvider, createTheme, Box,
  CircularProgress, Alert, Chip, Paper
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './components/Dashboard';
import NewScan from './components/NewScan';
import ScanResults from './components/ScanResults';
import ScanHistory from './components/ScanHistory';
import { scanService } from './services/api';

const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    success: { main: '#28a745' },
    warning: { main: '#ffc107' },
    error: { main: '#dc3545' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14
        }
      }
    }
  }
});

function App() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking | online | offline

  useEffect(() => {
    checkBackendStatus();
    loadScans();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/');
      setBackendStatus(res.ok ? 'online' : 'offline');
    } catch {
      setBackendStatus('offline');
    }
  };

  const loadScans = async () => {
    try {
      setLoading(true);
      const data = await scanService.getAllScans();
      setScans(data);
      setError(null);
    } catch {
      setError('Unable to connect to backend. Please ensure Flask server is running.');
    } finally {
      setLoading(false);
    }
  };

  const refreshScans = () => loadScans();

  /* BACKEND OFFLINE SCREEN */
  if (backendStatus === 'offline') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            p: 3
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 520 }}>
            <Typography variant="h4" color="error" gutterBottom>
              Backend Offline
            </Typography>
            <Typography paragraph>
              The Flask backend server is not running.
            </Typography>

            <Paper
              sx={{
                p: 2,
                bgcolor: '#f8f9fa',
                fontFamily: 'monospace',
                mb: 3
              }}
            >
              cd backend <br />
              venv\Scripts\activate <br />
              python app.py
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>

        {/* APP BAR */}
        <AppBar
          position="static"
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}
        >
          <Toolbar>
            <Typography
              component={Link}
              to="/"
              variant="h6"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🔒 Web Vulnerability Scanner
            </Typography>

            <Chip
              label={backendStatus === 'online' ? 'Backend Online' : 'Checking'}
              color={backendStatus === 'online' ? 'success' : 'warning'}
              size="small"
              sx={{ mr: 2 }}
            />

            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/new-scan">New Scan</Button>
            <Button color="inherit" component={Link} to="/history">History</Button>
          </Toolbar>
        </AppBar>

        {/* MAIN CONTENT */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard scans={scans} onRefresh={refreshScans} />} />
              <Route path="/new-scan" element={<NewScan onScanCreated={refreshScans} />} />
              <Route path="/scan/:id" element={<ScanResults />} />
              <Route path="/history" element={<ScanHistory onDelete={refreshScans} />} />
            </Routes>
          )}
        </Container>

        {/* FOOTER */}
        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: 'center',
            bgcolor: '#f8f9fa',
            borderTop: '1px solid #e5e7eb'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Web Vulnerability Scanner — Educational Use Only
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Scan only websites you own or have explicit permission to test
          </Typography>
        </Box>

      </Router>
    </ThemeProvider>
  );
}

export default App;
















// frontend/src/App.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Container, AppBar, Toolbar, Typography, Button, 
//   CssBaseline, ThemeProvider, createTheme, Box,
//   CircularProgress, Alert
// } from '@mui/material';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Dashboard from './components/Dashboard';
// import NewScan from './components/NewScan';
// import ScanResults from './components/ScanResults';
// import ScanHistory from './components/ScanHistory';
// import { scanService } from './services/api';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#667eea',
//     },
//     secondary: {
//       main: '#764ba2',
//     },
//     critical: {
//       main: '#dc3545',
//     },
//     high: {
//       main: '#fd7e14',
//     },
//     medium: {
//       main: '#ffc107',
//     },
//     low: {
//       main: '#28a745',
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     h4: {
//       fontWeight: 600,
//     },
//     h5: {
//       fontWeight: 600,
//     },
//     h6: {
//       fontWeight: 600,
//     },
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: 'none',
//           borderRadius: 8,
//           fontWeight: 500,
//         },
//       },
//     },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//           boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//         },
//       },
//     },
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//         },
//       },
//     },
//   },
// });

// function App() {
//   const [scans, setScans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline

//   useEffect(() => {
//     checkBackendStatus();
//     loadScans();
//   }, []);

//   const checkBackendStatus = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/');
//       if (response.ok) {
//         setBackendStatus('online');
//       } else {
//         setBackendStatus('offline');
//       }
//     } catch (error) {
//       console.error('Backend is not reachable:', error);
//       setBackendStatus('offline');
//     }
//   };

//   const loadScans = async () => {
//     try {
//       setLoading(true);
//       const data = await scanService.getAllScans();
//       setScans(data);
//       setError(null);
//     } catch (error) {
//       console.error('Failed to load scans:', error);
//       setError('Failed to connect to backend. Make sure Flask server is running on port 5000.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshScans = () => {
//     loadScans();
//   };

//   // Show backend offline warning
//   if (backendStatus === 'offline') {
//     return (
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Box sx={{ 
//           minHeight: '100vh', 
//           display: 'flex', 
//           alignItems: 'center', 
//           justifyContent: 'center',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           p: 3
//         }}>
//           <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
//             <Typography variant="h4" gutterBottom color="error">
//               🔌 Backend Not Running
//             </Typography>
//             <Typography variant="body1" paragraph>
//               The Flask backend server is not running. Please start it first:
//             </Typography>
//             <Box sx={{ 
//               bgcolor: '#f5f5f5', 
//               p: 2, 
//               borderRadius: 1,
//               fontFamily: 'monospace',
//               textAlign: 'left',
//               mb: 2
//             }}>
//               <Typography variant="body2">
//                 cd backend<br/>
//                 venv\Scripts\activate<br/>
//                 python app.py
//               </Typography>
//             </Box>
//             <Button 
//               variant="contained" 
//               onClick={() => window.location.reload()}
//               sx={{
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
//               }}
//             >
//               Retry Connection
//             </Button>
//           </Paper>
//         </Box>
//       </ThemeProvider>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
//           <AppBar position="static" sx={{ 
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
//           }}>
//             <Toolbar>
//               <Typography 
//                 variant="h6" 
//                 component={Link} 
//                 to="/" 
//                 sx={{ 
//                   flexGrow: 1, 
//                   textDecoration: 'none', 
//                   color: 'white',
//                   fontWeight: 600,
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1
//                 }}
//               >
//                 <span style={{ fontSize: '1.5em' }}>🔒</span>
//                 Web Vulnerability Scanner
//               </Typography>
//               <Box sx={{ display: 'flex', gap: 1 }}>
//                 <Button 
//                   color="inherit" 
//                   component={Link} 
//                   to="/"
//                   sx={{ fontWeight: 500 }}
//                 >
//                   Dashboard
//                 </Button>
//                 <Button 
//                   color="inherit" 
//                   component={Link} 
//                   to="/new-scan"
//                   sx={{ fontWeight: 500 }}
//                 >
//                   New Scan
//                 </Button>
//                 <Button 
//                   color="inherit" 
//                   component={Link} 
//                   to="/history"
//                   sx={{ fontWeight: 500 }}
//                 >
//                   History
//                 </Button>
//               </Box>
//             </Toolbar>
//           </AppBar>

//           <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
//             {loading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
//                 <CircularProgress />
//               </Box>
//             ) : error ? (
//               <Alert severity="error" sx={{ mt: 2 }}>
//                 {error}
//               </Alert>
//             ) : (
//               <Routes>
//                 <Route path="/" element={<Dashboard scans={scans} onRefresh={refreshScans} />} />
//                 <Route path="/new-scan" element={<NewScan onScanCreated={refreshScans} />} />
//                 <Route path="/scan/:id" element={<ScanResults />} />
//                 <Route path="/history" element={<ScanHistory scans={scans} onDelete={refreshScans} />} />
//               </Routes>
//             )}
//           </Container>

//           <Box component="footer" sx={{ 
//             py: 3, 
//             px: 2, 
//             mt: 'auto',
//             backgroundColor: '#f8f9fa',
//             borderTop: '1px solid #e9ecef'
//           }}>
//             <Container maxWidth="xl">
//               <Typography variant="body2" color="textSecondary" align="center">
//                 Web Vulnerability Scanner - Educational Purpose Only
//               </Typography>
//               <Typography variant="caption" color="textSecondary" align="center" display="block">
//                 Always ensure you have permission before scanning websites
//               </Typography>
//             </Container>
//           </Box>
//         </Box>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;