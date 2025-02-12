import React from 'react';
import { Box, Typography } from '@mui/material';
import reactLogo from '../assets/react.png'; // Replace with your logo paths
import geminiLogo from '../assets/gemini.png';
import googleCloudLogo from '../assets/google_cloud.png';
import tensorflowLogo from '../assets/tensorflow.png';
import mlbLogo from '../assets/mlb.png';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#002D62',
        color: '#FFFFFF',
        py: 6,
        px: { xs: 4, md: 12 },
        textAlign: 'center',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      {/* Footer Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Powered by
      </Typography>

      {/* Logos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 3, md: 6 },
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <img src={reactLogo} alt="React Logo" style={{ width: '60px', height: '60px' }} />
        <img src={geminiLogo} alt="Gemini Logo" style={{ width: '120px', height: '60px' }} />
        <img src={googleCloudLogo} alt="Google Cloud Logo" style={{ width: '60px', height: '60px' }} />
        <img src={tensorflowLogo} alt="TensorFlow Logo" style={{ width: '60px', height: '60px' }} />
        <img src={mlbLogo} alt="MLB Logo" style={{ width: '60px', height: '60px' }} />
      </Box>

      {/* Description */}
      {/* <Typography
        variant="body2"
        sx={{
          fontSize: '1rem',
          lineHeight: 1.5,
          maxWidth: '700px',
          margin: '0 auto',
          color: '#B0C4DE',
        }}
      >
        Leveraging cutting-edge technologies and years of MLB data to transform your game.
      </Typography> */}

      {/* Footer Links */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          mt: 4,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.9rem',
            color: '#B0C4DE',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Privacy Policy
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.9rem',
            color: '#B0C4DE',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Terms of Service
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.9rem',
            color: '#B0C4DE',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Contact Us
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
