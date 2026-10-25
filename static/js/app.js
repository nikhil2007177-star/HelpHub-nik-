let userLatitude = null;
let userLongitude = null;
const sampleProviders = [
  {
    id: "p1",
    name: "Aarav Home Repairs",
    category: "Home Repairs",
    skill: "Plumber",
    area: "Sample locality",
    latitude: 28.6139,
    longitude: 77.2090,
    experience: 5,
    availability: "Available",
    price: "Estimate on request",
    initials: "AH",
    color: "teal",
    description: "Fictional example profile for plumbing and home repairs.",
  },
  {
    id: "p2",
    name: "BrightWire Services",
    category: "Home Repairs",
    skill: "Electrician",
    area: "Sample locality",
    latitude: 28.6200,
    longitude: 77.2150,
    experience: 4,
    availability: "Available",
    price: "Visit charge to be confirmed",
    initials: "BW",
    color: "blue",
    description: "Fictional example profile for household electrical work.",
  },
  {
    id: "p3",
    name: "City Motor Care",
    category: "Vehicle",
    skill: "Mechanic",
    area: "Sample locality",
    latitude: 28.6300,
    longitude: 77.2000,
    experience: 7,
    availability: "Busy",
    price: "Estimate on request",
    initials: "CM",
    color: "orange",
    description: "Fictional example profile for vehicle inspection and repair.",
  },
  {
    id: "p4",
    name: "Everyday Helpers",
    category: "Daily Needs",
    skill: "Furniture assembly",
    area: "Sample locality",
    latitude: 28.6050,
    longitude: 77.2200,
    experience: 3,
    availability: "Available",
    price: "Estimate on request",
    initials: "EH",
    color: "pink",
    description: "Fictional example profile for daily-needs tasks.",
  },
  {
    id: "p5",
    name: "Community Health Desk",
    category: "Health",
    skill: "Healthcare service listing",
    area: "Sample locality",
    latitude: 28.6400,
    longitude: 77.2300,
    experience: 8,
    availability: "Available",
    price: "Contact to confirm",
    initials: "CH",
    color: "green",
    description:
      "Fictional listing, not a medical endorsement or emergency service.",
  },
  {
    id: "p6",
    name: "Rapid Local Assistance",
    category: "Emergency",
    skill: "Local assistance",
    area: "Sample locality",
    latitude: 28.5900,
    longitude: 77.1900,
    experience: 2,
    availability: "Available",
    price: "Contact to confirm",
    initials: "RL",
    color: "purple",
    description:
      "Fictional local assistance listing, not an official emergency service.",
  },
];

function getStored(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function queryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
}

function providerCard(provider) {
  const availabilityClass =
    provider.availability === "Available" ? "pill-success" : "pill-warm";

  return `
    <article class="provider-card">
      <div class="provider-card-top">
        <div class="avatar avatar-${escapeHTML(provider.color)}">
          ${escapeHTML(provider.initials)}
        </div>
        <span class="pill ${availabilityClass}">
          ${escapeHTML(provider.availability)}
        </span>
      </div>

      <p class="provider-category">
        ${escapeHTML(provider.category)} · ${escapeHTML(provider.skill)}
      </p>

      <h3>${escapeHTML(provider.name)}</h3>

      <p class="muted small">
        ⌖ ${escapeHTML(provider.area)} ·
        ${escapeHTML(provider.experience)} years' experience
      </p>

      <div class="provider-card-bottom">
        <span>${escapeHTML(provider.price)}</span>
        <a class="btn btn-primary btn-small"
           href="provider-profile.html?id=${encodeURIComponent(provider.id)}">
          View profile
        </a>
      </div>

      <p class="demo-caption">Sample listing · not verified</p>
    </article>
  `;
}

function initServices() {
  const grid = document.getElementById("providerGrid");
  if (!grid) return;

  const search = document.getElementById("serviceSearch");
  const category = document.getElementById("categoryFilter");
  const availability = document.getElementById("availabilityFilter");
  const resultCount = document.getElementById("resultCount");

  const categoryParam = queryParam("category");

  if (categoryParam) {
    const option = [...category.options].find(
      (item) => item.value === categoryParam || item.text === categoryParam,
    );

    if (option) category.value = option.value;
  }

  function renderProviders() {
    const searchText = search.value.toLowerCase().trim();
    const selectedCategory = category.value;
    const selectedAvailability = availability.value;

    const filtered = sampleProviders.filter((provider) => {
      const matchesCategory =
        !selectedCategory || provider.category === selectedCategory;

      const matchesAvailability =
        !selectedAvailability || provider.availability === selectedAvailability;

      const searchableText = [
        provider.name,
        provider.category,
        provider.skill,
        provider.area,
        provider.description,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        matchesAvailability &&
        (!searchText || searchableText.includes(searchText))
      );
    });

  const sortedProviders = filtered.map(provider => {
        const lat = Number(provider.latitude);
    const lon = Number(provider.longitude);

    if (
        provider.latitude == null ||
        provider.longitude == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
    ) {
        return { ...provider, distance: null };
    }
    if (userLatitude === null || userLongitude === null) {
        return { ...provider, distance: null };
    }

    const toRadians = degrees => degrees * Math.PI / 180;
    const earthRadius = 6371;

    const lat1 = toRadians(userLatitude);
const lat2 = toRadians(lat);
const deltaLat = toRadians(lat - userLatitude);
const deltaLon = toRadians(lon - userLongitude);

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;

    const distance = 2 * earthRadius *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return { ...provider, distance };
});

if (userLatitude !== null && userLongitude !== null) {
    sortedProviders.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });
}

grid.innerHTML = filtered.map(providerCard).join("");
resultCount.textContent = `${filtered.length} sample listings`;

  [search, category, availability].forEach((element) => {
    element.addEventListener("input", renderProviders);
  });

renderProviders();
  }
  const locationButton = document.getElementById("detectLocation");
  const locationNotice = document.getElementById("locationNotice");

  if (locationButton) {
    locationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        locationNotice.textContent =
          "Your browser does not support location detection.";
        return;
      }

      locationButton.disabled = true;
      locationButton.textContent = "Requesting permission…";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLatitude = position.coords.latitude;
          userLongitude = position.coords.longitude;

          locationNotice.textContent =
            `Location permission granted for this demo. ` +
            `Sample providers are not filtered by real distance yet.`;

          locationButton.disabled = false;
          locationButton.textContent = "Location detected";
        },
        (error) => {
          locationNotice.textContent =
            error.code === 1
              ? "Location permission was denied. You can still search services."
              : "Location could not be detected. You can still search services.";

          locationButton.disabled = false;
          locationButton.textContent = "Try location again";
        },
        { timeout: 10000, maximumAge: 60000 },
      );
    });
  }
}


function initProfile() {
  const root = document.getElementById("profileContent");
  if (!root) return;

  const id = queryParam("id") || "p1";
  const provider =
    sampleProviders.find((item) => item.id === id) || sampleProviders[0];

  const availabilityClass =
    provider.availability === "Available" ? "pill-success" : "pill-warm";

  root.innerHTML = `
    <div class="profile-hero">
      <div class="avatar avatar-${escapeHTML(provider.color)} avatar-large">
        ${escapeHTML(provider.initials)}
      </div>

      <div>
        <span class="pill ${availabilityClass}">
          ${escapeHTML(provider.availability)}
        </span>
        <h1>${escapeHTML(provider.name)}</h1>
        <p class="muted">
          ${escapeHTML(provider.category)} · ${escapeHTML(provider.skill)}
        </p>
        <p class="muted small">⌖ ${escapeHTML(provider.area)}</p>
      </div>
    </div>

    <div class="profile-layout">
      <section class="content-card">
        <span class="eyebrow">ABOUT THIS LISTING</span>
        <h2>Provider overview</h2>
        <p>${escapeHTML(provider.description)}</p>

        <div class="profile-facts">
          <div><span>Experience</span>
            <b>${escapeHTML(provider.experience)} years (sample)</b>
          </div>
          <div><span>Estimated pricing</span>
            <b>${escapeHTML(provider.price)}</b>
          </div>
          <div><span>Verification</span>
            <b>Not verified — demo</b>
          </div>
        </div>

        <div class="notice notice-warm">
          This is fictional sample data. No real provider identity or skill has been checked.
        </div>
      </section>

      <aside class="content-card">
        <h2>Interested in this provider?</h2>
        <p class="muted small">
          Create a request with your requirements.
        </p>
        <a class="btn btn-primary btn-full" href="request.html">
          Create a request ↗
        </a>
        <a class="btn btn-ghost btn-full mt-2" href="services.html">
          Back to services
        </a>
      </aside>
    </div>
  `;
}

function initRequestForm() {
  const form = document.getElementById("requestForm");
  if (!form) return;

  const category = queryParam("category");
  const categoryField = document.getElementById("requestCategory");

  if (category && categoryField) {
    categoryField.value = category;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const savedUser = JSON.parse(
      localStorage.getItem("helphubUser") ||
        sessionStorage.getItem("helphubUser") ||
        "null",
    );
    if (!savedUser || savedUser.role !== "customer") {
      alert("Please log in with your customer account first.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5001/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: savedUser.id,
          category: data.category,
          description: `${data.title}\n${data.description}`,
          area: data.area,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        alert(result.message || "Could not save your request.");
        return;
      }

      alert("Your service request has been saved!");
      window.location.href = "customer-dashboard.html";
    } catch (error) {
      console.error("Request error:", error);
      alert("Could not connect to HelpHub. Make sure Flask is running.");
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const roleSelect = document.getElementById("registerRole");
  const providerFields = document.getElementById("providerFields");

  function updateRole() {
    const isProvider = roleSelect.value === "provider";

    providerFields.hidden = !isProvider;

    providerFields
      .querySelectorAll("input, select, textarea")
      .forEach((field) => {
        field.disabled = !isProvider;

        if (
          ["category", "experience", "skills", "area", "bio"].includes(
            field.name,
          )
        ) {
          field.required =
            isProvider && ["category", "skills", "area"].includes(field.name);
        }
      });
  }

  const roleParam = queryParam("role");

  if (roleParam === "provider" || roleParam === "customer") {
    roleSelect.value = roleParam;
  }

  updateRole();
  roleSelect.addEventListener("change", updateRole);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("http://127.0.0.1:5001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Registration failed.");
        return;
      }

      alert("Registration successful! You can now explore HelpHub.");

      window.location.href =
        data.role === "provider"
          ? "provider-dashboard.html"
          : "customer-dashboard.html";
    } catch (error) {
      console.error("Registration error:", error);
      alert("Could not connect to HelpHub. Make sure the backend is running.");
    }
  });
}

function initLogin() {
  const button = document.getElementById("loginButton");

  if (!button) return;

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      button.disabled = true;

      const response = await fetch("http://127.0.0.1:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        alert(result.message || "Login failed.");
        return;
      }

      localStorage.setItem("helphubUser", JSON.stringify(result.user));

      alert("Login successful!");

      window.location.href =
        result.user.role === "provider"
          ? "provider-dashboard.html"
          : "customer-dashboard.html";
    } catch (error) {
      console.error("Login error:", error);
      alert("Could not connect to HelpHub. Check that Flask is running.");
    } finally {
      button.disabled = false;
    }
  });
}

async function initCustomerDashboard() {
  const list = document.getElementById("customerRequests");
  if (!list) return;

  const savedUser = JSON.parse(
    localStorage.getItem("helphubUser") ||
      sessionStorage.getItem("helphubUser") ||
      "null",
  );

  if (!savedUser || savedUser.role !== "customer") {
    list.innerHTML = `
            <div class="empty-state compact">
                <h3>Please log in</h3>
                <p>Log in with your customer account to view your requests.</p>
                <a class="btn btn-primary btn-small" href="login.html">Log in</a>
            </div>`;
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:5001/api/requests?customer_id=${encodeURIComponent(savedUser.id)}`,
    );

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Could not load requests.");
    }

    const requests = result.requests || [];

    document.getElementById("customerOpenCount").textContent = requests.filter(
      (item) => item.status !== "Completed",
    ).length;

    document.getElementById("customerQuoteCount").textContent = "0";

    document.getElementById("customerCompletedCount").textContent =
      requests.filter((item) => item.status === "Completed").length;

    if (!requests.length) {
      list.innerHTML = `
                <div class="empty-state compact">
                    <span>⌂</span>
                    <h3>No requests yet</h3>
                    <p>Your posted service requests will appear here.</p>
                    <a class="btn btn-primary btn-small" href="request.html">Create request</a>
                </div>`;
      return;
    }

    list.innerHTML = requests
      .map(
        (item) => `
            <article class="request-row">
                <div class="request-icon">⌂</div>
                <div class="request-row-main">
                    <h3>${escapeHTML(item.title || item.category || "Service request")}</h3>
                    <p class="muted small">
                        ${escapeHTML(item.category || "")} ·
                        ${escapeHTML(item.area || "")}
                    </p>
                    <p>${escapeHTML(item.description || "")}</p>
                </div>
                <span class="pill pill-warm">${escapeHTML(item.status || "Pending")}</span>
            </article>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Dashboard request loading error:", error);
    list.innerHTML = `
            <div class="empty-state compact">
                <h3>Could not load requests</h3>
                <p>Check that the HelpHub Flask server is running, then refresh this page.</p>
            </div>`;
  }
}

function initAdminDashboard() {
  const root = document.getElementById("adminApplications");
  if (!root) return;

  function render() {
    const applications = getStored("helphubApplications", []);
    const requests = getStored("helphubRequests", []);

    document.getElementById("adminApplicationCount").textContent =
      applications.length;

    document.getElementById("adminRequestCount").textContent = requests.length;

    if (!applications.length) {
      root.innerHTML = `
        <div class="empty-state compact">
          <span>✓</span>
          <h3>No demo applications yet</h3>
          <p>Provider applications created in this browser will appear here.</p>
          <a class="btn btn-primary btn-small" href="register.html?role=provider">
            Preview provider form
          </a>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Category</th>
            <th>Area</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${applications
            .map(
              (application) => `
            <tr>
              <td>
                <b>${escapeHTML(application.name)}</b>
                <small>${escapeHTML(application.email)}</small>
              </td>
              <td>${escapeHTML(application.category)}</td>
              <td>${escapeHTML(application.area)}</td>
              <td><span class="pill pill-warm">${escapeHTML(application.status)}</span></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  render();

  const refreshButton = document.getElementById("refreshAdmin");

  if (refreshButton) {
    refreshButton.addEventListener("click", render);
  }
}

function initDemoActions() {
  document.querySelectorAll("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", () => {
      alert(button.dataset.demoAction);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initServices();
  initProfile();
  initRequestForm();
  initRegisterForm();
  initLogin();
  initCustomerDashboard();
  initAdminDashboard();
  initDemoActions();
});

function updateNavbar() {
  const user = JSON.parse(
    localStorage.getItem("helphubUser") ||
      sessionStorage.getItem("helphubUser") ||
      "null",
  );

  document
    .querySelectorAll(".main-nav a, .header-actions a")
    .forEach((link) => {
      if (link.href.includes("login.html")) {
        if (user) {
          link.textContent = "My Dashboard";
          link.href =
            user.role === "provider"
              ? "provider-dashboard.html"
              : user.role === "admin"
                ? "admin-dashboard.html"
                : "customer-dashboard.html";
        } else {
          link.textContent = "Log in";
        }
      }

      if (link.href.includes("register.html") && user) {
        link.textContent = "Log out";
        link.href = "#logout";
        link.onclick = (event) => {
          event.preventDefault();
          localStorage.removeItem("helphubUser");
          sessionStorage.removeItem("helphubUser");
          window.location.href = "index.html";
        };
      }
    });
}

updateNavbar();

function initCurrentLocation() {
  const areaInput = document.getElementById("requestArea");
  const locationButton = document.getElementById("getCurrentLocation");
  const message = document.getElementById("locationMessage");

  if (!areaInput || !locationButton || !message) return;

  locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      message.textContent = "Location is not supported by this browser.";
      return;
    }

    locationButton.disabled = true;
    message.textContent = "Finding your current location...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );

          if (!response.ok) {
            throw new Error("Address lookup failed");
          }

          const result = await response.json();
          const address = result.address || {};

          const readableArea = [
            address.suburb || address.neighbourhood || address.residential,
            address.city || address.town || address.village || address.county,
            address.postcode,
          ]
            .filter(Boolean)
            .join(", ");

          if (readableArea) {
            areaInput.value = readableArea;
            message.textContent =
              "Location detected! You can edit it if needed.";
          } else {
            areaInput.value = `${latitude}, ${longitude}`;
            message.textContent =
              "Coordinates found; please enter your locality manually.";
          }
        } catch (error) {
          console.error("Address lookup error:", error);
          areaInput.value = `${latitude}, ${longitude}`;
          message.textContent =
            "Coordinates found, but the address could not be retrieved. Please enter your locality manually.";
        } finally {
          locationButton.disabled = false;
        }
      },
      (error) => {
        const messages = {
          1: "Location permission was denied. Allow it in your browser settings.",
          2: "Your location is unavailable. Please try again.",
          3: "Location request timed out. Please try again.",
        };

        message.textContent =
          messages[error.code] || "Could not detect your location.";
        locationButton.disabled = false;
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  });
}

window.initHelpHubMap = function () {
  const mapElement = document.getElementById("serviceMap");

  if (!mapElement || !window.google?.maps) return;

  const center = {
    lat: 28.4744,
    lng: 77.5040
  };

  const map = new google.maps.Map(mapElement, {
    center: center,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false
  });

  new google.maps.Marker({
    position: center,
    map: map,
    title: "HelpHub service area"
  });

  window.helpHubMap = map;
};
window.dispatchEvent(new Event("helphub-app-ready"));
