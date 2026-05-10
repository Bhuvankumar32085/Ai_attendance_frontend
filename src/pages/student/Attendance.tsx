import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCamera,
  FaMicrophone,
  FaRedo,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaStop,
  FaPlay,
  FaBookOpen,
  FaUpload, // Naya Icon upload ke liye
} from "react-icons/fa";
import API from "../../api/api";
import axios from "axios";
import RecordRTC from "recordrtc";
import { useAppSelector } from "../../redux/hook";

// Class/Subject ka interface API ke according
interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  subject_section: string;
  teacher_id: number;
}

export const Attendance: React.FC = () => {
  const navigate = useNavigate();
  const { loggedUser } = useAppSelector((state) => state.user);

  // Mode & Class Selection
  const [authMode, setAuthMode] = useState<"face" | "voice">("face");
  const [subjectId, setSubjectId] = useState<string>("");
  const [classes, setClasses] = useState<Subject[]>([]);

  // States
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // --- CAMERA (FACE) STATES & REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Naya ref File Upload ke liye
  const streamRef = useRef<MediaStream | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // --- VOICE STATES & REFS ---
  const mediaRecorderRef = useRef<RecordRTC | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // useEffect(() => {
  //   if (loggedUser?.role === "teacher") navigate("/");
  // }, [navigate, loggedUser]);


  // FETCH CLASSES API

  useEffect(() => {
    const fatchClass = async () => {
      try {
        const { data } = await API.get(
          `/auth/get-classes/${loggedUser?.user_id}`,
        );
        console.log("class data is :- ", data);
        setClasses(data);
      } catch (error) {
        console.error(error);
        let message = "Something went wrong";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.error || message;
        }
        console.log(message);
      }
    };

    if (loggedUser?.user_id) {
      fatchClass();
    }
  }, [loggedUser?.user_id, loggedUser?.role, navigate]);


  // HARDWARE CONTROLS

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setErrorMessage("");
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err)
      setErrorMessage("Camera access denied or device not found.");
    }
  }, [stopCamera]);

  const stopMicStream = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  // Handle Tab Switching Cleanup
  useEffect(() => {
    if (authMode === "face") {
      stopMicStream();
      if (!imageSrc) startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      stopMicStream();
    };
  }, [authMode, startCamera, stopCamera, stopMicStream, imageSrc]);


  // FACE LOGIC

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext("2d");
      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL("image/jpeg", 0.9));
        stopCamera();
      }
    }
  };

  // NAYA LOGIC: File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        stopCamera(); // Photo upload hote hi camera band kar do
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setImageSrc(null);
    setStatus("idle");
    // Upload input ki value reset karna taaki same file dubara upload ho sake
    if (fileInputRef.current) fileInputRef.current.value = ""; 
    startCamera();
  };


  // VOICE LOGIC (.wav FORMAT)

  const startRecording = async () => {
    try {
      setErrorMessage("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000, 
        numberOfAudioChannels: 1, 
      });

      recorder.startRecording();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
       console.error(err)
      setErrorMessage("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const recorder = mediaRecorderRef.current;

      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stopMicStream();
      });
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  const retakeVoice = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setStatus("idle");
  };


  // SUBMIT TO BACKEND

  const submitAttendance = async () => {
    if (!subjectId) {
      alert("Please select a class first!");
      return;
    }

    setStatus("loading");
    const formData = new FormData();
    formData.append("subject_id", subjectId);

    try {
      if (authMode === "face" && imageSrc) {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        formData.append("image", blob, "face_scan.jpg");
      } else if (authMode === "voice" && audioBlob) {
        formData.append("audio", audioBlob, "voice_scan.wav"); 
      } else {
        setStatus("error");
        return;
      }

      const { data } = await API.post("/auth/mark-attendance", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Success:", data);
      setStatus("success");
    } catch (error) {
      console.error(error);
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }
      setStatus("error");
      setErrorMessage(message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center shadow-lg"
        >
          <FaArrowLeft size={18} />
        </motion.button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Mark <span className="text-indigo-400">Attendance</span>
        </h1>
        <div className="w-12 h-12"></div>
      </div>

      <div className="w-full max-w-2xl bg-[#1E293B]/80 backdrop-blur-2xl p-6 sm:p-8 rounded-4xl border border-slate-700/50 shadow-2xl relative overflow-hidden flex flex-col">
        {/* API Generated Subject Dropdown */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">
            Select Class
          </label>
          <div className="relative group">
            <FaBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0B1120]/50 border border-slate-700/50 focus:bg-[#0B1120] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-200 text-sm font-medium appearance-none"
            >
              <option value="" disabled>
                -- Select Active Class --
              </option>
              {classes.map((cls) => (
                <option key={cls.subject_id} value={cls.subject_id}>
                  {cls.subject_code} - {cls.subject_name} (Section{" "}
                  {cls.subject_section})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0B1120]/50 p-1.5 rounded-2xl mb-8 border border-slate-700/50">
          <button
            onClick={() => setAuthMode("face")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              authMode === "face"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FaCamera /> Face Scan
          </button>
          <button
            onClick={() => setAuthMode("voice")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              authMode === "voice"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FaMicrophone /> Voice Scan
          </button>
        </div>

        {/* Dynamic Verification Area */}
        <div className="relative w-full aspect-video bg-black/50 rounded-3xl overflow-hidden border-2 border-slate-700/50 flex flex-col items-center justify-center shadow-inner min-h-75">
          {errorMessage && status !== "loading" && status !== "success" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-400 p-8 text-center bg-rose-950/40 z-10">
              <FaTimesCircle size={48} className="mb-4 opacity-80" />
              <p className="font-bold text-lg text-white mb-2">
                Error Detected
              </p>
              <p className="text-sm font-medium text-rose-300">
                {errorMessage}
              </p>
            </div>
          ) : authMode === "face" ? (
            /* --- FACE MODE UI --- */
            !imageSrc ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 m-6 border-2 border-indigo-500/30 rounded-3xl pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl -mb-0.5 -mr-0.5" />
                </div>
              </>
            ) : (
              <img
                src={imageSrc}
                alt="Captured/Uploaded"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            /* --- VOICE MODE UI --- */
            <div className="flex flex-col items-center justify-center w-full h-full p-6">
              {!audioBlob ? (
                <>
                  <div className="relative flex items-center justify-center mb-6">
                    {isRecording && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute w-24 h-24 bg-rose-500 rounded-full"
                      />
                    )}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                        isRecording
                          ? "bg-rose-600 shadow-rose-500/50"
                          : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/30"
                      }`}
                    >
                      {isRecording ? (
                        <FaStop size={28} />
                      ) : (
                        <FaMicrophone size={32} />
                      )}
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm text-center">
                    {isRecording
                      ? "Listening... Speak now."
                      : "Press to record your voice password."}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <FaMicrophone size={24} />
                  </div>
                  <p className="text-white font-bold mb-4">
                    Voice Sample Recorded
                  </p>
                  <button
                    onClick={playAudio}
                    className="px-6 py-2.5 bg-slate-800 text-slate-200 rounded-xl font-bold hover:bg-slate-700 flex items-center gap-2 border border-slate-700"
                  >
                    <FaPlay /> Play Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status Overlays */}
          <AnimatePresence>
            {status === "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0B1120]/90 backdrop-blur-md flex flex-col items-center justify-center z-20"
              >
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <h3 className="text-white font-bold text-xl tracking-wider">
                  Verifying...
                </h3>
              </motion.div>
            )}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center"
              >
                <FaCheckCircle className="text-emerald-400 mb-4" size={64} />
                <h3 className="text-white font-extrabold text-2xl mb-2">
                  Attendance Marked!
                </h3>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => navigate("/")}
                  className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Return to Dashboard
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <canvas ref={canvasRef} className="hidden" />
        
        {/* Hidden file input for uploading picture */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {/* Action Buttons */}
        <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
          {authMode === "face" && !imageSrc && (
            <>
              <button
                onClick={capturePhoto}
                className="w-full flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all flex justify-center items-center gap-2 shadow-lg"
              >
                <FaCamera /> Capture Face
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-1/3 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all flex justify-center items-center gap-2 border border-slate-700"
              >
                <FaUpload /> Upload Image
              </button>
            </>
          )}

          {(authMode === "face" ? imageSrc : audioBlob) &&
            status === "idle" && (
              <>
                <button
                  onClick={authMode === "face" ? retakePhoto : retakeVoice}
                  className="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-colors border border-slate-700/80 flex justify-center items-center gap-2"
                >
                  <FaRedo /> Retake
                </button>
                <button
                  onClick={submitAttendance}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all flex justify-center items-center gap-2 shadow-lg"
                >
                  <FaCheckCircle /> Verify & Submit
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
};