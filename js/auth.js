const toggleForm = document.getElementById('toggleForm');
const authForm = document.getElementById('authForm');
const formTitle = document.getElementById('formTitle');

let isLogin = true;

toggleForm.onclick = () => {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? "Login" : "Sign Up";
  toggleForm.textContent = isLogin ? "Don't have an account? Sign up" : "Already have an account? Login";
};

authForm.onsubmit = e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Simulate login/signup success
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", email);

  // Redirect to notes page
  window.location.href = "notes.html";
};
