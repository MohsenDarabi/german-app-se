<script lang="ts">
  import type { ChatSimulatorStep, ChatNode, ChatMessage, ChatResponseOption } from "$lib/content-model";
  import { createEventDispatcher, onMount, tick } from "svelte";

  export let step: ChatSimulatorStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

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
        {#each responseOptions as option}
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
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-xl, 1rem);
    overflow: hidden;
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-primary-600, #0e7490), var(--color-primary-700, #155e75));
    color: white;
  }

  .friend-info {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .avatar {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-500, #0891b2);
    border-radius: 50%;
    font-size: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .friend-details {
    display: flex;
    flex-direction: column;
  }

  .friend-name {
    font-weight: var(--font-semibold, 600);
    font-size: var(--text-base, 1rem);
  }

  .status {
    font-size: var(--text-xs, 0.75rem);
    opacity: 0.85;
  }

  /* Scenario hint */
  .scenario-hint {
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1));
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-success-700, #a16207);
    text-align: center;
    border-bottom: 1px solid var(--color-success-300, #fde047);
  }

  /* Messages area */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    background: var(--color-neutral-100, #f5f0e8);
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
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    cursor: pointer;
    border: none;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: var(--space-1, 0.25rem);
    transition: all var(--transition-fast, 150ms);
  }

  .message.friend {
    background: var(--color-neutral-50, #fdfbf7);
    border-top-left-radius: var(--radius-sm, 0.375rem);
    box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  }

  .message.user {
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-50, #ecfeff));
    border-top-right-radius: var(--radius-sm, 0.375rem);
    box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  }

  .message:hover {
    transform: scale(1.02);
  }

  .message-text {
    color: var(--color-neutral-800, #292524);
    line-height: 1.5;
  }

  .message-translation {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    font-style: italic;
    padding-top: var(--space-1, 0.25rem);
    border-top: 1px dashed var(--color-neutral-300, #d4c9b9);
  }

  .message-time {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-neutral-400, #a69b8a);
    align-self: flex-end;
    margin-top: var(--space-1, 0.25rem);
  }

  /* Typing indicator */
  .message.typing {
    background: var(--color-neutral-50, #fdfbf7);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border-top-left-radius: var(--radius-sm, 0.375rem);
  }

  .typing-dots {
    display: flex;
    gap: 4px;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    background: var(--color-primary-400, #22d3ee);
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
    30% { transform: translateY(-6px); }
  }

  /* Response area */
  .response-area {
    padding: var(--space-4, 1rem);
    background: var(--color-neutral-50, #fdfbf7);
    border-top: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  .response-prompt {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 var(--space-3, 0.75rem) 0;
    text-align: center;
  }

  .response-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .response-option {
    display: flex;
    flex-direction: column;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    text-align: left;
    min-height: 48px;
  }

  .response-option:hover {
    background: var(--color-primary-50, #ecfeff);
    border-color: var(--color-primary-400, #22d3ee);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .option-text {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-800, #292524);
  }

  .option-translation {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  /* Completion area */
  .completion-area {
    padding: var(--space-4, 1rem);
    background: var(--color-neutral-50, #fdfbf7);
    border-top: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  .completion-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-4, 1rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border: 2px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-xl, 1rem);
  }

  .completion-icon {
    font-size: 2.5rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-6px); }
  }

  .completion-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-success-700, #a16207);
    margin: 0;
  }

  .completion-stats {
    font-size: var(--text-base, 1rem);
    color: var(--color-success-600, #ca8a04);
    margin: 0;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .chat-container {
    background: var(--color-neutral-800, #292524);
  }

  :global([data-theme="dark"]) .chat-messages {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .message.friend {
    background: var(--color-neutral-700, #44403c);
  }

  :global([data-theme="dark"]) .message-text {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .response-area,
  :global([data-theme="dark"]) .completion-area {
    background: var(--color-neutral-800, #292524);
  }

  :global([data-theme="dark"]) .response-option {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .option-text {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
