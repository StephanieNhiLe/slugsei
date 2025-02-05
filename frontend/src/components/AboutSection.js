import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import analysisImage from '../assets/aboutsection-student.png'; // Replace with your image path

const AboutSection = () => {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      alignItems="center"
      justifyContent="center"
      px={{ xs: 4, md: 12 }}
      py={{ xs: 6, md: 12 }}
      gap={{ xs: 6, md: 10 }}
      sx={{
        backgroundColor: '#f4f4f4',
        borderRadius: '16px', // Rounded section edges
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
        overflow: 'hidden', // Prevent content overflow
        textAlign: 'center',
      }}
    >
      {/* Left Text Content */}
      <Box
        flex={{ xs: 1, md: 0.6 }}
        sx={{
          textAlign: { xs: 'center', md: 'left' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pl: { xs: 0, md: 5 }, // Add padding to the left for desktop
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            mb: 7,
            color: '#2E3A59',
            lineHeight: 1.2,
          }}
        >
          Discover How Our AI-Powered Analysis Works
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#555',
            mb: 5,
            fontSize: '1.5rem',
            lineHeight: 1.8,
          }}
        >
          Upload your baseball videos effortlessly and let our advanced AI algorithms provide you with comprehensive analysis. Receive personalized feedback to enhance your skills and transform your game.
        </Typography>
        {/* Stats */}
        <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }} gap={8}>
          <Box textAlign="center">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#2E3A59',
                mb: 1,
              }}
            >
              100 %
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#777', fontSize: '1.2rem' }}
            >
              User satisfaction rate with our AI analysis.
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#2E3A59',
                mb: 1,
              }}
            >
              5000 videos
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#777', fontSize: '1.2rem' }}
            >
              Videos analyzed monthly by our platform.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Button
            variant="contained"
            href="/baseball-ai"
            sx={{
              width: { xs: '60%', md: '20%' }, // Responsive button width
              backgroundColor: '#BA0C2F', // Red button color
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '5%',
              fontFamily: "'Roboto', sans-serif",
              color: '#FFFFFF',
              textTransform: 'uppercase',
              padding: '0.5rem 1.5rem',
              '&:hover': {
                backgroundColor: '#A11222', // Darker red hover effect
              },
            }}
          >
            Try SlugSei
          </Button>
        </Box>
      </Box>

      {/* Right Image Content */}
      <Box
        flex={{ xs: 1, md: 0.4 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pr: { xs: 0, md: 9 },
        }}
      >
        <img
          src={analysisImage}
          alt="AI Analysis"
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '12px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)', // Image shadow
          }}
        />
      </Box>
    </Box>
  );
};

export default AboutSection;
