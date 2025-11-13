const form = document.getElementById("predictionForm");
const tableBody = document.getElementById("tableBody");
const syncButton = document.getElementById("syncButton");

let predictions = [];
const REPO_OWNER = "justsoft304";
const REPO_NAME = "kicknwin-admin";
const TODAY_FILE = "today_predictions.json";
const PAST_FILE = "past_predictions.json";

const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/`;

/* Load Predictions */
async function loadPredictions() {
  try {
    const [todayRes, pastRes] = await Promise.all([
      fetch(`${RAW_BASE}${TODAY_FILE}`),
      fetch(`${RAW_BASE}${PAST_FILE}`)
    ]);

    const todayData = await todayRes.json();
    const pastData = await pastRes.json();

    predictions = [...todayData, ...pastData];
    localStorage.setItem("predictions", JSON.stringify(predictions));

    renderTable();
    console.log("✅ Predictions loaded from GitHub");
  } catch (err) {
    console.error("❌ Error loading data:", err);
    predictions = JSON.parse(localStorage.getItem("predictions")) || [];
    renderTable();
  }
}

/* Render Table */
function renderTable() {
  tableBody.innerHTML = "";
  predictions.forEach((p, i) => {
    tableBody.innerHTML += `
      <tr>
        <td>${p.date}</td>
        <td>${p.league}</td>
        <td>${p.home}</td>
        <td>${p.away}</td>
        <td>${p.prediction}</td>
        <td>${p.confidence || "-"}</td>
        <td class="${
          p.status === "win" ? "text-success" : 
          p.status === "loss" ? "text-danger" : 
          "text-warning"
        }">${p.status}</td>
        <td>${p.target}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editPrediction(${i})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePrediction(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* Add or Update Prediction */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPrediction = {
    date: matchDate.value,
    league: league.value,
    home: home.value,
    away: away.value,
    prediction: prediction.value,
    confidence: confidence.value,
    status: status.value,
    target: target.value
  };

  predictions.push(newPrediction);
  localStorage.setItem("predictions", JSON.stringify(predictions));
  renderTable();
  form.reset();

  await updateLocalJSONs();
  alert("✅ Prediction saved! Click 'Sync to GitHub' to update the repository.");
});

/* Save JSON Locally */
async function updateLocalJSONs() {
  const todayData = predictions.filter(p => p.target === "today");
  const pastData = predictions.filter(p => p.target === "past");

  saveFile("today_predictions.json", todayData);
  saveFile("past_predictions.json", pastData);
}

function saveFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* Edit or Delete */
function editPrediction(index) {
  const p = predictions[index];
  matchDate.value = p.date;
  league.value = p.league;
  home.value = p.home;
  away.value = p.away;
  prediction.value = p.prediction;
  confidence.value = p.confidence;
  status.value = p.status;
  target.value = p.target;

  deletePrediction(index);
}

function deletePrediction(index) {
  predictions.splice(index, 1);
  localStorage.setItem("predictions", JSON.stringify(predictions));
  renderTable();
}

/* Manual Trigger GitHub Sync */
syncButton.addEventListener("click", async () => {
  alert("🔄 Triggering GitHub Action to sync predictions...");
  await triggerGitHubAction();
});

async function triggerGitHubAction() {
  const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "token YOUR_PERSONAL_ACCESS_TOKEN", // Optional: only if private
    },
    body: JSON.stringify({
      event_type: "update_predictions"
    })
  });

  if (response.ok) {
    alert("✅ GitHub Action triggered! JSON will be committed automatically.");
  } else {
    alert("❌ Failed to trigger GitHub Action. Check your repo permissions or secrets.");
    console.error(await response.text());
  }
}

loadPredictions();
