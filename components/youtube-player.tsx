import React, { useEffect, useState, useRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import test from "@/public/test.json";
import { Button } from "./ui/button";

interface Question {
  type: string;
  question: string;
  options?: string[];
  answer?: string;
  question_video_url?: string;
  wrong_answer_video_url?: string;
  correct_answer_video_url?: string;
}

interface QuestionList {
  timestamp: number;
  question: Question;
}


const YoutubePlayer: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionList[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const playerRef = useRef<any>(null);

  const opts = {
    width: "100%",
    borderRadius: "2rem",
    playerVars: { autoplay: 1 },
  };

  const questionList: QuestionList[] = test.questions;

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
    setCurrentQuestionIndex(
      findClosestQuestion(playerRef.current.getCurrentTime())
    );
    if (currentQuestionIndex >= questions.length) return;

    const questionTime = questions[currentQuestionIndex]?.timestamp;
    const intervalId = setInterval(() => {
      if (!playerRef.current) return;
      const currentTime = playerRef.current.getCurrentTime();
      if (currentTime >= questionTime) {
        playerRef.current.pauseVideo();
        setShowQuestion(true);
        clearInterval(intervalId);
      }
    }, 100);

    // clean up the interval
    return () => clearInterval(intervalId);
  };

  useEffect(() => {
    if (showQuestion) {
      // logic to handle when a question is being shown
    }
  }, [showQuestion]);

  const handleClick = () => {
    setShowQuestion(false);
    playerRef.current.playVideo();
  };

  return (
    <>
      <h1>YouTube Player</h1>
      <div>
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
            videoId="zjkBMFhNj_g" // video id
            opts={opts}
            onStateChange={videoStateChange}
          />
        </div>
        {showQuestion && (
          <div style={{ maxWidth: "800px", margin: "auto", marginTop: "20px" }}>
            <p>Question: {questions[currentQuestionIndex].question.question}</p>
            {questions[currentQuestionIndex].question.options && (
              <div className="flex flex-col space-y-3">
                Options:{" "}
                {questions[currentQuestionIndex].question.options?.map(
                  (item, index) => {
                    return <span key={index}>{item}</span>;
                  }
                )}
              </div>
            )}
            <Button onClick={handleClick}>Next</Button>
          </div>
        )}
      </div>
    </>
  );
};

export default YoutubePlayer;
