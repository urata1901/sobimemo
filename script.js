const calendar = document.getElementById("calendar");
const currentMonthLabel = document.getElementById("currentMonth");

let today = new Date();
let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

const minDate = new Date(2023, 0, 1);

let schedules = JSON.parse(localStorage.getItem("schedules") || "{}");
let incomes = JSON.parse(localStorage.getItem("incomes") || "{}");

let selectedSchedule = null;
let selectedDateKey = null;

function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentMonthLabel.textContent = `${year}年 ${month + 1}月`;
  updateIncome(year, month);

  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

  for (let d = 1; d <= days; d++) {
    const cell = document.createElement("div");
    cell.className = "day";

    if (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) cell.classList.add("today");

    cell.innerHTML = `<strong>${d}</strong>`;

    const key = `${year}-${month + 1}-${d}`;
    if (schedules[key]) {
      schedules[key].forEach((e, i) => {
        const ev = document.createElement("div");
        ev.className = "event";
        ev.textContent = e.title;
        ev.onclick = () => openDetail(key, i);
        cell.appendChild(ev);
      });
    }
    calendar.appendChild(cell);
  }
}

function updateIncome(year, month) {
  const key = `${year}-${month + 1}`;
  document.getElementById("monthlyIncome").textContent = incomes[key] || 0;

  let sum = 0;
  Object.keys(incomes).forEach(k => {
    if (k.startsWith(year + "-")) sum += incomes[k];
  });
  document.getElementById("yearlyIncome").textContent = sum;
}

function openDetail(dateKey, index) {
  selectedDateKey = dateKey;
  selectedSchedule = index;
  const d = schedules[dateKey][index];

  detailContent.innerHTML = `
    <strong>${d.title}</strong><br>
    予定:${d.planTime}<br>
    実際:${d.actualTime}<br>
    場所:${d.place}<br>
    作業:${d.work}<br>
    リーダー:${d.leader}<br>
    人数:${d.people}<br>
    メモ:${d.memo}
  `;
  detailModal.classList.remove("hidden");
}

editBtn.onclick = () => {
  const d = schedules[selectedDateKey][selectedSchedule];
  dateInput.value = selectedDateKey;
  titleInput.value = d.title;
  planTime.value = d.planTime;
  actualTime.value = d.actualTime;
  placeInput.value = d.place;
  workInput.value = d.work;
  leaderInput.value = d.leader;
  peopleInput.value = d.people;
  memoInput.value = d.memo;

  schedules[selectedDateKey].splice(selectedSchedule, 1);
  detailModal.classList.add("hidden");
  scheduleModal.classList.remove("hidden");
};

deleteBtn.onclick = () => {
  if (confirm("削除しますか？")) {
    schedules[selectedDateKey].splice(selectedSchedule, 1);
    localStorage.setItem("schedules", JSON.stringify(schedules));
    detailModal.classList.add("hidden");
    renderCalendar();
  }
};

todayBtn.onclick = () => {
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
};

prevMonth.onclick = () => {
  const prev = new Date(currentDate);
  prev.setMonth(prev.getMonth() - 1);
  if (prev >= minDate) {
    currentDate = prev;
    renderCalendar();
  }
};

nextMonth.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

monthlyIncomeBox.onclick = () => incomeModal.classList.remove("hidden");

saveIncome.onclick = () => {
  const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  incomes[key] = Number(incomeInput.value);
  localStorage.setItem("incomes", JSON.stringify(incomes));
  incomeModal.classList.add("hidden");
  renderCalendar();
};

addSchedule.onclick = () => scheduleModal.classList.remove("hidden");

saveSchedule.onclick = () => {
  const date = dateInput.value;
  if (!schedules[date]) schedules[date] = [];
  schedules[date].push({
    title: titleInput.value,
    planTime: planTime.value,
    actualTime: actualTime.value,
    place: placeInput.value,
    work: workInput.value,
    leader: leaderInput.value,
    people: peopleInput.value,
    memo: memoInput.value
  });
  localStorage.setItem("schedules", JSON.stringify(schedules));
  scheduleModal.classList.add("hidden");
  renderCalendar();
};

renderCalendar();
