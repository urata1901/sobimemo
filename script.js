/* =========================
   データ管理
========================= */

let data = {
  characters: [],
  folders: ["未分類"],
  presets: []
};

let editId = null;

/* =========================
   保存 / 読込
========================= */

function saveData() {
  localStorage.setItem("charMemoData", JSON.stringify(data));
}

function loadData() {
  const d = localStorage.getItem("charMemoData");
  if (d) data = JSON.parse(d);
}

/* =========================
   モーダル共通
========================= */

function closeModal() {
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.add("hidden");
  });
}

/* =========================
   フォルダ
========================= */

function addFolder() {
  const name = prompt("フォルダ名を入力してください");
  if (!name) return;
  data.folders.push(name);
  saveData();
  renderFolders();
}

function renderFolders() {
  const list = document.getElementById("folderList");
  const select = document.getElementById("charFolder");

  list.innerHTML = "";
  select.innerHTML = "";

  data.folders.forEach(f => {
    list.innerHTML += `<div>${f}</div>`;
    select.innerHTML += `<option value="${f}">${f}</option>`;
  });
}

/* =========================
   キャラ作成 / 編集
========================= */

function openCharacterModal() {
  editId = null;

  document.getElementById("charTitle").value = "";
  document.getElementById("charMemo").value = "";
  document.getElementById("charImage").value = "";
  document.getElementById("charImageUrl").value = "";

  const equipSets = document.getElementById("equipSets");
  equipSets.innerHTML = "";
  addEquipSet();

  document.getElementById("characterModal").classList.remove("hidden");
}

function openEditCharacter(character) {
  editId = character.id;

  document.getElementById("charTitle").value = character.title;
  document.getElementById("charMemo").value = character.memo || "";
  document.getElementById("charImage").value = "";
  document.getElementById("charImageUrl").value = character.image || "";
  document.getElementById("charFolder").value = character.folder;

  const equipSets = document.getElementById("equipSets");
  equipSets.innerHTML = "";

  character.equipments.forEach(es => addEquipSet(es));

  document.getElementById("characterModal").classList.remove("hidden");
}

/* =========================
   装備セット / 装備
========================= */

function addEquipSet(setData = null) {
  const equipSets = document.getElementById("equipSets");

  const setDiv = document.createElement("div");
  setDiv.className = "equip-set";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "装備セット名";
  nameInput.value = setData?.name || "";

  const itemsDiv = document.createElement("div");
  itemsDiv.className = "equip-items";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "＋ 装備追加";
  addBtn.onclick = () => addEquipItem(itemsDiv);

  setDiv.appendChild(nameInput);
  setDiv.appendChild(itemsDiv);
  setDiv.appendChild(addBtn);

  equipSets.appendChild(setDiv);

  if (setData?.items?.length) {
    setData.items.forEach(i => addEquipItem(itemsDiv, i));
  } else {
    addEquipItem(itemsDiv);
  }
}

function addEquipItem(container, value = "") {
  const div = document.createElement("div");
  div.className = "equip-input";

  const input = document.createElement("input");
  input.placeholder = "装備名";
  input.value = value;

  const select = document.createElement("select");
  select.innerHTML = `<option value="">候補</option>`;
  data.presets.forEach(p => {
    select.innerHTML += `<option value="${p}">${p}</option>`;
  });

  select.onchange = () => {
    if (select.value) input.value = select.value;
  };

  div.appendChild(input);
  div.appendChild(select);
  container.appendChild(div);
}

/* =========================
   保存処理
========================= */

function saveCharacter() {
  const title = document.getElementById("charTitle").value.trim();
  const memo = document.getElementById("charMemo").value;
  const folder = document.getElementById("charFolder").value;
  const file = document.getElementById("charImage").files[0];
  const url = document.getElementById("charImageUrl").value.trim();

  if (!title) {
    alert("キャラタイトルは必須です");
    return;
  }

  const equipments = [];

  document.querySelectorAll(".equip-set").forEach(set => {
    const name = set.querySelector("input").value.trim() || "装備";
    const items = [...set.querySelectorAll(".equip-items input")]
      .map(i => i.value.trim())
      .filter(v => v);

    if (items.length) {
      equipments.push({ name, items });
    }
  });

  const save = (image) => {
    const payload = {
      id: editId ?? Date.now(),
      title,
      image,
      folder,
      memo,
      equipments
    };

    if (editId) {
      const index = data.characters.findIndex(c => c.id === editId);
      data.characters[index] = payload;
    } else {
      data.characters.push(payload);
    }

    saveData();
    renderCharacters();
    closeModal();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => save(e.target.result);
    reader.readAsDataURL(file);
  } else {
    save(url || "");
  }
}

/* =========================
   装備候補（プリセット）
========================= */

function openPresetModal() {
  document.getElementById("presetModal").classList.remove("hidden");
  renderPresets();
}

function addPreset() {
  const input = document.getElementById("presetInput");
  const value = input.value.trim();
  if (!value) return;

  data.presets.push(value);
  input.value = "";
  saveData();
  renderPresets();
}

function renderPresets() {
  const list = document.getElementById("presetList");
  list.innerHTML = "";
  data.presets.forEach(p => {
    list.innerHTML += `<li>${p}</li>`;
  });
}

/* =========================
   表示
========================= */

function renderCharacters() {
  const list = document.getElementById("characterList");
  list.innerHTML = "";

  data.characters.forEach(c => {
    const div = document.createElement("div");
    div.className = "character";
    div.onclick = () => openEditCharacter(c);

    div.innerHTML = `
      <img src="${c.image || ""}">
      <div class="character-info">
        <strong>${c.title}</strong>
        ${c.equipments.map(es => `
          <div class="equipment">
            <strong>${es.name}</strong><br>
            ${es.items.join("<br>")}
          </div>
        `).join("")}
      </div>
    `;

    list.appendChild(div);
  });
}

/* =========================
   初期化
========================= */

loadData();
renderFolders();
renderCharacters();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
