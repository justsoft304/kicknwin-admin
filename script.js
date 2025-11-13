const form = document.getElementById("predictionForm");
const tableBody = document.getElementById("tableBody");

let predictions = JSON.parse(localStorage.getItem("predictions")) || [];

// Display predictions
function renderTable() {
  tableBody.innerHTML = "";
  predictions.forEach((pred, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${pred.date}</td>
        <td>${pred.league}</td>
        <td>${pred.home}</td>
        <td>${pred.away}</td>
        <td>${pred.prediction}</td>
        <td>${pred.confidence || '-'}</td>
        <td class="${pred.status === 'win' ? 'text-success' : pred.status === 'loss' ? 'text-danger' : 'text-warning'}">${pred.status}</td>
        <td>${pred.target}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editPrediction(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePrediction(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newPrediction = {
    date: document.getElementById("matchDate").value,
    league: document.getElementById("league").value,
    home: document.getElementById("home").value,
    away: document.getElementById("away").value,
    prediction: document.getElementById("prediction").value,
    confidence: document.getElementById("confidence").value,
    status: document.getElementById("status").value,
    target: document.getElementById("target").value
  };

  predictions.push(newPrediction);
  localStorage.setItem("predictions", JSON.stringify(predictions));

  form.reset();
  renderTable();

  alert("✅ Prediction saved locally! (GitHub sync to be added)");
});

function editPrediction(index) {
  const p = predictions[index];
  document.getElementById("matchDate").value = p.date;
  document.getElementById("league").value = p.league;
  document.getElementById("home").value = p.home;
  document.getElementById("away").value = p.away;
  document.getElementById("prediction").value = p.prediction;
  document.getElementById("confidence").value = p.confidence;
  document.getElementById("status").value = p.status;
  document.getElementById("target").value = p.target;

  deletePrediction(index);
}

function deletePrediction(index) {
  predictions.splice(index, 1);
  localStorage.setItem("predictions", JSON.stringify(predictions));
  renderTable();
}

renderTable();
