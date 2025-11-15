document.addEventListener("DOMContentLoaded", () => {

  /* --- SIDEBAR / NAVBAR LOGIC --- */
  const hamburger = document.getElementById('hamburger-icon');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  const mainAvatar = document.getElementById('mainAvatar');

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-active');
    mainContent.classList.toggle('shifted');
  });

  // Load avatar
  const savedAvatar = localStorage.getItem('profileImage');
  if (savedAvatar) mainAvatar.src = savedAvatar;

  // Highlight active link
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar-nav a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.parentElement.classList.add("active-link");
    }
  });


  /* --- SEARCH FUNCTIONALITY --- */
  const allIdeas = JSON.parse(localStorage.getItem("ideas")) || [];
  const searchInput = document.getElementById("idea-search-input");
  const resultsContainer = document.getElementById("search-results");
  const dropdown = document.getElementById("search-dropdown");

  // Load previous searches
  let previousSearches = JSON.parse(localStorage.getItem("previousSearches")) || [];

  // Render ideas
  function renderIdeas(ideas) {
    if (!ideas.length) {
      resultsContainer.innerHTML = `<p class="search-info">No ideas found.</p>`;
      return;
    }

    resultsContainer.innerHTML = ideas.map(idea => `
      <div class="result-card">
        <h3>${idea.title}</h3>
        <p>Category: ${idea.category}</p>
        <p>Date: ${idea.date}</p>
        <p>${idea.text}</p>
      </div>
    `).join("");
  }

  // Show previous searches dropdown
  function showDropdown(filteredList) {
    dropdown.innerHTML = filteredList.map(item => `<li>${item}</li>`).join('');
    dropdown.style.display = filteredList.length ? 'block' : 'none';
  }

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Main search function
  function searchIdeas() {
    const query = searchInput.value.toLowerCase().trim();

    // Filter ideas based on input
    const filteredIdeas = allIdeas.filter(idea =>
      idea.title.toLowerCase().includes(query)
    );

    // Show filtered ideas
    renderIdeas(filteredIdeas);

    // Filter previous searches for dropdown
    const filteredPrev = previousSearches.filter(item =>
      item.toLowerCase().includes(query)
    );
    showDropdown(filteredPrev);
  }

  // Save search on Enter
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query && !previousSearches.includes(query)) {
        previousSearches.push(query);
        localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
      }
      dropdown.style.display = 'none'; // hide dropdown after enter
      searchIdeas();
      searchInput.value = ''; // clear input like Google
    }
  });

  // Search as user types
  searchInput.addEventListener("input", searchIdeas);

  // Click on dropdown item to populate input
  dropdown.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      searchInput.value = e.target.textContent;
      searchIdeas();
      dropdown.style.display = 'none';
    }
  });
});
