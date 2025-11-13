const form = document.getElementById("predictionForm");
const tableBody = document.getElementById("tableBody");

let predictions = JSON.parse(localStorage.getItem("predictions")) || [];

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
        <td class="${pred.status === 'win' ? 'text-success' : pred.status === 'loss' ? 'text-danger' : 'text-warning'}">${pred.status}</td>
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

  alert("✅ Prediction saved locally! Triggering GitHub sync...");
  await saveLocalJSON();
});

/* Save JSONs locally in repo; GitHub Action will push them */
async function saveLocalJSON() {
  const todayData = predictions.filter(p => p.target === "today");
  const pastData = predictions.filter(p => p.target === "past");

  await saveFile("today_predictions.json", todayData);
  await saveFile("past_predictions.json", pastData);
}

async function saveFile(filename, data) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    alert(`💾 ${filename} saved locally. Commit & push to GitHub to sync.`);
  } catch (err) {
    console.error("Save error:", err);
  }
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
}

renderTable();
