import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Link, Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const list = () => (
    <Box
      sx={{
        width: 250,
        bgcolor: '#002D62', // MLB Blue background
        height: '100%',
        color: 'white', // White text
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4, // Padding from the top
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component="a" href="/" sx={{ justifyContent: 'center' }}>
          <ListItemText primary="Home" sx={{ textAlign: 'center', color: 'white', pt: 3 }} />
        </ListItem>
        <ListItem button component="a" href="/baseball-ai" sx={{ justifyContent: 'center' }}>
          <ListItemText primary="Create" sx={{ textAlign: 'center', color: 'white', pt: 3 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: '#002D62', padding: '0.5rem 2rem' }}>
      <Toolbar>
        {/* Logo/Brand Name */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Roboto', sans-serif", // Modern font
            fontWeight: 'bold',
            fontSize: isMobile ? '1.5rem' : '1.8rem', // Responsive font size
            color: '#FFFFFF',
            flexGrow: 1,
            padding: '1rem'
          }}
        >
          <Link href="/" color="inherit" underline="none">
            SlugSei
          </Link>
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ marginLeft: 'auto' }}>
          {isMobile ? (
            <>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                {list()}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link
                href="/"
                color="inherit"
                underline="none"
                sx={{
                  fontSize: '1.25rem', // Larger font size for links
                  fontWeight: '500',
                  fontFamily: "'Roboto', sans-serif",
                  color: '#FFFFFF',
                  '&:hover': {
                    color: '#A11222', // Gold hover effect
                  },
                }}
              >
                Home
              </Link>
              <Button
                variant="contained"
                href="/baseball-ai"
                sx={{
                  backgroundColor: '#BA0C2F', // Red button color
                  fontSize: '1rem',
                  fontWeight: 'bold',
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
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
