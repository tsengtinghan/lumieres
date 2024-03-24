import React, { useEffect, useState, useRef, use } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import test from "@/public/test.json";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Video from "./ui/video";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { Label } from "./ui/label";
import { lstat } from "fs";

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

function getIdfromUrl(url: string): string | null {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  return urlParams.get("v");
}

type ButtonVariant =
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined;


const YoutubePlayer: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionList[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [loadingState, setLoadingState] = useState<string>("waiting_for_url");
  const [mainVideoUrl, setMainVideoUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const playerRef = useRef<any>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const lastVideo = useRef(false);
  
  const opts = {
    width: "100%",
    height: "570px",
    borderRadius: "2rem",
    playerVars: { autoplay: 1 },
  };

  const questionList: QuestionList[] = test;

  const startVideo = () => {
    loadingState === "waiting_for_url" &&
      setLoadingState("waiting_for_backend");
    // POST
    // https://lumieres-backend.onrender.com/create_questions
    //{"url":"https://www.youtube.com/watch?v=zjkBMFhNj_g", "max_questions":1}
    axios
      .post("https://lumieres-backend.onrender.com/demo/create_questions", {
        url: mainVideoUrl,
        max_questions: 1,
      })
      .then((response) => {
        console.log(response);
        setQuestions(response.data.questions); // change back to response.data.questions
        setLoadingState("questions_loaded");
      })
      .catch((error) => {
        console.log(error);
        setLoadingState("questions_loaded");
      });
  };

  //   useEffect(() => {
  //     setQuestions(questionList);
  //   }, []);

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
        console.log(questions[questionIndex]);
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

  const handleClick = (choice: string) => {
    setSelectedOption(choice);
    if (choice === questions[currentQuestionIndex].question.answer) {
      setVideoUrl(
        questions[currentQuestionIndex].question.correct_answer_video_url
      );
      setSelectedOption(choice);
        lastVideo.current = true;
    } else {
      setVideoUrl(
        questions[currentQuestionIndex].question.wrong_answer_video_url
      );
      setSelectedOption(choice);
        lastVideo.current = true;
    }
    // setShowQuestion(false);
    // playerRef.current.playVideo();
  };

  const initialScreen = (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Welcome to the YouTube Player</h1>
      <Input
        placeholder="Enter video URL"
        onChange={(e) => setMainVideoUrl(e.target.value)}
      />
      <Button onClick={startVideo}>Start</Button>
    </div>
  );

  const loadingScreen = (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Loading...</h1>
    </div>
  );
  const handleVideoEnd = () => {    
    console.log("Video Ended");
    console.log(lastVideo.current);
    if(lastVideo.current){
        setShowQuestion(false);
        playerRef.current.playVideo();
        lastVideo.current = false;
    }
  }

  const youtubeComponent = (<YouTube
    videoId={getIdfromUrl(mainVideoUrl) as string} // video id
    opts={opts}
    onStateChange={videoStateChange}/>);

  let mainComponent;
  if (showQuestion) {

    mainComponent = (
      <div className="grid grid-cols-2 gap-4 w-full h-full p-10">
        <div className="flex w-full h-full items-center justify-center">
          <video 
                  src={videoUrl} 
                  className="w-[250px] h-[250px] rounded-full border-none"
                  onEnded={handleVideoEnd}
                  autoPlay
          />
        </div>

          
          <div className="flex flex-col space-y-3 justify-center p-4 h-full">
            <h1 className="text-xl mb-3">{questions[currentQuestionIndex].question.question}</h1>
            {questions[currentQuestionIndex].question.options?.map(
              (item, index) => {
                if (
                  item === selectedOption &&
                  item !== questions[currentQuestionIndex].question.answer
                ) {
                  return (
                    <Button
                      key={index}
                      onClick={() => handleClick(item)}
                      variant="destructive"
                      className="!text-left justify-start text-lg h-16"
                    >
                      {item}
                    </Button>
                  );
                } else if (
                  item === selectedOption &&
                  item === questions[currentQuestionIndex].question.answer
                ) {
                  return (
                    <Button
                      key={index}
                      onClick={() => handleClick(item)}
                      variant="secondary"
                      className="!text-left justify-start text-lg h-16"
                    >
                      {item}
                    </Button>
                  );
                }
                return (
                  <Button
                    key={index}
                    onClick={() => handleClick(item)}
                    variant="outline"
                    className="!text-left justify-start text-lg h-16"
                  >
                    {item}
                  </Button>
                );
              }
            )}
          </div>

      </div>
    );
  } else if (loadingState === "waiting_for_url") {
    mainComponent = (
      <div className="h-full w-full flex justify-center items-center flex-col">
        <div className="text-5xl text-center align-middle p-12">
          Slides
          <br />
          LLM
        </div>
        <div>Please keep your sound on</div>
      </div>
    );
  } else if (loadingState === "waiting_for_backend") {
    mainComponent = (
      <div className="flex flex-col items-center h-full w-full p-12">
        <div className="w-full h-full">
          <div className="loader-inner">
            <div className="loader-line-wrap">
              <div className="loader-line"></div>
            </div>
            <div className="loader-line-wrap">
              <div className="loader-line"></div>
            </div>
            <div className="loader-line-wrap">
              <div className="loader-line"></div>
            </div>
            <div className="loader-line-wrap">
              <div className="loader-line"></div>
            </div>
            <div className="loader-line-wrap">
              <div className="loader-line"></div>
            </div>
          </div>
        </div>
        <h1 className="bottom-3/4">Generation takes up to 3 minutes.</h1>
      </div>
    );
  } else if (loadingState === "questions_loaded") {
    mainComponent = (
      <></>
    );
  }
  console.log(loadingState)
  console.log(showQuestion)

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 p-2  bg-orange-100 overflow-visible ">
      <div className="w-[100%] bg-white max-w-screen-lg shadow-2xl rounded-2xl aspect-[16/9] m-12 mb-16 flex">
        <div className={"w-full h-full bg-white " + (loadingState === "questions_loaded" && !showQuestion  ? 'z-0' : 'z-20' )} >
          {mainComponent}
        </div>
        <div className="w-full h-full ml-[-100%] z-10">
          <YouTube
          videoId={getIdfromUrl(mainVideoUrl) as string} // video id
          opts={opts}
          onStateChange={videoStateChange}
          />
        </div>
      </div>
      <div className="w-full max-w-lg flex justify-between items-center relative -top-12 gap-4 bg-black rounded-3xl p-2">
        <Label className="sr-only" htmlFor="input-field">
          Input Field
        </Label>
        <Input
          className="flex-grow text-white bg-black placeholder-white border-0 rounded-3xl focus:outline-none focus-visible:ring-offset-0 focus:ring-0"
          id="input-field"
          placeholder="Enter Link Here"
          onChange={(e) => setMainVideoUrl(e.target.value)}
        />
        <Button
          className="bg-white text-black p-2 rounded-3xl"
          onClick={startVideo}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 8l4 4m0 0l-4 4m4-4H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </Button>
      </div>
      <div className="absolute top-2 left-0 -mt-16 -ml-16 w-40 h-40 bg-red-500 rounded-full opacity-50 shadow-lg" ></div>
      <div className="absolute top-2 left-16 -mt-10 w-20 h-20 bg-orange-400 rounded-full opacity-50 shadow-lg"></div>
      <div className="absolute top-5 left-14 -mt-2 -ml-2 w-20 h-20 bg-yellow-400 rounded-full opacity-50 shadow-lg"></div>
      <div className="absolute bottom-10 right-0 -mb-16 -mr-16 w-40 h-40 bg-red-500 rounded-full opacity-50 shadow-lg" ></div>
      <div className="absolute bottom-2 right-10 -mb-10 ml-5 w-20 h-20 bg-orange-400 rounded-full opacity-50 shadow-lg"></div>
      <div className="absolute bottom-5 right-14 -mb-2 -mr-2 w-20 h-20 bg-yellow-500 rounded-full opacity-50 shadow-lg"></div>
    </div>
  );
};

export default YoutubePlayer;
