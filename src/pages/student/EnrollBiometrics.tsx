import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FaCamera,
  FaMicrophone,
  FaCheckCircle,
  FaRedo,
  FaPlay,
  FaStop,
  FaArrowRight,
  FaArrowLeft,
  FaUpload, // Naya import upload icon ke liye
} from "react-icons/fa";
import { useAppSelector } from "../../redux/hook";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import RecordRTC from "recordrtc";

export const EnrollBiometrics: React.FC = () => {
  const { loggedUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  // --- STATES ---
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Camera, 2: Voice, 3: Review

  // Photo States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Naya ref File Upload ke liye
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<RecordRTC | null>(null);

  // --- CAMERA LOGIC (Step 1) ---
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access failed", err);
      alert("Camera permission is required to capture your photo.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror fix
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL("image/jpeg", 0.9));
        stopCamera();
        setStep(2); // Photo lene ke baad direct Step 2 par jaye
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
        setStep(2); // Seedha step 2 (Voice) par bhej do
      };
      reader.readAsDataURL(file);
    }
  };

  // --- VOICE LOGIC (Step 2) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Native MediaRecorder ki jagah RecordRTC ka use, jo WAV banata hai
      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000, // Aapke librosa ko 16000 chahiye, yahi set kar diya!
        numberOfAudioChannels: 1, // Mono audio for faster AI processing
      });

      recorder.startRecording();

      // Store recorder and stream so we can stop them later
      mediaRecorderRef.current = recorder as any;
      videoStreamRef.current = stream; // Reusing stream ref to stop mic later

      setIsRecording(true);
    } catch (err) {
      console.error("Mic access failed", err);
      alert("Microphone permission is required to record your voice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const recorder = mediaRecorderRef.current as any;

      recorder.stopRecording(() => {
        const audioBlob = recorder.getBlob();
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));

        // Mic ki red light band karne ke liye
        if (videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      });
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // --- CLEANUP ---
  useEffect(() => {
    if (step === 1) startCamera();
    return () => {
      stopCamera();
    }; // Cleanup on unmount or step change
  }, [step, startCamera, stopCamera]);

  // --- SUBMIT LOGIC (Step 3) ---
  const handleSubmit = async () => {
    console.log("Submitting Biometrics...");
    console.log("Image Data:", imageSrc?.substring(0, 50) + "...");
    console.log("Audio Blob:", audioBlob);

    const formData = new FormData();
    try {
      if (audioBlob) {
        formData.append("audio", audioBlob, "voice.wav");
      }
      if (imageSrc) {
        const imageBlob = await fetch(imageSrc).then((res) => res.blob());
        formData.append("image", imageBlob, "face.jpg");
      }
      formData.append("user_id", String(loggedUser?.user_id));

      const res = await API.post("/auth/register-image-voice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res);
      // Yaha backend API hit hogi (multipart/form-data request)
      alert("Biometrics Enrolled Successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  // Animation variants
  const slideVariants: Variants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { x: -50, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 font-sans mt-8">
      {/* Progress Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Enroll <span className="text-indigo-400">Biometrics</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium">
          Add your face and voice to secure your account.
        </p>

        {/* Stepper Dots */}
        <div className="flex justify-center items-center gap-4 mt-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= num
                    ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {step > num ? <FaCheckCircle /> : num}
              </div>
              {num !== 3 && (
                <div
                  className={`w-12 h-1 ml-4 rounded-full ${step > num ? "bg-indigo-500" : "bg-slate-800"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1E293B]/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative min-h-112.5">
        <AnimatePresence mode="wait">
          {/* ================= STEP 1: FACE CAPTURE ================= */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 flex flex-col items-center"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaCamera className="text-indigo-400" /> Capture Your Face
              </h2>

              <div className="w-full max-w-sm aspect-video bg-black/80 rounded-4xl overflow-hidden border-2 border-slate-700/80 relative shadow-inner mb-8">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Scanner Target */}
                <div className="absolute inset-0 m-6 border-2 border-indigo-500/30 rounded-3xl pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl -mb-0.5 -mr-0.5" />
                </div>
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

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                >
                  <FaCamera /> Capture Photo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-lg"
                >
                  <FaUpload /> Upload Image
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: VOICE CAPTURE ================= */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 flex flex-col items-center justify-center h-full min-h-100"
            >
              <button
                onClick={() => setStep(1)}
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <FaArrowLeft /> Back
              </button>

              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <FaMicrophone className="text-purple-400" /> Record Your Voice
              </h2>
              <p className="text-slate-400 text-sm mb-10 text-center max-w-sm">
                Please press record and say:
                <br />{" "}
                <span className="text-white font-bold italic mt-2 block">
                  "My name is {loggedUser?.name || "Student"} and I am
                  registering my voice."
                </span>
              </p>

              {/* Voice Record Button with Pulse Effect */}
              <div className="relative flex items-center justify-center mb-10">
                {isRecording && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-24 h-24 bg-rose-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{
                        duration: 1.5,
                        delay: 0.2,
                        repeat: Infinity,
                      }}
                      className="absolute w-24 h-24 bg-rose-500 rounded-full"
                    />
                  </>
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

              {audioUrl ? (
                <div className="flex items-center gap-4 w-full justify-center">
                  <button
                    onClick={playAudio}
                    className="px-6 py-3 bg-slate-800 text-slate-200 rounded-xl font-bold hover:bg-slate-700 flex items-center gap-2 border border-slate-700"
                  >
                    <FaPlay /> Play Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(3)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                  >
                    Next <FaArrowRight />
                  </motion.button>
                </div>
              ) : (
                <p className="text-slate-500 text-sm font-medium animate-pulse">
                  {isRecording ? "Listening..." : "Tap the microphone to start"}
                </p>
              )}
            </motion.div>
          )}

          {/* ================= STEP 3: REVIEW & SUBMIT ================= */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 flex flex-col items-center"
            >
              <button
                onClick={() => setStep(2)}
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <FaArrowLeft /> Back
              </button>

              <h2 className="text-2xl font-bold text-white mb-8">
                Review Biometrics
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl mb-10">
                {/* Photo Preview */}
                <div className="flex-1 bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                  <h3 className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Face ID
                  </h3>
                  <img
                    src={imageSrc as string}
                    alt="Face ID"
                    className="w-full h-32 object-cover rounded-2xl border-2 border-slate-700"
                  />
                  <button
                    onClick={() => {
                      setStep(1);
                      if (fileInputRef.current) fileInputRef.current.value = ""; // Input clear karne ke liye
                    }}
                    className="mt-4 text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1"
                  >
                    <FaRedo /> Retake
                  </button>
                </div>

                {/* Voice Preview */}
                <div className="flex-1 bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center">
                  <h3 className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                    Voice ID
                  </h3>
                  <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-2 border border-purple-500/30">
                    <FaMicrophone size={24} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={playAudio}
                      className="px-3 py-1.5 bg-slate-700 rounded-lg text-xs font-bold text-white hover:bg-slate-600 flex items-center gap-1"
                    >
                      <FaPlay /> Play
                    </button>
                    <button
                      onClick={() => {
                        setAudioUrl(null);
                        setStep(2);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1"
                    >
                      <FaRedo /> Retake
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="px-10 py-4 w-full max-w-sm bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <FaCheckCircle /> Save Biometrics
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};