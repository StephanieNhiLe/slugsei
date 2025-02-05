import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Slider, LinearProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from './Header';
import { DropzoneArea } from 'material-ui-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const VideoPlaceholder = styled(Paper)(({ theme, fit }) => ({ 
  width: '100%',
  maxWidth: '300px', 
  aspectRatio: '16 / 9', 
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid white',
  margin: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  overflow: 'hidden' 
})); 

const GreyPlaceholder = styled('div')(({ theme }) => ({
  // backgroundColor: theme.palette.action.disabledBackground,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  width: '100%',
  height: 300,
  margin: theme.spacing(2), 
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    borderColor: 'white',
    color: 'white',
    '& fieldset': {
      borderColor: 'white',
    },
    '& .MuiInputBase-input': {
      color: 'white',
    },
  },
});

const StyledVideo = styled('video')(({ fit }) => ({
  width: '100%',
  height: '100%', 
  objectFit: 'contain',
}));

const CustomSettingsBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
}));

const SlugSeiCoach = () => {
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [objectFit, setObjectFit] = useState('contain'); 
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(''); 
  const [sentimentResult, setSentimentResult] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16 / 9');

  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [emotionValue, setEmotionValue] = useState(50);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedMusicalElement, setSelectedMusicalElement] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(file);
      setPreviewUrl(url);

      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        const aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
        setVideoAspectRatio(aspectRatio);
      };
    }
  };

  const handleGenerateVideo = async () => {
    if (!uploadedVideo) {
      return;
    }
  
    const formData = new FormData();
    formData.append('video', uploadedVideo);

    formData.append('customPrompt', customPrompt);
    formData.append('emotionValue', emotionValue);
    formData.append('selectedMood', selectedMood);
    formData.append('selectedMusicalElement', selectedMusicalElement);
    formData.append('selectedInstrument', selectedInstrument);
  
    try {
      const response = await axios.post(`https://stunning-lucky-gar.ngrok-free.app/getBGM`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'  
      });

      
      const contentType = response.headers['content-type'];

      if (contentType && contentType.indexOf('application/json') !== -1) {
        console.log('Received JSON response (error)');
        const reader = new FileReader();
        reader.onload = function() {
          const errorMessage = JSON.parse(this.result);
          console.error('Server error:', errorMessage);
          alert(`Error: ${errorMessage.message}`);
        };
        reader.readAsText(response.data);
      } else {
        console.log('Received video blob');
        const videoBlob = new Blob([response.data], { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setGeneratedVideoUrl(videoUrl);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        if (error.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function() {
            console.error('Error message from server:', this.result);
          };
          reader.readAsText(error.response.data);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
    setShowCustomSettings(true);
  };
  
  // connect this with backend -> generate with API --considered
  const handleCustomGeneration = async () => {
    console.log('Custom settings:', {
      prompt: customPrompt,
      emotion: emotionValue,
      mood: selectedMood,
      musicalElement: selectedMusicalElement,
      instrument: selectedInstrument,
    });
    setShowCustomSettings(false);
  };

  const renderCustomSettings = () => {
    return (
      <CustomSettingsBox>
        <Typography variant="h6" gutterBottom>Custom Settings</Typography>
        <TextField
          fullWidth
          label="Custom Prompt"
          variant="outlined" 
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography gutterBottom>Emotion</Typography>
        <Slider
          value={emotionValue}
          onChange={(e, newValue) => setEmotionValue(newValue)}
          aria-labelledby="emotion-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={0}
          max={100}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: 'lightgrey' }}>Mood/Feeling</InputLabel>
          <Select
            value={selectedMood}
            label="Mood/Feeling"
            onChange={(e) => setSelectedMood(e.target.value)}
          >
            <MenuItem value="happy">Happy</MenuItem>
            <MenuItem value="sad">Sad</MenuItem>
            <MenuItem value="energetic">Energetic</MenuItem>
            <MenuItem value="calm">Calm</MenuItem>
            <MenuItem value="mysterious">Mysterious</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2,  }}>
          <InputLabel sx={{ color: 'lightgrey' }}>Musical Element</InputLabel>
          <Select
            value={selectedMusicalElement}
            label="Musical Element"
            onChange={(e) => setSelectedMusicalElement(e.target.value)}
          >
            <MenuItem value="melody">Melody</MenuItem>
            <MenuItem value="harmony">Harmony</MenuItem>
            <MenuItem value="rhythm">Rhythm</MenuItem>
            <MenuItem value="texture">Texture</MenuItem>
            <MenuItem value="dynamics">Dynamics</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: 'lightgrey' }}>Instrument</InputLabel>
          <Select
            value={selectedInstrument}
            label="Instrument"
            onChange={(e) => setSelectedInstrument(e.target.value)}
          >
            <MenuItem value="piano">Piano</MenuItem>
            <MenuItem value="guitar">Guitar</MenuItem>
            <MenuItem value="violin">Violin</MenuItem>
            <MenuItem value="drums">Drums</MenuItem>
            <MenuItem value="synthesizer">Synthesizer</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#A1C75E', borderRadius: 20 }}
          onClick={handleGenerateVideo}
        >
          Re-Generate with Custom Settings
        </Button>
      </CustomSettingsBox>
    );
  };

  const handleDownloadVideo = () => {
    const link = document.createElement('a');
    link.href = generatedVideoUrl;
    link.download = 'generated_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSentimentAnalysis = async () => {
    if (!uploadedVideo) {
      alert('Please upload a video first');
      return;
    }
  
    const formData = new FormData();
    formData.append('video', uploadedVideo);
  
    try {
      const response = await axios.post(`https://stunning-lucky-gar.ngrok-free.app/analyze_sentiment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const result = response.data;
      alert(`Sentiment: ${result.sentiment}\nScore: ${result.score}`);
      setSentimentResult({ sentiment: result.sentiment, score: result.score });
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing sentiment');
    }
  };

  const renderSentimentResult = () => {
    if (!sentimentResult) return null;

    const { sentiment, score } = sentimentResult;
    const confidenceScore = parseFloat(score) * 100; 

    const getColor = (sentiment) => {
      switch (sentiment.toLowerCase()) {
        case 'positive': return '#48dbfb'; // Blue 
        case 'negative': return '#ff6b6b'; // Red 
        default: return '#feca57'; // Yellow 
      }
    };

    return (
      <Box sx={{width: '100%' }}>
        <Typography variant="h6" gutterBottom>Our Detector Shows That</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography variant="body1" sx={{ mr: 2, minWidth: 100 }}>Your Video Mood:</Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: getColor(sentiment),
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            {sentiment.toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>Confidence Level:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={confidenceScore} 
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getColor(sentiment),
                  }
                }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" style={{ color: 'white', fontWeight: 'bold' }}>{`${Math.round(confidenceScore)}%`}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
  sx={{
    minHeight: '100vh',
    bgcolor: '#850101',
    color: 'white',
    p: 0,
    m: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }}
>
  <Header />
  <Typography
    variant="h2"
    sx={{
      fontWeight: 'bold',
      mt: 2,
      mb: 2,
      background: '#FFFFFF',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center', // Changed to center for better mobile view
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    Let AI Level-up your BaseBall Game
  </Typography>
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' }, // Column for mobile, row for desktop
      width: '80%',
      justifyContent: 'space-between',
      px: 2,
      paddingBottom: '50px',
    }}
  >
    {/* Before */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pr: { md: 2 }, // Padding right only on medium and up
        alignItems: 'center',
        justifyContent: 'center',
        mb: { xs: 4, md: 0 }, // Margin bottom for mobile
      }}
    >
      <StyledTextField
        variant="outlined"
        type="file"
        InputLabelProps={{ shrink: true }}
        fullWidth
        onChange={handleFileChange}
      />
      {previewUrl ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <VideoPlaceholder sx={{ aspectRatio: videoAspectRatio, justifyContent: 'center' }}>
            <StyledVideo controls>
              <source src={previewUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </StyledVideo>
          </VideoPlaceholder>
          {renderSentimentResult()}
        </div>
      ) : (
        <GreyPlaceholder sx={{ borderRadius: 5 }}>
          <Typography variant="h6">Video Preview</Typography>
        </GreyPlaceholder>
      )}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mt: 2,
          mb: 2,
          background: 'linear-gradient(45deg, #849567, white)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center', // Changed to center for better mobile view
          width: { xs: '100%', md: '30vw' }, // Full width on mobile
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        Before
      </Typography>
      {previewUrl && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: { xs: 'column', md: 'row' }, // Column for mobile, row for desktop
            gap: '10px',
          }}
        >
          <Button
            variant="contained"
            sx={{ backgroundColor: '#9179a3', alignSelf: 'end', mt: 2, borderRadius: 20 }}
            onClick={handleSentimentAnalysis}
          >
            Mood Detector
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#A1C75E', alignSelf: 'end', mt: 2, borderRadius: 20 }}
            onClick={handleGenerateVideo}
          >
            Generate Video
          </Button>
        </div>
      )}
    </Box>
    {showCustomSettings && renderCustomSettings()}
    {/* After */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pl: { md: 2 }, // Padding left only on medium and up
        pt: { md: 7 }, // Padding top only on medium and up
      }}
    >
      {generatedVideoUrl ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <VideoPlaceholder sx={{ aspectRatio: videoAspectRatio }}>
            <StyledVideo key={generatedVideoUrl} controls>
              <source src={generatedVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </StyledVideo>
          </VideoPlaceholder>
        </div>
      ) : (
        <GreyPlaceholder sx={{ borderRadius: 5 }}>
          <Typography variant="h6">Generated Video</Typography>
        </GreyPlaceholder>
      )}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mt: 2,
          mb: 2,
          background: 'linear-gradient(45deg, #849567, white)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center', // Changed to center for better mobile view
          width: { xs: '100%', md: '30vw' }, // Full width on mobile
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        After
      </Typography>
      <Button
            variant="contained"
            sx={{ backgroundColor: '#A1C75E', alignSelf: 'center', borderRadius: 20 }}
            onClick={handleDownloadVideo}
          >
            Download Video
          </Button>
    </Box>
  </Box>
</Box>

  );
};

export default SlugSeiCoach;
