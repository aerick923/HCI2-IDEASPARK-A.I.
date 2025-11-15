/* =============================
   viewIdeaList.js
   - integrates navbar toggle & avatar load (from mainpage.js)
   - keeps full idea listing + filters + edit/delete/pin/save
   - fixes filtered-index bug so operations map to original array
   ============================= */

const ideasContainer = document.getElementById("ideasContainer");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

// NAVBAR ELEMENTS (integrated safely)
const hamburger = document.getElementById("hamburger-icon");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

// Sidebar toggle behavior (same as mainpage)
if (hamburger && sidebar && mainContent) {
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-active");
    mainContent.classList.toggle("shifted");
  });
}

// Load saved avatar (if present)
const mainAvatar = document.getElementById("mainAvatar");
if (mainAvatar) {
  const savedAvatarMain = localStorage.getItem("profileImage");
  mainAvatar.src = savedAvatarMain || mainAvatar.src || "IMAGES/default-avatar.png";
}

// Highlight active link in sidebar (safe guard if no nav)
(function highlightActiveNav() {
  try {
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar-nav a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.parentElement.classList.add("active-link");
      } else {
        link.parentElement.classList.remove("active-link");
      }
    });
  } catch (e) {
    // ignore if sidebar not present
  }
})();

// Load ideas from localStorage
let ideas = JSON.parse(localStorage.getItem("ideas")) || [];

/* ---------- Render ---------- */
/* Important: when filtering we need to keep track of the original index in `ideas`
   so edit/delete/pin operate on the correct stored item. */
function renderIdeas() {
  ideasContainer.innerHTML = "";

  // Category filtering
  let filteredIdeas = ideas.map((idea, idx) => ({ idea, idx })); // keep original index
  const selectedCategory = (categorySelect && categorySelect.value) ? categorySelect.value : "all";
  if (selectedCategory !== "all") {
    filteredIdeas = filteredIdeas.filter(entry => entry.idea.category.toLowerCase() === selectedCategory);
  }

  // Sorting on the filtered list (by values only)
  const sortValue = (sortSelect && sortSelect.value) ? sortSelect.value : "default";
  if (sortValue === "date") {
    filteredIdeas.sort((a, b) => new Date(a.idea.date || 0) - new Date(b.idea.date || 0));
  } else if (sortValue === "az") {
    filteredIdeas.sort((a, b) => a.idea.title.localeCompare(b.idea.title));
  } else if (sortValue === "za") {
    filteredIdeas.sort((a, b) => b.idea.title.localeCompare(a.idea.title));
  } else if (sortValue === "pinned") {
    filteredIdeas.sort((a, b) => (b.idea.pinned === true) - (a.idea.pinned === true));
  }

  // Render each card and attach original index as data-index
  filteredIdeas.forEach(({ idea, idx: originalIndex }) => {
    const card = document.createElement("div");
    card.classList.add("idea-card");

    if (idea.pinned) card.classList.add("pinned");

    // map category -> class
    const cat = (idea.category || "").toLowerCase();
    if (cat === "music") card.classList.add("music-bg");
    else if (cat === "work") card.classList.add("work-bg");
    else if (cat === "personal") card.classList.add("personal-bg");
    else if (cat === "hobby") card.classList.add("hobby-bg");

    // sanitize values for inserting into value attributes (basic)
    const safeTitle = (idea.title || "").replace(/"/g, "&quot;");
    const safeText = (idea.text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    card.innerHTML = `
      <input type="text" value="${safeTitle}" class="idea-title" ${idea.editing ? "" : "readonly"}>
      <textarea class="idea-text" ${idea.editing ? "" : "readonly"}>${safeText}</textarea>
      <p><strong>Category:</strong> ${idea.category || "—"}</p>
      <p><strong>Date:</strong> ${idea.date || "No date"}</p>
      <div class="button-group">
        ${idea.editing ? `<button class="save-btn" data-index="${originalIndex}">Save</button>` : `<button class="edit-btn" data-index="${originalIndex}">Edit</button>`}
        <button class="delete-btn" data-index="${originalIndex}">Delete</button>
        <button class="pin-btn" data-index="${originalIndex}">${idea.pinned ? "Unpin" : "Pin"}</button>
      </div>
    `;
    ideasContainer.appendChild(card);
  });

  attachEventListeners();
}

/* ---------- Event Handlers ---------- */
function attachEventListeners() {
  // Edit
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = (e) => {
      const i = Number(e.currentTarget.dataset.index);
      if (!Number.isNaN(i) && ideas[i]) {
        ideas[i].editing = true;
        renderIdeas();
      }
    };
  });

  // Save
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.onclick = (e) => {
      const i = Number(e.currentTarget.dataset.index);
      const card = e.currentTarget.closest(".idea-card");
      const newTitle = card.querySelector(".idea-title").value.trim();
      const newText = card.querySelector(".idea-text").value.trim();
      if (newTitle && newText && !Number.isNaN(i) && ideas[i]) {
        ideas[i].title = newTitle;
        ideas[i].text = newText;
        ideas[i].editing = false;
        saveIdeas();
        renderIdeas();
      } else {
        alert("Title and idea text cannot be empty!");
      }
    };
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = (e) => {
      const i = Number(e.currentTarget.dataset.index);
      if (!Number.isNaN(i) && ideas[i]) {
        if (confirm("Delete this idea?")) {
          ideas.splice(i, 1);
          saveIdeas();
          renderIdeas();
        }
      }
    };
  });

  // Pin
  document.querySelectorAll(".pin-btn").forEach(btn => {
    btn.onclick = (e) => {
      const i = Number(e.currentTarget.dataset.index);
      if (!Number.isNaN(i) && ideas[i]) {
        ideas[i].pinned = !ideas[i].pinned;
        saveIdeas();
        renderIdeas();
      }
    };
  });
}

/* ---------- Save ---------- */
function saveIdeas() {
  localStorage.setItem("ideas", JSON.stringify(ideas));
}

/* ---------- Filters: category color + events ---------- */
function updateCategoryDropdownColor() {
  if (!categorySelect) return;
  const selectedOption = categorySelect.options[categorySelect.selectedIndex];
  const color = selectedOption ? selectedOption.dataset.color || "#777" : "#777";
  categorySelect.style.backgroundColor = color;
  categorySelect.style.color = "#fff";
}

if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    updateCategoryDropdownColor();
    renderIdeas();
  });
}
if (sortSelect) {
  sortSelect.addEventListener("change", () => renderIdeas());
}

/* ---------- Init ---------- */
updateCategoryDropdownColor();
renderIdeas();
