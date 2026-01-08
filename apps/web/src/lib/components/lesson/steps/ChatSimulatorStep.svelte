<script lang="ts">
  import type { ChatSimulatorStep, ChatNode, ChatMessage, ChatResponseOption } from "$lib/content-model";
  import { createEventDispatcher, onMount, tick } from "svelte";

  export let step: ChatSimulatorStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{
    answer: {
      correct: boolean;
      userAnswer: string;
      correctAnswer: string;
      allowContinue: boolean;
    };
  }>();

  interface DisplayMessage {
    id: string;
    sender: 'friend' | 'user';
    text: string;
    translation?: string;
    timestamp?: string;
    showTranslation: boolean;
    isTyping?: boolean;
  }

  let messages: DisplayMessage[] = [];
  let currentNodeId: string = step.startNodeId;
  let responseOptions: ChatResponseOption[] = [];
  let isWaitingForResponse = false;
  let conversationComplete = false;
  let correctAnswers = 0;
  let totalQuestions = 0;
  let chatContainer: HTMLElement;

  // Build node map for quick lookup
  const nodeMap = new Map<string, ChatNode>();
  step.nodes.forEach(node => nodeMap.set(node.messageId, node));

  onMount(() => {
    startConversation();
  });

  async function startConversation() {
    await addFriendMessage(currentNodeId);
  }

  async function addFriendMessage(nodeId: string) {
    const node = nodeMap.get(nodeId);
    if (!node) {
      completeConversation();
      return;
    }

    currentNodeId = nodeId;

    // Show typing indicator
    const typingId = `typing-${Date.now()}`;
    messages = [...messages, {
      id: typingId,
      sender: 'friend',
      text: '',
      isTyping: true,
      showTranslation: false
    }];

    await scrollToBottom();
    await delay(800 + Math.random() * 400); // Typing delay

    // Replace typing with actual message
    messages = messages.filter(m => m.id !== typingId);
    messages = [...messages, {
      id: node.message.id,
      sender: 'friend',
      text: node.message.text,
      translation: node.message.translation,
      timestamp: node.message.timestamp || getCurrentTime(),
      showTranslation: step.showTranslations
    }];

    await scrollToBottom();

    // Show response options
    responseOptions = node.responseOptions;
    isWaitingForResponse = true;
    totalQuestions++;
  }

  async function selectResponse(option: ChatResponseOption) {
    if (!isWaitingForResponse) return;

    isWaitingForResponse = false;
    responseOptions = [];

    // Add user's message
    messages = [...messages, {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: option.text,
      translation: option.translation,
      timestamp: getCurrentTime(),
      showTranslation: step.showTranslations
    }];

    await scrollToBottom();

    // Check if correct
    const currentNode = nodeMap.get(currentNodeId);
    if (currentNode?.correctResponseId) {
      if (option.id === currentNode.correctResponseId) {
        correctAnswers++;
      }
    } else {
      // No correct answer specified, all are valid
      correctAnswers++;
    }

    // Continue to next message or end
    if (option.nextMessageId) {
      await delay(500);
      await addFriendMessage(option.nextMessageId);
    } else {
      await delay(300);
      completeConversation();
    }
  }

  function toggleTranslation(messageId: string) {
    messages = messages.map(m =>
      m.id === messageId ? { ...m, showTranslation: !m.showTranslation } : m
    );
  }

  function completeConversation() {
    conversationComplete = true;

    dispatch('answer', {
      correct: correctAnswers === totalQuestions,
      userAnswer: `${correctAnswers}/${totalQuestions} correct responses`,
      correctAnswer: 'Conversation completed',
      allowContinue: true
    });
  }

  function getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function scrollToBottom() {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
</script>

<div class="chat-container">
  <!-- Header -->
  <div class="chat-header">
    <div class="friend-info">
      <span class="avatar">{step.friendAvatar || '👤'}</span>
      <div class="friend-details">
        <span class="friend-name">{step.friendName}</span>
        <span class="status">آنلاین</span>
      </div>
    </div>
  </div>

  <!-- Scenario hint -->
  <div class="scenario-hint" dir="rtl">
    💬 {step.scenario}
  </div>

  <!-- Chat messages -->
  <div class="chat-messages" bind:this={chatContainer}>
    {#each messages as message (message.id)}
      <div
        class="message-wrapper"
        class:friend={message.sender === 'friend'}
        class:user={message.sender === 'user'}
      >
        {#if message.isTyping}
          <div class="message typing">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        {:else}
          <button
            class="message"
            class:friend={message.sender === 'friend'}
            class:user={message.sender === 'user'}
            on:click={() => toggleTranslation(message.id)}
          >
            <span class="message-text">{message.text}</span>
            {#if message.showTranslation && message.translation}
              <span class="message-translation" dir="rtl">{message.translation}</span>
            {/if}
            <span class="message-time">{message.timestamp}</span>
          </button>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Response options -->
  {#if isWaitingForResponse && responseOptions.length > 0}
    <div class="response-area">
      <p class="response-prompt" dir="rtl">پاسخ خود را انتخاب کنید:</p>
      <div class="response-options">
        {#each responseOptions as option (option.id)}
          <button
            class="response-option"
            on:click={() => selectResponse(option)}
          >
            <span class="option-text">{option.text}</span>
            {#if option.translation}
              <span class="option-translation" dir="rtl">{option.translation}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Completion message -->
  {#if conversationComplete}
    <div class="completion-area">
      <div class="completion-box">
        <span class="completion-icon">💬</span>
        <p class="completion-text" dir="rtl">
          آفرین! مکالمه را کامل کردید!
        </p>
        <p class="completion-stats" dir="rtl">
          {correctAnswers}/{totalQuestions} پاسخ درست
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 450px;
    max-height: 600px;
    background: #e5ddd5;
    border-radius: 1rem;
    overflow: hidden;
  }

  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #075e54;
    color: white;
  }

  .friend-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #128c7e;
    border-radius: 50%;
    font-size: 1.5rem;
  }

  .friend-details {
    display: flex;
    flex-direction: column;
  }

  .friend-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .status {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  /* Scenario hint */
  .scenario-hint {
    padding: 0.5rem 1rem;
    background: #fcf4cb;
    font-size: 0.85rem;
    color: #5c5c5c;
    text-align: center;
  }

  /* Messages area */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message-wrapper {
    display: flex;
  }

  .message-wrapper.friend {
    justify-content: flex-start;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message {
    max-width: 80%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .message.friend {
    background: white;
    border-top-left-radius: 0;
  }

  .message.user {
    background: #dcf8c6;
    border-top-right-radius: 0;
  }

  .message-text {
    color: #303030;
    line-height: 1.4;
  }

  .message-translation {
    font-size: 0.8rem;
    color: #667781;
    font-style: italic;
    padding-top: 0.25rem;
    border-top: 1px dashed #e0e0e0;
  }

  .message-time {
    font-size: 0.7rem;
    color: #667781;
    align-self: flex-end;
    margin-top: 0.25rem;
  }

  /* Typing indicator */
  .message.typing {
    background: white;
    padding: 0.75rem 1rem;
    border-top-left-radius: 0;
  }

  .typing-dots {
    display: flex;
    gap: 4px;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    background: #90a4ae;
    border-radius: 50%;
    animation: typing-bounce 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
  }

  /* Response area */
  .response-area {
    padding: 1rem;
    background: white;
    border-top: 1px solid #e0e0e0;
  }

  .response-prompt {
    font-size: 0.85rem;
    color: #667781;
    margin: 0 0 0.75rem 0;
    text-align: center;
  }

  .response-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .response-option {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    background: #f0f2f5;
    border: 2px solid #e0e0e0;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .response-option:hover {
    background: #e3f2fd;
    border-color: #2196f3;
  }

  .option-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: #303030;
  }

  .option-translation {
    font-size: 0.8rem;
    color: #667781;
  }

  /* Completion area */
  .completion-area {
    padding: 1rem;
    background: white;
    border-top: 1px solid #e0e0e0;
  }

  .completion-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #e8f5e9;
    border-radius: 1rem;
  }

  .completion-icon {
    font-size: 2rem;
  }

  .completion-text {
    font-size: 1rem;
    font-weight: 600;
    color: #2e7d32;
    margin: 0;
  }

  .completion-stats {
    font-size: 0.9rem;
    color: #558b2f;
    margin: 0;
  }
</style>
