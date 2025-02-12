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
        bgcolor: '#002D62', 
        height: '100%',
        color: 'white', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4, 
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
    <AppBar position="static" style={{ background: '#002D62' }}> {/* MLB Blue for the AppBar */}
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'revert',
            flexGrow: 1,
            color: 'white', // White text for the brand name
            textAlign: 'left',
            pl: isMobile ? 1 : 15,
          }}
        >
          <Link href="/" color="inherit" underline="none">
            SlugSei
          </Link>
        </Typography>
        <Box sx={{ marginLeft: 'auto', pr: isMobile ? 1 : 15 }}>
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
            <>
              <Link
                variant="h6"
                href="/"
                color="inherit"
                underline="none"
                sx={{
                  fontFamily: 'revert',
                  flexGrow: 1,
                  pr: 5,
                  color: 'white', 
                }}
              >
                Home
              </Link>
              <Button
                variant="contained"
                href="/baseball-ai"
                style={{
                  fontFamily: 'revert',
                  flexGrow: 1,
                  pr: 5,
                  backgroundColor: '#BA0C2F', 
                  color: 'white', 
                }}
              >
                Try SlugSei
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
