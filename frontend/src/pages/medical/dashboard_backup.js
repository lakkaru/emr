import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Avatar,
  Chip,
  Stack,
  Alert,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  LocalHospital as MedicalIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Article as NewsIcon,
  TrendingUp as TrendingIcon,
  Science as ResearchIcon,
  Vaccines as VaccineIcon,
  OpenInNew as ExternalIcon,
  AccessTime as TimeIcon,
  Announcement as AnnouncementIcon,
  NotificationsActive as NotificationIcon,
  PriorityHigh as PriorityIcon,
  CheckCircle as ReadIcon,
  RadioButtonUnchecked as UnreadIcon,
  AdminPanelSettings as AdminIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { navigate } from 'gatsby';
import { apiClient } from '../../utils/api';

export default function MedicalOfficerDashboard() {
  const { user, token, isLoading } = useAuth();
  const api = React.useMemo(() => apiClient(token), [token]);
  
  // Redirect if not medical officer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && (!token || user?.role !== 'medical_officer')) {
      navigate('/login');
    }
  }, [token, user, isLoading]);

  const [stats, setStats] = React.useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingDiagnoses: 0
  });

  const [error, setError] = React.useState('');
  const [medicalNews, setMedicalNews] = React.useState([]);
  const [announcements, setAnnouncements] = React.useState([]);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = React.useState(0);

  React.useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const patientsResponse = await api.get('/patients?limit=1');
        
        setStats({
          todayAppointments: 0, // TODO: Implement today's appointments
          totalPatients: patientsResponse.total || 0,
          pendingDiagnoses: 0 // TODO: Implement pending diagnoses
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        // Stats loaded
      }
    };

    const loadAnnouncements = async () => {
      try {
        const response = await api.get('/announcements?limit=5');
        setAnnouncements(response.announcements || []);
        setUnreadAnnouncementsCount(response.unreadCount || 0);
      } catch (err) {
        console.error('Failed to load announcements:', err);
        // Set sample data for demonstration
        const sampleAnnouncements = [
          {
            id: 1,
            title: 'New Patient Privacy Policy Updates',
            content: 'We have updated our patient privacy policies in accordance with the latest healthcare regulations. All staff members are required to review the updated policies.',
            type: 'policy',
            priority: 'high',
            isRead: false,
            publishDate: '2025-09-18',
            createdBy: { name: 'Hospital Admin' }
          },
          {
            id: 2,
            title: 'System Maintenance Scheduled',
            content: 'The EMR system will undergo scheduled maintenance on Saturday, September 23rd, 2025 from 2:00 AM to 6:00 AM.',
            type: 'system',
            priority: 'critical',
            isRead: false,
            publishDate: '2025-09-17',
            createdBy: { name: 'IT Department' }
          },
          {
            id: 3,
            title: 'Mandatory CPR Training Session',
            content: 'All medical staff are required to attend the CPR recertification training scheduled for next week.',
            type: 'training',
            priority: 'high',
            isRead: true,
            publishDate: '2025-09-16',
            createdBy: { name: 'Training Department' }
          }
        ];
        setAnnouncements(sampleAnnouncements);
        setUnreadAnnouncementsCount(sampleAnnouncements.filter(a => !a.isRead).length);
      }
    };

    const loadMedicalNews = () => {
      // Sample medical news data - In production, this would come from a medical news API
      const newsData = [
        {
          id: 1,
          title: 'New Guidelines for Hypertension Management Released',
          summary: 'Updated American Heart Association guidelines emphasize lifestyle modifications and personalized treatment approaches.',
          category: 'Cardiology',
          publishedDate: '2025-09-15',
          source: 'American Heart Association',
          urgency: 'high',
          readTime: 5,
          url: '#'
        },
        {
          id: 2,
          title: 'Breakthrough in Diabetes Treatment: GLP-1 Receptor Agonists',
          summary: 'Recent studies show significant improvements in cardiovascular outcomes with new generation GLP-1 medications.',
          category: 'Endocrinology',
          publishedDate: '2025-09-14',
          source: 'New England Journal of Medicine',
          urgency: 'medium',
          readTime: 8,
          url: '#'
        },
        {
          id: 3,
          title: 'COVID-19 Vaccine Updates: Bivalent Boosters Recommended',
          summary: 'WHO recommends updated bivalent boosters for healthcare workers and high-risk populations.',
          category: 'Infectious Disease',
          publishedDate: '2025-09-13',
          source: 'World Health Organization',
          urgency: 'high',
          readTime: 4,
          url: '#'
        },
        {
          id: 4,
          title: 'AI-Assisted Diagnosis Shows Promise in Early Cancer Detection',
          summary: 'Machine learning algorithms demonstrate 95% accuracy in identifying early-stage lung cancer from CT scans.',
          category: 'Oncology',
          publishedDate: '2025-09-12',
          source: 'Nature Medicine',
          urgency: 'medium',
          readTime: 6,
          url: '#'
        },
        {
          id: 5,
          title: 'Mental Health Integration in Primary Care: Best Practices',
          summary: 'Comprehensive guide for integrating mental health screening and treatment in primary care settings.',
          category: 'Psychiatry',
          publishedDate: '2025-09-11',
          source: 'American Medical Association',
          urgency: 'low',
          readTime: 10,
          url: '#'
        }
      ];
      
      setMedicalNews(newsData);
    };

    if (token && user?.role === 'medical_officer') {
      loadDashboardStats();
      loadAnnouncements();
      loadMedicalNews();
    }
  }, [token, user, api]);

  // Dashboard cards are commented out but kept for potential future use
  // const dashboardCards = [
  //   {
  //     title: 'Diagnoses & Treatment',
  //     description: 'Record diagnoses and treatment plans',
  //     icon: <DiagnosisIcon sx={{ fontSize: 40 }} />,
  //     color: 'success',
  //     action: 'Manage Cases',
  //     path: '/medical/diagnoses',
  //     priority: 'high'
  //   },
  //   {
  //     title: 'Prescriptions',
  //     description: 'Write and manage prescriptions',
  //     icon: <PrescriptionIcon sx={{ fontSize: 40 }} />,
  //     color: 'info',
  //     action: 'Prescriptions',
  //     path: '/medical/prescriptions',
  //     priority: 'high'
  //   },
  //   {
  //     title: 'Vital Signs',
  //     description: 'Monitor patient vital signs',
  //     icon: <VitalsIcon sx={{ fontSize: 40 }} />,
  //     color: 'warning',
  //     action: 'View Vitals',
  //     path: '/medical/vitals',
  //     priority: 'medium'
  //   }
  // ];

  const quickActions = [
    {
      title: 'Patient Search',
      description: 'Search patients by barcode or manually',
      icon: <SearchIcon />,
      action: () => navigate('/medical/patients'),
      color: 'primary'
    },
    // {
    //   title: 'Today\'s Schedule',
    //   description: 'View today\'s appointment schedule',
    //   icon: <ScheduleIcon />,
    //   action: () => navigate('/medical/schedule'),
    //   color: 'info'
    // }
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'medical_officer') {
    return null;
  }

  return (
    <Navigation title="Medical Officer Dashboard" currentPath="/medical/dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MedicalIcon color="primary" />
            Medical Officer Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, Dr. {user?.name}. Manage patient care and medical records.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Today's Overview */}
        {/* <Paper sx={{ p: 3, mb: 4, bgcolor: 'success.50', border: 1, borderColor: 'success.200' }}>
          <Typography variant="h6" gutterBottom color="success.main">
            Today's Medical Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.todayAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Appointments
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main" fontWeight="bold">
                  {stats.totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {stats.pendingDiagnoses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Reviews
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper> */}

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-2px)', 
                      boxShadow: 3 
                    }
                  }}
                  onClick={action.action}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${action.color}.main` }}>
                        {action.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Hospital Announcements Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'warning.50', 
          border: 1, 
          borderColor: 'warning.200',
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <AnnouncementIcon color="warning" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
              Hospital Announcements
            </Typography>
            <Chip 
              icon={<AdminIcon />} 
              label="Management Updates" 
              color="warning" 
              variant="filled" 
              size="small" 
            />
          </Box>
          
          {announcements.length > 0 ? (
            <Box>
              {announcements.map((announcement) => (
                <Accordion 
                  key={announcement.id}
                  sx={{ 
                    mb: 1,
                    border: announcement.priority === 'critical' ? 2 : 1,
                    borderColor: announcement.priority === 'critical' ? 'error.main' : 
                                announcement.priority === 'high' ? 'warning.main' : 'warning.300',
                    bgcolor: 'warning.25',
                    borderRadius: 1,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      bgcolor: 'warning.50',
                    }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: 'warning.main' }} />}
                    sx={{ bgcolor: 'warning.100', borderRadius: '4px 4px 0 0' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <AnnouncementIcon fontSize="small" color="warning" />
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          flex: 1,
                          fontWeight: 'bold',
                          color: 'warning.dark'
                        }}
                      >
                        {announcement.title}
                      </Typography>
                      
                      <Chip 
                        label={announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                        size="small"
                        color={
                          announcement.type === 'urgent' || announcement.type === 'system' ? 'error' :
                          announcement.type === 'policy' || announcement.type === 'training' ? 'warning' :
                          'default'
                        }
                        variant="outlined"
                      />
                      
                      {announcement.priority === 'critical' && (
                        <Chip label="CRITICAL" size="small" color="error" variant="filled" />
                      )}
                      {announcement.priority === 'high' && (
                        <Chip label="HIGH" size="small" color="warning" variant="filled" />
                      )}
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Typography variant="body1" paragraph>
                      {announcement.content}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        From: {announcement.createdBy?.name || 'Hospital Management'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Published: {new Date(announcement.publishDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <AnnouncementIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Announcements
              </Typography>
              <Typography variant="body2" color="text.disabled">
                There are currently no announcements from hospital management.
              </Typography>
            </Paper>
          )}
        </Paper>
        
        {/* Section Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
          <Divider sx={{ flex: 1 }} />
          <Chip 
            label="Medical Information Hub" 
            color="info" 
            variant="outlined" 
            sx={{ mx: 2, fontWeight: 'bold' }}
          />
          <Divider sx={{ flex: 1 }} />
        </Box>
        
        {/* Current Medical News Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'primary.50', 
          border: 1, 
          borderColor: 'primary.200',
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <NewsIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
              Current Medical News & Updates
            </Typography>
            <Chip 
              icon={<TrendingIcon />} 
              label="Stay Updated" 
              color="primary" 
              variant="filled" 
              size="small" 
            />
          </Box>
          
          {medicalNews.length > 0 ? (
            <Box>
              {medicalNews.map((news) => (
                <Accordion 
                  key={news.id}
                  sx={{ 
                    mb: 1,
                    border: news.urgency === 'high' ? 2 : 1,
                    borderColor: news.urgency === 'high' ? 'error.main' : 
                                news.urgency === 'medium' ? 'warning.main' : 'primary.300',
                    bgcolor: 'primary.25',
                    borderRadius: 1,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      bgcolor: 'primary.50',
                    }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                    sx={{ bgcolor: 'primary.100', borderRadius: '4px 4px 0 0' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <NewsIcon fontSize="small" color="primary" />
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          flex: 1,
                          fontWeight: 'bold',
                          color: 'primary.dark'
                        }}
                      >
                        {news.title}
                      </Typography>
                      
                      <Chip 
                        label={news.category}
                        size="small"
                        color={
                          news.category === 'Cardiology' ? 'error' :
                          news.category === 'Endocrinology' ? 'warning' :
                          news.category === 'Infectious Disease' ? 'info' :
                          news.category === 'Oncology' ? 'secondary' :
                          'default'
                        }
                        variant="outlined"
                      />
                      
                      {news.urgency === 'high' && (
                        <Chip label="URGENT" size="small" color="error" variant="filled" />
                      )}
                      {news.urgency === 'medium' && (
                        <Chip label="MEDIUM" size="small" color="warning" variant="filled" />
                      )}
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Typography variant="body1" paragraph>
                      {news.summary}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="disabled" />
                        <Typography variant="caption" color="text.secondary">
                          {news.readTime} min read
                        </Typography>
                      </Box>
                      {news.category === 'Infectious Disease' && <VaccineIcon fontSize="small" color="info" />}
                      {news.category === 'Oncology' && <ResearchIcon fontSize="small" color="secondary" />}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Source: {news.source}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Published: {new Date(news.publishedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<ExternalIcon fontSize="small" />}
                        onClick={() => window.open(news.url, '_blank')}
                      >
                        Read Full Article
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <NewsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Medical News
              </Typography>
              <Typography variant="body2" color="text.disabled">
                There are currently no medical news updates available.
              </Typography>
            </Paper>
          )}
        </Paper>
        {/* Medical Guidelines */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Medical Guidelines & Resources
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<MedicalIcon />} label="HIPAA Compliant" color="success" />
            <Chip icon={<AssignmentIcon />} label="Evidence-Based Care" color="info" />
            <Chip label="Emergency Protocols Available" variant="outlined" />
            <Chip label={`Logged in as: Dr. ${user?.name}`} variant="outlined" />
          </Stack>
        </Paper>
      </Container>
    </Navigation>
  );
}
