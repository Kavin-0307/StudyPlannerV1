// --- CONFIGURATION ---
const API_BASE = "http://localhost:8080/api";

// --- STATE ---
let selectedFile = null;
let currentLectureId = null;

// --- TAB NAVIGATION ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        const tabId = item.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// --- UPLOAD TAB LOGIC ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const statusMsg = document.getElementById('upload-status');

dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        document.getElementById('drop-text').innerText = `Selected: ${selectedFile.name}`;
    }
};

uploadBtn.onclick = async () => {
    const subjectId = document.getElementById('subject-id').value;
    if (!selectedFile || !subjectId) {
        showStatus("Please select a file and subject ID", "error");
        return;
    }

    try {
        showStatus("Uploading PDF...", "success");
        
        // 1. Upload the File
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('dto', new Blob([JSON.stringify({ title: selectedFile.name })], { type: "application/json" }));

        const uploadRes = await fetch(`${API_BASE}/lectures/${subjectId}`, {
            method: 'POST',
            body: formData
        });

        const lecture = await uploadRes.json();
        currentLectureId = lecture.id;
        document.getElementById('current-lecture-id').value = currentLectureId;

        showStatus(`File uploaded (ID: ${currentLectureId}). Starting ML processing...`, "success");

        // 2. Trigger ML Processing
        const processRes = await fetch(`${API_BASE}/lectures/${currentLectureId}/process`, {
            method: 'POST'
        });

        if (processRes.ok) {
            showStatus("Processing complete! Go to Study Materials.", "success");
        } else {
            throw new Error("ML Pipeline failed");
        }

    } catch (err) {
        showStatus(`Error: ${err.message}`, "error");
    }
};

function showStatus(msg, type) {
    statusMsg.innerText = msg;
    statusMsg.className = `status-msg ${type}`;
}

// --- MATERIALS TAB LOGIC ---
const loadBtn = document.getElementById('fetch-materials-btn');

loadBtn.onclick = async () => {
    const lectureId = document.getElementById('current-lecture-id').value;
    if (!lectureId) return;

    try {
        const res = await fetch(`${API_BASE}/ai-output/lecture/${lectureId}`);
        const outputs = await res.json();

        // Clear previous
        document.getElementById('keyword-tags').innerHTML = "";
        document.getElementById('summary-text').innerText = "Not found";
        document.getElementById('revision-text').innerText = "Not found";

        outputs.forEach(out => {
            if (out.outputType === "SUMMARY") {
                document.getElementById('summary-text').innerText = out.outputContent;
            } else if (out.outputType === "KEYWORDS") {
                const tags = out.outputContent.split(',');
                tags.forEach(t => {
                    const el = document.createElement('span');
                    el.className = 'tag';
                    el.innerText = t.trim();
                    document.getElementById('keyword-tags').appendChild(el);
                });
            } else if (out.outputType === "REVISION_SHEET") {
                document.getElementById('revision-text').innerText = out.outputContent;
            }
        });
    } catch (err) {
        alert("Failed to load materials");
    }
};

// --- CHAT TAB LOGIC ---
const sendBtn = document.getElementById('send-query-btn');
const queryInput = document.getElementById('user-query');
const chatBox = document.getElementById('chat-messages');

sendBtn.onclick = async () => {
    const query = queryInput.value;
    if (!query) return;

    // Add user message
    addMessage(query, 'user');
    queryInput.value = "";

    try {
        const res = await fetch(`${API_BASE}/ai-output/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: query
        });

        const results = await res.json();
        const answer = results.length > 0 ? results.join("\n\n") : "I couldn't find a specific answer for that in the document.";
        addMessage(answer, 'bot');
    } catch (err) {
        addMessage("Error communicating with AI Engine.", "bot");
    }
};

function addMessage(text, side) {
    const msg = document.createElement('div');
    msg.className = `message ${side}`;
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}
