document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const landingPage = document.getElementById('landing');
    const memoriesPage = document.getElementById('memories');
    const proposalPage = document.getElementById('proposal');

    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const celebration = document.getElementById('celebration');
    const buttonsContainer = document.querySelector('.buttons-container');

    // --- Background Music Init ---
    const bgMusic = document.getElementById('bg-music');
    let musicStarted = false;

    function startMusic() {
        if (!musicStarted) {
            bgMusic.volume = 0.5; // Set volume to 50%
            bgMusic.play().then(() => {
                musicStarted = true;
                document.removeEventListener('click', startMusic);
                document.removeEventListener('touchstart', startMusic);
            }).catch(e => {
                console.log("Audio play failed (waiting for interaction):", e);
            });
        }
    }

    // Try to play immediately (might work in some environments)
    startMusic();

    // Fallback: Play on first interaction
    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);

    // Page Transitions
    function switchPage(fromPage, toPage) {
        fromPage.classList.remove('active');
        fromPage.classList.add('hidden');

        setTimeout(() => {
            fromPage.style.display = 'none';
            toPage.style.display = 'flex';

            requestAnimationFrame(() => {
                toPage.classList.remove('hidden');
                toPage.classList.add('active');

                // Spotlight Logic
                if (toPage === proposalPage) {
                    document.body.classList.add('spotlight-active');
                } else {
                    document.body.classList.remove('spotlight-active');
                }

                // If switching to proposal, ensure interaction loop for 'no' button is active
            });
        }, 800);
    }

    startBtn.addEventListener('click', () => {
        switchPage(landingPage, memoriesPage);
    });

    nextBtn.addEventListener('click', () => {
        switchPage(memoriesPage, proposalPage);
    });

    // --- "No" Button Physics Logic (Cursor + Edge Repulsion) ---
    let noBtnPos = { x: 0, y: 0 };
    // We update position relative to its initial static position

    let mouseX = -1000, mouseY = -1000;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Physics loop
    function updatePhysics() {
        if (!proposalPage.classList.contains('active')) {
            requestAnimationFrame(updatePhysics);
            return;
        }

        const btnRect = noBtn.getBoundingClientRect();
        const btnCenter = {
            x: btnRect.left + btnRect.width / 2,
            y: btnRect.top + btnRect.height / 2
        };

        // 1. Repel from Cursor
        const distX = mouseX - btnCenter.x;
        const distY = mouseY - btnCenter.y;
        const distCursor = Math.sqrt(distX * distX + distY * distY);
        const cursorRepelRadius = 150;

        let forceX = 0;
        let forceY = 0;

        if (distCursor < cursorRepelRadius) {
            const angle = Math.atan2(distY, distX);
            const force = (cursorRepelRadius - distCursor) / cursorRepelRadius; // 0 to 1 strength
            const pushStrength = 15; // Speed factor

            // Push AWAY from cursor
            forceX -= Math.cos(angle) * pushStrength * force;
            forceY -= Math.sin(angle) * pushStrength * force;
        }

        // 2. Repel from Edges (Window Boundaries)
        const edgeThreshold = 100; // Distance from edge to start pushing back
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Repel from Left Edge
        if (btnRect.left < edgeThreshold) {
            const strength = (edgeThreshold - btnRect.left) / edgeThreshold;
            forceX += strength * 10;
        }
        // Repel from Right Edge
        if (btnRect.right > viewportWidth - edgeThreshold) {
            const strength = (btnRect.right - (viewportWidth - edgeThreshold)) / edgeThreshold;
            forceX -= strength * 10;
        }
        // Repel from Top Edge
        if (btnRect.top < edgeThreshold) {
            const strength = (edgeThreshold - btnRect.top) / edgeThreshold;
            forceY += strength * 10;
        }
        // Repel from Bottom Edge
        if (btnRect.bottom > viewportHeight - edgeThreshold) {
            const strength = (btnRect.bottom - (viewportHeight - edgeThreshold)) / edgeThreshold;
            forceY -= strength * 10;
        }

        // Apply forces
        noBtnPos.x += forceX;
        noBtnPos.y += forceY;

        noBtn.style.transform = `translate(${noBtnPos.x}px, ${noBtnPos.y}px)`;

        requestAnimationFrame(updatePhysics);
    }

    // Start physics loop
    requestAnimationFrame(updatePhysics);


    // Yes Button Click
    yesBtn.addEventListener('click', () => {
        // 1. Remove Spotlight
        document.body.classList.remove('spotlight-active');
        document.body.classList.add('celebrating');

        // 2. Hide Question & Buttons COMPLETELY
        const question = document.querySelector('.question');
        if (question) question.style.display = 'none';
        buttonsContainer.style.display = 'none';

        // 3. Expand Box
        const wrapper = proposalPage.querySelector('.content-wrapper');
        wrapper.classList.add('expanded');

        // 4. Show Celebration
        celebration.classList.remove('hidden');
        createConfetti();
        setInterval(createConfetti, 200);
    });

    // --- Background Moving Collage Logic (Grid Based) ---
    function renderBackgroundCollage() {
        const collageContainer = document.getElementById('bg-collage-container');
        if (collageContainer.children.length > 0) return;

        // Placeholder Photos - Extended list
        // Local Photos from assets folder
        // You can replace these images in the 'assets' folder with your own!
        const photoUrls = [
            'assets/photo1.jpg',
            'assets/photo2.jpg',
            'assets/photo3.jpg',
            'assets/photo4.jpg',
            'assets/photo5.jpg',
            'assets/photo6.jpg',
            'assets/photo1.jpg', // Repeating for collage density
            'assets/photo2.jpg',
            'assets/photo3.jpg',
            'assets/photo4.jpg',
            'assets/photo5.jpg',
            'assets/photo6.jpg'
        ];

        // Grid-based random distribution to prevent overlapping clumping
        const cols = 4;
        const rows = 3;
        const cellWidth = 100 / cols; // in vw
        const cellHeight = 100 / rows; // in vh

        photoUrls.forEach((url, index) => {
            const item = document.createElement('div');
            item.className = 'bg-photo-item';

            // Randomize visual properties - Bigger size
            const width = Math.random() * 150 + 200; // 200-350px width
            item.style.width = `${width}px`;
            item.style.height = `${width * (Math.random() * 0.4 + 0.8)}px`;

            // Determine cell position
            const col = index % cols;
            const row = Math.floor(index / cols);

            // Randomize position WITHIN the cell
            const baseLeft = col * cellWidth;
            const baseTop = row * cellHeight;

            const randomLeft = baseLeft + Math.random() * (cellWidth - 10);
            const randomTop = baseTop + Math.random() * (cellHeight - 10);

            item.style.left = `${randomLeft}vw`;
            item.style.top = `${randomTop}vh`;

            // Random styling
            const rotate = Math.random() * 30 - 15;
            item.style.transform = `rotate(${rotate}deg)`;
            item.style.opacity = 1;

            const img = document.createElement('img');
            img.src = url;
            item.appendChild(img);
            collageContainer.appendChild(item);

            animatePhoto(item);
        });
    }

    // Call immediately
    renderBackgroundCollage();

    function animatePhoto(element) {
        // Drifting animation
        const destX = (Math.random() - 0.5) * 100; // Small drift
        const destY = (Math.random() - 0.5) * 100;
        const duration = Math.random() * 10000 + 25000; // Very slow drift

        const rotateStart = (Math.random() * 30 - 15);
        const rotateEnd = (Math.random() * 30 - 15);

        element.animate([
            { transform: `translate(0, 0) rotate(${rotateStart}deg)` },
            { transform: `translate(${destX}px, ${destY}px) rotate(${rotateEnd}deg)` }
        ], {
            duration: duration,
            easing: 'ease-in-out',
            iterations: Infinity,
            direction: 'alternate'
        });
    }

    // --- Background & Visuals ---
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 50;

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 20 + 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}vw`;
        const colors = ['#ff4d6d', '#ff8fa3', '#ffb3c1', '#fff0f3', '#e01e37'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        if (Math.random() > 0.5) {
            particle.style.backgroundColor = color;
            particle.style.clipPath = "path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')";
        } else {
            particle.style.backgroundColor = color;
            particle.style.borderRadius = "50%";
        }

        const duration = Math.random() * 10 + 10;
        particle.style.animationDuration = `${duration}s`;
        const delay = Math.random() * 5;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);
    }

    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    // Sparkle Trail (Hearts)
    let lastSparkleTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSparkleTime > 30) {
            createSparkle(e.clientX, e.clientY);
            lastSparkleTime = now;
        }
    });

    document.addEventListener('click', (e) => {
        createBurst(e.clientX, e.clientY);
    });

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        const colors = ['#ff4d6d', '#ff8fa3', '#ffb3c1'];
        sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    function createBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            const burstPart = document.createElement('div');
            burstPart.classList.add('burst-part');
            burstPart.style.left = `${x}px`;
            burstPart.style.top = `${y}px`;
            burstPart.style.setProperty('--angle', `${i * 45}deg`);
            document.body.appendChild(burstPart);
            setTimeout(() => burstPart.remove(), 800);
        }
    }
});

function createConfetti() {
    const colors = ['#ff4d6d', '#ff8fa3', '#ffb3c1'];
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = '50%';
        confetti.style.top = '50%';
        confetti.style.borderRadius = '50%';
        document.body.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 300 + 100;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;

        confetti.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => confetti.remove();
    }
}
