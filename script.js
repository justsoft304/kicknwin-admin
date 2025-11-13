const form = document.getElementById("predictionForm");
const tableBody = document.getElementById("tableBody");

let predictions = [];

/* --- GITHUB CONFIG --- */
const REPO_OWNER = "your-username"; // replace with your GitHub username
const REPO_NAME = "kicknwin-admin";
const TODAY_JSON = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/today_predictions.json`;
const PAST_JSON = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/past_predictions.json`;

/* --- LOAD DATA FROM GITHUB --- */
async function loadPredictions() {
  try {
    const [todayRes, pastRes] = await Promise.all([
      fetch(TODAY_JSON),
      fetch(PAST_JSON),
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

/* --- RENDER TABLE --- */
function renderTable() {
  tableBody.innerHTML = "";
  predictions.forEach((pred, i) => {
    tableBody.innerHTML += `
      <tr>
        <td>${pred.date}</td>
        <td>${pred.league}</td>
        <td>${pred.home}</td>
        <td>${pred.away}</td>
        <td>${pred.prediction}</td>
        <td>${pred.confidence || "-"}</td>
        <td class="${
          pred.status === "win"
            ? "text-success"
            : pred.status === "loss"
            ? "text-danger"
            : "text-warning"
        }">${pred.status}</td>
        <td>${pred.target}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editPrediction(${i})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePrediction(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* --- SAVE NEW PREDICTION --- */
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
    target: target.value,
  };

  predictions.push(newPrediction);
  localStorage.setItem("predictions", JSON.stringify(predictions));
  renderTable();
  form.reset();

  alert("✅ Prediction saved locally! Generating JSONs for sync...");
  await saveLocalJSON();
});

/* --- SAVE JSON FILES LOCALLY (for GitHub Action sync) --- */
async function saveLocalJSON() {
  const todayData = predictions.filter((p) => p.target === "today");
  const pastData = predictions.filter((p) => p.target === "past");

  await saveFile("today_predictions.json", todayData);
  await saveFile("past_predictions.json", pastData);
}

async function saveFile(filename, data) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    alert(`💾 ${filename} updated locally. Commit & push to sync.`);
  } catch (err) {
    console.error("Save error:", err);
  }
}

/* --- EDIT & DELETE --- */
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

/* --- INIT --- */
loadPredictions();
