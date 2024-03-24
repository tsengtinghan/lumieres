import React, { useEffect, useState, useRef, use } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import test from "@/public/test.json";
import { Button } from "./ui/button";
import Video from "./ui/video";

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

type ButtonVariant = "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;

const YoutubePlayer: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionList[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const playerRef = useRef<any>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const opts = {
    width: "100%",
    borderRadius: "2rem",
    playerVars: { autoplay: 1 },
  };

  const questionList: QuestionList[] = test;

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
          <div className="flex mx-auto">
            <p>Question: {questions[currentQuestionIndex].question.question}</p>
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
                    return <Button key={index} onClick={() => handleClick(item)} variant="default">{item}</Button>;
                  }
                )}
              </div>
            )}
            <Video videoUrl= {videoUrl}/>
          </div>
        )}
      </div>
    </>
  );
};

export default YoutubePlayer;
