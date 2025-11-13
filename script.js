const form = document.getElementById("predictionForm");
const tableBody = document.getElementById("tableBody");

let predictions = [];

const REPO_OWNER = "justsoft304"; // e.g. justsoft304
const REPO_NAME = "kicknwin-admin";
const TODAY_FILE = "today_predictions.json";
const PAST_FILE = "past_predictions.json";

const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/`;

async function loadPredictions() {
  try {
    const [todayRes, pastRes] = await Promise.all([
      fetch(`${RAW_BASE}${TODAY_FILE}`),
      fetch(`${RAW_BASE}${PAST_FILE}`),
    ]);

    const todayData = await todayRes.json();
    const pastData = await pastRes.json();

    predictions = [...todayData, ...pastData];
    localStorage.setItem("predictions", JSON.stringify(predictions));

    renderTable();
    console.log("✅ Loaded predictions from GitHub");
  } catch (err) {
    console.error("❌ Failed to load GitHub data:", err);
    predictions = JSON.parse(localStorage.getItem("predictions")) || [];
    renderTable();
  }
}

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

  alert("💾 Prediction saved locally! Generating updated JSONs...");
  await updateLocalJSONs();
});

async function updateLocalJSONs() {
  const todayData = predictions.filter((p) => p.target === "today");
  const pastData = predictions.filter((p) => p.target === "past");

  await saveFile("today_predictions.json", todayData);
  await saveFile("past_predictions.json", pastData);

  alert("✅ JSONs updated locally! GitHub Action will sync automatically.");
}

async function saveFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

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
  updateLocalJSONs();
}

loadPredictions();
