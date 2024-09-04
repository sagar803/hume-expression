import React, { useRef, useState, useEffect } from 'react';

interface Emotion {
    name: string;
    score: number;
}

const VideoAnalysis: React.FC = () => {
    const [socketStatus, setSocketStatus] = useState<string>('Disconnected');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [emotionMap, setEmotionMap] = useState<Emotion[] | null>(null);
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener('play', handleVideoPlay);
            videoRef.current.addEventListener('pause', handleVideoPause);
            videoRef.current.addEventListener('ended', handleVideoEnd);
        }
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('play', handleVideoPlay);
                videoRef.current.removeEventListener('pause', handleVideoPause);
                videoRef.current.removeEventListener('ended', handleVideoEnd);
            }
        };
    }, [videoRef.current, uploadedVideo]);

    const connect = async (): Promise<void> => {
        const socketUrl = `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`;
        setSocketStatus('Connecting...');
        try {
            socketRef.current = new WebSocket(socketUrl);
            socketRef.current.onopen = () => setSocketStatus('Connected');
            socketRef.current.onmessage = handleSocketMessage;
            socketRef.current.onclose = () => setSocketStatus('Disconnected');
            socketRef.current.onerror = () => setSocketStatus('Error');
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    };

    const handleSocketMessage = (event: MessageEvent): void => {
        try {
            const response = JSON.parse(event.data);
            if (response.face && response.face.predictions && response.face.predictions.length > 0) {
                setEmotionMap(response.face.predictions[0].emotions);
            } else {
                setEmotionMap(null);
            }
        } catch (error) {
            console.error('Error processing server message:', error);
        }
    };

    const disconnect = (): void => {
        if (socketRef.current) {
            socketRef.current.close();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedVideo(URL.createObjectURL(file));
        }
    };

    const startVideoAnalysis = (): void => {
        if (!uploadedVideo || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            return;
        }
        setIsAnalyzing(true);
        if (videoRef.current) {
            videoRef.current.play().catch(error => console.error('Error playing video:', error));
        }
    };

    const stopVideoAnalysis = (): void => {
        setIsAnalyzing(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
        if (analyzeIntervalRef.current) {
            clearInterval(analyzeIntervalRef.current);
            analyzeIntervalRef.current = null;
        }
    };

    const handleVideoPlay = (): void => startSendingFrames();

    const handleVideoPause = (): void => {
        if (analyzeIntervalRef.current) {
            clearInterval(analyzeIntervalRef.current);
            analyzeIntervalRef.current = null;
        }
    };

    const handleVideoEnd = (): void => stopVideoAnalysis();

    const startSendingFrames = (): void => {
        if (analyzeIntervalRef.current) {
            clearInterval(analyzeIntervalRef.current);
        }

        const sendVideoFrames = (): void => {
            if (videoRef.current && canvasRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    try {
                        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
                        const base64Data = imageData.split(',')[1];
                        socketRef.current.send(JSON.stringify({
                            data: base64Data,
                            models: { face: {} }
                        }));
                    } catch (error) {
                        console.error('Error sending frame:', error);
                    }
                }
            }
        };

        analyzeIntervalRef.current = setInterval(sendVideoFrames, 500);
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Video Emotion Analysis</h1>
            <div className="mb-4 text-center">
                <span className={`inline-block px-2 py-1 rounded ${
                    socketStatus === 'Connected' ? 'bg-green-500 text-white' : 
                    socketStatus === 'Disconnected' ? 'bg-red-500 text-white' : 
                    'bg-yellow-500 text-black'
                }`}>
                    {socketStatus}
                </span>
            </div>

            <div className="mb-6">
                <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleFileUpload} 
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </div>
            <div className="flex justify-center space-x-4 mb-6">
                <button 
                    onClick={startVideoAnalysis} 
                    disabled={!uploadedVideo || isAnalyzing}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Start Analysis
                </button>
                <button 
                    onClick={stopVideoAnalysis} 
                    disabled={!isAnalyzing}
                    className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Stop Analysis
                </button>
            </div>
                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold mb-4">Video Playback</h2>
                    {uploadedVideo ? (
                        <video 
                            ref={videoRef} 
                            controls 
                            className="w-full rounded"
                        >
                            <source src={uploadedVideo} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                            <p className="text-gray-500">Upload a video to begin analysis</p>
                        </div>
                    )}
                </div>
                            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold mb-4">Emotion Analysis</h2>
                    {emotionMap ? (
                        <div className="grid grid-cols-2 gap-2">
                            {emotionMap.map(em => (
                                <div key={em.name} className="flex justify-between">
                                    <span>{em.name}:</span>
                                    <span className="font-semibold">{(em.score * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                            <p className="text-gray-500">No emotion data available</p>
                        </div>
                    )}
                </div>
            </div>


            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
        </div>
    );
};

export default VideoAnalysis;