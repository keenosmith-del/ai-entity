import { useRef, useState } from "react";
import {
  ArrowRight,
  Mic,
  Plus,
  Pause,
  Play,
  X,
  Ellipsis,
  Brain,
  Database,
  BookOpen,
  Workflow,
  Blocks,
  Cpu,
  ChevronDown,
  ChevronUp,
  SquarePen,
} from "lucide-react";

import "./styles/globals.css";
import "./styles/home.css";

import orb from "./assets/orb2.gif";
import record from "./assets/record.png";

function App() {
  const [prompt, setPrompt] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const inputRef = useRef(null);

  const [savedDraft, setSavedDraft] = useState("");

  const waveformBars = Array.from({ length: 72 });

  const [showPanel, setShowPanel] = useState(false);

  const [openSection, setOpenSection] = useState(null);

  const [showResponse, setShowResponse] = useState(false);

  const [isThinking, setIsThinking] = useState(false);

  // fake streaming
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const isMobile = window.innerWidth <= 768;

  const fakeResponse =
    "Hello! I'm your AI assistant. This response is currently being streamed one character at a time so we can build the interface before connecting a real language model.";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRecording) {
      setPrompt(savedDraft);
      setSavedDraft("");
      setIsRecording(false);
      setIsPaused(false);

      setShowResponse(true);

      inputRef.current?.focus();
      return;
    }

    // Normal text mode
    if (!prompt.trim()) return;

    console.log(prompt);

    const userPrompt = prompt;

    setPrompt("");

    setShowResponse(true);

    setIsThinking(true);

    inputRef.current?.focus();

    setResponse("");

    setTimeout(() => {

      setIsThinking(false);
      setIsStreaming(true);

      let i = 0;

      const interval = setInterval(() => {

        i++;

        setResponse(fakeResponse.slice(0, i));

        if (i >= fakeResponse.length) {

          clearInterval(interval);
          setIsStreaming(false);

        }

      }, 18);

    }, 3000);
  };

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
  };

  return (
    <main className="app">

      {/* ellipsis */}
      <button
        className="menuButton"
        onClick={() => setShowPanel((prev) => !prev)}
      >
        <Ellipsis size={22} strokeWidth={1.5} />
      </button>

      {/* panel */}
      <div className={`sidePanel ${showPanel ? "open" : ""}`}>
        <div className="panelMenu">
          <div className="panelGroup">

            <button
              className="panelItem"
              onClick={() => toggleSection("personality")}
            >

              <div className="panelLeft">

                <Brain
                  size={16}
                  strokeWidth={1}
                />

                <span>Personality</span>

              </div>

              {openSection === "personality" ? (
                <ChevronUp
                  size={15}
                  strokeWidth={1}
                />
              ) : (
                <ChevronDown
                  size={15}
                  strokeWidth={1}
                />
              )}

            </button>

            {openSection === "personality" && (

              <div className="panelContent">

                Personality content

              </div>

            )}

          </div>

          <div className="panelGroup">

            <button
              className="panelItem"
              onClick={() => toggleSection("memory")}
            >

              <div className="panelLeft">

                <Database
                  size={16}
                  strokeWidth={1}
                />

                <span>Memory</span>

              </div>

              {openSection === "memory" ? (
                <ChevronUp
                  size={15}
                  strokeWidth={1}
                />
              ) : (
                <ChevronDown
                  size={15}
                  strokeWidth={1}
                />
              )}

            </button>

            {openSection === "memory" && (

              <div className="panelContent">

                Memory content

              </div>

            )}

          </div>

          <div className="panelGroup">

            <button
              className="panelItem"
              onClick={() => toggleSection("knowledge")}
            >

              <div className="panelLeft">

                <BookOpen
                  size={16}
                  strokeWidth={1}
                />

                <span>Knowledge</span>

              </div>

              {openSection === "knowledge" ? (
                <ChevronUp
                  size={15}
                  strokeWidth={1}
                />
              ) : (
                <ChevronDown
                  size={15}
                  strokeWidth={1}
                />
              )}

            </button>

            {openSection === "knowledge" && (

              <div className="panelContent">

                Knowledge content

              </div>

            )}

          </div>

          <div className="panelGroup">

            <button
              className="panelItem"
              onClick={() => toggleSection("workflow")}
            >

              <div className="panelLeft">

                <Workflow
                  size={16}
                  strokeWidth={1}
                />

                <span>Workflow</span>

              </div>

              {openSection === "workflow" ? (
                <ChevronUp
                  size={15}
                  strokeWidth={1}
                />
              ) : (
                <ChevronDown
                  size={15}
                  strokeWidth={1}
                />
              )}

            </button>

            {openSection === "workflow" && (

              <div className="panelContent">

                Workflow content

              </div>

            )}

          </div>

          <div className="panelGroup">

            <button
              className="panelItem"
              onClick={() => toggleSection("context")}
            >

              <div className="panelLeft">

                <Blocks
                  size={16}
                  strokeWidth={1}
                />

                <span>Context</span>

              </div>

              {openSection === "context" ? (
                <ChevronUp
                  size={15}
                  strokeWidth={1}
                />
              ) : (
                <ChevronDown
                  size={15}
                  strokeWidth={1}
                />
              )}

            </button>

            {openSection === "context" && (

              <div className="panelContent">

                Context content

              </div>

            )}

          </div>

          <div className="panelGroup">

            <button
              className="panelItem"
              onClick={() => toggleSection("model")}
            >

              <div className="panelLeft">

                <Cpu
                  size={16}
                  strokeWidth={1}
                />

                <span>Model</span>

              </div>

              {openSection === "model" ? (
                <ChevronUp
                  size={15}
                  strokeWidth={1}
                />
              ) : (
                <ChevronDown
                  size={15}
                  strokeWidth={1}
                />
              )}

            </button>

            {openSection === "model" && (

              <div className="panelContent">

                Model content

              </div>

            )}
          </div>
        </div>
      </div>

      <div className={`workspace ${showResponse ? "responseOpen" : ""}`}>

        <section className="hero">
          <img
            src={orb}
            alt="AI Orb"
            className="orb"
            draggable={false}
          />

          <p className="heroText">
            Ask me anything...
          </p>

          <form
            className="promptForm"
            onSubmit={handleSubmit}
          >
            <Plus
              className="plusIcon"
              size={18}
              strokeWidth={1.5}
            />
            {isRecording && (
              <div className="waveform">
                {waveformBars.map((_, index) => (
                  <span
                    key={index}
                    className={`waveBar ${isPaused ? "paused" : ""}`}
                    style={{
                      animationDelay: `${index * 0.025}s`
                    }}
                  />
                ))}
              </div>
            )}

            <input
              ref={inputRef}
              className="promptInput"
              type="text"
              placeholder=""
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {!isRecording ? (
              <button
                type="button"
                className="micButton"
                onClick={() => {
                  setSavedDraft(prompt);
                  setPrompt("");
                  setIsRecording(true);
                  setIsPaused(false);
                }}
              >
                <Mic size={18} strokeWidth={1.5} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="recordButton"
                  onClick={() => setIsPaused((prev) => !prev)}
                >
                  <img
                    src={record}
                    alt="Recording"
                    className={`recordIcon ${isPaused ? "paused" : ""}`}
                    draggable={false}
                  />
                </button>

                <button
                  type="button"
                  className="cancelButton"
                  onClick={() => {
                    setPrompt(savedDraft);
                    setSavedDraft("");
                    setIsRecording(false);
                    setIsPaused(false);

                    inputRef.current?.focus();
                  }}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </>
            )}

            <button
              type="submit"
              className="sendButton"
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </form>
        </section> {/* end hero */}

        {/* response panel desktop */}
        {!isMobile && (
          <section className="responsePanel">

            <div className="responseHeader">

              <button
                className="responseIconButton"
                onClick={() => {
                  setPrompt("");
                  setSavedDraft("");
                  setIsRecording(false);
                  setIsPaused(false);

                  inputRef.current?.focus();

                  console.log("New conversation");
                }}
              >
                <SquarePen
                  size={16}
                  strokeWidth={1}
                />
              </button>

              <button
                className="responseIconButton"
                onClick={() => setShowResponse(false)}
              >
                <X
                  size={16}
                  strokeWidth={1}
                />
              </button>

            </div>

            {isThinking && (

              <div className="thinkingLoader">

                <span />
                <span />
                <span />

              </div>

            )}

            {/* response */}
            <div className="responseBody">

              {response}

            </div>

          </section>
        )}

        {/* mobile panel */}
        {isMobile && (

          <section className={`mobileResponsePanel ${showResponse ? "open" : ""}`}>

            <div className="responseHeader">

              <button
                className="responseIconButton"
                onClick={() => {
                  setPrompt("");
                  setSavedDraft("");
                  setIsRecording(false);
                  setIsPaused(false);

                  inputRef.current?.focus();
                }}
              >
                <SquarePen
                  size={16}
                  strokeWidth={1}
                />
              </button>

              <button
                className="responseIconButton"
                onClick={() => setShowResponse(false)}
              >
                <X
                  size={16}
                  strokeWidth={1}
                />
              </button>

            </div>

            {isThinking && (

              <div className="thinkingLoader">

                <span />
                <span />
                <span />

              </div>

            )}

            {/* response */}
            <div className="responseBody">

              {response}

            </div>

          </section>

        )}

      </div>
    </main >
  );
}

export default App;