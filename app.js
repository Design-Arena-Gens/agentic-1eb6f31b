import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authView = document.getElementById("auth-view");
const appView = document.getElementById("app-view");
const welcomeText = document.getElementById("welcome-text");
const logoutBtn = document.getElementById("logout-btn");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");
const loginSpinner = document.getElementById("login-spinner");
const signupSpinner = document.getElementById("signup-spinner");

const showLoginBtn = document.getElementById("show-login");
const showSignupBtn = document.getElementById("show-signup");

const navButtons = document.querySelectorAll("[data-tab-target]");
const tabSections = document.querySelectorAll(".tab-section");

const weatherLocation = document.getElementById("weather-location");
const weatherTemp = document.getElementById("weather-temp");
const weatherApparent = document.getElementById("weather-apparent");
const weatherHumidity = document.getElementById("weather-humidity");
const weatherWind = document.getElementById("weather-wind");
const weatherRain = document.getElementById("weather-rain");
const weatherStatus = document.getElementById("weather-status");
const refreshWeatherBtn = document.getElementById("refresh-weather");

const tipsList = document.getElementById("tips-list");
const marketList = document.getElementById("market-list");
const forumFeed = document.getElementById("forum-feed");
const newPostBtn = document.getElementById("new-post");

const scanInput = document.getElementById("scan-input");
const scanPreview = document.getElementById("scan-preview");
const scanPreviewImage = document.getElementById("scan-preview-image");
const submitScanBtn = document.getElementById("submit-scan");
const launchScanBtn = document.getElementById("launch-scan");

const tips = [
  "সকালবেলা ফসলের জমিতে নালার পানি নিষ্কাশন নিশ্চিত করুন যাতে জমি কাদা না হয়।",
  "পোকামাকড়ের আক্রমণ কমাতে প্রাকৃতিক কীটনাশক ব্যবহার করুন এবং সপ্তাহে একবার পর্যবেক্ষণ করুন।",
  "বৃষ্টির পরে জমিতে সেচ কম দিন, যাতে জলাবদ্ধতা না হয় এবং শিকড় সুস্থ থাকে।",
];

const marketItems = [
  {
    crop: "ধান (ব্রি-২৮)",
    price: "৳ ১,৪৫০ / মন",
    trend: "+৩%",
    status: "বাড়তি চাহিদা",
  },
  {
    crop: "টমেটো (দেশি)",
    price: "৳ ৬৫ / কেজি",
    trend: "-৫%",
    status: "সরবরাহ বেশি",
  },
  {
    crop: "আলু (ডায়মন্ড)",
    price: "৳ ৩২ / কেজি",
    trend: "+১%",
    status: "স্থিতিশীল বাজার",
  },
];

const forumPosts = [
  {
    author: "সালমা বেগম",
    time: "২ ঘন্টা আগে",
    content:
      "মুগ ডালের চারা ভালো অবস্থায় আছে। কিন্তু পাতায় হলুদ দাগ দেখা যাচ্ছে। কোনো প্রাকৃতিক সমাধান আছে কি?",
    likes: 18,
    comments: 5,
  },
  {
    author: "হাসানুর রহমান",
    time: "৫ ঘন্টা আগে",
    content:
      "বোরো ধানের জন্য সেরা সার প্রয়োগ সময় কখন? আমি কোন শিডিউল ফলো করবো?",
    likes: 12,
    comments: 3,
  },
];

function toggleAuthMode(mode) {
  const loginActive = mode === "login";
  loginForm.classList.toggle("hidden", !loginActive);
  signupForm.classList.toggle("hidden", loginActive);
  showLoginBtn.classList.toggle("bg-primary", loginActive);
  showLoginBtn.classList.toggle("text-white", loginActive);
  showLoginBtn.classList.toggle("shadow-sm", loginActive);
  showSignupBtn.classList.toggle("bg-primary", !loginActive);
  showSignupBtn.classList.toggle("text-white", !loginActive);
  showSignupBtn.classList.toggle("shadow-sm", !loginActive);
  showSignupBtn.classList.toggle("text-slate-500", loginActive);
  showLoginBtn.classList.toggle("text-slate-500", !loginActive);
}

showLoginBtn.addEventListener("click", () => toggleAuthMode("login"));
showSignupBtn.addEventListener("click", () => toggleAuthMode("signup"));

async function handleSignup(event) {
  event.preventDefault();
  signupError.classList.add("hidden");
  signupSpinner.classList.remove("hidden");

  const formData = new FormData(signupForm);
  const displayName = formData.get("displayName").trim();
  const phoneNumber = formData.get("phoneNumber").trim();
  const email = formData.get("email").trim();
  const password = formData.get("password");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      displayName,
      phoneNumber,
      email,
      createdAt: serverTimestamp(),
    });

    signupForm.reset();
  } catch (error) {
    signupError.textContent = localizeAuthError(error);
    signupError.classList.remove("hidden");
  } finally {
    signupSpinner.classList.add("hidden");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  loginError.classList.add("hidden");
  loginSpinner.classList.remove("hidden");

  const formData = new FormData(loginForm);
  const email = formData.get("email").trim();
  const password = formData.get("password");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = localizeAuthError(error);
    loginError.classList.remove("hidden");
  } finally {
    loginSpinner.classList.add("hidden");
  }
}

async function handleLogout() {
  await signOut(auth);
}

function localizeAuthError(error) {
  const map = {
    "auth/invalid-email": "ইমেইল ঠিকানা সঠিক নয়।",
    "auth/user-not-found": "এই ইমেইলে কোন একাউন্ট পাওয়া যায়নি।",
    "auth/wrong-password": "পাসওয়ার্ড ভুল হয়েছে।",
    "auth/email-already-in-use": "এই ইমেইলে একটি একাউন্ট রয়েছে।",
    "auth/weak-password": "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
  };

  return map[error.code] || "অপারেশন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।";
}

function populateTips() {
  tipsList.innerHTML = "";
  tips.forEach((tip) => {
    const li = document.createElement("li");
    li.className =
      "flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-slate-600";
    li.innerHTML = `
      <span class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <i class="fa-solid fa-lightbulb"></i>
      </span>
      <p class="text-sm leading-relaxed">${tip}</p>
    `;
    tipsList.appendChild(li);
  });
}

function populateMarket() {
  marketList.innerHTML = "";
  marketItems.forEach(({ crop, price, trend, status }) => {
    const card = document.createElement("div");
    card.className =
      "rounded-2xl border border-slate-100 bg-surface p-4 text-sm shadow-sm";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <h4 class="text-base font-semibold text-slate-900">${crop}</h4>
        <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">${trend}</span>
      </div>
      <p class="mt-2 text-2xl font-semibold text-slate-900">${price}</p>
      <p class="mt-1 text-xs text-slate-500">${status}</p>
    `;
    marketList.appendChild(card);
  });
}

function populateForum() {
  forumFeed.innerHTML = "";
  forumPosts.forEach(({ author, time, content, likes, comments }) => {
    const card = document.createElement("div");
    card.className =
      "rounded-2xl border border-slate-100 bg-surface p-4 shadow-sm";
    card.innerHTML = `
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span class="font-semibold text-slate-700">${author}</span>
        <span>${time}</span>
      </div>
      <p class="mt-2 text-sm leading-relaxed text-slate-700">${content}</p>
      <div class="mt-4 flex items-center gap-6 text-xs text-slate-500">
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-heart text-rose-500"></i> ${likes}
        </span>
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-comment-dots text-primary"></i> ${comments}
        </span>
      </div>
    `;
    forumFeed.appendChild(card);
  });
}

function switchTab(target) {
  tabSections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== `tab-${target}`);
  });
  navButtons.forEach((btn) => {
    btn.classList.toggle(
      "text-primary",
      btn.dataset.tabTarget === target
    );
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tabTarget));
});

async function fetchWeather() {
  weatherLocation.textContent = "অবস্থান খুঁজছে…";
  weatherStatus.textContent = "অবস্থান অনুমতি দিলে আবহাওয়া দেখানো হবে।";

  function updateCard(data) {
    weatherTemp.textContent = `${Math.round(data.temperature)}°C`;
    weatherApparent.textContent = `${Math.round(data.apparentTemperature)}°C`;
    weatherHumidity.textContent = `${Math.round(data.humidity)}%`;
    weatherWind.textContent = `${Math.round(data.windSpeed)} কিমি/ঘ`;
    weatherRain.textContent = `${data.precipitation.toFixed(1)} মিমি`;
    weatherLocation.textContent = data.location;
    weatherStatus.textContent = data.description;
  }

  function mapWeather(code) {
    const descriptions = {
      0: "আকাশ পরিষ্কার",
      1: "মূলত পরিষ্কার",
      2: "আংশিক মেঘলা",
      3: "ঘন মেঘলা",
      45: "কুয়াশা",
      48: "বরফ কণা সহ কুয়াশা",
      51: "হালকা ঝিরঝিরে বৃষ্টি",
      53: "মাঝারি ঝিরঝিরে বৃষ্টি",
      55: "ভারী ঝিরঝিরে বৃষ্টি",
      61: "হালকা বৃষ্টি",
      63: "মাঝারি বৃষ্টি",
      65: "ভারী বৃষ্টি",
      80: "হালকা বৃষ্টি (মাঝে মাঝে)",
      81: "মাঝারি বৃষ্টি (মাঝে মাঝে)",
      82: "ভারী বৃষ্টি (মাঝে মাঝে)",
    };
    return descriptions[code] || "বর্তমান আবহাওয়া তথ্য";
  }

  function buildApiUrl(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code",
      timezone: "auto",
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  }

  async function load(lat, lon, label = "আপনার অবস্থান") {
    try {
      const response = await fetch(buildApiUrl(lat, lon));
      const json = await response.json();
      const current = json.current;
      updateCard({
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        location: label,
        description: mapWeather(current.weather_code),
      });
      weatherStatus.textContent += " (সর্বশেষ আপডেট)";
    } catch (error) {
      weatherStatus.textContent = "আবহাওয়া তথ্য লোড করা যায়নি। পরে চেষ্টা করুন।";
    }
  }

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        load(coords.latitude, coords.longitude, "আপনার অবস্থান");
      },
      () => {
        weatherStatus.textContent =
          "অবস্থান অনুমতি না থাকায় ঢাকা, বাংলাদেশ-এর তথ্য দেখানো হচ্ছে।";
        load(23.8103, 90.4125, "ঢাকা, বাংলাদেশ");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  } else {
    weatherStatus.textContent =
      "ডিভাইস অবস্থান সমর্থন করে না। ঢাকা, বাংলাদেশ-এর তথ্য দেখানো হচ্ছে।";
    load(23.8103, 90.4125, "ঢাকা, বাংলাদেশ");
  }
}

loginForm.addEventListener("submit", handleLogin);
signupForm.addEventListener("submit", handleSignup);
logoutBtn.addEventListener("click", handleLogout);
refreshWeatherBtn.addEventListener("click", fetchWeather);

launchScanBtn.addEventListener("click", () => {
  switchTab("scan");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

scanInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    scanPreview.classList.add("hidden");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    scanPreviewImage.src = e.target?.result;
    scanPreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

submitScanBtn.addEventListener("click", () => {
  alert("ছবিটি বিশ্লেষণের জন্য পাঠানো হয়েছে। ফলাফল শীঘ্রই পাওয়া যাবে।");
});

newPostBtn.addEventListener("click", () => {
  alert("ফোরাম পোস্ট ফিচার শীঘ্রই আসছে!");
});

onAuthStateChanged(auth, (user) => {
  const isAuthenticated = Boolean(user);
  authView.classList.toggle("hidden", isAuthenticated);
  appView.classList.toggle("hidden", !isAuthenticated);

  if (user) {
    const name = user.displayName || user.email?.split("@")[0] || "কৃষক";
    welcomeText.textContent = `${name} 👋`;
    populateTips();
    populateMarket();
    populateForum();
    switchTab("home");
    fetchWeather();
  } else {
    loginForm.reset();
    signupForm.reset();
  }
});

