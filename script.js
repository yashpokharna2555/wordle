let generatedWord = "";
let btn = document.querySelector(".check-btn");
let attempts = 0;

async function fetchRandomWord() {
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?length=5"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    generatedWord = data[0].toUpperCase(); // Store the generated word
    console.log("Generated word:", generatedWord);
    resetGame();
  } catch (error) {
    console.error("Error:", error.message);
  }
  alert("Your word has been generated!!");
}

function resetGame() {
  // Clear the boxes
  const boxes = document.querySelectorAll(".box");
  boxes.forEach((box) => {
    box.textContent = "";
    box.style.backgroundColor = "#ffffff";
  });
  // Hide the Check button
  btn.style.display = "none";
  // Reset alphabet button colors
  const alphabetBtns = document.querySelectorAll(".alphabet-btn");
  alphabetBtns.forEach((btn) => {
    btn.style.backgroundColor = "#007bff";
  });
  // Reset attempts
  attempts = 0;
}

let alphabetCnt = 0;
let currentRow = 1;

function addLetter(letter, rowId) {
  alphabetCnt += 1;
  rowId = generateRowId(rowId, alphabetCnt);

  const boxes = document.querySelectorAll(`#${rowId} .box`);
  for (let box of boxes) {
    if (box.textContent === "") {
      box.textContent = letter.toUpperCase();
      if (checkRowFilled(rowId)) {
        btn.style.display = "block";
        btn.setAttribute("onclick", `checkWord('${rowId}')`);
      } else {
        btn.style.display = "none";
      }
      break;
    }
  }

  // Change the color of the alphabet button
  document.getElementById(letter).style.backgroundColor = "#999";
}

function generateRowId(rowId, totalNo) {
  let rowNum = Math.ceil(totalNo / 5);
  return `${rowId}-${rowNum}`;
}

function checkRowFilled(rowId) {
  const boxes = document.querySelectorAll(`#${rowId} .box`);
  for (let box of boxes) {
    if (box.textContent === "") {
      return false;
    }
  }
  return true;
}

async function checkWord(rowId) {
  let greenCnt = 0;

  const boxes = document.querySelectorAll(`#${rowId} .box`);
  let word = "";
  for (let box of boxes) {
    word += box.textContent;
  }

  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
  );
  if (!response.ok) {
    alert("Not a valid word");
    clearRow(rowId);
    return; // Stop further execution if word is not valid
  }

  // Increment attempts only if the word is valid
  attempts++;

  // Compare the guessed word with the generated word
  let delay = 500; // milliseconds
  for (let i = 0; i < word.length; i++) {
    setTimeout(() => {
      if (word[i] === generatedWord[i]) {
        // Correct letter in correct position - turn box green
        boxes[i].style.backgroundColor = "#28a745";
        greenCnt++;
      } else if (generatedWord.includes(word[i])) {
        // Letter is present but in wrong position - turn box yellow
        boxes[i].style.backgroundColor = "yellow";
      } else {
        // Letter is not present in the generated word - turn box grey
        boxes[i].style.backgroundColor = "grey";
      }
      // Check if all letters are correct after color changes
      if (greenCnt === 5) {
        setTimeout(() => {
          alert("Congratulations! You Won!!!");
          alert("New Game will start. Best of Luck");
          // Reset the game after alert
          resetGame();
          location.reload();
        }, delay * (word.length + 1));
      }
    }, delay * (i + 1));
  }

  // Change the color of the alphabet buttons after the row is complete
  const alphabetBtns = document.querySelectorAll(".alphabet-btn");
  for (let btn of alphabetBtns) {
    if (btn.style.backgroundColor !== "#999") {
      btn.style.backgroundColor = "#007bff";
    }
  }

  if (attempts === 6) {
    setTimeout(() => {
      alert("Oops! Maximum attempts reached.");
      location.reload(); // Reload the page after 3 seconds
    }, delay * (word.length + 1));
  }

  // Change the color of the used alphabet buttons
  const usedLetters = new Set(word.split(""));
  usedLetters.forEach((letter) => {
    const alphabetBtn = document.getElementById(letter);
    if (alphabetBtn) {
      alphabetBtn.style.backgroundColor = "red";
    }
  });
}

function clearRow(rowId) {
  const boxes = document.querySelectorAll(`#${rowId} .box`);
  for (let box of boxes) {
    box.textContent = "";
  }
  alphabetCnt -= 5;
  if (alphabetCnt < 0) alphabetCnt = 0;
  rowId = generateRowId(rowId, alphabetCnt); // Update rowId
}
