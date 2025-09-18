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
  AccordionDetails,
  Badge
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
  Priority as PriorityIcon,
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

        {/* Announcements Section */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 4,
            mb: 4,
            border: '1px solid',
            borderColor: 'grey.300',
            bgcolor: '#fafafa',
            borderRadius: 2,
            borderLeft: '4px solid #5C6BC0'
          }}
        >
          {/* Announcements Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Avatar sx={{ bgcolor: '#5C6BC0', width: 36, height: 36 }}>
              <AnnouncementIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: '600' }}>
                Hospital Announcements
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                Important updates and notifications
              </Typography>
            </Box>
            <Badge 
              badgeContent={unreadAnnouncementsCount} 
              color="error"
              sx={{ mr: 1 }}
            >
              <NotificationIcon sx={{ color: '#5C6BC0' }} />
            </Badge>
            <Chip 
              label={`${announcements.length} Total`}
              size="small"
              sx={{ 
                bgcolor: '#E8EAF6', 
                color: '#5C6BC0',
                fontWeight: '500'
              }}
            />
          </Box>

          {/* Announcements Content */}
          {announcements.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <AnnouncementIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#757575' }}>
                No announcements available
              </Typography>
              <Typography variant="body2" sx={{ color: '#9E9E9E' }}>
                Check back later for important hospital updates
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {announcements.map((announcement) => (
                <Paper 
                  key={announcement.id}
                  elevation={1}
                  sx={{ 
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: announcement.priority === 'critical' ? '#F44336' : 
                               announcement.priority === 'high' ? '#FF9800' : '#E0E0E0',
                    bgcolor: 'white',
                    borderRadius: 1
                  }}
                >
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: announcement.priority === 'critical' ? '#FFEBEE' : 
                               announcement.priority === 'high' ? '#FFF3E0' : '#F5F5F5',
                        color: '#424242',
                        '&:hover': {
                          bgcolor: announcement.priority === 'critical' ? '#FFCDD2' : 
                                 announcement.priority === 'high' ? '#FFE0B2' : '#EEEEEE',
                        },
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {announcement.isRead ? (
                            <ReadIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                          ) : (
                            <UnreadIcon fontSize="small" sx={{ color: '#FF9800' }} />
                          )}
                          <Chip 
                            label={announcement.type}
                            size="small"
                            sx={{
                              bgcolor: announcement.type === 'policy' ? '#E3F2FD' :
                                      announcement.type === 'system' ? '#FFF3E0' :
                                      announcement.type === 'training' ? '#E8F5E8' : '#F5F5F5',
                              color: announcement.type === 'policy' ? '#1976D2' :
                                     announcement.type === 'system' ? '#F57C00' :
                                     announcement.type === 'training' ? '#388E3C' : '#616161',
                              fontWeight: '500',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        
                        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: '600', color: '#424242' }}>
                          {announcement.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {announcement.priority === 'critical' && (
                            <Chip 
                              icon={<PriorityIcon />}
                              label="Critical" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#F44336',
                                color: 'white',
                                fontWeight: '500'
                              }}
                            />
                          )}
                          {announcement.priority === 'high' && (
                            <Chip 
                              label="High Priority" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#FF9800', 
                                color: 'white',
                                fontWeight: '500'
                              }}
                            />
                          )}
                          <Typography variant="caption" sx={{ color: '#757575' }}>
                            {new Date(announcement.publishDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: '#424242' }}>
                        {announcement.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #E0E0E0' }}>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          Published by: {announcement.createdBy?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575', fontStyle: 'italic' }}>
                          {announcement.isRead ? 'Read' : 'Unread'}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

        <Paper 
          elevation={2}
          sx={{ 
            p: 4,
            mb: 4,
            border: '1px solid',
            borderColor: 'grey.300',
            bgcolor: '#fafafa',
            borderRadius: 2,
            borderLeft: '4px solid #26A69A'
          }}
        >
          {/* Medical News Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Avatar sx={{ bgcolor: '#26A69A', width: 36, height: 36 }}>
              <NewsIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: '600' }}>
                Medical News & Updates
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                Latest medical research and guidelines
              </Typography>
            </Box>
            <Chip 
              icon={<TrendingIcon />} 
              label="Stay Updated" 
              size="small"
              sx={{ 
                bgcolor: '#E0F2F1', 
                color: '#26A69A',
                fontWeight: '500'
              }}
            />
            <Chip 
              label={`${medicalNews.length} Articles`}
              size="small"
              sx={{ 
                bgcolor: '#E0F2F1', 
                color: '#26A69A',
                fontWeight: '500'
              }}
            />
          </Box>

          {/* Medical News Content */}
          {medicalNews.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NewsIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#757575' }}>
                No medical news available
              </Typography>
              <Typography variant="body2" sx={{ color: '#9E9E9E' }}>
                Check back later for the latest medical updates
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {medicalNews.slice(0, 6).map((news) => (
                  <Paper 
                    key={news.id}
                    elevation={1}
                    sx={{ 
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: news.urgency === 'high' ? '#F44336' : 
                                 news.urgency === 'medium' ? '#FF9800' : '#E0E0E0',
                      bgcolor: 'white',
                      borderRadius: 1
                    }}
                  >
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: news.urgency === 'high' ? '#FFEBEE' : 
                                 news.urgency === 'medium' ? '#FFF3E0' : '#F5F5F5',
                          color: '#424242',
                          '&:hover': {
                            bgcolor: news.urgency === 'high' ? '#FFCDD2' : 
                                   news.urgency === 'medium' ? '#FFE0B2' : '#EEEEEE',
                          },
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={news.category}
                              size="small"
                              sx={{
                                bgcolor: news.category === 'Cardiology' ? '#FFEBEE' :
                                        news.category === 'Endocrinology' ? '#FFF3E0' :
                                        news.category === 'Infectious Disease' ? '#E3F2FD' :
                                        news.category === 'Oncology' ? '#F3E5F5' : '#F5F5F5',
                                color: news.category === 'Cardiology' ? '#D32F2F' :
                                       news.category === 'Endocrinology' ? '#F57C00' :
                                       news.category === 'Infectious Disease' ? '#1976D2' :
                                       news.category === 'Oncology' ? '#7B1FA2' : '#616161',
                                fontWeight: '500',
                                fontSize: '0.75rem'
                              }}
                            />
                            {news.category === 'Infectious Disease' && <VaccineIcon fontSize="small" sx={{ color: '#1976D2' }} />}
                            {news.category === 'Oncology' && <ResearchIcon fontSize="small" sx={{ color: '#7B1FA2' }} />}
                          </Box>
                          
                          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: '600', color: '#424242' }}>
                            {news.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {news.urgency === 'high' && (
                              <Chip 
                                label="Urgent" 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#F44336',
                                  color: 'white',
                                  fontWeight: '500'
                                }}
                              />
                            )}
                            {news.urgency === 'medium' && (
                              <Chip 
                                label="Important" 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#FF9800', 
                                  color: 'white',
                                  fontWeight: '500'
                                }}
                              />
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon fontSize="small" sx={{ color: '#757575' }} />
                              <Typography variant="caption" sx={{ color: '#757575' }}>
                                {news.readTime}m
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#757575' }}>
                              {new Date(news.publishedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: '#424242' }}>
                          {news.summary}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #E0E0E0' }}>
                          <Typography variant="caption" sx={{ color: '#26A69A', fontWeight: '500' }}>
                            Source: {news.source}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="contained"
                            startIcon={<ExternalIcon fontSize="small" />}
                            onClick={() => window.open(news.url, '_blank')}
                            sx={{ 
                              bgcolor: '#26A69A', 
                              '&:hover': { bgcolor: '#00695C' },
                              textTransform: 'none',
                              fontWeight: '500'
                            }}
                          >
                            Read Article
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                ))}
              </Box>
              
              {medicalNews.length > 6 && (
                <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<NewsIcon />}
                    onClick={() => {
                      alert('Full medical news section would be implemented here');
                    }}
                    sx={{ 
                      borderColor: '#26A69A',
                      color: '#26A69A',
                      '&:hover': { 
                        bgcolor: '#E0F2F1',
                        borderColor: '#00695C'
                      },
                      textTransform: 'none',
                      fontWeight: '500'
                    }}
                  >
                    View All News ({medicalNews.length})
                  </Button>
                </Box>
              )}
            </>
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
