document.addEventListener("DOMContentLoaded", () => {
    const questions = [
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correct: "Paris",
            hint: "It's known as the City of Light"
        },
        {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correct: "4",
            hint: "It's the result of adding two twos"
        },
        {
            question: "Who wrote 'To Kill a Mockingbird'?",
            options: ["Harper Lee", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"],
            correct: "Harper Lee",
            hint: "The author shares a name with a bird"
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    const timerWarningSound = document.getElementById('timer-warning-sound');
    const nameInputContainer = document.getElementById('name-input-container');
    const userNameInput = document.getElementById('user-name');
    const startQuizButton = document.getElementById('start-quiz');
    const quizContainer = document.getElementById('quiz-container');
    const endScreen = document.getElementById('end-screen');
    let hasPlayedWarningSound = false;
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const questionNumberElement = document.getElementById('question-number');
    const questionTextElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const submitButton = document.getElementById('submit');
    const hintButton = document.getElementById('hint');
    const hintTextElement = document.getElementById('hint-text');
    const progressElement = document.getElementById('progress');
    const leaderboardElement = document.getElementById('leaderboard-list');
    const restartQuizButton = document.getElementById('restart-quiz');
    const finishButton = document.getElementById('finish');
    const finalScoreElement = document.getElementById('final-score');

    const leaderboard = [];

    function startTimer() {
        let timeLeft = 30;
        timerElement.textContent = timeLeft;
        timerElement.style.setProperty('--progress-width', '100%');
        hasPlayedWarningSound = false;
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 5 && !hasPlayedWarningSound) {
                timerWarningSound.play();
                hasPlayedWarningSound = true;
                setTimeout(() => {
                    timerWarningSound.pause();
                    timerWarningSound.currentTime = 0;
                }, 5000);
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitAnswer();
            }
        }, 1000);
    }

    function updateProgress() {
        const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressElement.style.setProperty('--progress-width', `${progressPercentage}%`);
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(progressPercentage)}%`;
        }
    }

    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        questionNumberElement.textContent = `Question ${currentQuestionIndex + 1}`;
        questionTextElement.textContent = question.question;
        optionsContainer.innerHTML = "";
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option');
            button.addEventListener('click', () => selectOption(button));
            optionsContainer.appendChild(button);
        });

        hintTextElement.textContent = "";
        hintTextElement.classList.add('hidden');
        hintButton.disabled = false;

        hasPlayedWarningSound = false;
        quizContainer.classList.add('slide-in');
        setTimeout(() => quizContainer.classList.remove('slide-in'), 500);
        startTimer();
    }

    function selectOption(selectedButton) {
        const buttons = document.querySelectorAll('.option');
        buttons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
    }

    function showHint() {
        if (hintTextElement.classList.contains('hidden')) {
            const hint = questions[currentQuestionIndex].hint;
            hintTextElement.textContent = hint;
            hintTextElement.classList.remove('hidden');
        }
        hintButton.disabled = true;
    }

    function submitAnswer() {
        updateProgress();
        clearInterval(timerInterval);
        const selectedButton = document.querySelector('.option.selected');
        if (selectedButton) {
            const selectedAnswer = selectedButton.textContent;
            const correctAnswer = questions[currentQuestionIndex].correct;
            if (selectedAnswer === correctAnswer) {
                score++;
                scoreElement.textContent = `Score: ${score}`;
                selectedButton.classList.add('correct');
                playSound('correct.mp3');
                showConfetti();
            } else {
                selectedButton.classList.add('incorrect');
                playSound('incorrect.mp3');
            }
        }

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                quizContainer.classList.add('slide-out');
                setTimeout(() => {
                    quizContainer.classList.remove('slide-out');
                    loadQuestion();
                }, 500);
            } else {
                endQuiz();
            }
        }, 2000);
    }

    function playSound(soundFile) {
        const audio = new Audio(`${soundFile}`);
        audio.play();
    }

    function showConfetti() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js';
        script.onload = () => {
            confetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.6 }
            });
        };
        document.body.appendChild(script);
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            if (nameInputContainer.style.display !== 'none') {
                startQuiz();
            } else if (document.querySelector('.option.selected')) {
                submitAnswer();
            }
        }
    }

    function endQuiz() {
        quizContainer.classList.add('fade-out');
        setTimeout(() => {
            quizContainer.style.display = 'none';
            endScreen.style.display = 'block';
            endScreen.classList.add('fade-in-up');
            setTimeout(() => endScreen.classList.remove('fade-in-up'), 500);
        }, 500);
        finalScoreElement.textContent = score;
        updateLeaderboard(userNameInput.value || 'Anonymous');
    }

    function updateLeaderboard(userName) {
        leaderboard.push({ name: userName, score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboardElement.innerHTML = "";
        leaderboard.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<img src="avatars/avatar${(index % 5) + 1}.png" alt="Avatar">${index + 1}. ${entry.name} - Score: ${entry.score}`;
            leaderboardElement.appendChild(listItem);
        });
    }

    startQuizButton.addEventListener('click', () => {
        if (userNameInput.value) {
            nameInputContainer.classList.add('fade-out');
            setTimeout(() => {
                nameInputContainer.style.display = 'none';
                quizContainer.style.display = 'block';
                quizContainer.classList.add('fade-in');
                setTimeout(() => quizContainer.classList.remove('fade-in'), 500);
                loadQuestion();
            }, 500);
        } else {
            alert('Please enter your name');
        }
    });

    document.addEventListener('keypress', handleKeyPress);
    submitButton.addEventListener('click', submitAnswer);
    hintButton.addEventListener('click', showHint);
    restartQuizButton.addEventListener('click', () => {
        currentQuestionIndex = 0;
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        endScreen.style.display = 'none';
        quizContainer.style.display = 'block';
        loadQuestion();
        progressElement.style.setProperty('--progress-width', '0%');
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = '0%';
        }
    });

    finishButton.addEventListener('click', () => {
        alert('Thank you for playing!');
        window.location.reload();
    });
});
