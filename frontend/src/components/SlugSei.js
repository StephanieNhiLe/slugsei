import React, { useState } from 'react';
import { Box, Typography, Card, Button, TextField } from '@mui/material';
import Header from './Header';
import ReactMarkdown from 'react-markdown';
import { uploadVideo, analyzeVideo, getFeedback, askAI } from '../api/api';

const buttonStyles = {
  backgroundColor: '#BA0C2F',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '50px',
  fontFamily: "'Roboto', sans-serif",
  color: '#FFFFFF',
  textTransform: 'uppercase',
  padding: '0.5rem 1.5rem',
  '&:hover': {
    backgroundColor: '#A11222',
  },
};

const SlugSeiPage = () => {
  const [video, setVideo] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [analysisImages, setAnalysisImages] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI', message: 'Welcome! How can I assist you with your baseball coaching today?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const videoURL = URL.createObjectURL(file);
      setVideo(videoURL);

      try {
        const response = await uploadVideo(file);
        setVideoId(response.video_id);
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', message: 'Your video has been uploaded successfully. Please click "Analyze Video" to proceed.' },
        ]);
      } catch (error) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', message: 'Failed to upload video. Please try again.' },
        ]);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAnalyzeVideo = async () => {
    if (videoId) {
      setIsAnalyzing(true);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'AI', message: 'Analyzing your video... Stay tuned for coaching feedback.' },
      ]);
      try {
        const analysisResponse = await analyzeVideo(videoId);
        const feedbackResponse = await getFeedback(videoId);

        if (analysisResponse.images) {
          setAnalysisImages(analysisResponse.images);
        }

        const feedback = feedbackResponse?.feedback?.feedback;
        if (feedback && typeof feedback === 'string') {
          setChatMessages((prev) => [...prev, { sender: 'AI', message: feedback }]);
        }

        if (analysisResponse.analysis) {
          const { launch_angle, exit_velocity } = analysisResponse.analysis;
          setChatMessages((prev) => [
            ...prev,
            { 
              sender: 'AI', 
              message: `Analysis Results:\nLaunch Angle: ${launch_angle.toFixed(1)}°\nExit Velocity: ${exit_velocity.toFixed(1)} mph`
            },
          ]);
        }
      } catch (error) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', message: 'Error analyzing video. Please try again.' },
        ]);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = inputMessage;
      setChatMessages((prev) => [
        ...prev,
        { sender: 'User', message: userMessage },
      ]);
      setInputMessage('');

      try {
        const aiResponse = await askAI(videoId, userMessage);
        const aiMessage = aiResponse?.answer || 'Sorry, I could not process your question. Please try again.';
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', message: aiMessage },
        ]);
      } catch (error) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', message: 'Error processing your question. Please try again later.' },
        ]);
      }
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 4,
          px: 4,
          py: 3,
          backgroundColor: '#F4F4F4',
          height: 'calc(100vh - 80px)',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            flex: 2,
            backgroundColor: '#D1E8FF',
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {video ? (
            <video
              src={video}
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                border: '2px dashed #999',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: '#555' }}>
                Upload a video
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              sx={{ ...buttonStyles, ...(isUploading && { opacity: 0.5, pointerEvents: 'none' }) }}
            >
              Upload Video
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={handleVideoUpload}
              />
            </Button>
            <Button
              variant="contained"
              sx={buttonStyles}
              onClick={handleAnalyzeVideo}
              disabled={!videoId || isAnalyzing}
            >
              Analyze Video
            </Button>
          </Box>
          {analysisImages && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                px: 2,
                py: 4,
                gap: 2,
              }}
            >
              {Object.entries(analysisImages).map(([key, url]) => (
                <Card
                  key={key}
                  sx={{
                    flex: 1,
                    backgroundColor: '#FEE8D4',
                    padding: '1rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 'bold',
                    }}
                  >
                    {key.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <img src={url} alt={key} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                </Card>
              ))}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#FFE5D9',
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            height: '90%',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              mb: 2,
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            {chatMessages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'AI' ? 'flex-start' : 'flex-end',
                  marginBottom: '1rem',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '60%',
                    backgroundColor: msg.sender === 'AI' ? '#E0F7FA' : '#BA0C2F',
                    color: msg.sender === 'AI' ? '#333' : '#FFFFFF',
                    padding: '0.8rem 1rem',
                    borderRadius: msg.sender === 'AI' ? '16px 16px 16px 0px' : '16px 16px 0px 16px',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              variant="outlined"
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px' }}
            />
            <Button
              variant="contained"
              sx={buttonStyles}
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SlugSeiPage;