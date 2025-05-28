const computerChoiceDisplay = document.getElementById("computer-choice");
const userChoiceDisplay = document.getElementById("user-choice");
const resultDisplay = document.getElementById("game-title");
const userScoreDisplay = document.getElementById("user-score");
const computerScoreDisplay = document.getElementById("computer-score");

const possibleChoices = document.querySelectorAll("button");

const computerDiv = document.getElementById("image1");
const userDiv = document.getElementById("image2")

let userChoice;
let computerChoice;
let outcome = ["rock", "paper", "scissors"];

let userScore = 0;
let computerScore = 0;

const userImg = document.createElement("img");
userImg.src = "./images/start.png";
userDiv.appendChild(userImg);

const computerImg = document.createElement("img");
computerImg.src = "./images/start.png";
computerDiv.appendChild(computerImg);

possibleChoices.forEach(choice => 
    choice.addEventListener("click", (event) => {
        userChoice = event.target.id;
        
        // clear previous image
        userDiv.innerHTML = "";
        userImg.src = "./images/" + userChoice + ".png";
        userImg.alt = userChoice;
        userImg.width = 100;
        userImg.height = 100;
        userDiv.appendChild(userImg);

        generateComputerChoice();
        getResult();
    })
);

function generateComputerChoice() {
    const randomNumber = Math.floor(Math.random() * outcome.length);
    computerChoice = outcome[randomNumber];

    computerDiv.innerHTML = "";
    computerImg.src = "./images/" + computerChoice +"1.png";
    computerImg.alt = computerChoice;
    computerImg.width = 100;
    computerImg.height = 100;
    computerDiv.appendChild(computerImg);
}

function getResult() {
    if (userChoice === computerChoice) {
        resultDisplay.innerHTML = "Draw!";
        // optional: you could track drawScore if you want
    } 
    else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "paper" && computerChoice === "rock") ||
        (userChoice === "scissors" && computerChoice === "paper")
    ) {
        resultDisplay.innerHTML = "Win!";
        userScore++;
        userScoreDisplay.innerText = userScore;
        userScoreDisplay.classList.remove("score-rotate");
        void userScoreDisplay.offsetWidth;
        userScoreDisplay.classList.add("score-rotate");
    } 
    else {
        resultDisplay.innerHTML = "Lose!";
        computerScore++;
        computerScoreDisplay.innerText = computerScore;
        computerScoreDisplay.classList.remove("score-rotate");
        void computerScoreDisplay.offsetWidth;
        computerScoreDisplay.classList.add("score-rotate");
    }
}

