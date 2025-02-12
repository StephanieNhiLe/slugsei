import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/herosection-baseball.jpg';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGenerateVideoClick = () => {
    navigate('/baseball-ai');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '80vh',
        width: '100vw', 
        overflow: 'hidden', // Disable scrolling
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: 'center',
        textAlign: isMobile ? 'center' : 'left',
        padding: isMobile ? '5% 2%' : '2% 7%',
        color: 'white',
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          filter: 'brightness(0.5)', // Reduce brightness for better text visibility
          zIndex: -1,
        }}
      />

      {/* Text Content */}
      <Typography
        variant={isMobile ? 'h3' : 'h1'}
        gutterBottom
        sx={{
          fontWeight: 'bold',
          mt: 8,
          mb: 2,
          background: '#FFFFFF',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Transform your <br /> Baseball Game With AI
      </Typography>
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        gutterBottom
        sx={{
          mt: 3,
          fontSize: isMobile ? '1em' : '1.5em',
          fontFamily: 'revert',
        }}
      >
        Experience the future of baseball coaching with SlugSei. Our AI-powered
        platform provides <br />
        personalized feedback to level up. Upload your videos to try it today.
      </Typography>
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#BA0C2F',
          padding: isMobile ? '2% 3%' : '1% 1.5%',
          fontSize: isMobile ? '0.8em' : '1em',
          borderRadius: '3rem',
          '&:hover': {
            backgroundColor: '#A11222',
            fontcolor: '#FFFFFF',
          },
          mt: 4,
        }}
        onClick={handleGenerateVideoClick}
      >
        Try SlugSei
      </Button>
    </Box>
  );
};

export default HeroSection;
