import React, { useRef, useState, useEffect } from 'react';

const VideoAnalysis = () => {
    const [socketStatus, setSocketStatus] = useState('Disconnected');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [emotionMap, setEmotionMap] = useState(null);
    const [uploadedVideo, setUploadedVideo] = useState(null);

    const socketRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const serverReadyRef = useRef(false);
    const analyzeIntervalRef = useRef(null);

    useEffect(() => {
        console.log("Mounting component");
        console.log("Connecting to server");
        connect();

        return () => {
            console.log("Tearing down component");
            disconnect();
        };
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener('ended', handleVideoEnd);
        }
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('ended', handleVideoEnd);
            }
        };
    }, []);

    const connect = async () => {
        const socketUrl = `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`;

        serverReadyRef.current = true;
        console.log(`Connecting to websocket... (using ${socketUrl})`);

        setSocketStatus('Connecting...');

        socketRef.current = new WebSocket(socketUrl);
        socketRef.current.onopen = socketOnOpen;
        socketRef.current.onmessage = socketOnMessage;
        socketRef.current.onclose = socketOnClose;
        socketRef.current.onerror = socketOnError;
    };

    const socketOnOpen = () => {
        console.log('WebSocket connection established');
        setSocketStatus('Connected');
    };

    const socketOnMessage = (event) => {
        const response = JSON.parse(event.data);
        console.log(response);
        setEmotionMap(response.face.predictions[0].emotions);
    };

    const socketOnClose = () => {
        console.log('WebSocket connection closed');
        setSocketStatus('Disconnected');
    };

    const socketOnError = (error) => {
        console.error('WebSocket error:', error);
        setSocketStatus('Error');
    };

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.close();
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedVideo(URL.createObjectURL(file));
        }
    };

    const startVideoAnalysis = () => {
        if (!uploadedVideo || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            console.error('Video not uploaded or socket not ready');
            return;
        }

        setIsAnalyzing(true);
        videoRef.current.play();

        const sendVideoFrames = () => {
            if (videoRef.current && videoRef.current.paused) {
                stopVideoAnalysis();
                return;
            }

            if (videoRef.current && canvasRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
                    const base64Data = imageData.split(',')[1];

                    socketRef.current.send(JSON.stringify({
                        data: base64Data,
                        models: {
                            face: {}
                        }
                    }));
                }
            }
        };

        analyzeIntervalRef.current = setInterval(sendVideoFrames, 500);
    };

    const stopVideoAnalysis = () => {
        setIsAnalyzing(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
        if (analyzeIntervalRef.current) {
            clearInterval(analyzeIntervalRef.current);
            analyzeIntervalRef.current = null;
        }
    };

    const handleVideoEnd = () => {
        console.log('Video ended');
        stopVideoAnalysis();
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Video Analysis</h1>
            <p className="mb-2">Socket Status: {socketStatus}</p>
            <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileUpload} 
                className="mb-4"
            />
            <div className="flex space-x-4 mb-4">
                <button 
                    onClick={startVideoAnalysis} 
                    disabled={!uploadedVideo || isAnalyzing}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Start Analysis
                </button>
                <button 
                    onClick={stopVideoAnalysis} 
                    disabled={!isAnalyzing}
                    className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                >
                    Stop Analysis
                </button>
            </div>
            {uploadedVideo && (
                <video 
                    ref={videoRef} 
                    controls 
                    width="640" 
                    height="480" 
                    className="mb-4"
                >
                    <source src={uploadedVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
            {emotionMap && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Emotion Analysis:</h2>
                    <pre className="bg-gray-100 p-4 rounded">
                        {JSON.stringify(emotionMap, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default VideoAnalysis;