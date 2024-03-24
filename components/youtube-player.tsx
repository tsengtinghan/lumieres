import React, { useEffect, useState, useRef, use } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import test from "@/public/test.json";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Video from "./ui/video";
import {
    Card,
    CardContent,
  } from "@/components/ui/card"
import axios from "axios";

interface Question {
  type: string;
  question: string;
  options: string[];
  answer: string;
  question_video_url: string;
  wrong_answer_video_url: string;
  correct_answer_video_url: string;
}

interface QuestionList {
  timestamp: number;
  question: Question;
}

function getIdfromUrl(url: string) : string | null{
  const urlParams = new URLSearchParams(url.split('?')[1]);
  return urlParams.get('v');
}

type ButtonVariant = "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;

const YoutubePlayer: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionList[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [loadingState, setLoadingState] = useState<string>("waiting_for_url");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const playerRef = useRef<any>(null);
  const [selectedOption, setSelectedOption] = useState("");

  const opts = {
    width: "100%",
    borderRadius: "2rem",
    playerVars: { autoplay: 1 },
  };

  const questionList: QuestionList[] = test;

  const startVideo = () => {
    loadingState === "waiting_for_url" && setLoadingState("waiting_for_backend");
    // POST
    // https://lumieres-backend.onrender.com/create_questions
    //{"url":"https://www.youtube.com/watch?v=zjkBMFhNj_g", "max_questions":1}
    axios.post("https://lumieres-backend.onrender.com/demo/create_questions", {
      url: videoUrl,
      max_questions: 1,
    }).then((response) => {
      console.log(response);
      setQuestions(response.data.questions);
      setLoadingState("questions_loaded");
    }).catch((error) => {
      console.log(error);
      setLoadingState("questions_loaded");
    });
  }
  
  useEffect(() => {
    setQuestions(questionList);
  }, []);

  const findClosestQuestion = (currentTime: number) => {
    return questions.findIndex((question) => question.timestamp >= currentTime);
  };

  const videoStateChange: YouTubeProps["onStateChange"] = (event) => {
    playerRef.current = event.target;
    if (event.data === 1) checkForQuestions();
  };

  const checkForQuestions = () => {
    const questionIndex = findClosestQuestion(
      playerRef.current.getCurrentTime()
    );
    setCurrentQuestionIndex(questionIndex);

    if (questionIndex >= questions.length) return;

    const questionTime = questions[questionIndex]?.timestamp;
    const intervalId = setInterval(() => {
      if (!playerRef.current) return;
      const currentTime = playerRef.current.getCurrentTime();
      if (currentTime >= questionTime && currentTime < questionTime + 1) {
        playerRef.current.pauseVideo();
        setVideoUrl(questions[questionIndex].question.question_video_url);
        setShowQuestion(true);
        clearInterval(intervalId);
      }
    }, 500);
    return () => clearInterval(intervalId);
  };
  
  
  

  useEffect(() => {
    if (showQuestion) {
      // logic to handle when a question is being shown
    }
  }, [showQuestion]);

  const handleClick = (choice:string) => {
    setSelectedOption(choice);
    if(choice === questions[currentQuestionIndex].question.answer){
        setVideoUrl(questions[currentQuestionIndex].question.correct_answer_video_url);
        setSelectedOption(choice);
    }
    else{
        setVideoUrl(questions[currentQuestionIndex].question.wrong_answer_video_url);
        setSelectedOption(choice);
    }
    // setShowQuestion(false);
    // playerRef.current.playVideo();
  };
  
  const initialScreen = (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Welcome to the YouTube Player</h1>
      <Input placeholder="Enter video URL" onChange={(e) => setVideoUrl(e.target.value)} />
      <Button onClick={startVideo}>Start</Button>
    </div>
  );
  
  const loadingScreen = (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Loading...</h1>
    </div>
  );
  
  const youtubeComponent = (
    <div
    style={{
      maxWidth: "800px",
      margin: "auto",
      marginTop: "12px",
      minHeight: "30vh",
      borderRadius: "12px",
      overflow: "hidden",
    }}
  >
    
    
    <YouTube
      videoId={getIdfromUrl(videoUrl) as string} // video id
      opts={opts}
      onStateChange={videoStateChange}
    />
  </div>
  );

  return (
    <>
      <h1>YouTube Player</h1>
      <div>
        {loadingState == "questions_loaded" && youtubeComponent}
        {showQuestion && (
          <div className="flex mx-auto justify-center my-5">
            <Card className="p-5 bg-center mb-5">
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col w-64 h-64">
                  <p>Question: {questions[currentQuestionIndex].question.question}</p>
                  <Video videoUrl= {videoUrl}/>
                </div>
                {questions[currentQuestionIndex].question.options && (
                <div className="flex flex-col space-y-3">
                    Options:{" "}
                    {questions[currentQuestionIndex].question.options?.map(
                    (item, index) => {
                        if (item === selectedOption && item !== questions[currentQuestionIndex].question.answer) {
                        return <Button key={index} onClick={() => handleClick(item)} variant="destructive">{item}</Button>;
                        }
                        else if (item === selectedOption && item === questions[currentQuestionIndex].question.answer) {
                            return <Button key={index} onClick={() => handleClick(item)} variant="secondary">{item}</Button>;
                        }
                        return <Button key={index} onClick={() => handleClick(item)} variant="outline">{item}</Button>;
                    }
                    )}
                
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {loadingState == "waiting_for_url" && initialScreen}
    </>
  );
};

export default YoutubePlayer;
