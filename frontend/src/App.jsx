import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  ArrowLeft,
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
  Square,
  Minus,
} from "lucide-react";

import "./styles/globals.css";
import "./styles/home.css";

import orb from "./assets/orb2.gif";
import record from "./assets/record.png";

import {
  getConversations,
  createConversation as createConversationAPI,
  updateConversation,
  deleteConversation,
} from "./api/conversations";

function App() {
  const [prompt, setPrompt] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const inputRef = useRef(null);

  const desktopResponseBodyRef = useRef(null);
  const mobileResponseBodyRef = useRef(null);

  const conversationRef = useRef(null);

  const desktopShouldAutoScrollRef = useRef(true);
  const mobileShouldAutoScrollRef = useRef(true);

  const [savedDraft, setSavedDraft] = useState("");

  const waveformBars = Array.from({ length: 72 });

  const [showPanel, setShowPanel] = useState(false);

  const [openSection, setOpenSection] = useState(null);

  // personality state
  // default personalty
  const defaultPersonality = {
    tone: "Balanced",
    responseStyle: "Concise",
    formality: "Neutral",
    creativity: "Balanced",
    customInstructions: "",
  };

  const [personality, setPersonality] = useState(
    defaultPersonality
  );

  const [personalityDraft, setPersonalityDraft] = useState(
    defaultPersonality
  );

  // memory states 
  // defauly memory
  const defaultMemory = {
    enabled: true,
    memories: [],
  };

  const [memory, setMemory] = useState(
    defaultMemory
  );

  const [memoryInput, setMemoryInput] = useState("");

  const [editingMemoryIndex, setEditingMemoryIndex] = useState(null);
  const [editingMemoryValue, setEditingMemoryValue] = useState("");

  // edit conversation titles
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingConversationTitle, setEditingConversationTitle] = useState("");

  // delete conversation
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // edit knowledge docs
  const [editingKnowledgeId, setEditingKnowledgeId] = useState(null);
  const [editingKnowledgeName, setEditingKnowledgeName] = useState("");

  const [editingKnowledgeContentId, setEditingKnowledgeContentId] = useState(null);
  const [editingKnowledgeContent, setEditingKnowledgeContent] = useState("");

  // context state
  const defaultContext = {
    includeConversation: true,
    includePersonality: true,
    includeMemory: true,
    includeKnowledge: true,
    maxMessages: 20,
  };

  const [context, setContext] = useState(
    defaultContext
  );

  // knowledge state
  const defaultKnowledge = {
    enabled: true,
    documents: [],
  };

  const [knowledge, setKnowledge] = useState(
    defaultKnowledge
  );

  const [knowledgeInput, setKnowledgeInput] = useState("");

  // model
  const defaultModelSettings = {
    model: "gpt-5.6",
    temperature: 0.7,
    maxTokens: 1024,
  };

  const [modelSettings, setModelSettings] = useState(
    defaultModelSettings
  );

  const [showResponse, setShowResponse] = useState(false);

  const [isResponseMinimized, setIsResponseMinimized] = useState(false);

  const [isThinking, setIsThinking] = useState(false);

  // toast
  const [toast, setToast] = useState("");

  // helper
  const createConversation = (
    conversationPersonality = personality,
    conversationMemory = memory,
    conversationContext = context
  ) => ({
    id: Date.now(),
    title: "New Conversation",
    messages: [],
    personality: {
      ...conversationPersonality,
    },
    memory: {
      ...conversationMemory,
      memories: [...conversationMemory.memories],
    },
    context: {
      ...conversationContext,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const createNewConversation = () => {

    const newConversation = createConversation();

    setConversation(newConversation);
    setShowResponse(true);
    setIsResponseMinimized(false);

    setPersonality({
      ...defaultPersonality,
    });

    setPersonalityDraft({
      ...defaultPersonality,
    });

    setMemory({
      ...defaultMemory,
      memories: [],
    });

    setContext({
      ...defaultContext,
    });

    return newConversation;

  };

  const endConversation = () => {

    stopStreaming();

    const newConversation = createConversation();

    setConversation(newConversation);

    setPrompt("");
    setSavedDraft("");
    setIsRecording(false);
    setIsPaused(false);

    setShowResponse(false);
    setIsResponseMinimized(false);

    setPersonality({
      ...defaultPersonality,
    });

    setPersonalityDraft({
      ...defaultPersonality,
    });

    setMemory({
      ...defaultMemory,
      memories: [],
    });

    setContext({
      ...defaultContext,
    });

    setOpenSection(null);
  };

  const handleNewChat = () => {

    stopStreaming();

    setPrompt("");
    setSavedDraft("");
    setIsRecording(false);
    setIsPaused(false);

    setOpenSection(null);
    setShowPanel(false);

    createNewConversation();

    inputRef.current?.focus();

  };

  // helper
  const persistConversation = async (conversationToSave) => {

    const {
      id,
      _id,
      ...conversationData
    } = conversationToSave;

    try {

      if (_id) {

        const updatedConversation =
          await updateConversation(
            _id,
            conversationData
          );

        setConversation(updatedConversation);

        return updatedConversation;

      }

      const savedConversation =
        await createConversationAPI(
          conversationData
        );

      setConversation(savedConversation);

      return savedConversation;

    } catch (error) {

      console.error(
        "Failed to persist conversation:",
        error
      );

      return null;

    }

  };

  const createConversationTitle = (text) => {

    const cleanText = text.trim();

    if (cleanText.length <= 40) {
      return cleanText;
    }

    return `${cleanText.slice(0, 40).trim()}...`;

  };

  // restore memory & personality when switching conversations
  const switchConversation = (selectedConversation) => {
    const selectedMemory = selectedConversation.memory || defaultMemory;

    setConversation(selectedConversation);

    setPersonality({
      ...defaultPersonality,
      ...(selectedConversation.personality || {}),
    });

    setPersonalityDraft({
      ...defaultPersonality,
      ...(selectedConversation.personality || {}),
    });

    setMemory({
      ...defaultMemory,
      ...selectedMemory,
      memories: [
        ...(selectedMemory.memories || []),
      ],
    });

    setContext({
      ...defaultContext,
      ...(selectedConversation.context || {}),
    });

    setEditingMemoryIndex(null);
    setEditingMemoryValue("");
    setMemoryInput("");

    setShowResponse(true);
    setIsResponseMinimized(false);
  };

  // personality
  const buildPersonalityInstructions = (settings) => {

    const instructions = [];

    instructions.push(
      `Use a ${settings.tone.toLowerCase()} tone.`
    );

    instructions.push(
      `Keep responses ${settings.responseStyle.toLowerCase()}.`
    );

    instructions.push(
      `Use a ${settings.formality.toLowerCase()} level of formality.`
    );

    instructions.push(
      `Use a ${settings.creativity.toLowerCase()} level of creativity.`
    );

    if (settings.customInstructions.trim()) {

      instructions.push(
        settings.customInstructions.trim()
      );

    }

    return instructions.join(" ");

  };

  // knowledge builder
  const buildKnowledgeInstructions = () => {

    if (
      !knowledge.enabled ||
      knowledge.documents.length === 0
    ) {
      return "";
    }

    return knowledge.documents
      .map(
        (document) =>
          `Document: ${document.name}\n${document.content}`
      )
      .join("\n\n");

  };

  // ai request payload
  const buildAIRequest = (
    userPrompt,
    retrievedKnowledge = []
  ) => {

    const messages = [];

    if (context.includePersonality) {

      messages.push({
        role: "system",
        content: buildPersonalityInstructions(personality),
      });

    }

    if (
      context.includeMemory &&
      memory.enabled &&
      memory.memories.length > 0
    ) {

      messages.push({
        role: "system",
        content: `Relevant memories:\n${buildMemoryInstructions()}`,
      });

    }

    if (
      context.includeKnowledge &&
      knowledge.enabled &&
      retrievedKnowledge.length > 0
    ) {

      const knowledgeContent =
        retrievedKnowledge
          .map(
            (document) =>
              `Document: ${document.name}\n${document.content || ""}`
          )
          .join("\n\n");

      messages.push({
        role: "system",
        content: `Relevant knowledge:\n${knowledgeContent}`,
      });

    }

    if (context.includeConversation) {

      const conversationMessages =
        conversation.messages
          .slice(-context.maxMessages)
          .filter((message) => message.content);

      messages.push(
        ...conversationMessages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );

    }

    messages.push({
      role: "user",
      content: userPrompt,
    });

    return {
      messages,
    };

  };

  // context stat helper
  const getContextStats = () => {

    const conversationMessages = context.includeConversation
      ? conversation.messages
        .slice(-context.maxMessages)
        .filter((message) => message.content)
      : [];

    const memoryCount =
      context.includeMemory && memory.enabled
        ? memory.memories.length
        : 0;

    return {
      messages: conversationMessages.length,
      memories: memoryCount,
      personality: context.includePersonality,
    };

  };

  //memory builder
  const buildMemoryInstructions = () => {

    if (!memory.enabled || memory.memories.length === 0) {
      return "";
    }

    return memory.memories
      .map((item) => `- ${item}`)
      .join("\n");

  };

  // knowledge retrieval simulation
  const retrieveKnowledge = (userPrompt) => {

    if (
      !knowledge.enabled ||
      !context.includeKnowledge ||
      knowledge.documents.length === 0
    ) {
      return [];
    }

    const promptWords = userPrompt
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);

    const results = knowledge.documents
      .map((document) => {

        const searchableText = `
        ${document.name}
        ${document.content || ""}
      `.toLowerCase();

        const matches = promptWords.filter((word) =>
          searchableText.includes(word)
        );

        return {
          ...document,
          score: matches.length,
        };

      })
      .filter((document) => document.score > 0)
      .sort((a, b) => b.score - a.score);

    return results;
  };

  // memory extraction
  const extractMemory = (userPrompt) => {

    const text = userPrompt.trim();

    if (!text) {
      return null;
    }

    // add pattern girl/boy friend's name is
    const patterns = [
      {
        regex: /^my name is (.+)$/i,
        format: (match) => `User's name is ${match[1].trim()}.`,
      },
      {
        regex: /^i(?:'m| am) (?:a |an )?(.+)$/i,
        format: (match) => `User is ${match[1].trim()}.`,
      },
      {
        regex: /^i (?:like|love|prefer) (.+)$/i,
        format: (match) => `User likes ${match[1].trim()}.`,
      },
      {
        regex: /^i work (?:as|at) (.+)$/i,
        format: (match) => `User works ${match[1].trim()}.`,
      },
    ];

    for (const pattern of patterns) {

      const match = text.match(pattern.regex);

      if (match) {
        return pattern.format(match);
      }

    }

    return null;

  };

  //
  const saveConversationToHistory = (currentConversation) => {

    if (currentConversation.messages.length === 0) {
      return;
    }

    setConversationHistory((currentHistory) => {

      const existingConversation = currentHistory.find(
        (item) => item.id === currentConversation.id
      );

      if (existingConversation) {

        return currentHistory.map((item) =>
          item.id === currentConversation.id
            ? currentConversation
            : item
        );

      }

      return [
        ...currentHistory,
        currentConversation,
      ];

    });

  };

  const saveConversationTitle = (conversationId) => {

    const title = editingConversationTitle.trim();

    if (!title) return;

    setConversationHistory((currentHistory) =>
      currentHistory.map((item) =>
        item.id === conversationId
          ? {
            ...item,
            title,
            updatedAt: Date.now(),
          }
          : item
      )
    );

    setConversation((current) =>
      current.id === conversationId
        ? {
          ...current,
          title,
          updatedAt: Date.now(),
        }
        : current
    );

    setEditingConversationId(null);
    setEditingConversationTitle("");

  };

  // delete handler
  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation(conversationToDelete._id);

      setConversationHistory((currentHistory) =>
        currentHistory.filter(
          (item) => item._id !== conversationToDelete._id
        )
      );

      if (conversation._id === conversationToDelete._id) {
        stopStreaming();

        const newConversation = createConversation();

        setConversation(newConversation);
        setPrompt("");
        setSavedDraft("");
        setIsRecording(false);
        setIsPaused(false);
        setShowResponse(false);
        setIsResponseMinimized(false);

        setPersonality({
          ...defaultPersonality,
        });

        setPersonalityDraft({
          ...defaultPersonality,
        });

        setMemory({
          ...defaultMemory,
          memories: [],
        });

        setContext({
          ...defaultContext,
        });

        setOpenSection(null);
      }

      setConversationToDelete(null);

      showToast("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);

      setConversationToDelete(null);

      showToast("Failed to delete conversation");
    }
  };

  // save knowledge edit helper
  const saveKnowledgeName = (documentId) => {

    const name = editingKnowledgeName.trim();

    if (!name) return;

    setKnowledge((current) => ({
      ...current,

      documents: current.documents.map((document) =>
        document.id === documentId
          ? {
            ...document,
            name,
          }
          : document
      ),
    }));

    setEditingKnowledgeId(null);
    setEditingKnowledgeName("");

    showToast("Document renamed");

  };

  const saveKnowledgeContent = (documentId) => {

    setKnowledge((current) => ({
      ...current,

      documents: current.documents.map((document) =>
        document.id === documentId
          ? {
            ...document,
            content: editingKnowledgeContent,
          }
          : document
      ),
    }));

    setEditingKnowledgeContentId(null);
    setEditingKnowledgeContent("");

    showToast("Document saved");

  };

  // set and reset personality 
  const savePersonality = () => {

    setPersonality({
      ...personalityDraft,
    });

    setConversation((current) => ({
      ...current,
      personality: {
        ...personalityDraft,
      },
      updatedAt: Date.now(),
    }));

    showToast("Changes saved");

  };

  const resetPersonality = () => {

    setPersonalityDraft({
      ...defaultPersonality,
    });

    showToast("Personality reset");

  };

  const showToast = (message) => {

    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);

  };

  // conversation
  const [conversation, setConversation] = useState(
    createConversation()
  );

  const [conversationHistory, setConversationHistory] = useState([]);

  const [isStreaming, setIsStreaming] = useState(false);

  const fakeResponse =
    "Hello! I'm your AI assistant. This response is currently being streamed one character at a time so we can build the interface before connecting a real language model.";

  const streamRef = useRef(null);
  const thinkingTimeoutRef = useRef(null);

  const isMobile = window.innerWidth <= 768;

  // stop streaming response
  const stopStreaming = () => {

    // Stop thinking phase
    if (thinkingTimeoutRef.current) {

      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;

    }

    // Stop streaming phase
    if (streamRef.current) {

      clearInterval(streamRef.current);
      streamRef.current = null;

    }

    setIsThinking(false);
    setIsStreaming(false);

  };

  // handle submit onclick (arrow) send
  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowPanel(false);

    if (isRecording) {
      setPrompt(savedDraft);
      setSavedDraft("");
      setIsRecording(false);
      setIsPaused(false);

      setShowResponse(true);

      inputRef.current?.focus();
      return;
    }

    if (!prompt.trim()) return;

    const userPrompt = prompt.trim();

    const memoryCandidate = extractMemory(userPrompt);

    const retrievedKnowledge = retrieveKnowledge(userPrompt);

    console.log("Retrieved knowledge:", retrievedKnowledge);

    const aiRequest = buildAIRequest(
      userPrompt,
      retrievedKnowledge
    );

    console.log("AI request:", aiRequest);

    setPrompt("");
    setShowResponse(true);
    setIsResponseMinimized(false);

    setIsThinking(true);

    inputRef.current?.focus();

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: userPrompt,
    };

    const assistantMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
    };

    desktopShouldAutoScrollRef.current = true;
    mobileShouldAutoScrollRef.current = true;

    const updatedConversation = {
      ...conversation,

      title:
        conversation.messages.length === 0
          ? createConversationTitle(userPrompt)
          : conversation.title,

      messages: [
        ...conversation.messages,
        userMessage,
        assistantMessage,
      ],

      updatedAt: Date.now(),
    };

    setConversation(updatedConversation);

    // Store extracted memory locally
    if (
      memory.enabled &&
      memoryCandidate &&
      !memory.memories.includes(memoryCandidate)
    ) {
      setMemory((current) => {
        const updatedMemory = {
          ...current,
          memories: [
            ...current.memories,
            memoryCandidate,
          ],
        };

        setConversation((currentConversation) => ({
          ...currentConversation,
          memory: {
            ...updatedMemory,
            memories: [
              ...updatedMemory.memories,
            ],
          },
          updatedAt: Date.now(),
        }));

        return updatedMemory;
      });
    }

    thinkingTimeoutRef.current = setTimeout(() => {

      thinkingTimeoutRef.current = null;

      setIsThinking(false);
      setIsStreaming(true);

      let i = 0;

      streamRef.current = setInterval(() => {

        i++;

        setConversation((current) => {

          const updatedConversation = {
            ...current,

            messages: current.messages.map((message) =>
              message.id === assistantMessage.id
                ? {
                  ...message,
                  content: fakeResponse.slice(0, i),
                }
                : message
            ),

            updatedAt: Date.now(),
          };

          return updatedConversation;

        });

        if (i >= fakeResponse.length) {

          clearInterval(streamRef.current);
          streamRef.current = null;

          setIsStreaming(false);

          const currentConversation =
            conversationRef.current;

          const completedConversation = {
            ...currentConversation,

            messages: currentConversation.messages.map(
              (message) =>
                message.id === assistantMessage.id
                  ? {
                    ...message,
                    content: fakeResponse,
                  }
                  : message
            ),

            updatedAt: Date.now(),
          };

          setConversation(completedConversation);

          persistConversation(completedConversation);

        }

      }, 18);

    }, 3000);
  };

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
  };

  // desktop scroll function
  const handleDesktopResponseScroll = () => {

    const body = desktopResponseBodyRef.current;

    if (!body) return;

    const distanceFromBottom =
      body.scrollHeight -
      body.scrollTop -
      body.clientHeight;

    desktopShouldAutoScrollRef.current =
      distanceFromBottom < 40;

  };

  // mobile scroll function 
  const handleMobileResponseScroll = () => {

    const body = mobileResponseBodyRef.current;

    if (!body) return;

    const distanceFromBottom =
      body.scrollHeight -
      body.scrollTop -
      body.clientHeight;

    mobileShouldAutoScrollRef.current =
      distanceFromBottom < 40;

  };

  // useEffect scroll
  useEffect(() => {

    const desktopBody = desktopResponseBodyRef.current;
    const mobileBody = mobileResponseBodyRef.current;

    if (
      desktopBody &&
      desktopShouldAutoScrollRef.current
    ) {
      desktopBody.scrollTop = desktopBody.scrollHeight;
    }

    if (
      mobileBody &&
      mobileShouldAutoScrollRef.current
    ) {
      mobileBody.scrollTop = mobileBody.scrollHeight;
    }

  }, [conversation.messages, isThinking]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // conversation history
  useEffect(() => {

    // Unsaved conversations do not belong in history.
    if (
      !conversation._id ||
      conversation.messages.length === 0
    ) {
      return;
    }

    setConversationHistory((currentHistory) => {

      const exists = currentHistory.some(
        (item) => item.id === conversation.id
      );

      if (exists) {

        return currentHistory.map((item) =>
          item.id === conversation.id
            ? conversation
            : item
        );

      }

      return [
        conversation,
        ...currentHistory,
      ];

    });

  }, [conversation]);

  // db persistence 
  useEffect(() => {

    const loadConversations = async () => {

      try {

        const conversations = await getConversations();

        setConversationHistory(conversations);

      } catch (error) {

        console.error(
          "Failed to load conversations:",
          error
        );

      }

    };

    loadConversations();

  }, []);

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
              type="button"
              className="panelItem"
              onClick={handleNewChat}
            >

              <div className="panelLeft">

                <SquarePen
                  size={16}
                  strokeWidth={1}
                />

                <span>New Chat</span>

              </div>

            </button>

          </div>

          <div className="historyTitle">
            Tools
          </div>

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

            {/* personality open side panel */}
            {openSection === "personality" && (

              <div className="panelContent personalityContent">

                <div className="personalityField">

                  <span className="personalityLabel">
                    Tone
                  </span>

                  <select
                    value={personalityDraft.tone}
                    onChange={(e) =>
                      setPersonalityDraft((current) => ({
                        ...current,
                        tone: e.target.value,
                      }))
                    }
                  >
                    <option>Balanced</option>
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Direct</option>
                  </select>

                </div>


                <div className="personalityField">

                  <span className="personalityLabel">
                    Response style
                  </span>

                  <select
                    value={personalityDraft.responseStyle}
                    onChange={(e) =>
                      setPersonalityDraft((current) => ({
                        ...current,
                        responseStyle: e.target.value,
                      }))
                    }
                  >
                    <option>Concise</option>
                    <option>Balanced</option>
                    <option>Detailed</option>
                  </select>

                </div>


                <div className="personalityField">

                  <span className="personalityLabel">
                    Formality
                  </span>

                  <select
                    value={personalityDraft.formality}
                    onChange={(e) =>
                      setPersonalityDraft((current) => ({
                        ...current,
                        formality: e.target.value,
                      }))
                    }
                  >
                    <option>Neutral</option>
                    <option>Casual</option>
                    <option>Formal</option>
                  </select>

                </div>


                <div className="personalityField">

                  <span className="personalityLabel">
                    Creativity
                  </span>

                  <select
                    value={personalityDraft.creativity}
                    onChange={(e) =>
                      setPersonalityDraft((current) => ({
                        ...current,
                        creativity: e.target.value,
                      }))
                    }
                  >
                    <option>Balanced</option>
                    <option>Focused</option>
                    <option>Creative</option>
                  </select>

                </div>


                <div className="personalityField">

                  <span className="personalityLabel">
                    Custom instructions
                  </span>

                  <textarea
                    value={personalityDraft.customInstructions}
                    onChange={(e) =>
                      setPersonalityDraft((current) => ({
                        ...current,
                        customInstructions: e.target.value,
                      }))
                    }
                    placeholder="Add instructions..."
                  />

                </div>


                <div className="personalityActions">

                  <button
                    type="button"
                    className="personalityReset"
                    onClick={resetPersonality}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    className="personalitySave"
                    onClick={savePersonality}
                  >
                    Save
                  </button>

                </div>

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

              <div className="panelContent memoryContent">

                <div className="memoryToggleRow">

                  <span className="personalityLabel">
                    Memory
                  </span>

                  <button
                    type="button"
                    className={`memoryToggle ${memory.enabled ? "active" : ""}`}
                    onClick={() => {

                      setMemory((current) => {

                        const updatedMemory = {
                          ...current,
                          enabled: !current.enabled,
                        };

                        setConversation((conversation) => ({
                          ...conversation,
                          memory: {
                            ...updatedMemory,
                            memories: [...updatedMemory.memories],
                          },
                          updatedAt: Date.now(),
                        }));

                        return updatedMemory;

                      });

                    }}
                  >
                    <span />
                  </button>

                </div>

                <div className="memoryDescription">
                  Allow the assistant to remember information between conversations.
                </div>

                {/* memory input */}
                <div className="memoryAdd">

                  <input
                    type="text"
                    value={memoryInput}
                    onChange={(e) => setMemoryInput(e.target.value)}
                    placeholder="Add a memory..."
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;

                      const value = memoryInput.trim();

                      if (!value) return;

                      setMemory((current) => {

                        const updatedMemory = {
                          ...current,
                          memories: [
                            ...current.memories,
                            value,
                          ],
                        };

                        setConversation((conversation) => ({
                          ...conversation,
                          memory: {
                            ...updatedMemory,
                            memories: [...updatedMemory.memories],
                          },
                          updatedAt: Date.now(),
                        }));

                        return updatedMemory;

                      });

                      setMemoryInput("");
                    }}
                  />

                  <button
                    type="button"
                    className="memoryAddButton"
                    onClick={() => {

                      const value = memoryInput.trim();

                      if (!value) return;

                      setMemory((current) => {

                        const updatedMemory = {
                          ...current,
                          memories: [
                            ...current.memories,
                            value,
                          ],
                        };

                        setConversation((conversation) => ({
                          ...conversation,
                          memory: {
                            ...updatedMemory,
                            memories: [...updatedMemory.memories],
                          },
                          updatedAt: Date.now(),
                        }));

                        return updatedMemory;

                      });

                      setMemoryInput("");

                    }}
                  >
                    Add
                  </button>

                </div>

                {memory.enabled && (

                  <div className="memoryList">

                    {memory.memories.length === 0 ? (

                      <div className="memoryEmpty">
                        No memories stored
                      </div>

                    ) : (

                      memory.memories.map((item, index) => (

                        <div
                          key={index}
                          className="memoryItem"
                        >

                          {editingMemoryIndex === index ? (

                            <input
                              className="memoryEditInput"
                              value={editingMemoryValue}
                              onChange={(e) =>
                                setEditingMemoryValue(e.target.value)
                              }
                              onKeyDown={(e) => {

                                if (e.key !== "Enter") return;

                                const value = editingMemoryValue.trim();

                                if (!value) return;

                                setMemory((current) => {

                                  const updatedMemory = {
                                    ...current,
                                    memories: current.memories.map(
                                      (memoryItem, memoryIndex) =>
                                        memoryIndex === index
                                          ? value
                                          : memoryItem
                                    ),
                                  };

                                  setConversation((conversation) => ({
                                    ...conversation,
                                    memory: {
                                      ...updatedMemory,
                                      memories: [...updatedMemory.memories],
                                    },
                                    updatedAt: Date.now(),
                                  }));

                                  return updatedMemory;

                                });

                                setEditingMemoryIndex(null);
                                setEditingMemoryValue("");

                              }}
                            />

                          ) : (

                            <button
                              type="button"
                              className="memoryText"
                              onClick={() => {
                                setEditingMemoryIndex(index);
                                setEditingMemoryValue(item);
                              }}
                            >
                              {item}
                            </button>

                          )}

                          <button
                            type="button"
                            className="memoryRemove"
                            onClick={() => {

                              setMemory((current) => {

                                const updatedMemory = {
                                  ...current,
                                  memories: current.memories.filter(
                                    (_, memoryIndex) =>
                                      memoryIndex !== index
                                  ),
                                };

                                setConversation((conversation) => ({
                                  ...conversation,
                                  memory: {
                                    ...updatedMemory,
                                    memories: [...updatedMemory.memories],
                                  },
                                  updatedAt: Date.now(),
                                }));

                                return updatedMemory;

                              });

                            }}
                          >
                            <X
                              size={13}
                              strokeWidth={1.5}
                            />
                          </button>

                        </div>

                      ))

                    )}

                  </div>

                )}

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

              <div className="panelContent knowledgeContent">

                <div className="memoryToggleRow">

                  <span className="personalityLabel">
                    Knowledge
                  </span>

                  <button
                    type="button"
                    className={`memoryToggle ${knowledge.enabled ? "active" : ""
                      }`}
                    onClick={() => {

                      setKnowledge((current) => ({
                        ...current,
                        enabled: !current.enabled,
                      }));

                    }}
                  >
                    <span />
                  </button>

                </div>

                <div className="memoryDescription">
                  Use stored documents as additional knowledge for responses.
                </div>

                <div className="knowledgeAdd">

                  <input
                    type="text"
                    value={knowledgeInput}
                    onChange={(e) =>
                      setKnowledgeInput(e.target.value)
                    }
                    placeholder="Document name..."
                  />

                  <button
                    type="button"
                    className="memoryAddButton"
                    onClick={() => {

                      const name = knowledgeInput.trim();

                      if (!name) return;

                      setKnowledge((current) => ({
                        ...current,
                        documents: [
                          ...current.documents,
                          {
                            id: Date.now(),
                            name,
                            content: `Sample content from ${name}.`,
                          },
                        ],
                      }));

                      setKnowledgeInput("");

                    }}
                  >
                    Add
                  </button>

                </div>

                <div className="knowledgeList">

                  {knowledge.documents.length === 0 ? (

                    <div className="memoryEmpty">
                      No knowledge stored
                    </div>

                  ) : (

                    knowledge.documents.map((document) => (

                      <div className="knowledgeItem">

                        {/* NAME */}
                        <div className="knowledgeNameArea">

                          {editingKnowledgeId === document.id ? (

                            <input
                              className="knowledgeEditInput"
                              value={editingKnowledgeName}
                              onChange={(e) =>
                                setEditingKnowledgeName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveKnowledgeName(document.id);
                                }

                                if (e.key === "Escape") {
                                  setEditingKnowledgeId(null);
                                  setEditingKnowledgeName("");
                                }
                              }}
                              autoFocus
                            />

                          ) : (

                            <button
                              type="button"
                              className="knowledgeName"
                              onClick={() => {
                                setEditingKnowledgeId(document.id);
                                setEditingKnowledgeName(document.name);
                              }}
                            >
                              {document.name}
                            </button>

                          )}

                        </div>


                        {/* CONTENT */}
                        <div className="knowledgeContentArea">

                          {editingKnowledgeContentId === document.id ? (

                            <div className="knowledgeEditor">

                              <textarea
                                className="knowledgeContentInput"
                                value={editingKnowledgeContent}
                                onChange={(e) =>
                                  setEditingKnowledgeContent(e.target.value)
                                }
                                autoFocus
                              />

                              <div className="knowledgeEditorActions">

                                <button
                                  type="button"
                                  className="knowledgeCancelButton"
                                  onClick={() => {
                                    setEditingKnowledgeContentId(null);
                                    setEditingKnowledgeContent("");
                                  }}
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  className="knowledgeSaveButton"
                                  onClick={() => {
                                    saveKnowledgeContent(document.id);
                                  }}
                                >
                                  Save
                                </button>

                              </div>

                            </div>

                          ) : (

                            <button
                              type="button"
                              className="knowledgeContentPreview"
                              onClick={() => {
                                setEditingKnowledgeContentId(document.id);
                                setEditingKnowledgeContent(
                                  document.content || ""
                                );
                              }}
                            >
                              {document.content ||
                                "No content yet. Click to add content."}
                            </button>

                          )}

                        </div>


                        {/* DELETE */}
                        <button
                          type="button"
                          className="memoryRemove"
                          onClick={() => {

                            setKnowledge((current) => ({
                              ...current,
                              documents: current.documents.filter(
                                (item) => item.id !== document.id
                              ),
                            }));

                          }}
                        >
                          <X
                            size={13}
                            strokeWidth={1.5}
                          />
                        </button>

                      </div>

                    ))

                  )}

                </div>

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

              <div className="panelContent workflowContent">

                <div className="workflowDescription">
                  Shows how a request moves through the assistant.
                </div>

                <div className="workflowSteps">

                  <div className="workflowStep">

                    <span className="workflowStepNumber">
                      01
                    </span>

                    <div className="workflowStepContent">

                      <span className="workflowStepTitle">
                        Prompt
                      </span>

                      <span className="workflowStepDescription">
                        Current message
                      </span>

                    </div>

                  </div>


                  <div className="workflowConnector" />


                  <div
                    className={`workflowStep ${context.includeConversation ||
                      context.includePersonality ||
                      context.includeMemory ||
                      context.includeKnowledge
                      ? "active"
                      : ""
                      }`}
                  >

                    <span className="workflowStepNumber">
                      02
                    </span>

                    <div className="workflowStepContent">

                      <span className="workflowStepTitle">
                        Context
                      </span>

                      <span className="workflowStepDescription">

                        {[
                          context.includeConversation && "Conversation",
                          context.includePersonality && "Personality",
                          context.includeMemory && "Memory",
                          context.includeKnowledge && "Knowledge",
                        ]
                          .filter(Boolean)
                          .join(", ") || "No additional context"}

                      </span>

                    </div>

                  </div>


                  <div className="workflowConnector" />


                  <div
                    className={`workflowStep ${context.includeKnowledge && knowledge.enabled
                      ? "active"
                      : ""
                      }`}
                  >

                    <span className="workflowStepNumber">
                      03
                    </span>

                    <div className="workflowStepContent">

                      <span className="workflowStepTitle">
                        Retrieval
                      </span>

                      <span className="workflowStepDescription">

                        {context.includeKnowledge && knowledge.enabled
                          ? `${knowledge.documents.length} document${knowledge.documents.length === 1
                            ? ""
                            : "s"
                          } available`
                          : "Knowledge disabled"}

                      </span>

                    </div>

                  </div>


                  <div className="workflowConnector" />


                  <div className="workflowStep">

                    <span className="workflowStepNumber">
                      04
                    </span>

                    <div className="workflowStepContent">

                      <span className="workflowStepTitle">
                        AI Request
                      </span>

                      <span className="workflowStepDescription">
                        Assemble selected context
                      </span>

                    </div>

                  </div>


                  <div className="workflowConnector" />


                  <div
                    className={`workflowStep ${isThinking || isStreaming
                      ? "active"
                      : ""
                      }`}
                  >

                    <span className="workflowStepNumber">
                      05
                    </span>

                    <div className="workflowStepContent">

                      <span className="workflowStepTitle">
                        Model
                      </span>

                      <span className="workflowStepDescription">

                        {isThinking
                          ? "Thinking..."
                          : isStreaming
                            ? "Streaming..."
                            : "Ready"}

                      </span>

                    </div>

                  </div>


                  <div className="workflowConnector" />


                  <div className="workflowStep">

                    <span className="workflowStepNumber">
                      06
                    </span>

                    <div className="workflowStepContent">

                      <span className="workflowStepTitle">
                        Response
                      </span>

                      <span className="workflowStepDescription">

                        {isStreaming
                          ? "Receiving response"
                          : "Ready"}

                      </span>

                    </div>

                  </div>

                </div>

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

              <div className="panelContent contextContent">

                <div className="contextField">

                  <div className="contextToggleRow">

                    <span className="personalityLabel">
                      Conversation
                    </span>

                    <button
                      type="button"
                      className={`memoryToggle ${context.includeConversation ? "active" : ""
                        }`}
                      onClick={() => {

                        setContext((current) => {

                          const updatedContext = {
                            ...current,
                            includeConversation: !current.includeConversation,
                          };

                          setConversation((conversation) => ({
                            ...conversation,
                            context: {
                              ...updatedContext,
                            },
                            updatedAt: Date.now(),
                          }));

                          return updatedContext;

                        });

                      }}
                    >
                      <span />
                    </button>

                  </div>

                  <div className="memoryDescription">
                    Include previous messages when generating a response.
                  </div>

                </div>


                <div className="contextField">

                  <div className="contextToggleRow">

                    <span className="personalityLabel">
                      Personality
                    </span>

                    <button
                      type="button"
                      className={`memoryToggle ${context.includePersonality ? "active" : ""
                        }`}
                      onClick={() => {

                        setContext((current) => {

                          const updatedContext = {
                            ...current,
                            includePersonality: !current.includePersonality,
                          };

                          setConversation((conversation) => ({
                            ...conversation,
                            context: {
                              ...updatedContext,
                            },
                            updatedAt: Date.now(),
                          }));

                          return updatedContext;

                        });

                      }}
                    >
                      <span />
                    </button>

                  </div>

                  <div className="memoryDescription">
                    Include personality instructions in the request.
                  </div>

                </div>


                <div className="contextField">

                  <div className="contextToggleRow">

                    <span className="personalityLabel">
                      Memory
                    </span>

                    <button
                      type="button"
                      className={`memoryToggle ${context.includeMemory ? "active" : ""
                        }`}
                      onClick={() => {

                        setContext((current) => {

                          const updatedContext = {
                            ...current,
                            includeMemory: !current.includeMemory,
                          };

                          setConversation((conversation) => ({
                            ...conversation,
                            context: {
                              ...updatedContext,
                            },
                            updatedAt: Date.now(),
                          }));

                          return updatedContext;

                        });

                      }}
                    >
                      <span />
                    </button>

                  </div>

                  <div className="memoryDescription">
                    Include relevant saved memories.
                  </div>

                </div>


                <div className="contextField">

                  <span className="personalityLabel">
                    Conversation messages
                  </span>

                  <select
                    value={context.maxMessages}
                    onChange={(e) => {

                      setContext((current) => {

                        const updatedContext = {
                          ...current,
                          maxMessages: Number(e.target.value),
                        };

                        setConversation((conversation) => ({
                          ...conversation,
                          context: {
                            ...updatedContext,
                          },
                          updatedAt: Date.now(),
                        }));

                        return updatedContext;

                      });

                    }}
                  >
                    <option value={5}>Last 5</option>
                    <option value={10}>Last 10</option>
                    <option value={20}>Last 20</option>
                    <option value={50}>Last 50</option>
                  </select>

                </div>

                <div className="contextField">

                  <div className="contextToggleRow">

                    <span className="personalityLabel">
                      Knowledge
                    </span>

                    <button
                      type="button"
                      className={`memoryToggle ${context.includeKnowledge ? "active" : ""
                        }`}
                      onClick={() => {

                        setContext((current) => {

                          const updatedContext = {
                            ...current,
                            includeKnowledge:
                              !current.includeKnowledge,
                          };

                          setConversation((conversation) => ({
                            ...conversation,
                            context: {
                              ...updatedContext,
                            },
                            updatedAt: Date.now(),
                          }));

                          return updatedContext;

                        });

                      }}
                    >
                      <span />
                    </button>

                  </div>

                  <div className="memoryDescription">
                    Include relevant knowledge in the request.
                  </div>

                </div>

                <div className="contextSummary">

                  <span className="personalityLabel">
                    Active context
                  </span>

                  <div className="contextSummaryList">

                    {context.includePersonality && (
                      <span>Personality</span>
                    )}

                    {context.includeMemory && (
                      <span>Memory</span>
                    )}

                    {context.includeConversation && (
                      <span>Conversation</span>
                    )}

                    {context.includeKnowledge && (
                      <span>Knowledge</span>
                    )}

                    <span>Current prompt</span>

                  </div>

                  <div className="contextStats">

                    <div className="contextStat">

                      <span className="contextStatValue">
                        {getContextStats().messages}
                      </span>

                      <span className="contextStatLabel">
                        messages
                      </span>

                    </div>

                    <div className="contextStat">

                      <span className="contextStatValue">
                        {getContextStats().memories}
                      </span>

                      <span className="contextStatLabel">
                        memories
                      </span>

                    </div>

                    <div className="contextStat">

                      <span className="contextStatValue">
                        {getContextStats().personality ? "On" : "Off"}
                      </span>

                      <span className="contextStatLabel">
                        personality
                      </span>

                    </div>

                  </div>

                </div>

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

              <div className="panelContent modelContent">

                <div className="modelField">

                  <span className="personalityLabel">
                    Model
                  </span>

                  <select
                    value={modelSettings.model}
                    onChange={(e) => {

                      setModelSettings((current) => ({
                        ...current,
                        model: e.target.value,
                      }));

                    }}
                  >
                    <option value="gpt-5.6">GPT-5.6</option>
                    <option value="gpt-5-mini">GPT-5 mini</option>
                    <option value="gpt-4.1">GPT-4.1</option>
                  </select>

                </div>


                <div className="modelField">

                  <div className="modelFieldHeader">

                    <span className="personalityLabel">
                      Temperature
                    </span>

                    <span className="modelValue">
                      {modelSettings.temperature}
                    </span>

                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelSettings.temperature}
                    onChange={(e) => {

                      setModelSettings((current) => ({
                        ...current,
                        temperature: Number(e.target.value),
                      }));

                    }}
                  />

                  <div className="modelRangeLabels">

                    <span>Focused</span>
                    <span>Creative</span>

                  </div>

                </div>


                <div className="modelField">

                  <div className="modelFieldHeader">

                    <span className="personalityLabel">
                      Maximum response
                    </span>

                    <span className="modelValue">
                      {modelSettings.maxTokens}
                    </span>

                  </div>

                  <select
                    value={modelSettings.maxTokens}
                    onChange={(e) => {

                      setModelSettings((current) => ({
                        ...current,
                        maxTokens: Number(e.target.value),
                      }));

                    }}
                  >
                    <option value={256}>256 tokens</option>
                    <option value={512}>512 tokens</option>
                    <option value={1024}>1,024 tokens</option>
                    <option value={2048}>2,048 tokens</option>
                    <option value={4096}>4,096 tokens</option>
                  </select>

                </div>


                <div className="modelInfo">

                  <span className="modelInfoLabel">
                    Status
                  </span>

                  <span className="modelInfoValue">
                    Frontend simulation
                  </span>

                </div>

              </div>

            )}

          </div>

          {/* conversations panel group */}
          <div className="conversationHistory">

            <div className="historyTitle">
              Conversations
            </div>

            {conversationHistory.length === 0 ? (

              <div className="historyEmpty">
                No conversations yet
              </div>

            ) : (

              conversationHistory.map((item) => (

                <div
                  key={item.id}
                  className={`historyItem ${item.id === conversation.id ? "active" : ""}`}
                >

                  {editingConversationId === item.id ? (

                    <input
                      className="historyEditInput"
                      value={editingConversationTitle}
                      onChange={(e) =>
                        setEditingConversationTitle(e.target.value)
                      }
                      onKeyDown={(e) => {

                        if (e.key === "Enter") {
                          saveConversationTitle(item.id);
                        }

                        if (e.key === "Escape") {
                          setEditingConversationId(null);
                          setEditingConversationTitle("");
                        }

                      }}
                      autoFocus
                    />

                  ) : (

                    <div className="historyItemContent">

                      <button
                        type="button"
                        className="historyTitleButton"
                        onClick={() => {
                          switchConversation(item);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();

                          setEditingConversationId(item.id);
                          setEditingConversationTitle(item.title);
                        }}
                      >
                        {item.title}
                      </button>

                      <button
                        type="button"
                        className="memoryRemove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationToDelete(item);
                        }}
                      >
                        <X
                          size={13}
                          strokeWidth={1.5}
                        />
                      </button>

                    </div>

                  )}

                </div>

              ))

            )}

          </div>

        </div>
      </div>

      <div
        className={`workspace ${showResponse && !isResponseMinimized
          ? "responseOpen"
          : ""
          } ${showResponse && isResponseMinimized
            ? "responseMinimized"
            : ""
          }`}
      >

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
              onFocus={() => setShowPanel(false)}
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

            {/* send prompt button / stop respond button */}
            {isThinking || isStreaming ? (
              <button
                type="button"
                className="sendButton"
                onClick={stopStreaming}
              >
                <Square
                  size={16}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </button>

            ) : (

              <button
                type="submit"
                className="sendButton"
              >
                <ArrowRight
                  size={18}
                  strokeWidth={1.5}
                />
              </button>

            )}

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

                  createNewConversation();

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
                onClick={() => {
                  setIsResponseMinimized(true);
                }}
              >
                <Minus
                  size={16}
                  strokeWidth={1}
                />
              </button>

              <button
                className="responseIconButton"
                onClick={endConversation}
              >
                <X
                  size={16}
                  strokeWidth={1}
                />
              </button>

            </div>

            {/* conversation */}
            <div
              ref={desktopResponseBodyRef}
              className="responseBody"
              onScroll={handleDesktopResponseScroll}
            >

              {conversation.messages.map((message) => (

                <div
                  key={message.id}
                  className={`message ${message.role}`}
                >

                  {message.role === "assistant" && isThinking && message.content === "" ? (

                    <div className="thinkingLoader">

                      <span />
                      <span />
                      <span />

                    </div>

                  ) : (

                    message.content

                  )}

                </div>

              ))}

            </div>

          </section>
        )}

        {/* minimise desktop */}
        {!isMobile && isResponseMinimized && (
          <button
            type="button"
            className="responseReopenButton"
            onClick={() => {
              setIsResponseMinimized(false);
              inputRef.current?.focus();
            }}
          >
            <ArrowLeft
              size={17}
              strokeWidth={1}
            />
          </button>
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

                  createNewConversation();

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
                onClick={() => {
                  setIsResponseMinimized(true);
                }}
              >
                <Minus
                  size={16}
                  strokeWidth={1}
                />
              </button>

              <button
                className="responseIconButton"
                onClick={endConversation}
              >
                <X
                  size={16}
                  strokeWidth={1}
                />
              </button>

            </div>

            {/* response */}
            <div
              ref={mobileResponseBodyRef}
              className="responseBody"
              onScroll={handleMobileResponseScroll}
            >

              {conversation.messages.map((message) => (

                <div
                  key={message.id}
                  className={`message ${message.role}`}
                >

                  {message.role === "assistant" && isThinking && message.content === "" ? (

                    <div className="thinkingLoader">

                      <span />
                      <span />
                      <span />

                    </div>

                  ) : (

                    message.content

                  )}

                </div>

              ))}

            </div>

          </section>

        )}

      </div>

      {/* delete conversation modal */}
      {conversationToDelete && (

        <div
          className="deleteModalOverlay"
          onClick={() => setConversationToDelete(null)}
        >

          <div
            className="deleteModal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="deleteModalTitle">
              Delete conversation?
            </div>

            <div className="deleteModalDescription">
              This conversation will be permanently deleted.
            </div>

            <div className="deleteModalActions">

              <button
                type="button"
                className="deleteModalCancel"
                onClick={() => setConversationToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="deleteModalConfirm"
                onClick={handleDeleteConversation}
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

      {/* toast */}
      {toast && (

        <div className="appToast">

          {toast}

        </div>

      )}

    </main >
  );
}

export default App;