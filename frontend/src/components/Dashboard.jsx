// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, Grid, Card, CardContent,
  Button, Chip, Alert, Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ scans = [] }) => {
  const [stats, setStats] = useState({
    totalScans: 0,
    totalVulnerabilities: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    calculateStats();
  }, [scans]);

  const calculateStats = () => {
    let totalVulns = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    scans.forEach(scan => {
      if (scan.results?.vulnerabilities) {
        scan.results.vulnerabilities.forEach(vuln => {
          totalVulns++;
          switch (vuln.severity?.toLowerCase()) {
            case 'critical': critical++; break;
            case 'high': high++; break;
            case 'medium': medium++; break;
            case 'low': low++; break;
            default: break;
          }
        });
      }
    });

    setStats({
      totalScans: scans.length,
      totalVulnerabilities: totalVulns,
      criticalCount: critical,
      highCount: high,
      mediumCount: medium,
      lowCount: low
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, gradient }) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        background: gradient,
        color: 'white',
        backdropFilter: 'blur(10px)',
        transition: '0.3s',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.25)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          {icon}
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, mt: 2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>

      {/* HEADER */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Security Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }} color='white'>
            Monitor your scan results and vulnerabilities in real-time
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate('/new-scan')}
          sx={{
            bgcolor: 'white',
            color: '#667eea',
            fontWeight: 600,
            px: 4,
            '&:hover': { bgcolor: '#f3f3f3' }
          }}
        >
          New Scan
        </Button>
      </Box>

      {/* STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Scans"
            value={stats.totalScans}
            icon={<SecurityIcon />}
            gradient="linear-gradient(135deg, #4e73df, #224abe)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Vulnerabilities"
            value={stats.totalVulnerabilities}
            icon={<BugReportIcon />}
            gradient="linear-gradient(135deg, #6f42c1, #512da8)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Critical"
            value={stats.criticalCount}
            icon={<WarningIcon />}
            gradient="linear-gradient(135deg, #dc3545, #a71d2a)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="High"
            value={stats.highCount}
            icon={<WarningIcon />}
            gradient="linear-gradient(135deg, #fd7e14, #e8590c)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Medium"
            value={stats.mediumCount}
            icon={<TimelineIcon />}
            gradient="linear-gradient(135deg, #ffc107, #e0a800)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Low"
            value={stats.lowCount}
            icon={<SecurityIcon />}
            gradient="linear-gradient(135deg, #28a745, #1e7e34)"
          />
        </Grid>
      </Grid>

      {/* RECENT SCANS */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 , color: '#333' }}>
          Recent Scans
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {scans.length === 0 ? (
          <Alert severity="info">
            No scans yet. Click "New Scan" to get started!
          </Alert>
        ) : (
          scans.slice(0, 5).map(scan => (
            <Box
              key={scan.scan_id}
              onClick={() => navigate(`/scan/${scan.scan_id}`)}
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: '0.3s',
                bgcolor: '#f9fafc',
                '&:hover': {
                  transform: 'translateX(6px)',
                  bgcolor: '#eef2ff'
                }
              }}
            >
              <Box>
                <Typography fontWeight={600}>
                  {scan.target_url}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(scan.created_at).toLocaleString()}
                </Typography>
              </Box>

              <Box display="flex" gap={1}>
                <Chip
                  label={scan.status}
                  color={getStatusColor(scan.status)}
                  size="small"
                />
                <Chip
                  label={`${scan.vulnerability_count || 0} vulns`}
                  color={scan.vulnerability_count > 0 ? 'error' : 'default'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
















// frontend/src/components/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Paper, Typography, Box, Grid, Card, CardContent,
//   Button, Chip, CircularProgress, Alert
// } from '@mui/material';
// import { 
//   Security as SecurityIcon,
//   Warning as WarningIcon,
//   Timeline as TimelineIcon,
//   BugReport as BugReportIcon
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = ({ scans = [], onRefresh }) => {
//   const [stats, setStats] = useState({
//     totalScans: 0,
//     totalVulnerabilities: 0,
//     criticalCount: 0,
//     highCount: 0,
//     mediumCount: 0,
//     lowCount: 0
//   });
//   const navigate = useNavigate();

//   useEffect(() => {
//     calculateStats();
//   }, [scans]);

//   const calculateStats = () => {
//     let totalVulns = 0;
//     let critical = 0;
//     let high = 0;
//     let medium = 0;
//     let low = 0;
    
//     scans.forEach(scan => {
//       if (scan.results?.vulnerabilities) {
//         scan.results.vulnerabilities.forEach(vuln => {
//           totalVulns++;
//           switch(vuln.severity?.toLowerCase()) {
//             case 'critical': critical++; break;
//             case 'high': high++; break;
//             case 'medium': medium++; break;
//             case 'low': low++; break;
//             default: break;
//           }
//         });
//       }
//     });
    
//     setStats({
//       totalScans: scans.length,
//       totalVulnerabilities: totalVulns,
//       criticalCount: critical,
//       highCount: high,
//       mediumCount: medium,
//       lowCount: low
//     });
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'completed': return 'success';
//       case 'running': return 'warning';
//       case 'failed': return 'error';
//       default: return 'default';
//     }
//   };

//   const StatCard = ({ title, value, icon, color }) => (
//     <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`, color: 'white' }}>
//       <CardContent>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           <Typography variant="h6" sx={{ fontWeight: 500 }}>{title}</Typography>
//           {icon}
//         </Box>
//         <Typography variant="h3" sx={{ fontWeight: 700 }}>{value}</Typography>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <Box>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
//         <Typography variant="h4" sx={{ fontWeight: 700 }}>
//           Dashboard
//         </Typography>
//         <Button 
//           variant="contained" 
//           onClick={() => navigate('/new-scan')}
//           sx={{
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             px: 4,
//             py: 1
//           }}
//         >
//           New Scan
//         </Button>
//       </Box>

//       {/* Stats Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatCard 
//             title="Total Scans" 
//             value={stats.totalScans}
//             icon={<SecurityIcon />}
//             color="#667eea"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatCard 
//             title="Vulnerabilities" 
//             value={stats.totalVulnerabilities}
//             icon={<BugReportIcon />}
//             color="#764ba2"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatCard 
//             title="Critical" 
//             value={stats.criticalCount}
//             icon={<WarningIcon />}
//             color="#dc3545"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatCard 
//             title="High" 
//             value={stats.highCount}
//             icon={<WarningIcon />}
//             color="#fd7e14"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatCard 
//             title="Medium" 
//             value={stats.mediumCount}
//             icon={<TimelineIcon />}
//             color="#ffc107"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatCard 
//             title="Low" 
//             value={stats.lowCount}
//             icon={<SecurityIcon />}
//             color="#28a745"
//           />
//         </Grid>
//       </Grid>

//       {/* Recent Scans */}
//       <Paper sx={{ p: 3 }}>
//         <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
//           Recent Scans
//         </Typography>

//         {scans.length === 0 ? (
//           <Alert severity="info" sx={{ mt: 2 }}>
//             No scans yet. Click "New Scan" to get started!
//           </Alert>
//         ) : (
//           <Grid container spacing={2}>
//             {scans.slice(0, 5).map((scan) => (
//               <Grid item xs={12} key={scan.scan_id}>
//                 <Paper 
//                   sx={{ 
//                     p: 2, 
//                     display: 'flex', 
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s',
//                     '&:hover': { 
//                       bgcolor: '#f8f9fa',
//                       transform: 'translateY(-2px)',
//                       boxShadow: 3
//                     }
//                   }}
//                   onClick={() => navigate(`/scan/${scan.scan_id}`)}
//                 >
//                   <Box>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
//                       {scan.target_url}
//                     </Typography>
//                     <Typography variant="caption" color="textSecondary">
//                       Scan ID: {scan.scan_id} • {new Date(scan.created_at).toLocaleString()}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', gap: 1 }}>
//                     <Chip 
//                       label={scan.status}
//                       color={getStatusColor(scan.status)}
//                       size="small"
//                     />
//                     <Chip 
//                       label={`${scan.vulnerability_count || 0} vulnerabilities`}
//                       color={scan.vulnerability_count > 0 ? 'error' : 'default'}
//                       size="small"
//                       variant="outlined"
//                     />
//                   </Box>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         )}

//         {scans.length > 5 && (
//           <Box sx={{ textAlign: 'center', mt: 3 }}>
//             <Button 
//               variant="text" 
//               onClick={() => navigate('/history')}
//               sx={{ color: '#667eea' }}
//             >
//               View All Scans
//             </Button>
//           </Box>
//         )}
//       </Paper>
//     </Box>
//   );
// };

// export default Dashboard;