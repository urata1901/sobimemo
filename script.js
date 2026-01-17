// データ
let characters = JSON.parse(localStorage.getItem("characters")) || [];
let folders = JSON.parse(localStorage.getItem("folders")) || [];
let selectMode = false;

// DOM
const folderContainer = document.getElementById("folderContainer");
const addCharacterBtn = document.getElementById("addCharacterBtn");
const toggleSelectModeBtn = document.getElementById("toggleSelectModeBtn");
const selectAllBtn = document.getElementById("selectAllBtn");
const deselectAllBtn = document.getElementById("deselectAllBtn");
const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
const bulkMoveSelect = document.getElementById("bulkMoveSelect");
const bulkMoveBtn = document.getElementById("bulkMoveBtn");
const searchInput = document.getElementById("searchInput");

// キャラモーダル
const characterModal = document.getElementById("characterModal");
const characterForm = document.getElementById("characterForm");
const characterTitle = document.getElementById("characterTitle");
const characterImage = document.getElementById("characterImage");
const characterFolder = document.getElementById("characterFolder");
const characterNote = document.getElementById("characterNote");
const equipmentSetsContainer = document.getElementById("equipmentSetsContainer");
const addEquipmentSetBtn = document.getElementById("addEquipmentSetBtn");

// キャラ詳細モーダル
const characterDetailModal = document.getElementById("characterDetailModal");
const detailTitle = document.getElementById("detailTitle");
const detailImage = document.getElementById("detailImage");
const detailNote = document.getElementById("detailNote");
const detailEquipment = document.getElementById("detailEquipment");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailDeleteBtn = document.getElementById("detailDeleteBtn");

// フォルダモーダル
const folderBtn = document.getElementById("folderBtn");
const folderModal = document.getElementById("folderModal");
const folderModalContent = document.getElementById("folderModalContent");

// -------------------- 保存 --------------------
const save = () => {
  localStorage.setItem("characters", JSON.stringify(characters));
  localStorage.setItem("folders", JSON.stringify(folders));
  updateBulkMoveSelect();
  render();
};

// -------------------- フォルダ管理 --------------------
folderBtn.onclick = () => {
  folderModalContent.innerHTML = `<h3>フォルダ管理</h3>
    <div>
      <input id="newFolderInput" placeholder="新規フォルダ名">
      <button id="createFolderBtn">作成</button>
    </div>
    <div id="folderListContainer"></div>
    <button onclick="folderModal.classList.remove('active')">閉じる</button>`;
  
  const listContainer = folderModalContent.querySelector("#folderListContainer");
  folders.forEach(f => {
    const div = document.createElement("div");
    div.innerHTML = `<span>${f}</span> <button onclick="deleteFolder('${f}')">・・・</button>`;
    listContainer.appendChild(div);
  });
  folderModal.classList.add("active");

  const input = folderModalContent.querySelector("#newFolderInput");
  const createBtn = folderModalContent.querySelector("#createFolderBtn");
  createBtn.onclick = () => {
    const val = input.value.trim();
    if(!val) return;
    if(!folders.includes(val)) folders.push(val);
    input.value = "";
    save();
    folderModal.classList.remove("active"); // ← 追加後にモーダル閉じる
    render();
  };
};

function deleteFolder(name){
  if(!confirm(`フォルダ「${name}」を削除しますか？\n中のキャラは未分類に移動します`)) return;
  folders = folders.filter(f => f !== name);
  characters.forEach(c => { if(c.folder === name) c.folder = ""; });
  save();
}

// -------------------- 選択モード --------------------
toggleSelectModeBtn.onclick = () => {
  selectMode = !selectMode;
  document.body.classList.toggle("select-mode-active", selectMode);
  render();
};

// -------------------- キャラ追加 --------------------
addCharacterBtn.onclick = () => {
  openCharacterForm();
};

function openCharacterForm(index = null){
  characterForm.dataset.editIndex = index === null ? "" : index;
  if(index === null){
    characterTitle.value = "";
    characterNote.value = "";
    characterImage.value = "";
    equipmentSetsContainer.innerHTML = "";
    updateCharacterFolderSelect();
  } else {
    const c = characters[index];
    characterTitle.value = c.title;
    characterNote.value = c.note;
    equipmentSetsContainer.innerHTML = "";
    c.equipmentSets.forEach(s => {
      const setDiv = document.createElement("div");
      setDiv.className = "equipment-set";
      setDiv.innerHTML = `<input class="equipSetName" placeholder="セット名" value="${s.name}">
        ${s.items.map(it => `<input class="equipItem" placeholder="装備名" value="${it}">`).join("")}
        <button type="button" class="addEquipItemBtn">装備追加</button>`;
      setDiv.querySelector(".addEquipItemBtn").onclick = () => {
        const input = document.createElement("input"); 
        input.className = "equipItem"; 
        input.placeholder = "装備名"; 
        setDiv.insertBefore(input, setDiv.querySelector(".addEquipItemBtn")); 
      };
      equipmentSetsContainer.appendChild(setDiv);
    });
    updateCharacterFolderSelect();
    characterFolder.value = c.folder || "";
  }
  characterModal.classList.add("active");
}

function updateCharacterFolderSelect(){
  characterFolder.innerHTML = "<option value=''>未分類</option>";
  folders.forEach(f => characterFolder.innerHTML += `<option value="${f}">${f}</option>`);
}

// -------------------- 装備セット追加 --------------------
addEquipmentSetBtn.onclick = () => {
  const setDiv = document.createElement("div");
  setDiv.className = "equipment-set";
  setDiv.innerHTML = `<input placeholder="セット名" class="equipSetName">
    <input placeholder="装備1" class="equipItem">
    <button type="button" class="addEquipItemBtn">装備追加</button>`;
  const addItemBtn = setDiv.querySelector(".addEquipItemBtn");
  addItemBtn.onclick = () => {
    const input = document.createElement("input");
    input.placeholder = "装備名";
    input.className = "equipItem";
    setDiv.insertBefore(input, addItemBtn);
  };
  equipmentSetsContainer.appendChild(setDiv);
};

// -------------------- キャラ保存（画像保持対応） --------------------
characterForm.onsubmit = e => {
  e.preventDefault();
  const title = characterTitle.value.trim();
  if(!title) return alert("キャラ名を入力してください");
  const folder = characterFolder.value;
  const note = characterNote.value;
  const equipSets = [...equipmentSetsContainer.querySelectorAll(".equipment-set")].map(s => {
    const name = s.querySelector(".equipSetName").value.trim();
    const items = [...s.querySelectorAll(".equipItem")].map(it => it.value.trim()).filter(x => x);
    return {name, items};
  });

  const index = characterForm.dataset.editIndex;
  let imgData = index !== "" ? characters[index].image || "" : "";

  const file = characterImage.files[0];

  const saveChar = () => {
    const newChar = {title, folder, note, image: imgData, equipmentSets: equipSets};
    if(index === "") characters.push(newChar);
    else characters[index] = {...characters[index], ...newChar};
    save();
    characterModal.classList.remove("active");
  };

  if(file){
    const reader = new FileReader();
    reader.onload = e => { imgData = e.target.result; saveChar(); };
    reader.readAsDataURL(file);
  } else saveChar();
};

// -------------------- render --------------------
function render(keyword=""){
  folderContainer.innerHTML = "";
  const folderNames = ["未分類", ...folders];
  folderNames.forEach(folderName => {
    const charsInFolder = characters.filter(c => c.folder === folderName || (folderName === "未分類" && (!c.folder || c.folder === "")));
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder-block";
    const folderHeader = document.createElement("div");
    folderHeader.className = "folder-header";
    folderHeader.innerHTML = `<span>${folderName}</span> <button class="folder-options">・・・</button>`;
    folderHeader.querySelector(".folder-options").onclick = () => { if(folderName!=="未分類") deleteFolder(folderName); };
    folderDiv.appendChild(folderHeader);

    charsInFolder.forEach((c, i) => {
      const card = createCharacterCard(c, i);
      folderDiv.appendChild(card);
    });

    folderContainer.appendChild(folderDiv);
  });
  updateBulkMoveSelect();
}

function createCharacterCard(c, i){
  const card = document.createElement("div");
  card.className = "character-card";
  card.onclick = () => { 
    if(selectMode) card.classList.toggle("selected"); 
    else openDetailModal(i); 
  };
  const imgHTML = c.image ? `<img src="${c.image}">` : `<div class="no-image"></div>`;
  const titleHTML = `<div class="character-title">${c.title}</div>`;
  const equipHTML = c.equipmentSets.map(s => `<div class="home-equipment-set"><strong>${s.name}</strong>${s.items.map(it=>`<span>${it}</span>`).join("")}</div>`).join("");
  const infoHTML = `<div class="character-info">${titleHTML}<div class="home-equipment-row">${equipHTML}</div></div>`;

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "card-actions";
  const editBtn = document.createElement("button");
  editBtn.textContent = "編集";
  editBtn.onclick = e => { e.stopPropagation(); openCharacterForm(i); };
  const delBtn = document.createElement("button");
  delBtn.textContent = "削除";
  delBtn.onclick = e => { e.stopPropagation(); if(!confirm("削除しますか？")) return; characters.splice(i,1); save(); };
  actionsDiv.append(editBtn, delBtn);

  card.innerHTML = imgHTML + infoHTML;
  card.appendChild(actionsDiv);
  return card;
}

// -------------------- キャラ詳細モーダル --------------------
function openDetailModal(i){
  const c = characters[i];
  detailTitle.textContent = c.title;
  detailImage.src = c.image || "";
  detailNote.textContent = c.note || "";
  detailEquipment.innerHTML = c.equipmentSets.map(s => `<div class="home-equipment-set"><strong>${s.name}</strong>${s.items.map(it => `<span>${it}</span>`).join("")}</div>`).join("");
  detailEditBtn.onclick = () => { characterDetailModal.classList.remove("active"); openCharacterForm(i); };
  detailDeleteBtn.onclick = () => { if(confirm("削除しますか？")){ characters.splice(i,1); save(); characterDetailModal.classList.remove("active"); } };
  characterDetailModal.classList.add("active");
}

// -------------------- 一括操作 --------------------
function updateBulkMoveSelect(){
  bulkMoveSelect.innerHTML = `<option value="">フォルダ移動</option>`;
  folders.forEach(f => bulkMoveSelect.innerHTML += `<option value="${f}">${f}</option>`);
  bulkMoveSelect.innerHTML += `<option value="">未分類</option>`;
}

selectAllBtn.onclick = () => { document.querySelectorAll(".folder-block .character-card").forEach(c => c.classList.add("selected")); };
deselectAllBtn.onclick = () => { document.querySelectorAll(".folder-block .character-card").forEach(c => c.classList.remove("selected")); };

bulkDeleteBtn.onclick = () => {
  const selectedIdx = [...document.querySelectorAll(".character-card.selected")].map(c => [...folderContainer.querySelectorAll(".character-card")].indexOf(c));
  if(!selectedIdx.length) return alert("選択されていません");
  if(!confirm("選択したキャラを削除しますか？")) return;
  characters = characters.filter((c, i) => !selectedIdx.includes(i));
  save();
};

bulkMoveBtn.onclick = () => {
  const folder = bulkMoveSelect.value;
  if(!folder) return;
  const selectedIdx = [...document.querySelectorAll(".character-card.selected")].map(c => [...folderContainer.querySelectorAll(".character-card")].indexOf(c));
  selectedIdx.forEach(i => characters[i].folder = folder);
  save();
};

// -------------------- 検索 --------------------
searchInput.oninput = () => render(searchInput.value.toLowerCase());

// 初期描画
updateBulkMoveSelect();
render();
