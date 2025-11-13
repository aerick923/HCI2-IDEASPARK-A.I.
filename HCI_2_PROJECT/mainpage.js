// Sidebar toggle
const hamburger = document.getElementById("hamburger-icon");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("sidebar-active");
  mainContent.classList.toggle("shifted");
});

// Load saved avatar
const mainAvatar = document.getElementById("mainAvatar");
const savedAvatarMain = localStorage.getItem("profileImage");
mainAvatar.src = savedAvatarMain || "IMAGES/default-avatar.png";

// Highlight current page
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".sidebar-nav a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.parentElement.classList.add("active-link");
  }
});

// Custom Alert
const customAlert = document.getElementById("customAlert");
const alertBox = document.querySelector(".alert-box");
const alertOkBtn = document.getElementById("alertOkBtn");
alertOkBtn.addEventListener("click", () => (customAlert.style.display = "none"));

function showAlert(title, message) {
  alertBox.querySelector("h3").textContent = title;
  alertBox.querySelector("p").textContent = message;
  customAlert.style.display = "flex";
}

// Elements
const submitButton = document.querySelector(".submit-button");
const textarea = document.getElementById("ideaText");
const categorySelect = document.getElementById("categorySelect");
const ideaTitle = document.getElementById("ideaTitle");
const ideaDate = document.getElementById("ideaDate");

// Block writing without title
textarea.addEventListener("focus", () => {
  if (!ideaTitle.value.trim()) {
    showAlert("⚠️ Reminder", "Please enter a title before writing your idea!");
    textarea.blur();
  }
});

// Handle submission
submitButton.addEventListener("click", () => {
  const title = ideaTitle.value.trim();
  const ideaText = textarea.value.trim();
  const category = categorySelect.value;
  const date = ideaDate.value;

  if (!title) {
    showAlert("⚠️ Missing Title", "Please enter a title before submitting!");
    return;
  }

  if (!ideaText) {
    showAlert("⚠️ Missing Idea", "Please write your idea before submitting!");
    return;
  }

  let ideas = JSON.parse(localStorage.getItem("ideas")) || [];
  ideas.push({ title, text: ideaText, category, date, pinned: false });
  localStorage.setItem("ideas", JSON.stringify(ideas));

  showAlert("✅ Success", "Your idea has been submitted successfully!");
  ideaTitle.value = "";
  textarea.value = "";
  categorySelect.value = "music";
  ideaDate.value = "";
});
