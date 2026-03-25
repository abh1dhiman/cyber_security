// frontend/src/components/ScanHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Box, TextField, InputAdornment, Pagination,
  CircularProgress, Tooltip, Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScanHistory = ({ onDelete }) => {
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchScans();
  }, []);

  useEffect(() => {
    filterScans();
  }, [searchTerm, scans]);

  const fetchScans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scans');
      setScans(res.data);
      setFilteredScans(res.data);
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterScans = () => {
    const filtered = scans.filter(scan =>
      scan.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.scan_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredScans(filtered);
    setPage(1);
  };

  const handleDelete = async (scanId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this scan permanently?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/scans/${scanId}`);
      fetchScans();
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const paginatedScans = filteredScans.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Scan History
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          View, analyze, and manage all past vulnerability scans
        </Typography>
      </Box>

      {/* MAIN CARD */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >

        {/* SEARCH */}
        <TextField
          fullWidth
          placeholder="Search by URL or Scan ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <Divider sx={{ mb: 3 }} />

        {/* LOADING */}
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              Loading scan history...
            </Typography>
          </Box>
        ) : filteredScans.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No scans found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Scan ID</b></TableCell>
                    <TableCell><b>Target URL</b></TableCell>
                    <TableCell><b>Date</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Vulns</b></TableCell>
                    <TableCell align="center"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedScans.map(scan => (
                    <TableRow
                      key={scan.scan_id}
                      hover
                      onClick={() => navigate(`/scan/${scan.scan_id}`)}
                      sx={{
                        cursor: 'pointer',
                        transition: '0.25s',
                        '&:hover': {
                          bgcolor: '#f6f8ff'
                        }
                      }}
                    >
                      <TableCell>{scan.scan_id}</TableCell>
                      <TableCell>{scan.target_url}</TableCell>
                      <TableCell>
                        {new Date(scan.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scan.status}
                          size="small"
                          color={getStatusColor(scan.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scan.vulnerability_count || 0}
                          size="small"
                          color={scan.vulnerability_count > 0 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Scan">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/scan/${scan.scan_id}`);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Scan">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => handleDelete(scan.scan_id, e)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            {filteredScans.length > rowsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(filteredScans.length / rowsPerPage)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ScanHistory;

















// frontend/src/components/ScanHistory.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Paper, Typography, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, Chip, IconButton,
//   Box, TextField, InputAdornment, Pagination
// } from '@mui/material';
// import {
//   Delete as DeleteIcon,
//   Visibility as ViewIcon,
//   Search as SearchIcon
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ScanHistory = ({ onDelete }) => {
//   const [scans, setScans] = useState([]);
//   const [filteredScans, setFilteredScans] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const rowsPerPage = 10;
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchScans();
//   }, []);

//   useEffect(() => {
//     filterScans();
//   }, [searchTerm, scans]);

//   const fetchScans = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/scans');
//       setScans(response.data);
//       setFilteredScans(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching scans:', error);
//       setLoading(false);
//     }
//   };

//   const filterScans = () => {
//     const filtered = scans.filter(scan =>
//       scan.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       scan.scan_id.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredScans(filtered);
//     setPage(1);
//   };

//   const handleDelete = async (scanId, event) => {
//     event.stopPropagation();
//     if (window.confirm('Are you sure you want to delete this scan?')) {
//       try {
//         await axios.delete(`http://localhost:5000/api/scans/${scanId}`);
//         fetchScans();
//         if (onDelete) onDelete();
//       } catch (error) {
//         console.error('Error deleting scan:', error);
//       }
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'completed': return 'success';
//       case 'running': return 'warning';
//       case 'failed': return 'error';
//       default: return 'default';
//     }
//   };

//   const paginatedScans = filteredScans.slice(
//     (page - 1) * rowsPerPage,
//     page * rowsPerPage
//   );

//   return (
//     <Paper sx={{ p: 3 }}>
//       <Typography variant="h5" gutterBottom>
//         Scan History
//       </Typography>

//       <Box sx={{ mb: 3 }}>
//         <TextField
//           fullWidth
//           variant="outlined"
//           placeholder="Search by URL or Scan ID..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             )
//           }}
//         />
//       </Box>

//       <TableContainer>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Scan ID</TableCell>
//               <TableCell>Target URL</TableCell>
//               <TableCell>Date</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Vulnerabilities</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedScans.map((scan) => (
//               <TableRow 
//                 key={scan.scan_id}
//                 hover
//                 onClick={() => navigate(`/scan/${scan.scan_id}`)}
//                 sx={{ cursor: 'pointer' }}
//               >
//                 <TableCell>{scan.scan_id}</TableCell>
//                 <TableCell>{scan.target_url}</TableCell>
//                 <TableCell>
//                   {new Date(scan.created_at).toLocaleDateString()}
//                 </TableCell>
//                 <TableCell>
//                   <Chip 
//                     label={scan.status}
//                     color={getStatusColor(scan.status)}
//                     size="small"
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <Chip 
//                     label={scan.vulnerability_count || 0}
//                     color={scan.vulnerability_count > 0 ? 'error' : 'default'}
//                     size="small"
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <IconButton 
//                     size="small"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/scan/${scan.scan_id}`);
//                     }}
//                   >
//                     <ViewIcon />
//                   </IconButton>
//                   <IconButton 
//                     size="small"
//                     onClick={(e) => handleDelete(scan.scan_id, e)}
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {filteredScans.length > rowsPerPage && (
//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
//           <Pagination 
//             count={Math.ceil(filteredScans.length / rowsPerPage)}
//             page={page}
//             onChange={(e, value) => setPage(value)}
//             color="primary"
//           />
//         </Box>
//       )}

//       {filteredScans.length === 0 && (
//         <Box sx={{ textAlign: 'center', py: 4 }}>
//           <Typography color="textSecondary">
//             No scans found
//           </Typography>
//         </Box>
//       )}
//     </Paper>
//   );
// };

// export default ScanHistory;