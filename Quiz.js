const questionBanks = {
    geography: [
        { 
            question: "What is the capital of Australia?", 
            options: ["Sydney", "Melbourne", "Canberra", "Perth"], 
            correct: "Canberra" 
        },
        { 
            question: "Which river is the longest in the world?", 
            options: ["Amazon", "Nile", "Yangtze", "Mississippi"], 
            correct: "Nile" 
        },
        { 
            question: "Which country has the most natural lakes?", 
            options: ["Canada", "Russia", "USA", "Brazil"], 
            correct: "Canada" 
        },
        { 
            question: "What is the largest ocean on Earth?", 
            options: ["Atlantic", "Indian", "Arctic", "Pacific"], 
            correct: "Pacific" 
        },
        { 
            question: "Mount Everest is located between which two countries?", 
            options: ["India and China", "Nepal and China", "Pakistan and India", "Bhutan and Nepal"], 
            correct: "Nepal and China" 
        }
    ],
    history: [
        { 
            question: "In which year did World War II end?", 
            options: ["1943", "1945", "1947", "1950"], 
            correct: "1945" 
        },
        { 
            question: "Who was the first president of the United States?", 
            options: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"], 
            correct: "George Washington" 
        },
        { 
            question: "The Industrial Revolution began in which country?", 
            options: ["France", "Germany", "United States", "Great Britain"], 
            correct: "Great Britain" 
        },
        { 
            question: "Which ancient civilization built the pyramids of Giza?", 
            options: ["Romans", "Greeks", "Egyptians", "Persians"], 
            correct: "Egyptians" 
        },
        { 
            question: "The Renaissance began in which country?", 
            options: ["France", "Germany", "Italy", "Spain"], 
            correct: "Italy" 
        }
    ],
    coding: [
        { 
            question: "What does HTML stand for?", 
            options: ["Hyperlinks and Text Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"], 
            correct: "Hyper Text Markup Language" 
        },
        { 
            question: "Which CSS property changes text color?", 
            options: ["text-color", "color", "font-color", "background-color"], 
            correct: "color" 
        },
        { 
            question: "Which of these is NOT a JavaScript framework?", 
            options: ["React", "Vue", "Django", "Angular"], 
            correct: "Django" 
        },
        { 
            question: "What does API stand for?", 
            options: ["Application Programming Interface", "Automated Programming Interface", "Application Process Integration", "Automated Process Integration"], 
            correct: "Application Programming Interface" 
        },
        { 
            question: "Which language runs in a web browser?", 
            options: ["Java", "C", "Python", "JavaScript"], 
            correct: "JavaScript" 
        }
    ],
    science: [
        { 
            question: "What is the chemical symbol for gold?", 
            options: ["Go", "Gd", "Au", "Ag"], 
            correct: "Au" 
        },
        { 
            question: "Which planet is known as the Red Planet?", 
            options: ["Venus", "Mars", "Jupiter", "Saturn"], 
            correct: "Mars" 
        },
        { 
            question: "What is the hardest natural substance on Earth?", 
            options: ["Gold", "Iron", "Diamond", "Quartz"], 
            correct: "Diamond" 
        },
        { 
            question: "Which gas do plants absorb from the atmosphere?", 
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], 
            correct: "Carbon Dioxide" 
        },
        { 
            question: "What is the human body's largest organ?", 
            options: ["Liver", "Brain", "Skin", "Heart"], 
            correct: "Skin" 
        }
    ]
}; 
        
// Current quiz state
let currentSubject = '';
let currentQuestionIndex = 0;
let userAnswers = [];
let timeLeft = 60;
let timeInterval;
        
// DOM elements
const container = document.getElementById('container');
const timerElement = document.getElementById('timer');
        
// Subject button click handlers
document.getElementById('geography').addEventListener('click', () => startQuiz('geography'));
document.getElementById('history').addEventListener('click', () => startQuiz('history'));
document.getElementById('coding').addEventListener('click', () => startQuiz('coding'));
document.getElementById('science').addEventListener('click', () => startQuiz('science'));
        
// Start quiz function
function startQuiz(subject) {
    currentSubject = subject;
    currentQuestionIndex = 0;
    userAnswers = [];
            
    // Start timer
    timeLeft = 60;
    updateTimer();
    timeInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timeInterval);
            showResults();
        }
    }, 1000);
            
    // Load first question
    loadQuestion();
}
        
// Load question function
function loadQuestion() {
    const questions = questionBanks[currentSubject];
    const question = questions[currentQuestionIndex];
            
    // Create the quiz HTML
    container.innerHTML = `
        <h1>${currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1)} Quiz</h1>
        <div id="questions">${question.question}</div>
                
        <button class="option-btn" data-option="0">${question.options[0]}</button>
        <button class="option-btn" data-option="1">${question.options[1]}</button>
        <button class="option-btn" data-option="2">${question.options[2]}</button>
        <button class="option-btn" data-option="3">${question.options[3]}</button>
                
        <div class="nav-buttons">
            <button class="nav-btn" id="prev">Previous</button>
            <button class="nav-btn" id="next">Next</button>
        </div>
                
        <button id="submit">Submit Quiz</button>
    `;
            
    // Set up event listeners for the new elements
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.option-btn').forEach(b => {
                b.classList.remove('selected');
            });
            // Add selected class to clicked option
            this.classList.add('selected');
            // Store user's answer
            userAnswers[currentQuestionIndex] = question.options[parseInt(this.dataset.option)];
        });
    });
            
    // Navigation buttons
    document.getElementById('prev').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    });
            
    document.getElementById('next').addEventListener('click', () => {
        if (currentQuestionIndex < questionBanks[currentSubject].length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
    });
            
    // Submit button
    document.getElementById('submit').addEventListener('click', showResults);
}
        
// Update timer display
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
    if (timeLeft <= 10) {
        timerElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    }
}
        
// Show results
function showResults() {
    clearInterval(timeInterval);
            
    const questions = questionBanks[currentSubject];
    let score = 0;
            
    questions.forEach((q, index) => {
        if (userAnswers[index] === q.correct) {
            score++;
        }
    });
            
    const percentage = Math.round((score / questions.length) * 100);
    container.innerHTML = `
    <h1>Quiz Results</h1>
    <div style="
        font-size: 24px; 
        margin: 20px 0; 
        font-weight: bold; 
        background: linear-gradient(90deg, #00c6ff, #0072ff); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent;">
        Score: ${score} out of ${questions.length}
    </div>

    <div style="background-color: #f0f0f0; width: 80%; height: 20px; border-radius: 10px; overflow: hidden; margin: 25px auto; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);">
        <div style="background-color: #007bff; width: ${percentage}%; height: 100%; border-radius: 10px;"></div>
    </div>

    <button id="restart" class="subject-btn" style="background: linear-gradient(135deg, #9C27B0, #E91E63);">Take Another Quiz</button>
    `;
    document.getElementById('restart').addEventListener('click', () => {
        // Reset and show subject selection again
        container.innerHTML = `
            <h1>Select Your Subject</h1>
            <button id="geography" class="subject-btn">Geography</button>
            <button id="history" class="subject-btn">History</button>
            <button id="coding" class="subject-btn">Coding</button>
            <button id="science" class="subject-btn">Science</button>
        `;
                
        // Reattach event listeners
        document.getElementById('geography').addEventListener('click', () => startQuiz('geography'));
        document.getElementById('history').addEventListener('click', () => startQuiz('history'));
        document.getElementById('coding').addEventListener('click', () => startQuiz('coding'));
        document.getElementById('science').addEventListener('click', () => startQuiz('science'));
                
        // Reset timer
        timerElement.textContent = 'Time Left: 60s';
        timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    });
}