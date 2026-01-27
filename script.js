const calendar = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");

let current = new Date();
let selectedDate = "";
let editId = null;
let selectedEventId = null;

const data = JSON.parse(localStorage.getItem("calendarData")) || {};
const incomeData = JSON.parse(localStorage.getItem("incomeData")) || {};

/* =====================
  共通保存
===================== */
function saveAll() {
  localStorage.setItem("calendarData", JSON.stringify(data));
  localStorage.setItem("incomeData", JSON.stringify(incomeData));
}

/* =====================
  月移動
===================== */
document.getElementById("prevMonth").onclick = () => changeMonth(-1);
document.getElementById("nextMonth").onclick = () => changeMonth(1);

function changeMonth(diff) {
  current.setMonth(current.getMonth() + diff);
  render();
}

/* =====================
  レンダリング
===================== */
function render() {
  renderCalendar();
  renderIncome();
}

function renderCalendar() {
  calendar.innerHTML = "";

  const y = current.getFullYear();
  const m = current.getMonth();
  monthLabel.textContent = `${y}年 ${m + 1}月`;

  const firstDay = new Date(y, m, 1).getDay();
  const lastDate = new Date(y, m + 1, 0).getDate();
  const todayStr = formatDate(new Date());

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`;
    const cell = document.createElement("div");
    cell.className = "day";

    if (dateStr === todayStr) cell.classList.add("today");

    cell.innerHTML = `<div class="date">${d}</div>`;

    (data[dateStr] || []).forEach(ev => {
      const e = document.createElement("div");
      e.className = "event";
      e.style.background = ev.color;
      e.textContent = ev.title;
      cell.appendChild(e);
    });

    cell.onclick = () => openDayModal(dateStr);
    calendar.appendChild(cell);
  }
}

/* =====================
  日付モーダル
===================== */
function openDayModal(dateStr) {
  selectedDate = dateStr;
  document.getElementById("modalDate").textContent = dateStr;

  const list = document.getElementById("eventList");
  list.innerHTML = "";

  (data[dateStr] || []).forEach(ev => {
    const div = document.createElement("div");
    div.textContent = `${ev.title} / ${ev.place || ""}`;
    div.onclick = () => openActionSheet(dateStr, ev.id);
    list.appendChild(div);
  });

  document.getElementById("dayModal").classList.remove("hidden");
}

function closeDayModal() {
  document.getElementById("dayModal").classList.add("hidden");
}

/* =====================
  アクションシート
===================== */
function openActionSheet(date, eventId) {
  selectedDate = date;
  selectedEventId = eventId;
  document.getElementById("actionSheet").classList.remove("hidden");
}

function closeActionSheet() {
  document.getElementById("actionSheet").classList.add("hidden");
}

/* =====================
  予定フォーム
===================== */
document.getElementById("addBtn").onclick = () => {
  openForm(formatDate(new Date()));
};

function openForm(date) {
  editId = null;
  document.getElementById("formTitle").textContent = "予定追加";
  document.querySelector("#formModal .primary").textContent = "保存";

  document.getElementById("f-date").value = date;

  ["title","place","work","leader","people","memo"].forEach(k => {
    document.getElementById("f-" + k).value = "";
  });

  ["planStart","planEnd","actualStart","actualEnd"].forEach(k => {
    document.getElementById("f-" + k).value = "";
  });

  document.getElementById("f-color").value = "#007AFF";
  document.getElementById("formModal").classList.remove("hidden");
}

function closeForm() {
  document.getElementById("formModal").classList.add("hidden");
}

function saveEvent() {
  const date = document.getElementById("f-date").value;

  const ev = {
    id: editId || crypto.randomUUID(),
    title: f("title"),
    plan: { start: f("planStart"), end: f("planEnd") },
    actual: { start: f("actualStart"), end: f("actualEnd") },
    place: f("place"),
    work: f("work"),
    leader: f("leader"),
    people: f("people"),
    memo: f("memo"),
    color: f("color")
  };

  data[date] = data[date] || [];

  if (editId) {
    data[date] = data[date].map(e => e.id === editId ? ev : e);
  } else {
    data[date].push(ev);
  }

  saveAll();
  closeForm();
  closeDayModal();
  render();
}

/* =====================
  編集・削除
===================== */
function editSelected() {
  const ev = data[selectedDate].find(e => e.id === selectedEventId);
  editId = ev.id;

  document.getElementById("formTitle").textContent = "予定を編集";
  document.querySelector("#formModal .primary").textContent = "更新";

  document.getElementById("f-date").value = selectedDate;
  document.getElementById("f-title").value = ev.title;
  document.getElementById("f-place").value = ev.place;
  document.getElementById("f-work").value = ev.work;
  document.getElementById("f-leader").value = ev.leader;
  document.getElementById("f-people").value = ev.people;
  document.getElementById("f-memo").value = ev.memo;
  document.getElementById("f-color").value = ev.color;

  document.getElementById("f-planStart").value = ev.plan.start;
  document.getElementById("f-planEnd").value = ev.plan.end;
  document.getElementById("f-actualStart").value = ev.actual.start;
  document.getElementById("f-actualEnd").value = ev.actual.end;

  closeActionSheet();
  document.getElementById("formModal").classList.remove("hidden");
}

function confirmDelete() {
  if (!confirm("この予定を削除しますか？")) return;

  data[selectedDate] = data[selectedDate].filter(e => e.id !== selectedEventId);
  saveAll();
  closeActionSheet();
  closeDayModal();
  render();
}

/* =====================
  収入管理
===================== */
function renderIncome() {
  const key = current.getFullYear() + "-" + pad(current.getMonth() + 1);
  document.getElementById("monthIncome").textContent = incomeData[key] || 0;

  const year = current.getFullYear();
  let sum = 0;
  for (let m = 1; m <= 12; m++) {
    sum += Number(incomeData[year + "-" + pad(m)] || 0);
  }
  document.getElementById("yearIncome").textContent = sum;
}

function openIncomeModal() {
  const key = current.getFullYear() + "-" + pad(current.getMonth() + 1);
  document.getElementById("incomeInput").value = incomeData[key] || "";
  document.getElementById("incomeModal").classList.remove("hidden");
}

function closeIncomeModal() {
  document.getElementById("incomeModal").classList.add("hidden");
}

function saveIncome() {
  const key = current.getFullYear() + "-" + pad(current.getMonth() + 1);
  incomeData[key] = Number(document.getElementById("incomeInput").value || 0);
  saveAll();
  closeIncomeModal();
  renderIncome();
}

/* =====================
  util
===================== */
function pad(n) {
  return String(n).padStart(2, "0");
}
function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function f(id) {
  return document.getElementById("f-" + id).value;
}

/* 初期描画 */
render();
