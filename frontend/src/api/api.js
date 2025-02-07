import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8080';  

const handleError = (error) => {
    console.error(error);
    throw error.response?.data || error.message || "An error occurred";
};

export const uploadVideo = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);  
        const response = await axios.post(`${BASE_URL}/video/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Upload Video API Error: ", error.response?.data || error.message);
        throw new Error(error.response?.detail || 'Failed to upload video.');
    }
};

export const analyzeVideo = async (videoId) => {
    try {
        const response = await axios.post(`${BASE_URL}/analysis/process`, { 
            video_id: videoId 
        });
        return {
            ...response.data,
            images: response.data.images || {},
            analysis: response.data.analysis || {}
        };
    } catch (error) {
        handleError(error);
    }
};

export const getFeedback = async (videoId) => {
    try {
        const response = await axios.post(`${BASE_URL}/coaching/feedback`, {
            video_id: videoId,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const askAI = async (videoId, question) => {
    try {
        const response = await axios.post(`${BASE_URL}/analysis/ask`, {
            video_id: videoId,
            question: question,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const generateAnalysisImages = async (videoId, launchAngle, exitVelocity) => {
    try {
        const response = await axios.post(`${BASE_URL}/analysis/generate-images`, {
            video_id: videoId,
            launch_angle: launchAngle,
            exit_velocity: exitVelocity,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};