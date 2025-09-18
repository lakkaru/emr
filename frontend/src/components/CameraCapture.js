import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Refresh as RetakeIcon
} from '@mui/icons-material';

const CameraCapture = ({ onCapture, disabled = false, maxImages = 5 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera if available
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions and try again.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setError('');
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        const newImage = {
          id: Date.now(),
          url: imageUrl,
          blob: blob,
          timestamp: new Date().toLocaleString()
        };
        
        setCapturedImages(prev => [...prev, newImage]);
      }
    }, 'image/jpeg', 0.8);
  };

  const deleteImage = (imageId) => {
    setCapturedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up object URL to prevent memory leaks
      const imageToDelete = prev.find(img => img.id === imageId);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      return updated;
    });
  };

  const handleSaveImages = () => {
    if (onCapture && capturedImages.length > 0) {
      onCapture(capturedImages);
    }
    setCapturedImages([]);
    handleClose();
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      capturedImages.forEach(img => {
        URL.revokeObjectURL(img.url);
      });
    };
  }, []);

  return (
    <>
      <Button
        startIcon={<CameraIcon />}
        onClick={handleOpen}
        disabled={disabled}
        variant="outlined"
        size="small"
        sx={{ textTransform: 'none' }}
      >
        Capture Images
      </Button>

      <Dialog 
        open={isOpen} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Capture Images for Documentation
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {/* Camera View */}
            <Grid item xs={12} md={8}>
              <Box sx={{ position: 'relative', width: '100%', backgroundColor: '#000', borderRadius: 1 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'cover'
                  }}
                />
                
                {stream && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: '50%', 
                    transform: 'translateX(-50%)'
                  }}>
                    <Button
                      variant="contained"
                      onClick={captureImage}
                      disabled={capturedImages.length >= maxImages}
                      sx={{
                        borderRadius: '50%',
                        minWidth: 64,
                        height: 64,
                        backgroundColor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <CameraIcon sx={{ fontSize: 32 }} />
                    </Button>
                  </Box>
                )}
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
              
              {capturedImages.length >= maxImages && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Maximum {maxImages} images captured. Delete some to capture more.
                </Alert>
              )}
            </Grid>
            
            {/* Captured Images */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Captured Images ({capturedImages.length}/{maxImages})
              </Typography>
              
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {capturedImages.map((image) => (
                  <Card key={image.id} sx={{ mb: 1 }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={image.url}
                      alt={`Captured at ${image.timestamp}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {image.timestamp}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => deleteImage(image.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
                
                {capturedImages.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                    No images captured yet
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSaveImages}
            variant="contained"
            disabled={capturedImages.length === 0}
          >
            Save {capturedImages.length} Image{capturedImages.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CameraCapture;
