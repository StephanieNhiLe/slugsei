import React, { useState } from 'react';
import { Box, Typography, Card, Button, TextField, CircularProgress } from '@mui/material';
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
  const [isLoading, setIsLoading] = useState({
    upload: false,
    analysis: false,
    feedback: false
  });
  const [referenceVideo, setReferenceVideo] = useState(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const response = await uploadVideo(file);
        setVideoId(response.video_id);
        setVideo(URL.createObjectURL(file));
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
        
        if (analysisResponse.images) {
          setAnalysisImages(analysisResponse.images);
        }

        const feedbackResponse = await getFeedback(videoId);
        const feedback = feedbackResponse?.feedback?.feedback;
        const refVideo = feedbackResponse?.feedback?.reference_video;
        
        if (feedback && typeof feedback === 'string') {
          setChatMessages((prev) => [...prev, { 
            sender: 'AI', 
            message: feedback,
            referenceVideo: refVideo
          }]);
          if (refVideo) {
            setReferenceVideo(refVideo);
          }
        }

        if (analysisResponse.analysis) {
          const { launch_angle, exit_velocity } = analysisResponse.analysis;
          if (launch_angle !== undefined && exit_velocity !== undefined) {
            setChatMessages((prev) => [
              ...prev,
              { 
                sender: 'AI', 
                message: `Analysis Results:\nLaunch Angle: ${launch_angle.toFixed(1)}°\nExit Velocity: ${exit_velocity.toFixed(1)} mph`
              },
            ]);
          }
        }
      } catch (error) {
        console.error('Analysis error:', error);
        setChatMessages((prev) => [
          ...prev,
          { sender: 'AI', message: `Error: ${error.message || 'Failed to analyze video. Please try again.'}` },
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

  const renderMessage = (message) => {
    const parts = message.split(/(Reference Player Video: https:\/\/\S+\.mp4)/);
    return parts.map((part, index) => {
      if (part.startsWith('Reference Player Video: https://')) {
        const url = part.replace('Reference Player Video: ', '');
        return (
          <Box key={index} sx={{ mt: 1 }}>
            <Typography 
              component="span" 
              sx={{ 
                color: 'inherit',
                fontWeight: 'bold'
              }}
            >
              Reference Player Video:{' '}
            </Typography>
            <Typography
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'inherit',
                textDecoration: 'underline',
                wordBreak: 'break-all',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              {url}
            </Typography>
          </Box>
        );
      }
      return <ReactMarkdown key={index}>{part}</ReactMarkdown>;
    });
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          p: 2,
          backgroundColor: '#F4F4F4',
          height: 'calc(100vh - 64px)',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            width: '67%',
            backgroundColor: '#D1E8FF',
            padding: '1rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
          }}
        >
          <Box sx={{ 
            height: '50%',
            position: 'relative',
            display: 'flex',
            gap: 2
          }}>
            {isUploading ? (
              <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
              }}>
                <CircularProgress 
                  sx={{ 
                    color: '#BA0C2F',
                    width: '48px !important',
                    height: '48px !important'
                  }} 
                />
                <Typography variant="body1" sx={{ color: '#555' }}>
                  Uploading video...
                </Typography>
              </Box>
            ) : video ? (
              <>
                <Box sx={{ 
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '0.5rem',
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Your Swing
                  </Typography>
                  <video
                    src={video}
                    controls
                    style={{
                      width: '100%',
                      height: 'calc(100% - 28px)',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />
                </Box>

                {referenceVideo && (
                  <Box sx={{ 
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '0.5rem',
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        Reference Swing
                      </Typography>
                      <Typography
                        component="a"
                        href={referenceVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: '#1976d2',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          '&:hover': {
                            color: '#1565c0',
                          }
                        }}
                      >
                        Open in new window
                      </Typography>
                    </Box>
                    <video
                      src={referenceVideo}
                      controls
                      style={{
                        width: '100%',
                        height: 'calc(100% - 28px)',
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  border: '2px dashed #999',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Typography variant="h6" sx={{ color: '#555' }}>
                  Upload a video
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Supported formats: MP4, MOV
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            minHeight: '40px'
          }}>
            <Button
              variant="contained"
              component="label"
              sx={{ ...buttonStyles }}
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
              sx={{
                ...buttonStyles,
                ...(isAnalyzing && { opacity: 0.7, pointerEvents: 'none' })
              }}
              onClick={handleAnalyzeVideo}
              disabled={!videoId || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
            </Button>
          </Box>

          <Box sx={{ 
            height: 'calc(50% - 60px)',
            display: 'flex',
            gap: 2,
            overflow: 'auto'
          }}>
            {analysisImages && Object.entries(analysisImages).map(([key, url]) => (
              <Card
                key={key}
                sx={{
                  flex: 1,
                  minWidth: '200px',
                  backgroundColor: '#FEE8D4',
                  padding: '0.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 'bold',
                  }}
                >
                  {key.replace('_', ' ').toUpperCase()}
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={url} 
                    alt={key} 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }} 
                  />
                </Box>
              </Card>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            width: '33%',
            backgroundColor: '#FFE5D9',
            padding: '1rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              mb: 2,
              padding: '0.75rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
            }}
          >
            {chatMessages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'AI' ? 'flex-start' : 'flex-end',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    backgroundColor: msg.sender === 'AI' ? '#E0F7FA' : '#BA0C2F',
                    color: msg.sender === 'AI' ? '#333' : '#FFFFFF',
                    padding: '0.6rem 0.8rem',
                    borderRadius: msg.sender === 'AI' ? '16px 16px 16px 0px' : '16px 16px 0px 16px',
                    wordBreak: 'break-word',
                  }}
                >
                  {renderMessage(msg.message)}
                  {msg.referenceVideo && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        color: msg.sender === 'AI' ? '#1976d2' : '#fff',
                        fontStyle: 'italic'
                      }}
                    >
                      Reference video available above
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            height: '40px'
          }}>
            <TextField
              variant="outlined"
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              size="small"
              sx={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '8px',
              }}
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