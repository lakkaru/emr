import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Alert
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as SpeakingIcon
} from '@mui/icons-material';

const VoiceInput = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // You can make this configurable
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        setError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Tooltip title="Voice input not supported in this browser">
        <IconButton disabled size="small">
          <MicOffIcon />
        </IconButton>
      </Tooltip>
    );
  }

  if (error) {
    return (
      <Tooltip title={error}>
        <IconButton disabled size="small" color="error">
          <MicOffIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={isListening ? "Stop voice input" : "Start voice input"}>
        <IconButton
          onClick={toggleListening}
          disabled={disabled}
          size="small"
          color={isListening ? "primary" : "default"}
          sx={{
            backgroundColor: isListening ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
            '&:hover': {
              backgroundColor: isListening ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {isListening ? <SpeakingIcon /> : <MicIcon />}
        </IconButton>
      </Tooltip>
      
      {isListening && (
        <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem' }}>
          Listening...
        </Typography>
      )}
    </Box>
  );
};

export default VoiceInput;
