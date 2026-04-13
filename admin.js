const FILES = [
  { path: "index.html", label: "首页", hint: "Homepage" },
  { path: "research.html", label: "研究方向", hint: "Research" },
  { path: "equipment.html", label: "研究设备", hint: "Equipment" },
  { path: "members.html", label: "成员介绍", hint: "Members" },
  { path: "achievements.html", label: "研究成果", hint: "Achievements" },
  { path: "activities.html", label: "组内活动", hint: "Activities" },
  { path: "contact.html", label: "加入我们", hint: "Join Us" },
  { path: "shen-shuiwen.html", label: "教授主页", hint: "Professor Detail" },
  { path: "site.css", label: "全站样式", hint: "Stylesheet" },
  { path: "site.js", label: "全站脚本", hint: "Scripts" }
];

const pickButton = document.querySelector("#pick-directory");
const fileList = document.querySelector("#file-list");
const directoryStatus = document.querySelector("#directory-status");
const editorTitle = document.querySelector("#editor-title");
const editorPath = document.querySelector("#editor-path");
const fileEditor = document.querySelector("#file-editor");
const saveButton = document.querySelector("#save-file");
const reloadButton = document.querySelector("#reload-file");
const downloadButton = document.querySelector("#download-file");
const previewButton = document.querySelector("#preview-file");
const wrapToggle = document.querySelector("#wrap-toggle");

let directoryHandle = null;
let activeFile = null;
let activeFileHandle = null;

function setEditorEnabled(enabled) {
  fileEditor.disabled = !enabled;
  saveButton.disabled = !enabled;
  reloadButton.disabled = !enabled;
  downloadButton.disabled = !enabled;
  previewButton.disabled = !enabled || !activeFile || !activeFile.path.endsWith(".html");
}

function updateStatus(message) {
  directoryStatus.textContent = message;
}

function renderFileList() {
  fileList.innerHTML = "";

  FILES.forEach((file) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "file-button";
    if (activeFile && activeFile.path === file.path) {
      button.classList.add("is-active");
    }
    button.innerHTML = `${file.label}<small>${file.path} · ${file.hint}</small>`;
    button.addEventListener("click", () => {
      void openFile(file);
    });
    fileList.appendChild(button);
  });
}

async function openFile(file) {
  if (!directoryHandle) {
    updateStatus("请先选择网站文件夹。");
    return;
  }

  try {
    const handle = await directoryHandle.getFileHandle(file.path);
    const blob = await handle.getFile();
    const content = await blob.text();

    activeFile = file;
    activeFileHandle = handle;
    fileEditor.value = content;
    editorTitle.textContent = file.label;
    editorPath.textContent = file.path;
    setEditorEnabled(true);
    renderFileList();
    updateStatus(`已加载 ${file.path}`);
  } catch (error) {
    console.error(error);
    updateStatus(`无法打开 ${file.path}，请确认选择的是 /home/lin/wangye 目录。`);
  }
}

async function pickDirectory() {
  if (!window.showDirectoryPicker) {
    updateStatus("当前浏览器不支持文件系统访问，请改用 Chrome 或 Edge。");
    return;
  }

  try {
    directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    updateStatus("站点目录已连接，可以开始编辑。");
    renderFileList();
  } catch (error) {
    if (error && error.name === "AbortError") return;
    console.error(error);
    updateStatus("选择目录失败，请重试。");
  }
}

async function saveCurrentFile() {
  if (!activeFileHandle) return;

  try {
    const writable = await activeFileHandle.createWritable();
    await writable.write(fileEditor.value);
    await writable.close();
    updateStatus(`已保存 ${activeFile.path}`);
  } catch (error) {
    console.error(error);
    updateStatus(`保存失败：${activeFile.path}`);
  }
}

async function reloadCurrentFile() {
  if (!activeFile) return;
  await openFile(activeFile);
}

function downloadCurrentFile() {
  if (!activeFile) return;

  const blob = new Blob([fileEditor.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = activeFile.path;
  anchor.click();
  URL.revokeObjectURL(url);
}

function previewCurrentFile() {
  if (!activeFile || !activeFile.path.endsWith(".html")) return;
  window.open(activeFile.path, "_blank", "noopener");
}

pickButton.addEventListener("click", () => {
  void pickDirectory();
});

saveButton.addEventListener("click", () => {
  void saveCurrentFile();
});

reloadButton.addEventListener("click", () => {
  void reloadCurrentFile();
});

downloadButton.addEventListener("click", downloadCurrentFile);
previewButton.addEventListener("click", previewCurrentFile);

wrapToggle.addEventListener("change", () => {
  fileEditor.classList.toggle("is-nowrap", !wrapToggle.checked);
});

setEditorEnabled(false);
renderFileList();
