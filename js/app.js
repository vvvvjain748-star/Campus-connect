/**
 * Campus Connect - Main Application Logic & Interactive State Management
 * Software Engineering Lab Project
 */

// Application State
let currentUser = null;
let currentView = "home";
let currentProfileSubtab = "connections";
let selectedPhotoData = null;

// DOM Ready initialization
document.addEventListener("DOMContentLoaded", () => {
  initUserSession();
  setupNavigation();
  setupRoleSwitcher();
  setupEventListeners();
  renderCurrentView();
});

/* ==========================================================================
   User & Session Management
   ========================================================================== */
function initUserSession() {
  const isLoggedOut = localStorage.getItem("cc_logged_out") === "true";
  const currentUserId = localStorage.getItem("cc_current_user_id");
  const users = getStorageData("cc_users");

  if (isLoggedOut && !currentUserId) {
    window.location.href = "login.html";
    return;
  }

  if (!currentUserId || !users.some(u => u.id === currentUserId)) {
    // If not logged in or opening fresh, default to student 1
    const defaultUser = users[0] || DEFAULT_USERS[0];
    localStorage.setItem("cc_current_user_id", defaultUser.id);
    currentUser = defaultUser;
  } else {
    currentUser = users.find(u => u.id === currentUserId);
  }

  updateNavUserUI();
}

function getStorageData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Storage read error for key: " + key, e);
    return [];
  }
}

function setStorageData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function updateNavUserUI() {
  const roleSelect = document.getElementById("navRoleSwitcher");
  if (roleSelect) {
    roleSelect.value = currentUser.id;
  }

  const adminNavLink = document.getElementById("navLinkAdmin");
  if (adminNavLink) {
    // Display admin panel link if current user is admin, or keep it visible with an indicator
    adminNavLink.style.display = currentUser.role === "admin" ? "block" : "none";
  }

  const mentorshipNavLink = document.getElementById("navLinkMentorship");
  if (mentorshipNavLink) {
    mentorshipNavLink.textContent = currentUser.role === "faculty" ? "Mentorship (Faculty)" : "Mentorship";
  }
}

function setupRoleSwitcher() {
  const roleSelect = document.getElementById("navRoleSwitcher");
  if (!roleSelect) return;

  const users = getStorageData("cc_users");
  roleSelect.innerHTML = "";

  users.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.id;
    const roleIcon = user.role === "admin" ? "⚙️ Admin" : (user.role === "faculty" ? "👩‍🏫 Faculty" : "👨‍🎓 Student");
    opt.textContent = `${user.name} (${roleIcon})`;
    if (user.id === currentUser.id) opt.selected = true;
    roleSelect.appendChild(opt);
  });

  roleSelect.addEventListener("change", (e) => {
    const newUserId = e.target.value;
    localStorage.setItem("cc_current_user_id", newUserId);
    initUserSession();
    showToast(`Switched active profile to ${currentUser.name} (${currentUser.role.toUpperCase()})`);
    renderCurrentView();
  });
}

function handleLogout() {
  localStorage.setItem("cc_logged_out", "true");
  localStorage.removeItem("cc_current_user_id");
  window.location.href = "login.html";
}

/* ==========================================================================
   Navigation & Routing
   ========================================================================== */
function setupNavigation() {
  const links = document.querySelectorAll(".nav-link[data-view]");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.getAttribute("data-view");
      navigateTo(targetView);
    });
  });

  // Handle URL Hash if present
  const hash = window.location.hash.replace("#", "");
  if (hash && ["home", "events", "groups", "profile", "admin", "mentorship"].includes(hash)) {
    navigateTo(hash);
  }
}

function navigateTo(viewName) {
  currentView = viewName;
  window.location.hash = viewName;

  // Update active state on nav links
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("data-view") === viewName) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Hide all sections, display the active one
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.add("active");
  }

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCurrentView() {
  switch (currentView) {
    case "home":
      renderHomeFeed();
      break;
    case "events":
      renderEventsView();
      break;
    case "groups":
      renderGroupsView();
      break;
    case "profile":
      renderProfileView();
      break;
    case "admin":
      renderAdminView();
      break;
    case "mentorship":
      renderMentorshipView();
      break;
    default:
      renderHomeFeed();
  }
}

/* ==========================================================================
   HOME & FEED LOGIC
   ========================================================================== */
function renderHomeFeed() {
  renderSidebarProfileWidget();
  renderSidebarUpcomingEvents();
  renderPostsStream();

  // Configure Post Creator for Faculty/Admin
  const facultyNoticeCheckWrap = document.getElementById("facultyNoticeWrap");
  if (facultyNoticeCheckWrap) {
    facultyNoticeCheckWrap.style.display = (currentUser.role === "faculty" || currentUser.role === "admin") ? "flex" : "none";
  }
}

function renderSidebarProfileWidget() {
  const avatarElem = document.getElementById("sideProfileAvatar");
  const nameElem = document.getElementById("sideProfileName");
  const deptElem = document.getElementById("sideProfileDept");
  const connsElem = document.getElementById("sideProfileConns");
  const postsElem = document.getElementById("sideProfilePosts");

  if (!avatarElem) return;

  avatarElem.textContent = currentUser.avatar;
  avatarElem.style.backgroundColor = currentUser.avatarBg;
  nameElem.textContent = currentUser.name;
  deptElem.textContent = `${currentUser.department} ${currentUser.year ? "· " + currentUser.year : ""}`;
  
  // Dynamic posts count
  const posts = getStorageData("cc_posts");
  const userPostsCount = posts.filter(p => p.userId === currentUser.id).length;
  connsElem.textContent = currentUser.connectionsCount || 0;
  postsElem.textContent = userPostsCount;
}

function renderSidebarUpcomingEvents() {
  const container = document.getElementById("sideEventsList");
  if (!container) return;

  const events = getStorageData("cc_events");
  const upcoming = events.filter(e => e.status === "Upcoming").slice(0, 2);

  if (upcoming.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No upcoming events scheduled.</p>`;
    return;
  }

  container.innerHTML = upcoming.map(evt => `
    <div class="widget-event-item" onclick="navigateTo('events')">
      <div class="widget-date-badge">${evt.date}</div>
      <div class="widget-event-info">
        <div class="evt-name">${escapeHTML(evt.title)}</div>
        <div class="evt-loc">${escapeHTML(evt.location)}</div>
      </div>
    </div>
  `).join("");
}

function renderPostsStream() {
  const streamContainer = document.getElementById("postsStream");
  if (!streamContainer) return;

  const posts = getStorageData("cc_posts");

  if (posts.length === 0) {
    streamContainer.innerHTML = `
      <div class="post-card" style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
        <p>No campus updates yet. Be the first to share something!</p>
      </div>
    `;
    return;
  }

  streamContainer.innerHTML = posts.map(post => {
    const isLiked = (post.likedBy || []).includes(currentUser.id);
    const canDelete = currentUser.role === "admin" || post.userId === currentUser.id;
    const roleBadgeClass = post.authorRole.toLowerCase();

    return `
      <div class="post-card ${post.isAnnouncement ? 'announcement' : ''}" id="postCard-${post.id}">
        <div class="post-header">
          <div class="post-author-box">
            <div class="author-avatar" style="background-color: ${post.authorBg || '#4f46e5'}">
              ${post.authorAvatar || post.authorName.substring(0, 2).toUpperCase()}
            </div>
            <div class="author-meta">
              <div class="author-name-row">
                <span class="author-name">${escapeHTML(post.authorName)}</span>
                <span class="author-badge ${roleBadgeClass}">${post.authorRole}</span>
                ${post.isAnnouncement ? `<span class="faculty-badge-pill">📢 Notice</span>` : ''}
              </div>
              <div class="post-time">${post.timestamp} ${post.authorDept ? `· ${escapeHTML(post.authorDept)}` : ''}</div>
            </div>
          </div>
          ${canDelete ? `
            <button class="post-delete-btn" title="Delete post" onclick="deletePost('${post.id}')">
              🗑️
            </button>
          ` : ''}
        </div>

        <div class="post-body">${escapeHTML(post.content)}</div>

        ${post.photo ? `
          <div style="margin-bottom: 14px; border-radius: 8px; overflow: hidden; max-height: 320px;">
            <img src="${post.photo}" alt="Post image" style="width: 100%; object-fit: cover;">
          </div>
        ` : ''}

        <div class="post-footer-actions">
          <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
            <span>${isLiked ? '❤️' : '🤍'}</span>
            <span>Like (${post.likes || 0})</span>
          </button>
          <button class="action-btn" onclick="toggleComments('${post.id}')">
            <span>💬</span>
            <span>Comment (${(post.comments || []).length})</span>
          </button>
        </div>

        <!-- Comments Accordion -->
        <div class="comments-container" id="commentsBox-${post.id}">
          <div class="comments-list" id="commentsList-${post.id}">
            ${(post.comments || []).map(c => `
              <div class="comment-bubble">
                <span class="comment-author">${escapeHTML(c.author)}:</span>
                <span>${escapeHTML(c.text)}</span>
                <span class="comment-time">${c.timestamp || 'just now'}</span>
              </div>
            `).join("")}
          </div>
          <div class="comment-input-box">
            <input type="text" class="comment-input" id="inputComment-${post.id}" placeholder="Write a reply..." onkeydown="handleCommentKey(event, '${post.id}')">
            <button class="btn-primary btn-send-comment" onclick="addComment('${post.id}')">Send</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function handleCreatePost() {
  const input = document.getElementById("postInput");
  const content = input.value.trim();

  if (!content) {
    showToast("Please enter something to post!");
    return;
  }

  const isNoticeCheckbox = document.getElementById("postAsNotice");
  const isAnnouncement = isNoticeCheckbox && isNoticeCheckbox.checked && (currentUser.role === "faculty" || currentUser.role === "admin");

  const posts = getStorageData("cc_posts");
  const newPost = {
    id: "post_" + Date.now(),
    userId: currentUser.id,
    authorName: currentUser.name,
    authorRole: currentUser.role === "faculty" ? "Faculty" : (currentUser.role === "admin" ? "Admin" : "Student"),
    authorDept: currentUser.department,
    authorAvatar: currentUser.avatar,
    authorBg: currentUser.avatarBg,
    content: content,
    timestamp: "Just now",
    likes: 0,
    likedBy: [],
    comments: [],
    photo: selectedPhotoData || null,
    isAnnouncement: isAnnouncement
  };

  posts.unshift(newPost);
  setStorageData("cc_posts", posts);

  // Clear inputs
  input.value = "";
  selectedPhotoData = null;
  const photoPreview = document.getElementById("postPhotoPreview");
  if (photoPreview) photoPreview.innerHTML = "";
  if (isNoticeCheckbox) isNoticeCheckbox.checked = false;

  showToast("Your post has been published to Campus Connect!");
  renderCurrentView();
}

function toggleLike(postId) {
  const posts = getStorageData("cc_posts");
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (!post.likedBy) post.likedBy = [];

  const index = post.likedBy.indexOf(currentUser.id);
  if (index > -1) {
    post.likedBy.splice(index, 1);
    post.likes = Math.max(0, (post.likes || 1) - 1);
  } else {
    post.likedBy.push(currentUser.id);
    post.likes = (post.likes || 0) + 1;
  }

  setStorageData("cc_posts", posts);
  renderPostsStream();
}

function toggleComments(postId) {
  const box = document.getElementById(`commentsBox-${postId}`);
  if (box) {
    box.classList.toggle("show");
  }
}

function handleCommentKey(e, postId) {
  if (e.key === "Enter") {
    addComment(postId);
  }
}

function addComment(postId) {
  const input = document.getElementById(`inputComment-${postId}`);
  const text = input.value.trim();
  if (!text) return;

  const posts = getStorageData("cc_posts");
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (!post.comments) post.comments = [];

  post.comments.push({
    id: "c_" + Date.now(),
    author: currentUser.name,
    text: text,
    timestamp: "Just now"
  });

  setStorageData("cc_posts", posts);
  input.value = "";
  renderPostsStream();
  // Keep comments box open
  const box = document.getElementById(`commentsBox-${postId}`);
  if (box) box.classList.add("show");
}

function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  let posts = getStorageData("cc_posts");
  posts = posts.filter(p => p.id !== postId);
  setStorageData("cc_posts", posts);
  showToast("Post deleted successfully.");
  renderCurrentView();
}

function handleAttachPhoto() {
  const fileInput = document.getElementById("postPhotoInput");
  if (fileInput) fileInput.click();
}

function handlePhotoSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (uploadEvent) => {
    selectedPhotoData = uploadEvent.target.result;
    const preview = document.getElementById("postPhotoPreview");
    if (preview) {
      preview.innerHTML = `
        <div style="position: relative; display: inline-block; margin-top: 10px;">
          <img src="${selectedPhotoData}" style="max-height: 120px; border-radius: 8px;">
          <button type="button" onclick="removePhotoPreview()" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer;">✕</button>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
}

function removePhotoPreview() {
  selectedPhotoData = null;
  const preview = document.getElementById("postPhotoPreview");
  if (preview) preview.innerHTML = "";
  const fileInput = document.getElementById("postPhotoInput");
  if (fileInput) fileInput.value = "";
}

/* ==========================================================================
   COLLEGE EVENTS LOGIC
   ========================================================================== */
function renderEventsView() {
  const events = getStorageData("cc_events");
  const registrations = getStorageData("cc_event_registrations");

  // Create Event button: only for Faculty & Admin
  const btnCreate = document.getElementById("btnOpenCreateEvent");
  if (btnCreate) {
    btnCreate.style.display = (currentUser.role === "faculty" || currentUser.role === "admin") ? "inline-block" : "none";
  }

  // Student Registrations tracker button
  const myRegCount = registrations.filter(r => r.studentId === currentUser.id).length;
  const btnMyRegs = document.getElementById("btnMyEventRegistrations");
  if (btnMyRegs) {
    btnMyRegs.style.display = (currentUser.role === "student") ? "inline-block" : "none";
    btnMyRegs.textContent = `📋 My Event Applications (${myRegCount})`;
  }

  const upcomingGrid = document.getElementById("eventsGridUpcoming");
  const ongoingGrid = document.getElementById("eventsGridOngoing");
  const completedGrid = document.getElementById("eventsGridCompleted");

  const upcoming = events.filter(e => e.status === "Upcoming");
  const ongoing = events.filter(e => e.status === "Ongoing");
  const completed = events.filter(e => e.status === "Completed");

  if (upcomingGrid) upcomingGrid.innerHTML = renderEventCards(upcoming);
  if (ongoingGrid) ongoingGrid.innerHTML = renderEventCards(ongoing);
  if (completedGrid) completedGrid.innerHTML = renderEventCards(completed);
}

function renderEventCards(eventList) {
  if (eventList.length === 0) {
    return `<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.9rem; padding: 12px 0;">No events in this category.</div>`;
  }

  const allRegistrations = getStorageData("cc_event_registrations");
  const isOrganizerOrAdmin = currentUser.role === "admin" || currentUser.role === "faculty";

  return eventList.map(evt => {
    const eventRegistrations = allRegistrations.filter(r => r.eventId === evt.id);
    const myReg = allRegistrations.find(r => r.eventId === evt.id && r.studentId === currentUser.id);
    const canManage = currentUser.role === "admin" || (currentUser.role === "faculty" && (evt.organizer || '').includes(currentUser.name));

    return `
      <div class="event-card">
        <div>
          <div class="event-card-header">
            <span class="event-date-text">${evt.date}</span>
            <span class="event-tag-badge">${escapeHTML(evt.category || 'General')}</span>
          </div>
          <h3 class="event-title">${escapeHTML(evt.title)}</h3>
          <p class="event-desc">${escapeHTML(evt.description)}</p>
        </div>
        
        <div class="event-meta-footer">
          <div class="event-loc-time">
            <span>📍 ${escapeHTML(evt.location)}</span> · <span>${escapeHTML(evt.time)}</span>
          </div>
          
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${evt.status !== "Completed" ? `
              <!-- Faculty & Admin Registration Manager -->
              ${isOrganizerOrAdmin ? `
                <button class="btn-rsvp" style="background: var(--primary-light); color: var(--primary); border-color: var(--primary);" onclick="openEventRegistrationsModal('${evt.id}')">
                  📋 Registrations (${eventRegistrations.length})
                </button>
              ` : `
                <!-- Student Interactive Application Workflow -->
                ${!myReg ? `
                  <button class="btn-rsvp" onclick="registerForEvent('${evt.id}')">
                    Apply / RSVP (${evt.attendees || 0})
                  </button>
                ` : myReg.status === 'Pending' ? `
                  <span class="badge-status badge-pending">⏳ Pending Review</span>
                  <button class="btn-table-action" onclick="withdrawEventRegistration('${myReg.id}')">Withdraw</button>
                ` : myReg.status === 'Approved' ? `
                  <span class="badge-status badge-approved">✅ Approved</span>
                  <button class="btn-table-action" onclick="withdrawEventRegistration('${myReg.id}')">Cancel</button>
                ` : `
                  <span class="badge-status badge-rejected">❌ Rejected</span>
                  <button class="btn-table-action" onclick="registerForEvent('${evt.id}')">Re-apply</button>
                `}
              `}
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-light);">${evt.attendees || 0} attended</span>
            `}

            ${canManage ? `
              <button class="post-delete-btn" title="Delete event" onclick="deleteEvent('${evt.id}')">🗑️</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* Dynamic Event Registration Actions */
function registerForEvent(eventId) {
  const events = getStorageData("cc_events");
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const registrations = getStorageData("cc_event_registrations");
  const existing = registrations.find(r => r.eventId === eventId && r.studentId === currentUser.id);

  if (existing) {
    if (existing.status === "Pending") {
      showToast("Your registration is already under review!");
      return;
    }
    if (existing.status === "Approved") {
      showToast("You are already approved for this event!");
      return;
    }
    // If rejected, re-apply
    existing.status = "Pending";
    existing.appliedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } else {
    registrations.unshift({
      id: "reg_" + Date.now(),
      eventId: eventId,
      eventTitle: evt.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentRoll: currentUser.rollNo || "N/A",
      studentDept: currentUser.department,
      appliedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Pending",
      reviewNote: ""
    });
  }

  setStorageData("cc_event_registrations", registrations);
  showToast(`Application submitted for "${evt.title}"! Awaiting approval.`);
  renderEventsView();
}

function withdrawEventRegistration(regId) {
  if (!confirm("Are you sure you want to withdraw your event application?")) return;
  let registrations = getStorageData("cc_event_registrations");
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  if (reg.status === "Approved") {
    let events = getStorageData("cc_events");
    let evt = events.find(e => e.id === reg.eventId);
    if (evt && evt.attendees > 0) {
      evt.attendees -= 1;
      setStorageData("cc_events", events);
    }
  }

  registrations = registrations.filter(r => r.id !== regId);
  setStorageData("cc_event_registrations", registrations);
  showToast("Application withdrawn successfully.");
  renderEventsView();
  closeModal("modalMyRegistrations");
}

let currentManagingEventId = null;
function openEventRegistrationsModal(eventId) {
  currentManagingEventId = eventId;
  renderEventRegistrationsModalContent();
  openModal("modalEventRegistrations");
}

function renderEventRegistrationsModalContent(statusFilter = "all") {
  const events = getStorageData("cc_events");
  const evt = events.find(e => e.id === currentManagingEventId);
  const registrations = getStorageData("cc_event_registrations");
  let eventRegistrations = registrations.filter(r => r.eventId === currentManagingEventId);

  const modalTitle = document.getElementById("eventRegModalTitle");
  const statsElem = document.getElementById("eventRegStats");
  const listElem = document.getElementById("eventRegApplicantsList");

  if (modalTitle) modalTitle.textContent = evt ? `Review Applicants: ${evt.title}` : "Event Registrations";

  const totalCount = eventRegistrations.length;
  const pendingCount = eventRegistrations.filter(r => r.status === "Pending").length;
  const approvedCount = eventRegistrations.filter(r => r.status === "Approved").length;
  const rejectedCount = eventRegistrations.filter(r => r.status === "Rejected").length;

  if (statsElem) {
    statsElem.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        <button class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; ${statusFilter==='all'?'border-color:var(--primary);color:var(--primary);font-weight:700;':''}" onclick="renderEventRegistrationsModalContent('all')">All (${totalCount})</button>
        <button class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; ${statusFilter==='Pending'?'border-color:var(--primary);color:var(--primary);font-weight:700;':''}" onclick="renderEventRegistrationsModalContent('Pending')">⏳ Pending (${pendingCount})</button>
        <button class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; ${statusFilter==='Approved'?'border-color:var(--primary);color:var(--primary);font-weight:700;':''}" onclick="renderEventRegistrationsModalContent('Approved')">✅ Approved (${approvedCount})</button>
        <button class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; ${statusFilter==='Rejected'?'border-color:var(--primary);color:var(--primary);font-weight:700;':''}" onclick="renderEventRegistrationsModalContent('Rejected')">❌ Rejected (${rejectedCount})</button>
      </div>
    `;
  }

  if (statusFilter !== "all") {
    eventRegistrations = eventRegistrations.filter(r => r.status === statusFilter);
  }

  if (listElem) {
    if (eventRegistrations.length === 0) {
      listElem.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; padding: 24px 0; text-align: center;">No student applicants found in this category.</p>`;
      return;
    }

    listElem.innerHTML = eventRegistrations.map(r => `
      <div class="applicant-item-card">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 0.96rem;">${escapeHTML(r.studentName)}</strong>
            <span class="badge-status badge-${r.status.toLowerCase()}">${r.status}</span>
          </div>
          <div style="font-size: 0.83rem; color: var(--text-muted); margin-top: 3px;">
            Roll: <strong>${escapeHTML(r.studentRoll)}</strong> · ${escapeHTML(r.studentDept)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-light); margin-top: 2px;">
            Applied: ${r.appliedDate} · ${escapeHTML(r.studentEmail)}
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          ${r.status !== 'Approved' ? `
            <button class="btn-approve" onclick="updateRegistrationStatus('${r.id}', 'Approved')">Approve ✓</button>
          ` : ''}
          ${r.status !== 'Rejected' ? `
            <button class="btn-reject" onclick="updateRegistrationStatus('${r.id}', 'Rejected')">Reject ✕</button>
          ` : ''}
        </div>
      </div>
    `).join("");
  }
}

function updateRegistrationStatus(regId, newStatus) {
  const registrations = getStorageData("cc_event_registrations");
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  const prevStatus = reg.status;
  reg.status = newStatus;
  reg.reviewedBy = currentUser.name;
  reg.reviewDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  let events = getStorageData("cc_events");
  let evt = events.find(e => e.id === reg.eventId);
  if (evt) {
    if (newStatus === "Approved" && prevStatus !== "Approved") {
      evt.attendees = (evt.attendees || 0) + 1;
    } else if (newStatus !== "Approved" && prevStatus === "Approved") {
      evt.attendees = Math.max(0, (evt.attendees || 1) - 1);
    }
    setStorageData("cc_events", events);
  }

  setStorageData("cc_event_registrations", registrations);
  showToast(`Registration for ${reg.studentName} marked as ${newStatus}!`);

  if (currentManagingEventId) {
    renderEventRegistrationsModalContent();
  }
  renderEventsView();
  if (currentView === "admin") {
    renderAdminView();
  }
}

function openMyRegistrationsModal() {
  const registrations = getStorageData("cc_event_registrations");
  const myRegs = registrations.filter(r => r.studentId === currentUser.id);
  const container = document.getElementById("myRegistrationsList");

  if (container) {
    if (myRegs.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 28px 0;">You have not registered for any events yet.</p>`;
    } else {
      container.innerHTML = myRegs.map(r => `
        <div class="applicant-item-card" style="margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="font-size: 0.98rem; font-weight: 600;">${escapeHTML(r.eventTitle)}</h4>
              <span class="badge-status badge-${r.status.toLowerCase()}">${r.status}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
              Submitted on: ${r.appliedDate}
            </div>
            ${r.reviewNote ? `<div style="font-size: 0.82rem; color: #047857; margin-top: 4px;">Review Note: ${escapeHTML(r.reviewNote)}</div>` : ''}
          </div>
          <button class="btn-table-action danger" onclick="withdrawEventRegistration('${r.id}')">Withdraw</button>
        </div>
      `).join("");
    }
  }
  openModal("modalMyRegistrations");
}

function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  let events = getStorageData("cc_events");
  events = events.filter(e => e.id !== eventId);
  setStorageData("cc_events", events);
  showToast("Event removed.");
  renderEventsView();
}

function handleCreateEventSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("evtInputTitle").value.trim();
  const category = document.getElementById("evtInputCategory").value.trim();
  const status = document.getElementById("evtInputStatus").value;
  const date = document.getElementById("evtInputDate").value.trim().toUpperCase();
  const time = document.getElementById("evtInputTime").value.trim();
  const location = document.getElementById("evtInputLocation").value.trim();
  const description = document.getElementById("evtInputDesc").value.trim();

  if (!title || !date || !location) {
    alert("Please fill all required fields.");
    return;
  }

  const events = getStorageData("cc_events");
  const newEvt = {
    id: "evt_" + Date.now(),
    title: title,
    category: category || "Campus Event",
    status: status,
    date: date,
    fullDate: date,
    time: time || "All day",
    location: location,
    description: description,
    organizer: `${currentUser.name} (${currentUser.department})`,
    attendees: 1,
    isAttending: true
  };

  events.unshift(newEvt);
  setStorageData("cc_events", events);

  closeModal("modalCreateEvent");
  showToast(`Event "${title}" published!`);
  renderEventsView();
}

/* ==========================================================================
   CLUBS & GROUPS LOGIC
   ========================================================================== */
function renderGroupsView() {
  const clubs = getStorageData("cc_clubs");
  const grid = document.getElementById("groupsGrid");
  if (!grid) return;

  const btnCreate = document.getElementById("btnOpenCreateClub");
  if (btnCreate) {
    btnCreate.style.display = (currentUser.role === "admin" || currentUser.role === "faculty") ? "inline-block" : "none";
  }

  grid.innerHTML = clubs.map(club => {
    const isJoined = club.isJoined || false;
    const canDelete = currentUser.role === "admin";

    return `
      <div class="group-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="group-tag">${escapeHTML(club.tag)}</div>
            ${canDelete ? `<button class="post-delete-btn" title="Delete club" onclick="deleteClub('${club.id}')">🗑️</button>` : ''}
          </div>
          <h3 class="group-name">${escapeHTML(club.name)}</h3>
          <p class="group-desc">${escapeHTML(club.description)}</p>
          <div style="font-size: 0.82rem; color: var(--text-light); margin-bottom: 12px;">
            <span>🗓️ ${escapeHTML(club.meetingTime || 'Weekly Meetings')}</span> · <span>📍 ${escapeHTML(club.room || 'Campus Center')}</span>
          </div>
        </div>

        <div class="group-footer">
          <span class="group-members">👥 ${club.members || 0} active members</span>
          <button class="btn-join ${isJoined ? 'joined' : ''}" onclick="toggleJoinClub('${club.id}')">
            ${isJoined ? 'Joined ✓' : 'Join Club'}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleJoinClub(clubId) {
  const clubs = getStorageData("cc_clubs");
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  club.isJoined = !club.isJoined;
  club.members = (club.members || 0) + (club.isJoined ? 1 : -1);

  setStorageData("cc_clubs", clubs);
  showToast(club.isJoined ? `Joined ${club.name}!` : `Left ${club.name}.`);
  renderGroupsView();
}

function deleteClub(clubId) {
  if (!confirm("Are you sure you want to remove this club?")) return;
  let clubs = getStorageData("cc_clubs");
  clubs = clubs.filter(c => c.id !== clubId);
  setStorageData("cc_clubs", clubs);
  showToast("Club removed.");
  renderGroupsView();
}

function handleCreateClubSubmit(e) {
  e.preventDefault();
  const tag = document.getElementById("clubInputTag").value.trim().toUpperCase();
  const name = document.getElementById("clubInputName").value.trim();
  const desc = document.getElementById("clubInputDesc").value.trim();
  const time = document.getElementById("clubInputTime").value.trim();
  const room = document.getElementById("clubInputRoom").value.trim();

  if (!tag || !name || !desc) {
    alert("Please fill in all required club details.");
    return;
  }

  const clubs = getStorageData("cc_clubs");
  const newClub = {
    id: "club_" + Date.now(),
    tag: tag,
    name: name,
    description: desc,
    lead: currentUser.name,
    members: 1,
    isJoined: true,
    meetingTime: time || "Wednesdays, 4:00 PM",
    room: room || "Main Student Activity Hall"
  };

  clubs.push(newClub);
  setStorageData("cc_clubs", clubs);

  closeModal("modalCreateClub");
  showToast(`Club "${name}" registered!`);
  renderGroupsView();
}

/* ==========================================================================
   PROFILE & CONNECTIONS LOGIC (Screenshot 1 Fidelity)
   ========================================================================== */
function renderProfileView() {
  renderProfileHero();
  setupProfileSubtabs();
  renderProfileSubtabContent();
}

function renderProfileHero() {
  const heroAvatar = document.getElementById("profileHeroAvatar");
  const heroName = document.getElementById("profileHeroName");
  const heroBadge = document.getElementById("profileHeroBadge");
  const heroDept = document.getElementById("profileHeroDept");
  const heroRoll = document.getElementById("profileHeroRoll");

  if (!heroAvatar) return;

  heroAvatar.textContent = currentUser.avatar;
  heroAvatar.style.backgroundColor = currentUser.avatarBg;
  heroName.textContent = currentUser.name;
  
  heroBadge.textContent = currentUser.role === "faculty" ? "Faculty" : (currentUser.role === "admin" ? "Admin" : "Student");
  heroBadge.className = `author-badge ${currentUser.role.toLowerCase()}`;

  heroDept.textContent = `${currentUser.department} · ${currentUser.year || 'Member'}`;
  heroRoll.textContent = currentUser.rollNo ? `ID / Roll: ${currentUser.rollNo}` : '';
}

function setupProfileSubtabs() {
  const tabs = document.querySelectorAll(".subtab-link");
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentProfileSubtab = tab.getAttribute("data-subtab");
      renderProfileSubtabContent();
    };
  });
}

function renderProfileSubtabContent() {
  document.querySelectorAll(".subtab-content").forEach(c => c.classList.remove("active"));
  const activeContent = document.getElementById(`subtab-${currentProfileSubtab}`);
  if (activeContent) activeContent.classList.add("active");

  if (currentProfileSubtab === "connections") {
    renderConnectionsList();
  } else if (currentProfileSubtab === "about") {
    renderAboutTab();
  } else if (currentProfileSubtab === "myposts") {
    renderMyPostsTab();
  }
}

function renderConnectionsList(searchQuery = "") {
  const list = document.getElementById("connectionsList");
  if (!list) return;

  const users = getStorageData("cc_users");
  // Exclude current user from their own connections directory
  let connections = users.filter(u => u.id !== currentUser.id);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    connections = connections.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      (u.facultyAdvisor && u.facultyAdvisor.toLowerCase().includes(q))
    );
  }

  if (connections.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem; padding: 20px 0;">No matching campus members found.</p>`;
    return;
  }

  list.innerHTML = connections.map(u => {
    const isFaculty = u.role === "faculty";
    const badgeText = isFaculty ? "Faculty" : (u.role === "admin" ? "Admin" : "Student");
    const badgeClass = isFaculty ? "faculty" : (u.role === "admin" ? "admin" : "student");
    const isConnected = (currentUser.connectedUserIds || []).includes(u.id);

    return `
      <div class="connection-item-card">
        <div class="connection-left">
          <div class="conn-avatar" style="background-color: ${u.avatarBg || (isFaculty ? '#10b981' : '#818cf8')}">
            ${u.avatar}
          </div>
          <div class="conn-meta">
            <h4>
              ${escapeHTML(u.name)}
              <span class="author-badge ${badgeClass}">${badgeText}</span>
            </h4>
            <div class="conn-sub">
              ${isFaculty ? `Faculty Advisor · ${escapeHTML(u.department)}` : `${escapeHTML(u.department)} · ${escapeHTML(u.year || 'Student')}`}
            </div>
            ${!isFaculty && u.facultyAdvisor ? `
              <div class="conn-advisor">Faculty Advisor: ${escapeHTML(u.facultyAdvisor)}</div>
            ` : ''}
            <div class="conn-dept">
              ${escapeHTML(u.bio || (isFaculty ? 'Supports student projects, mentoring, and department activities.' : 'Department of ' + u.department))}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn-connect ${isConnected ? 'connected' : ''}" onclick="toggleConnection('${u.id}')">
            ${isConnected ? 'Connected ✓' : '+ Connect'}
          </button>
          ${isFaculty ? `
            <button class="btn-primary" style="padding: 6px 14px; font-size: 0.85rem;" onclick="openMentorshipInquiry('${u.id}')">
              Ask Guidance
            </button>
          ` : `
            <button class="btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" onclick="showToast('Connection message sent to ${escapeHTML(u.name)}')">
              Message
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");
}

function toggleConnection(targetUserId) {
  const users = getStorageData("cc_users");
  const targetUser = users.find(u => u.id === targetUserId);
  if (!targetUser) return;

  if (!currentUser.connectedUserIds) {
    currentUser.connectedUserIds = [];
  }

  const isConnected = currentUser.connectedUserIds.includes(targetUserId);

  if (isConnected) {
    currentUser.connectedUserIds = currentUser.connectedUserIds.filter(id => id !== targetUserId);
    currentUser.connectionsCount = Math.max(0, (currentUser.connectionsCount || 1) - 1);
    showToast(`Disconnected from ${targetUser.name}.`);
  } else {
    currentUser.connectedUserIds.push(targetUserId);
    currentUser.connectionsCount = (currentUser.connectionsCount || 0) + 1;
    showToast(`Connected with ${targetUser.name}!`);
  }

  // Update in user list
  const currentIdx = users.findIndex(u => u.id === currentUser.id);
  if (currentIdx > -1) {
    users[currentIdx] = currentUser;
    setStorageData("cc_users", users);
  }

  renderSidebarProfileWidget();
  const searchInput = document.getElementById("connectionsSearchInput");
  renderConnectionsList(searchInput ? searchInput.value : "");
}

function handleConnectionsSearch(e) {
  renderConnectionsList(e.target.value);
}

function renderAboutTab() {
  const bioElem = document.getElementById("aboutBio");
  const skillsElem = document.getElementById("aboutSkills");
  const emailElem = document.getElementById("aboutEmail");
  const advisorElem = document.getElementById("aboutAdvisor");
  const deptElem = document.getElementById("aboutDept");
  const rollElem = document.getElementById("aboutRoll");
  const githubElem = document.getElementById("aboutGithub");
  const linkedinElem = document.getElementById("aboutLinkedin");

  if (bioElem) bioElem.textContent = currentUser.bio || "No bio added yet.";
  if (emailElem) emailElem.textContent = currentUser.email;
  if (advisorElem) advisorElem.textContent = currentUser.facultyAdvisor || "Not assigned";
  if (deptElem) deptElem.textContent = currentUser.department;
  if (rollElem) rollElem.textContent = currentUser.rollNo || "N/A";
  if (githubElem) githubElem.textContent = currentUser.github || "Not linked";
  if (linkedinElem) linkedinElem.textContent = currentUser.linkedin || "Not linked";

  if (skillsElem) {
    const skills = currentUser.skills || ["Computer Science", "Web Development"];
    skillsElem.innerHTML = skills.map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`).join("");
  }
}

function renderMyPostsTab() {
  const container = document.getElementById("myPostsList");
  if (!container) return;

  const posts = getStorageData("cc_posts");
  const myPosts = posts.filter(p => p.userId === currentUser.id);

  if (myPosts.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem; padding: 24px 0;">You haven't posted anything yet.</p>`;
    return;
  }

  container.innerHTML = myPosts.map(post => `
    <div class="post-card" style="margin-bottom: 16px;">
      <div class="post-header">
        <div class="post-author-box">
          <div class="author-avatar" style="background-color: ${currentUser.avatarBg}">
            ${currentUser.avatar}
          </div>
          <div class="author-meta">
            <span class="author-name">${escapeHTML(currentUser.name)}</span>
            <span class="post-time">${post.timestamp}</span>
          </div>
        </div>
        <button class="post-delete-btn" onclick="deletePost('${post.id}')" title="Delete post">🗑️</button>
      </div>
      <div class="post-body">${escapeHTML(post.content)}</div>
      <div class="post-footer-actions">
        <span>❤️ ${post.likes || 0} Likes</span>
        <span>💬 ${(post.comments || []).length} Comments</span>
      </div>
    </div>
  `).join("");
}

function openEditProfileModal() {
  document.getElementById("editProfileName").value = currentUser.name || "";
  document.getElementById("editProfileDept").value = currentUser.department || "";
  document.getElementById("editProfileAdvisor").value = currentUser.facultyAdvisor || "";
  document.getElementById("editProfileBio").value = currentUser.bio || "";
  document.getElementById("editProfileSkills").value = (currentUser.skills || []).join(", ");
  document.getElementById("editProfileGithub").value = currentUser.github || "";
  document.getElementById("editProfileLinkedin").value = currentUser.linkedin || "";

  const avatarBgSelect = document.getElementById("editProfileAvatarBg");
  if (avatarBgSelect && currentUser.avatarBg) {
    avatarBgSelect.value = currentUser.avatarBg;
  }

  openModal("modalEditProfile");
}

function handleEditProfileSubmit(e) {
  e.preventDefault();
  currentUser.name = document.getElementById("editProfileName").value.trim();
  currentUser.department = document.getElementById("editProfileDept").value.trim();
  currentUser.facultyAdvisor = document.getElementById("editProfileAdvisor").value.trim();
  currentUser.bio = document.getElementById("editProfileBio").value.trim();
  currentUser.github = document.getElementById("editProfileGithub").value.trim();
  currentUser.linkedin = document.getElementById("editProfileLinkedin").value.trim();

  const avatarBgSelect = document.getElementById("editProfileAvatarBg");
  if (avatarBgSelect) {
    currentUser.avatarBg = avatarBgSelect.value;
  }

  const initials = currentUser.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || currentUser.avatar;
  currentUser.avatar = initials;

  const skillsRaw = document.getElementById("editProfileSkills").value;
  currentUser.skills = skillsRaw.split(",").map(s => s.trim()).filter(Boolean);

  // Update in user list
  const users = getStorageData("cc_users");
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx > -1) {
    users[idx] = currentUser;
    setStorageData("cc_users", users);
  }

  closeModal("modalEditProfile");
  showToast("Profile details updated successfully!");
  updateNavUserUI();
  setupRoleSwitcher();
  renderProfileView();
  renderSidebarProfileWidget();
}

/* ==========================================================================
   FACULTY MENTORSHIP & INQUIRIES SYSTEM
   ========================================================================== */
function renderMentorshipView() {
  const container = document.getElementById("mentorshipContent");
  if (!container) return;

  const inquiries = getStorageData("cc_inquiries");

  if (currentUser.role === "faculty") {
    // Faculty sees inquiries addressed to them
    const myInquiries = inquiries.filter(i => i.facultyId === currentUser.id);

    container.innerHTML = `
      <div class="connections-section-card">
        <div class="connections-header">
          <h3>Faculty Mentorship Portal</h3>
          <p>Review student academic consultation requests, project ideas, and SE Lab guidance inquiries.</p>
        </div>

        ${myInquiries.length === 0 ? `
          <p style="color: var(--text-muted); font-size: 0.95rem; padding: 20px 0;">No active student inquiries right now.</p>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${myInquiries.map(inq => `
              <div class="connection-item-card" style="flex-direction: column; align-items: stretch;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="font-size: 1.05rem; font-weight: 600;">${escapeHTML(inq.subject)}</h4>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                      From: <strong>${escapeHTML(inq.studentName)}</strong> (${escapeHTML(inq.studentEmail)}) · Date: ${inq.date}
                    </div>
                  </div>
                  <span class="author-badge ${inq.status === 'Approved' ? 'faculty' : 'student'}">${inq.status}</span>
                </div>

                <div style="font-size: 0.92rem; background: var(--bg-page); padding: 12px; border-radius: 8px; margin: 12px 0;">
                  ${escapeHTML(inq.message)}
                </div>

                ${inq.reply ? `
                  <div style="font-size: 0.9rem; color: #047857; background: #ecfdf5; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px;">
                    <strong>Your Response:</strong> ${escapeHTML(inq.reply)}
                  </div>
                ` : `
                  <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <input type="text" id="replyInput-${inq.id}" class="form-input" placeholder="Type your advice / appointment response...">
                    <button class="btn-primary" onclick="replyToInquiry('${inq.id}')">Reply & Approve</button>
                  </div>
                `}
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
  } else {
    // Student sees their inquiries + button to ask a faculty member
    const studentInquiries = inquiries.filter(i => i.studentId === currentUser.id);

    container.innerHTML = `
      <div class="connections-section-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div class="connections-header" style="margin-bottom: 0;">
            <h3>Student Mentorship & Guidance Requests</h3>
            <p>Connect with professors for lab project reviews, thesis advice, and academic support.</p>
          </div>
          <button class="btn-primary" onclick="openMentorshipInquiry()">➕ New Inquiry</button>
        </div>

        ${studentInquiries.length === 0 ? `
          <div style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
            <p>You haven't sent any mentorship inquiries yet.</p>
            <button class="btn-primary" style="margin-top: 12px;" onclick="openMentorshipInquiry()">Request Guidance</button>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${studentInquiries.map(inq => `
              <div class="connection-item-card" style="flex-direction: column; align-items: stretch;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="font-size: 1.05rem; font-weight: 600;">${escapeHTML(inq.subject)}</h4>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                      Advisor: <strong>${escapeHTML(inq.facultyName)}</strong> · Date: ${inq.date}
                    </div>
                  </div>
                  <span class="author-badge ${inq.status === 'Approved' ? 'faculty' : 'student'}">${inq.status}</span>
                </div>

                <div style="font-size: 0.92rem; background: var(--bg-page); padding: 12px; border-radius: 8px; margin: 12px 0;">
                  ${escapeHTML(inq.message)}
                </div>

                ${inq.reply ? `
                  <div style="font-size: 0.9rem; color: #047857; background: #ecfdf5; padding: 10px 14px; border-radius: 8px;">
                    <strong>Faculty Response:</strong> ${escapeHTML(inq.reply)}
                  </div>
                ` : `
                  <div style="font-size: 0.85rem; color: var(--text-light); font-style: italic;">
                    Waiting for faculty advisor review...
                  </div>
                `}
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
  }
}

function openMentorshipInquiry(preselectedFacultyId = null) {
  const select = document.getElementById("inquiryFacultySelect");
  if (!select) return;

  const users = getStorageData("cc_users");
  const facultyList = users.filter(u => u.role === "faculty");

  select.innerHTML = facultyList.map(f => `
    <option value="${f.id}" ${preselectedFacultyId === f.id ? 'selected' : ''}>
      ${f.name} (${f.department})
    </option>
  `).join("");

  openModal("modalMentorshipInquiry");
}

function handleMentorshipInquirySubmit(e) {
  e.preventDefault();
  const facultyId = document.getElementById("inquiryFacultySelect").value;
  const subject = document.getElementById("inquirySubject").value.trim();
  const message = document.getElementById("inquiryMessage").value.trim();

  if (!subject || !message) {
    alert("Please enter subject and message.");
    return;
  }

  const users = getStorageData("cc_users");
  const faculty = users.find(u => u.id === facultyId);

  const inquiries = getStorageData("cc_inquiries");
  inquiries.unshift({
    id: "inq_" + Date.now(),
    studentId: currentUser.id,
    studentName: currentUser.name,
    studentEmail: currentUser.email,
    facultyId: facultyId,
    facultyName: faculty ? faculty.name : "Faculty Member",
    subject: subject,
    message: message,
    status: "Pending",
    reply: null,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  });

  setStorageData("cc_inquiries", inquiries);
  closeModal("modalMentorshipInquiry");
  showToast("Mentorship request sent to " + (faculty ? faculty.name : "Faculty"));
  navigateTo("mentorship");
}

function replyToInquiry(inquiryId) {
  const input = document.getElementById(`replyInput-${inquiryId}`);
  const replyText = input.value.trim();
  if (!replyText) {
    alert("Please write a reply.");
    return;
  }

  const inquiries = getStorageData("cc_inquiries");
  const inq = inquiries.find(i => i.id === inquiryId);
  if (!inq) return;

  inq.reply = replyText;
  inq.status = "Approved";

  setStorageData("cc_inquiries", inquiries);
  showToast("Reply sent to student!");
  renderMentorshipView();
}

/* ==========================================================================
   ADMIN MANAGEMENT PANEL LOGIC
   ========================================================================== */
function renderAdminView() {
  const users = getStorageData("cc_users");
  const posts = getStorageData("cc_posts");
  const events = getStorageData("cc_events");
  const clubs = getStorageData("cc_clubs");

  // Summary Metrics
  const studentsCount = users.filter(u => u.role === "student").length;
  const facultyCount = users.filter(u => u.role === "faculty").length;
  const activeEventsCount = events.filter(e => e.status !== "Completed").length;

  const statStudents = document.getElementById("adminStatStudents");
  const statFaculty = document.getElementById("adminStatFaculty");
  const statEvents = document.getElementById("adminStatEvents");
  const statClubs = document.getElementById("adminStatClubs");
  const statPosts = document.getElementById("adminStatPosts");

  if (statStudents) statStudents.textContent = studentsCount;
  if (statFaculty) statFaculty.textContent = facultyCount;
  if (statEvents) statEvents.textContent = activeEventsCount;
  if (statClubs) statClubs.textContent = clubs.length;
  if (statPosts) statPosts.textContent = posts.length;

  // Render User Management Table
  const userTableBody = document.getElementById("adminUsersTableBody");
  if (userTableBody) {
    userTableBody.innerHTML = users.map(u => `
      <tr>
        <td>
          <strong>${escapeHTML(u.name)}</strong>
          <div style="font-size: 0.78rem; color: var(--text-light);">${escapeHTML(u.rollNo || u.id)}</div>
        </td>
        <td>${escapeHTML(u.email)}</td>
        <td>
          <span class="author-badge ${u.role}">${u.role.toUpperCase()}</span>
        </td>
        <td>${escapeHTML(u.department)}</td>
        <td>
          <span style="color: ${u.status === 'Active' ? '#059669' : '#b91c1c'}; font-weight: 600; font-size: 0.82rem;">
            ● ${u.status || 'Active'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn-table-action" onclick="toggleUserStatus('${u.id}')">
              ${u.status === 'Suspended' ? 'Activate' : 'Suspend'}
            </button>
            ${u.id !== currentUser.id ? `
              <button class="btn-table-action danger" onclick="adminDeleteUser('${u.id}')">Delete</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join("");
  }

  // Render Event Applications & Approvals Table in Admin
  const regTableBody = document.getElementById("adminEventRegsTableBody");
  if (regTableBody) {
    const registrations = getStorageData("cc_event_registrations");
    if (registrations.length === 0) {
      regTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">No event applications found.</td></tr>`;
    } else {
      regTableBody.innerHTML = registrations.map(r => `
        <tr>
          <td><strong>${escapeHTML(r.eventTitle)}</strong></td>
          <td>${escapeHTML(r.studentName)}</td>
          <td>${escapeHTML(r.studentRoll)}</td>
          <td>${escapeHTML(r.studentDept)}</td>
          <td>
            <span class="badge-status badge-${r.status.toLowerCase()}">${r.status}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${r.status !== 'Approved' ? `
                <button class="btn-approve" style="padding: 4px 8px; font-size: 0.75rem;" onclick="updateRegistrationStatus('${r.id}', 'Approved')">Approve ✓</button>
              ` : ''}
              ${r.status !== 'Rejected' ? `
                <button class="btn-reject" style="padding: 4px 8px; font-size: 0.75rem;" onclick="updateRegistrationStatus('${r.id}', 'Rejected')">Reject ✕</button>
              ` : ''}
              <button class="btn-table-action danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="adminDeleteRegistration('${r.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join("");
    }
  }
}

function adminDeleteRegistration(regId) {
  if (!confirm("Are you sure you want to remove this registration record?")) return;
  let registrations = getStorageData("cc_event_registrations");
  registrations = registrations.filter(r => r.id !== regId);
  setStorageData("cc_event_registrations", registrations);
  showToast("Registration entry removed.");
  renderAdminView();
}

function handleResetDemoData() {
  if (!confirm("Are you sure you want to reset all campus data to default demo state? This will restore original students, faculty, events, and clubs.")) return;
  resetCampusConnectStorage();
  initUserSession();
  setupRoleSwitcher();
  showToast("Campus Connect database restored to seed state!");
  renderCurrentView();
}

function toggleUserStatus(userId) {
  const users = getStorageData("cc_users");
  const user = users.find(u => u.id === userId);
  if (!user) return;

  user.status = user.status === "Suspended" ? "Active" : "Suspended";
  setStorageData("cc_users", users);
  showToast(`User status updated to ${user.status}`);
  renderAdminView();
}

function adminDeleteUser(userId) {
  if (!confirm("Are you sure you want to delete this campus account?")) return;
  let users = getStorageData("cc_users");
  users = users.filter(u => u.id !== userId);
  setStorageData("cc_users", users);
  showToast("User account removed.");
  renderAdminView();
}

function handleAdminAddUserSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("adminNewName").value.trim();
  const email = document.getElementById("adminNewEmail").value.trim().toLowerCase();
  const role = document.getElementById("adminNewRole").value;
  const dept = document.getElementById("adminNewDept").value.trim();

  const users = getStorageData("cc_users");
  if (users.some(u => u.email.toLowerCase() === email)) {
    alert("User with this email already exists.");
    return;
  }

  const initials = name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "CC";
  const newUser = {
    id: "usr_" + Date.now(),
    name: name,
    email: email,
    password: "password123",
    role: role,
    department: dept,
    year: role === "faculty" ? "Faculty Advisor" : "Class of '26",
    avatar: initials,
    avatarBg: role === "faculty" ? "#10b981" : (role === "admin" ? "#4338ca" : "#4f46e5"),
    connectionsCount: 1,
    postsCount: 0,
    facultyAdvisor: "Dr. Meera Kapoor",
    bio: `Campus member at ${dept}.`,
    skills: ["Academics", "Collaboration"],
    github: "",
    linkedin: "",
    rollNo: (role === "faculty" ? "FAC-" : "STU-") + Math.floor(100 + Math.random()*900),
    status: "Active"
  };

  users.push(newUser);
  setStorageData("cc_users", users);

  closeModal("modalAdminAddUser");
  showToast(`Account created for ${name} (${role.toUpperCase()})`);
  renderAdminView();
}

/* ==========================================================================
   MODAL UTILITIES & EVENT LISTENERS
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
}

function setupEventListeners() {
  // Close modals on clicking background overlay
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("open");
      }
    });
  });
}

function showToast(message) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
