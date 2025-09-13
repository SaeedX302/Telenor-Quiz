let deferredPrompt;
const pwaInstallBanner = document.getElementById('pwa-install-banner');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(reg => {
            console.log('Service Worker registered! 😎', reg);
        }).catch(err => {
            console.log('Service Worker registration failed: 😫', err);
        });
    });
}

// PWA Install Banner Logic
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    pwaInstallBanner.classList.remove('hidden');
    pwaInstallBanner.classList.add('show');
});

pwaInstallBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt.');
        } else {
            console.log('User dismissed the install prompt.');
        }
        // We've used the prompt, and it can't be used again. Hide the banner.
        deferredPrompt = null;
        pwaInstallBanner.classList.remove('show');
        pwaInstallBanner.classList.add('hidden');
    }
});

// Hide banner if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('TSun Daily Quiz was installed.');
    pwaInstallBanner.classList.remove('show');
    pwaInstallBanner.classList.add('hidden');
});

const API_URL = 'https://corsproxy.io/?http%3A%2F%2Fpaktrickowner.serv00.net%2FApi.php';
const QUOTE_API_URL = 'https://corsproxy.io/?https://quotes.tsunstudio.pw/api/quotes';
// Note: It's better to manage API keys with environment variables for security.
// For example, in Vercel you can add a variable named API_KEY.
// const API_KEY = process.env.API_KEY; 
const API_KEY = ""; // Placeholder for now
let quizData = []; // Store the fetched quiz data globally
let quotesData = [];
let currentQuoteIndex = 0;

// UI Elements
const quizContainer = document.getElementById('quiz-container');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const questionsList = document.getElementById('questions-list');
const themeBtn = document.getElementById('themeBtn');
const changelogBtn = document.getElementById('changelogBtn');
const changelogModal = document.getElementById('changelogModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const mainTitle = document.getElementById('mainTitle');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const changelogContent = document.getElementById('changelogContent');


// Theme logic
const sunSVG = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
const moonSVG = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0015.354 20.354z"></path></svg>`;

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeBtn.innerHTML = sunSVG;
        themeBtn.setAttribute('aria-label', 'Switch to light theme');
        themeBtn.setAttribute('title', 'Switch to light theme');
        themeBtn.setAttribute('aria-pressed', 'true');
    } else {
        document.body.classList.remove('dark-theme');
        themeBtn.innerHTML = moonSVG;
        themeBtn.setAttribute('aria-label', 'Switch to dark theme');
        themeBtn.setAttribute('title', 'Switch to dark theme');
        themeBtn.setAttribute('aria-pressed', 'false');
    }
};

themeBtn.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});

// Changelog Modal
const changelogData = [
    {
        date: '13 September, 2025',
        version: '2.4.0',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Refactor:</b> Converted to a proper webapp with separate HTML, CSS, and JS files for better modularity and scalability.',
            '<b>Feature:</b> Added new Changelog entry for this conversion.',
            '<b>Aesthetic:</b> Replaced the old favicon with a new 3D favicon from icons8.com.',
            '<b>Security:</b> Recommended moving the API key to a .env file.',
        ]
    },
    {
        date: '13 September, 2025',
        version: '2.3.5',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Feature:</b> Added PWA functionality for an installable app experience.',
            '<b>UI/UX:</b> Implemented a smart notification shade to prompt users to install the app.',
            '<b>Performance:</b> Integrated Service Worker for offline support and faster loading times.',
        ]
    },
    {
        date: '13 September, 2025',
        version: '2.1.5',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Fix:</b> We Add A Better Favivon.',
            '<b>Security:</b> Move Api Into Env.',
            '<b>Aesthetic:</b> For Improvemt Fix Some Small Bugs.',
        ]
    },
    {
        date: '13 September, 2025',
        version: '2.0.1',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Feature:</b> Add Theme Switching Function.',
            '<b>Aesthetic:</b> Add Sparkle animation In Light And Dark Themes.',
        ]
    },
    {
        date: '13 September, 2025',
        version: '1.0.6',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>UI:</b> Increased the blue saturation in the background gradient.',
            '<b>Aesthetic:</b> The new colors create a more vibrant and dynamic visual effect.',
        ]
    },
    {
        date: '13 September, 2025',
        version: '1.0.3',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Design:</b> Modern Glassmorphism UI with Tailwind CSS.',
            '<b>Fix:</b> Added loading and error states for a better user experience.',
        ]
    },
    {
        date: '13 September, 2025',
        version: '1.0.1',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Improved:</b> Improvements In Api Responce.',
        ]
    },
    {
        date: '12 September, 2025',
        version: '1.0.0',
        author: '༯𝙎ค૯𝙀𝘿✘🫀',
        changes: [
            '<b>Initial Release:</b> Launche First Version Of Telenor Daily Quiz.',
            '<b>Feature:</b> Responsive design for all devices.',
        ]
    }
];

function renderChangelog(data) {
    changelogContent.innerHTML = '';
    data.forEach(entry => {
        const div = document.createElement('div');
        div.classList.add('mb-6', 'pb-4', 'border-b', 'border-gray-200');
        div.innerHTML = `
            <p class="text-sm text-gray-500">Date: ${entry.date}</p>
            <p class="text-sm text-gray-500">Version: ${entry.version}</p>
            <p class="text-sm text-gray-500">Author: ${entry.author}</p>
            <ul class="list-disc list-inside mt-2 text-gray-700 space-y-1">
                ${entry.changes.map(change => `<li>${change}</li>`).join('')}
            </ul>
        `;
        changelogContent.appendChild(div);
    });
}

renderChangelog(changelogData); // Initial render with all changelogs

changelogBtn.setAttribute('aria-label', 'Open changelog');
changelogBtn.setAttribute('title', 'Open changelog');
changelogBtn.addEventListener('click', () => {
    changelogModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
});

closeModalBtn.addEventListener('click', () => {
    changelogModal.classList.add('hidden');
    document.body.style.overflow = '';
});

window.addEventListener('click', (e) => {
    if (e.target === changelogModal) {
        changelogModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
});

// Click Effect
document.body.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
});

// Fetch Quiz Data
async function fetchQuiz() {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    loadingState.style.display = 'flex';
    errorState.classList.add('hidden');
    questionsList.classList.add('hidden');

    try {
        const response = await fetch(API_URL, { signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data || !Array.isArray(data.quiz)) {
            throw new Error("Invalid API response format");
        }

        quizData = data.quiz;
        questionsList.classList.remove('hidden');
        renderAllQuestions(quizData);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Fetch aborted due to timeout.');
            errorState.innerHTML = `<p class="text-red-500 font-bold text-xl">Request Timed Out!</p><p class="text-gray-600 mt-2">Server se jawab nahi mila. Please try again.</p>`;
        } else {
            console.error('Error fetching quiz data:', error.message);
            errorState.innerHTML = `<p class="text-red-500 font-bold text-xl">API Fetching Failed!</p><p class="text-gray-600 mt-2">Server se data nahi aa raha hai. Check your connection or the API.</p>`;
        }
        errorState.classList.remove('hidden');
        questionsList.classList.add('hidden');
    } finally {
        loadingState.style.display = 'none';
    }
}

// Fetch Quotes Data
async function fetchQuotes() {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
        const response = await fetch(QUOTE_API_URL, { signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Quotes API response was not ok');
        }
        quotesData = await response.json();
        if (quotesData && quotesData.length > 0) {
            setInterval(displayNextQuote, 10000);
            displayNextQuote();
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Quotes API request timed out.');
        } else {
            console.error('Error fetching quotes data:', error);
        }
    }
}

function displayNextQuote() {
    if (quotesData.length > 0) {
        const quote = quotesData[currentQuoteIndex];
        quoteText.innerHTML = `"${quote.quote}"`;
        quoteAuthor.innerHTML = `- ${quote.author}`;
        currentQuoteIndex = (currentQuoteIndex + 1) % quotesData.length;
    }
}

// Render all questions and answers
function renderAllQuestions(quizData) {
    questionsList.innerHTML = ''; // Clear previous content

    quizData.forEach((item, index) => {
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('p-4', 'sm:p-6', 'mb-4', 'sm:mb-6', 'rounded-xl', 'glass-card');

        const questionHeader = document.createElement('div');
        questionHeader.classList.add('flex', 'flex-col', 'sm:flex-row', 'justify-between', 'items-start', 'sm:items-center', 'mb-4');

        const questionHeading = document.createElement('h2');
        questionHeading.classList.add('text-lg', 'sm:text-xl', 'md:text-2xl', 'font-semibold', 'text-gray-800', 'leading-relaxed', 'mb-2', 'sm:mb-0', 'w-full', 'sm:w-3/4');
        questionHeading.textContent = `${index + 1}. ${item.question}`;
        questionHeader.appendChild(questionHeading);

        questionBlock.appendChild(questionHeader);

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-4');

        item.options.forEach(option => {
            const optionBtn = document.createElement('div');
            optionBtn.classList.add(
                'bg-white', 'text-gray-800', 'font-medium', 'rounded-full', 'py-3', 'px-6',
                'border', 'border-gray-200', 'shadow-md', 'text-sm', 'md:text-base', 'flex', 'items-center', 'justify-between'
            );
            optionBtn.textContent = option;

            if (option === item.answer) {
                optionBtn.classList.add('correct-answer');
            }

            optionsContainer.appendChild(optionBtn);
        });
        questionBlock.appendChild(optionsContainer);
        questionsList.appendChild(questionBlock);
    });
}

// Initial load
window.onload = () => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(storedTheme);
    fetchQuiz();
    fetchQuotes();
};
