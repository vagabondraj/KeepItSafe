const notesContainer = document.getElementById('notesContainer');
const createNoteBtn = document.getElementById('createNoteBtn');
const noteModal = document.getElementById('noteModal');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelBtn = document.getElementById('cancelBtn');
const noteLockCheckbox = document.getElementById('noteLock');
const notePasswordInput = document.getElementById('notePassword');

// Redirect to login if not logged in
if (!localStorage.getItem('isLoggedIn')) {
  window.location.href = 'index.html';
}

// Get logged-in user's email
const userEmail = localStorage.getItem('userEmail');
if (!userEmail) {
  window.location.href = 'index.html'; // just in case
}

// Use user-specific key for notes storage
const notesKey = `notes_${userEmail}`;

// Load notes for the current user
let notes = JSON.parse(localStorage.getItem(notesKey)) || [];

let editingIndex = null;

const notesPerPage = 4;
let currentPage = 1;

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');

// Simple hash function for demo (not secure)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 4) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

// Format ISO date string to readable format
function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function renderNotes(filter = '') {
  notesContainer.innerHTML = '';

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(filter.toLowerCase()) ||
      note.content.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const startIndex = (currentPage - 1) * notesPerPage;
  const endIndex = startIndex + notesPerPage;
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  paginatedNotes.forEach((note, index) => {
    const globalIndex = startIndex + index;
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.innerHTML = `
      <h3>${note.title} ${note.isLocked ? '🔒' : ''}</h3>
      <p>${note.isLocked ? '<em>Locked content</em>' : note.content}</p>
      <small class="timestamps">Created: ${formatDateTime(note.createdAt)}</small><br>
      <small class="timestamps">Last edited: ${formatDateTime(note.updatedAt)}</small><br>
      <button onclick="editNote(${globalIndex})">Edit</button>
      <button class="delete" onclick="deleteNote(${globalIndex})">Delete</button>
    `;
    notesContainer.appendChild(noteEl);
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function openModal(index = null) {
  noteModal.classList.remove('hidden');
  notePasswordInput.value = '';
  notePasswordInput.style.display = 'none';

  if (index !== null) {
    const note = notes[index];
    editingIndex = index;

    if (note.isLocked) {
      const enteredPwd = prompt('This note is locked. Enter password to unlock:');
      if (simpleHash(enteredPwd || '') !== note.passwordHash) {
        alert('Incorrect password! Cannot open note.');
        closeModal();
        return;
      }
      noteTitle.value = note.title;
      noteContent.value = note.content;
      noteLockCheckbox.checked = true;
      notePasswordInput.style.display = 'block';
      notePasswordInput.value = enteredPwd;
    } else {
      noteTitle.value = note.title;
      noteContent.value = note.content;
      noteLockCheckbox.checked = false;
    }
  } else {
    editingIndex = null;
    noteTitle.value = '';
    noteContent.value = '';
    noteLockCheckbox.checked = false;
  }
}

function closeModal() {
  noteModal.classList.add('hidden');
  localStorage.removeItem('noteDraft');
}

function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const isLocked = noteLockCheckbox.checked;
  const password = notePasswordInput.value;

  if (!title || !content) return;

  if (isLocked && password.length < 4) {
    alert('Password must be at least 4 characters to lock the note.');
    return;
  }

  const noteData = {
    title,
    content,
    isLocked,
    passwordHash: isLocked ? simpleHash(password) : '',
    createdAt:
      editingIndex !== null && notes[editingIndex].createdAt
        ? notes[editingIndex].createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (editingIndex !== null) {
    notes[editingIndex] = noteData;
  } else {
    notes.push(noteData);
  }
  localStorage.setItem(notesKey, JSON.stringify(notes));
  localStorage.removeItem('noteDraft');
  renderNotes();
  closeModal();
}

function editNote(index) {
  openModal(index);
}

function deleteNote(index) {
  if (confirm('Are you sure you want to delete this note?')) {
    notes.splice(index, 1);
    localStorage.setItem(notesKey, JSON.stringify(notes));
    renderNotes();
  }
}

createNoteBtn.onclick = () => openModal();
cancelBtn.onclick = closeModal;
saveNoteBtn.onclick = saveNote;

const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', (e) => {
  renderNotes(e.target.value);
});

renderNotes('');

// Pagination button handlers
prevPageBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderNotes(searchInput.value);
  }
};

nextPageBtn.onclick = () => {
  const filteredNotesCount = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      note.content.toLowerCase().includes(searchInput.value.toLowerCase())
  ).length;
  const totalPages = Math.ceil(filteredNotesCount / notesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderNotes(searchInput.value);
  }
};

// Logout feature
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.onclick = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  window.location.href = 'index.html';
};

// Auto-save drafts when user types in modal
[noteTitle, noteContent].forEach((input) => {
  input.addEventListener('input', () => {
    localStorage.setItem(
      'noteDraft',
      JSON.stringify({
        title: noteTitle.value,
        content: noteContent.value,
      })
    );
  });
});

// Dark and light feature
const themeToggleBtn = document.getElementById('themeToggleBtn');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.onclick = () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Show/hide password input based on checkbox
noteLockCheckbox.addEventListener('change', () => {
  if (noteLockCheckbox.checked) {
    notePasswordInput.style.display = 'block';
  } else {
    notePasswordInput.style.display = 'none';
    notePasswordInput.value = '';
  }
});
