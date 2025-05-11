<script lang="ts">
    import Chatbot from '$lib/components/chatBot/ChatBot.svelte';
    import { onMount } from 'svelte';

    onMount(() => {
        // Optional: Listen for messages from the parent window
        window.addEventListener('message', (event) => {
            console.log('Message received in iframe:', event.data);
            if (event.data && event.data.type === 'INIT_CHAT') {
                // You could use this to pass initial data, e.g., user name
                // alert(`Chat initialized with: ${event.data.payload}`);
            }
        });

        // Optional: Send a message to the parent when the iframe content is ready
        window.parent.postMessage({ type: 'CHAT_IFRAME_READY', height: document.body.scrollHeight }, 'https://felipeqf.github.io/portfolio');
        // For production, replace '*' with the specific origin of the parent page:
        // window.parent.postMessage({ type: 'CHAT_IFRAME_READY' }, 'https://your-parent-page.com');
    });
</script>

<Chatbot />

<style>
    /* Ensure the chatbot takes up the full space of the iframe page */
    /* And remove any default body margin from the browser */
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden; /* Optional: if you want the chatbot component to handle all scrolling */
    }
    /* You might want to ensure the chatbot component itself fills the space */
    /* This depends on how Chatbot.svelte is structured internally */
    :global(.chat-container) { /* Or whatever the root element of your Chatbot.svelte is */
        height: 100vh;
        width: 100vw;
        box-sizing: border-box; /* Important if you have padding/borders */
        /* Remove any margins it might have if it's meant to fill the iframe */
        margin: 0 !important;
        border-radius: 0 !important; /* If the iframe itself will have rounded corners */
        box-shadow: none !important; /* If the iframe itself will have a shadow */
    }
</style>