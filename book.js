//Allows user to choose based on mood and setting.
let userSelections = {
  mood: '',
  setting: ''
};
//Starts off every time the user opens the application by making sure the user has no books in the watch list yet and no book matches yet.
let activeBookMatch = null;
let bookWatchlist = [];
// Uses DOM manipulation to load the watch list every time the user opens the application.
document.addEventListener("DOMContentLoaded", () => {
  loadWatchlistFromCache();
});
// The user can select choice based on mood and setting.
function selectChoice(step, value) {
  userSelections[step] = value;

  if (step === 'mood') {
    transitionScreen('screen-mood', 'screen-setting');
  } else if (step === 'setting') {
    transitionScreen('screen-setting', 'screen-result');
    matchLocalRegistryBook(); // Query our localized bestseller database file
  }
}
// This function hides the ID of the book and also shows it.
function transitionScreen(hideId, showId) {
  document.getElementById(hideId).classList.remove('active');
  document.getElementById(showId).classList.add('active');
}

/**
 * Filters the real bestseller database matrix and randomizes duplicates
 */
function matchLocalRegistryBook() {
  // Collect ALL real books matching the grid parameters
  const matchingPool = globalBookRegistry.filter(book => 
    book.mood === userSelections.mood && book.setting === userSelections.setting
  );
// If nothing shows up, it hits the user with one of these messages.
  if (matchingPool.length === 0) {
    document.getElementById('book-title').innerText = "Data Query Empty";
    document.getElementById('book-desc').innerText = "Could not locate records matching that choice tracking combination.";
    return;
  }

  // Picks a random index out of the real matches
  const randomIndex = Math.floor(Math.random() * matchingPool.length);
  activeBookMatch = matchingPool[randomIndex];

  // Resets button states
  document.getElementById('btn-save').innerText = "➕ Add to My List";
  document.getElementById('btn-save').disabled = false;

  // Renders properties straight onto the user interface elements
  document.getElementById('book-title').innerText = activeBookMatch.title;
  document.getElementById('book-author').innerText = `By ${activeBookMatch.author}`;
  document.getElementById('book-desc').innerText = activeBookMatch.desc;
  document.getElementById('book-cover').src = activeBookMatch.image;
  document.getElementById('book-cover').alt = `${activeBookMatch.title} Cover Art`;
}

// ==========================================
// PERSISTENT CACHE CORE SYSTEMS (localStorage) to save user's preferences.
// ==========================================
function saveCurrentToWatchlist() {
  if (!activeBookMatch) return;
// If the user tries to save the same book onto the watch list, the application denies the request.
  const isDuplicate = bookWatchlist.some(bookTitle => bookTitle === activeBookMatch.title);
// If it's not a duplicate however, the application allows the request and save the user's book onto the watch list.
  if (!isDuplicate) {
    bookWatchlist.push(activeBookMatch.title);
    localStorage.setItem("book_watchlist_cache", JSON.stringify(bookWatchlist));
    renderWatchlistDOM();
    document.getElementById('btn-save').innerText = "✅ Saved to My List";
    document.getElementById('btn-save').disabled = true;
  }
}
// Dynamically loads the user's watch list and saves the user's watch list regardless if the user closes the app.
function loadWatchlistFromCache() {
  const cachedData = localStorage.getItem("book_watchlist_cache");
  if (cachedData) {
    bookWatchlist = JSON.parse(cachedData);
    renderWatchlistDOM();
  }
}
// Uses DOM manipulation to load the unordered list (watchlist)
function renderWatchlistDOM() {
  const ulContainer = document.getElementById('watchlist-ul');
  ulContainer.innerHTML = "";
// If the list's length === 0, then looks at it strictly declares it true or false if it's equal as in string to integer and returns the statement: "The list is empty"
// if the user has no books in the list.
  if (bookWatchlist.length === 0) {
    ulContainer.innerHTML = "<li style='color: #555; border: none; background: none;'>Your list is empty.</li>";
    return;
  }
/* Uses forEach by using the parameters (title, index) and uses innerHTML to 
delete a certain book if the user doesn't want it included in the watch list or it can also add the book to the watch list with the title and index of the book. */
  bookWatchlist.forEach((title, index) => {
    const liItem = document.createElement('li');
    liItem.innerHTML = `
      <span>${title}</span>
      <button class="btn-delete-item" onclick="deleteWatchlistItem(${index})">❌</button>
    `;
    ulContainer.appendChild(liItem);
  });
}
/* This function targets at deleting an item from the watch list by index and saves the user's choices in the watch list if they delete an item.
However, if the book match and it's not in the watch list already, the system safely adds the book.
It can also alter by not adding it and declaring it false. */
function deleteWatchlistItem(targetIndex) {
  bookWatchlist.splice(targetIndex, 1);
  localStorage.setItem("book_watchlist_cache", JSON.stringify(bookWatchlist));
  renderWatchlistDOM();
  if (activeBookMatch && !bookWatchlist.includes(activeBookMatch.title)) {
    document.getElementById('btn-save').innerText = "➕ Add to My List";
    document.getElementById('btn-save').disabled = false;
  }
}

// Ensures that the main HTML file links both data and to book.js/books-data.js at the bottom
function clearWatchlistCache() {
  bookWatchlist = [];
  localStorage.removeItem("book_watchlist_cache");
  renderWatchlistDOM();
  if (activeBookMatch) {
    document.getElementById('btn-save').innerText = "➕ Add to My List";
    document.getElementById('btn-save').disabled = false;
  }
}
/* After the user is done matching, the game restarts again. 
It starts back from square 1 where the user can pick a different mood and setting.
However, the user can also safely store their new book in their watch list. */
function resetGame() {
  userSelections = { mood: '', setting: '' };
  document.getElementById('book-cover').src = ""; 
  transitionScreen('screen-result', 'screen-mood');
}
