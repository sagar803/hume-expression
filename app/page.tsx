//@ts-check
"use client"

import React, { useEffect, useRef, useState } from "react";
import VideoStream from "@/components/VideoStream";
import Image from "next/image";
import AudioStreamingComponent from "@/components/AudioStream";
import AudioTest from "@/components/AudioTest";
import FaceBurst from "@/components/FaceBurst";
import AudioWidget from "@/zdev/AudioWidget";
import AllCombined from "@/components/AllCombined";
import Test from "@/zdev/test";

export default function Home() {
  // const [activeTab, setActiveTab] = useState('face')

  // console.log(activeTab)
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const streamRef = useRef<MediaStream | null>(null);

  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);



  // useEffect(() => {
  //   startVideoStream();
  //   return () => {
  //     console.log("Tearing down component");
  //   };
  // }, []);

  // const startVideoStream = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     streamRef.current = stream;
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //     }
  //     // startSendingFrames();
  //   } catch (error) {
  //     console.error('Error accessing camera:', error);
  //   }
  // };


  return (
    <div>
      {/* <h1>Facial Expression Analysis</h1>

        <div className="relative max-w-md mx-auto">
          <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video mb-4" />
          <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
        </div> */}

        {/* {activeTab === 'face' && <VideoStream activeTab={activeTab} setActiveTab={setActiveTab}/> }
        {activeTab === 'burst' && <AudioWidget activeTab={activeTab} setActiveTab={setActiveTab} modelName="burst" recordingLengthMs={500} streamWindowLengthMs={2000} />}
        {activeTab === 'prosody' && <AudioWidget activeTab={activeTab} setActiveTab={setActiveTab} modelName="prosody" recordingLengthMs={500} streamWindowLengthMs={5000} />} */}
        <AllCombined />
        {/* <Test /> */}
    </div>
  );
}
