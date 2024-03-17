import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef ,useState} from "react";
import Avatar from "../common/Avatar";
import { FaPlay, FaStop } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import { userAgent } from "next/server";
import MessageStatus from "../common/MessageStatus";
import WaveSurfer from "wavesurfer.js";
import { HOST } from "@/utils/ApiRoutes";


function VoiceMessage({ message }) {
  const [{currentChatUser,userInfo}] = useStateProvider();
  const [audioMessage,setAudioMessage] = useState(null);
  const [isPlaying,setIsPlaying] = useState(false);
  const [currentPlaybackTime,setCurrentPlaybacktime] = useState(0);
  const [totalDuration,setTotalDuration] = useState(0);

  const waveFormRef = useRef(null);
  const waveform =useRef(null);

  useEffect(() => {
    if(waveform.current === null){
      waveform.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });
      
  
      waveform.current.on("finish", () => {
        setIsPlaying(false)
      });
  
      return () => {
        waveform.current.destroy();
      };
    }
    
  }, []);

  useEffect( () => {
    const audioURL = `${HOST}/${message.message}`;
    const audio = new Audio(audioURL);
    setAudioMessage(audio);
    waveform.current.load(audioURL);
    waveform.current.on("ready",()=>{
      setTotalDuration(waveform.current.getDuration());
    });
  },[message.message]);

  useEffect(() => {

    if (audioMessage) {
    
    const updatePlaybackTime = () => {
    
    setCurrentPlaybacktime (audioMessage.currentTime);
    
    };
    
    audioMessage.addEventListener("timeupdate", updatePlaybackTime);
    
    return () => {
    
    audioMessage.removeEventListener("timeupdate", updatePlaybackTime);
    
    };
    
    }
    
    }, [audioMessage]);

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayAudio = () => {
    if (audioMessage) {
      waveform.current.stop();
      waveform.current.play();
      audioMessage.play();
      setIsPlaying(true);
    }
  };
  
  
  const handlePauseAudio = () => {
    waveform.current.stop();
    audioMessage.pause();
    setIsPlaying(false);
  };


  return (
  <div 
    className={`flex items-center gap-5 text-white px-4 pr-2 py-4 text-sm rounded-md ${
      message.senderId === currentChatUser.id
        ? "bg-slate-600"
        : "bg-slate-700"
    }`}>
    <div>
    <Avatar
      type="lg"
      
      image={message.senderId === currentChatUser.id ? currentChatUser?.profilePicture : userInfo?.profileImage}
      //image={userInfo?.profileImage}
    />
    </div>
    <div className="cursor-pointer text-xl">
      {!isPlaying ? (
        <FaPlay onClick={handlePlayAudio} />
      ) : (
        <FaStop onClick={handlePauseAudio} />
      )

      }
    </div>
    <div className="relative">
      <div className="w-60" ref={waveFormRef} />
      <div className="text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full" ref={waveFormRef}>
        <span>
          {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
        </span>
        <div className="flex gap-1">
          <span>{calculateTime(message.createdAt)}</span>
          {
            message.senderId===userInfo.id && <MessageStatus messageStatus={message.essageStatus} />
          }
        </div>
      </div>
    </div>
  </div>);
}

export default VoiceMessage;
