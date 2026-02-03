<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { db, type ChatMessage } from '$lib/db';

  export let lessonId: string;
  export let vocabulary: Array<{ de: string; fa: string }> = [];
  export let lessonTitle: string = '';

  interface Message {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isLoading?: boolean;
  }

  let messages: Message[] = [];
  let inputValue = '';
  let isLoading = false;
  let error: string | null = null;
  let messagesContainer: HTMLDivElement;

  // Quick question suggestions
  const suggestions = [
    'der, die یا das؟',
    'این فعل چطور صرف می‌شه؟',
    'ترتیب کلمات درسته؟',
    'تفاوتشون چیه؟',
  ];

  onMount(async () => {
    await loadHistory();
  });

  async function loadHistory() {
    try {
      const history = await db.chatMessages
        .where('lessonId')
        .equals(lessonId)
        .sortBy('timestamp');

      messages = history.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));

      await scrollToBottom();
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }

  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async function sendMessage(text?: string) {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    inputValue = '';
    error = null;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    messages = [...messages, userMessage];

    // Save user message to DB
    try {
      const id = await db.chatMessages.add({
        lessonId,
        role: 'user',
        content: messageText,
        timestamp: userMessage.timestamp,
      });
      userMessage.id = id;
    } catch (e) {
      console.error('Failed to save user message:', e);
    }

    // Add loading placeholder
    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: '',
      isLoading: true,
    };
    messages = [...messages, loadingMessage];
    await scrollToBottom();

    isLoading = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          lessonContext: lessonTitle,
          vocabulary: vocabulary.slice(0, 10),
        }),
      });

      // Remove loading message
      messages = messages.filter(m => !m.isLoading);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      messages = [...messages, assistantMessage];

      // Save assistant message to DB
      try {
        const id = await db.chatMessages.add({
          lessonId,
          role: 'assistant',
          content: data.message,
          timestamp: assistantMessage.timestamp,
        });
        assistantMessage.id = id;
      } catch (e) {
        console.error('Failed to save assistant message:', e);
      }

      await scrollToBottom();

    } catch (e) {
      // Remove loading message
      messages = messages.filter(m => !m.isLoading);

      error = e instanceof Error ? e.message : 'خطا در ارتباط با سرور';
      console.error('Chat error:', e);
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function clearHistory() {
    try {
      await db.chatMessages
        .where('lessonId')
        .equals(lessonId)
        .delete();
      messages = [];
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }
</script>

<div class="chat-container" dir="rtl">
  <!-- Messages Area -->
  <div class="messages-area" bind:this={messagesContainer}>
    {#if messages.length === 0}
      <div class="empty-state">
        <span class="empty-icon">🤖</span>
        <p class="empty-title">سوالت رو بپرس!</p>
        <p class="empty-hint">درباره گرامر، لغات یا جملات این درس سوال کن.</p>

        <!-- Quick suggestions -->
        <div class="suggestions">
          {#each suggestions as suggestion (suggestion)}
            <button class="suggestion-btn" on:click={() => sendMessage(suggestion)}>
              {suggestion}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      {#each messages as message (message.timestamp)}
        <div class="message {message.role}" class:loading={message.isLoading}>
          <div class="message-bubble">
            {#if message.isLoading}
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
            {:else}
              {message.content}
            {/if}
          </div>
        </div>
      {/each}
    {/if}

    {#if error}
      <div class="error-message">
        <span>⚠️</span> {error}
      </div>
    {/if}
  </div>

  <!-- Input Area -->
  <div class="input-area">
    {#if messages.length > 0}
      <button class="clear-btn" on:click={clearHistory} title="پاک کردن تاریخچه">
        🗑️
      </button>
    {/if}

    <div class="input-wrapper">
      <input
        type="text"
        bind:value={inputValue}
        on:keydown={handleKeydown}
        placeholder="سوالت رو بنویس..."
        disabled={isLoading}
      />
      <button
        class="send-btn"
        on:click={() => sendMessage()}
        disabled={!inputValue.trim() || isLoading}
      >
        {#if isLoading}
          ⏳
        {:else}
          ➤
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .chat-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-neutral-50, #fdfbf7);
  }

  /* Messages Area */
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Empty State */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1.5rem;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-neutral-700, #44403c);
    margin: 0 0 0.5rem 0;
  }

  .empty-hint {
    font-size: 0.875rem;
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 1.5rem 0;
  }

  /* Suggestions */
  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .suggestion-btn {
    padding: 0.5rem 1rem;
    background: var(--color-primary-50, #ecfeff);
    border: 1px solid var(--color-primary-200, #a5f3fc);
    border-radius: 1rem;
    font-size: 0.8rem;
    color: var(--color-primary-700, #155e75);
    cursor: pointer;
    transition: all 0.2s;
  }

  .suggestion-btn:hover {
    background: var(--color-primary-100, #cffafe);
    transform: translateY(-1px);
  }

  /* Messages */
  .message {
    display: flex;
    max-width: 85%;
  }

  .message.user {
    align-self: flex-start;
  }

  .message.assistant {
    align-self: flex-end;
  }

  .message-bubble {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .message.user .message-bubble {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border-bottom-right-radius: 0.25rem;
  }

  .message.assistant .message-bubble {
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-800, #292524);
    border-bottom-left-radius: 0.25rem;
  }

  /* Loading dots */
  .loading-dots {
    display: flex;
    gap: 4px;
    padding: 0.25rem 0;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    background: var(--color-neutral-400, #a69b8a);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
  .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
  .loading-dots span:nth-child(3) { animation-delay: 0; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  /* Error */
  .error-message {
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #dc2626;
    font-size: 0.85rem;
    text-align: center;
  }

  /* Input Area */
  .input-area {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--color-neutral-200, #e8e0d5);
    display: flex;
    gap: 0.5rem;
    background: var(--color-neutral-50, #fdfbf7);
  }

  .clear-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid var(--color-neutral-300, #d4c9b9);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .clear-btn:hover {
    background: var(--color-neutral-100, #f5f0e8);
    border-color: var(--color-neutral-400, #a69b8a);
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    gap: 0.5rem;
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: 1.5rem;
    padding: 0.25rem 0.25rem 0.25rem 1rem;
  }

  .input-wrapper input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.9rem;
    color: var(--color-neutral-800, #292524);
    outline: none;
    min-width: 0;
  }

  .input-wrapper input::placeholder {
    color: var(--color-neutral-400, #a69b8a);
  }

  .send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .chat-container {
    background: #292524;
  }

  :global([data-theme="dark"]) .empty-title {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .empty-hint {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .suggestion-btn {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.3);
    color: #c4b5fd;
  }

  :global([data-theme="dark"]) .suggestion-btn:hover {
    background: rgba(139, 92, 246, 0.25);
  }

  :global([data-theme="dark"]) .message.assistant .message-bubble {
    background: #44403c;
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .input-area {
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .input-wrapper {
    background: #44403c;
  }

  :global([data-theme="dark"]) .input-wrapper input {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .input-wrapper input::placeholder {
    color: #78716c;
  }

  :global([data-theme="dark"]) .clear-btn {
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .clear-btn:hover {
    background: #44403c;
  }
</style>
