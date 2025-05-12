<script lang="ts">
	import { onMount, tick } from 'svelte';

	interface Message {
		id: string; // Unique ID for Svelte's keyed each block
		role: 'user' | 'assistant';
		content: string;
	}

	let messageHistory: Message[] = [];
	let userInput: string = '';
	let messagesContainer: HTMLDivElement; // To bind to the messages div for scrolling
	let isLoading: boolean = false; // To disable input/button while waiting for response

	// Helper to generate unique IDs
	const generateId = (): string => '_' + Math.random().toString(36).substring(2, 9);

	async function scrollToBottom(): Promise<void> {
		await tick(); // Wait for DOM to update
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function handleKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !isLoading) {
			sendMessage();
		}
	}

	async function sendMessage(): Promise<void> {
		const messageText = userInput.trim();

		if (messageText && !isLoading) {
			isLoading = true;
			// Add user message to UI
			const userMessage: Message = { id: generateId(), role: 'user', content: messageText };
			messageHistory = [...messageHistory, userMessage];
			userInput = ''; // Clear input
			await scrollToBottom();

			// Prepare history for the API
			const apiHistory = messageHistory.map(({ role, content }) => ({ role, content }));

			// Add a placeholder for the assistant's message
			const assistantMessageId = generateId();
			let assistantMessageContent = '';
			messageHistory = [
				...messageHistory,
				{ id: assistantMessageId, role: 'assistant', content: '...' } // Placeholder
			];
			await scrollToBottom();

			try {
				const response = await fetch('https://chatbot-api-351069756806.us-central1.run.app/ask', { // Updated URL to match FastAPI server
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'text/plain' // Added to match FastAPI response type
					},
					body: JSON.stringify({
						messages: apiHistory.map(msg => ({
							role: msg.role,
							content: msg.content
						}))
					})
				});

				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}

				if (!response.body) {
					throw new Error('Response body is null');
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				// Update the placeholder message with streamed content
				const updateAssistantMessage = (newContent: string) => {
					messageHistory = messageHistory.map((msg) =>
						msg.id === assistantMessageId ? { ...msg, content: newContent } : msg
					);
				};

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						const chunk = decoder.decode(value, { stream: true });
						assistantMessageContent += chunk;
						updateAssistantMessage(assistantMessageContent);
						await scrollToBottom();
					}
				} finally {
					reader.releaseLock(); // Make sure to release the reader
				}

				// Final decode for any remaining bytes
				assistantMessageContent += decoder.decode();
				updateAssistantMessage(assistantMessageContent);
			} catch (error) {
				console.error('Error:', error);
				const errorMessage = error instanceof Error ? error.message : 'Sorry, there was an error.';
				// Update the placeholder with an error message or add a new error message
				messageHistory = messageHistory.map((msg) =>
					msg.id === assistantMessageId ? { ...msg, content: `Error: ${errorMessage}` } : msg
				);
			} finally {
				isLoading = false;
				await scrollToBottom();
			}
		}
	}

	function resetHistory(): void {
		messageHistory = [];
		userInput = '';
		isLoading = false;
	}

	// Example: Load initial messages if needed, or set up something on component mount
	onMount(() => {
		// You could load previous chat history from localStorage here, for example
		// messageHistory = [{ id: generateId(), role: 'assistant', content: 'Hello! How can I help you today?' }];
	});
</script>

<div class="chat-container">
	<h1>Chat</h1>
	<div class="messages" bind:this={messagesContainer}>
		{#each messageHistory as message (message.id)}
			<div class="message {message.role}-message">
				<!-- Use {@html ...} if your content can contain HTML and you trust it,
             otherwise Svelte escapes it by default, which is safer.
             For plain text, direct rendering is fine. -->
				{message.content}
			</div>
		{/each}
		{#if isLoading && messageHistory.length > 0 && messageHistory[messageHistory.length -1].role === 'assistant' && messageHistory[messageHistory.length -1].content === '...'}
			<!-- This is a simple loading indicator, you can make it more sophisticated -->
		{/if}
	</div>
	<div class="input-container">
		<input
			type="text"
			bind:value={userInput}
			placeholder="Type your message..."
			on:keypress={handleKeyPress}
			disabled={isLoading}
		/>
		<button on:click={sendMessage} disabled={isLoading}>
			{#if isLoading}Sending...{:else}Send{/if}
		</button>
		<button class="reset-btn" on:click={resetHistory} disabled={isLoading}>Reset History</button>
	</div>
</div>

<style>
	/* Styles are scoped to this component by Svelte */
	.chat-container {
		font-family: Arial, sans-serif;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		background-color: #f9f9f9; /* Slightly different from body for contrast if used on a page */
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		margin-bottom: 20px;
	}
	.messages {
		height: 400px;
		overflow-y: auto;
		margin-bottom: 20px;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		background-color: white;
	}
	.message {
		margin-bottom: 10px;
		padding: 10px;
		border-radius: 5px;
		word-wrap: break-word; /* Ensure long words break */
	}
	.user-message {
		background-color: #e3f2fd;
		margin-left: 20%;
		text-align: right;
	}
	.assistant-message {
		background-color: #f0f0f0; /* Slightly different from original for clarity */
		margin-right: 20%;
	}
	.input-container {
		display: flex;
		gap: 10px;
	}
	input[type='text'] {
		flex: 1;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
	}
	button {
		padding: 10px 20px;
		background-color: #2196f3;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	button:hover:not(:disabled) {
		background-color: #1976d2;
	}
	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}
	.reset-btn {
		background-color: #f44336;
	}
	.reset-btn:hover:not(:disabled) {
		background-color: #d32f2f;
	}
</style>