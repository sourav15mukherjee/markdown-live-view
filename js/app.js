(function () {
  'use strict';

  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB

  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const addFileInput = document.getElementById('addFileInput');
  const errorMessage = document.getElementById('errorMessage');
  const uploadSection = document.getElementById('uploadSection');
  const viewerSection = document.getElementById('viewerSection');
  const tabsContainer = document.getElementById('tabs');
  const viewerContent = document.getElementById('viewerContent');
  const clearBtn = document.getElementById('clearBtn');
  const editBtn = document.getElementById('editBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const documentPane = document.getElementById('documentPane');
  const editorPane = document.getElementById('editorPane');
  const editorTextarea = document.getElementById('editorTextarea');
  const editorPreview = document.getElementById('editorPreview');

  let documents = [];
  let activeTab = 0;
  let editMode = false;

  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {}
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {}
      return code;
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.hidden = false;
    setTimeout(function () {
      errorMessage.hidden = true;
    }, 5000);
  }

  function validateFiles(files, isAppend) {
    if (files.length === 0) return false;

    var currentCount = isAppend ? documents.length : 0;
    if (currentCount + files.length > MAX_FILES) {
      showError('Maximum ' + MAX_FILES + ' files allowed. You currently have ' + currentCount + ' and selected ' + files.length + '.');
      return false;
    }

    var totalSize = 0;
    for (var i = 0; i < files.length; i++) {
      if (files[i].size > MAX_FILE_SIZE) {
        showError('File "' + files[i].name + '" exceeds the 5MB size limit.');
        return false;
      }
      totalSize += files[i].size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      showError('Total file size exceeds the 15MB limit.');
      return false;
    }

    return true;
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        resolve({ name: file.name, content: e.target.result });
      };
      reader.onerror = function () {
        reject(new Error('Failed to read file: ' + file.name));
      };
      reader.readAsText(file);
    });
  }

  function renderMarkdown(text) {
    var rawHtml = marked.parse(text);
    return DOMPurify.sanitize(rawHtml);
  }

  function showViewer() {
    uploadSection.hidden = true;
    viewerSection.hidden = false;
  }

  function showUploader() {
    uploadSection.hidden = false;
    viewerSection.hidden = true;
    documents = [];
    activeTab = 0;
    editMode = false;
    tabsContainer.innerHTML = '';
    documentPane.innerHTML = '';
    editorPane.hidden = true;
    downloadBtn.hidden = true;
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Edit';
  }

  function buildTabs() {
    tabsContainer.innerHTML = '';
    documents.forEach(function (doc, index) {
      var tab = document.createElement('div');
      tab.className = 'tab' + (index === activeTab ? ' active' : '');

      var label = document.createElement('span');
      label.textContent = doc.name;
      label.addEventListener('click', function () {
        activeTab = index;
        if (editMode) exitEditMode();
        buildTabs();
        renderActiveDocument();
      });
      tab.appendChild(label);

      var closeBtn = document.createElement('button');
      closeBtn.className = 'tab-close';
      closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeTab(index);
      });
      tab.appendChild(closeBtn);

      tabsContainer.appendChild(tab);
    });

    if (documents.length < MAX_FILES) {
      var addTab = document.createElement('div');
      addTab.className = 'tab tab-add';
      addTab.title = 'Add markdown file';
      addTab.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      addTab.addEventListener('click', function () {
        addFileInput.click();
      });
      tabsContainer.appendChild(addTab);
    }
  }

  function closeTab(index) {
    documents.splice(index, 1);

    if (documents.length === 0) {
      showUploader();
      return;
    }

    if (activeTab >= documents.length) {
      activeTab = documents.length - 1;
    }

    if (editMode) exitEditMode();
    buildTabs();
    renderActiveDocument();
  }

  function renderActiveDocument() {
    if (documents.length === 0) return;
    if (editMode) {
      editorPreview.innerHTML = '<div class="markdown-body">' + renderMarkdown(documents[activeTab].content) + '</div>';
      return;
    }
    var doc = documents[activeTab];
    documentPane.innerHTML = '<div class="markdown-body">' + renderMarkdown(doc.content) + '</div>';
  }

  function enterEditMode() {
    if (documents.length === 0) return;
    editMode = true;
    documentPane.hidden = true;
    editorPane.hidden = false;
    editorTextarea.value = documents[activeTab].content;
    editorPreview.innerHTML = '<div class="markdown-body">' + renderMarkdown(documents[activeTab].content) + '</div>';
    downloadBtn.hidden = false;
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>Done';
  }

  function exitEditMode() {
    editMode = false;
    editorPane.hidden = true;
    documentPane.hidden = false;
    downloadBtn.hidden = true;
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Edit';
    renderActiveDocument();
  }

  function downloadDocument() {
    if (documents.length === 0) return;
    var doc = documents[activeTab];
    var blob = new Blob([doc.content], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleFiles(files, isAppend) {
    errorMessage.hidden = true;

    var fileArray = Array.from(files).filter(function (f) {
      return f.name.match(/\.md$/i) || f.name.match(/\.markdown$/i) || f.name.match(/\.mdx$/i);
    });

    if (fileArray.length === 0) {
      showError('Please select valid markdown files (.md, .markdown, .mdx)');
      return;
    }

    if (!validateFiles(fileArray, isAppend)) return;

    try {
      var newDocs = await Promise.all(fileArray.map(readFile));
      if (isAppend) {
        documents = documents.concat(newDocs);
        activeTab = documents.length - newDocs.length;
      } else {
        documents = newDocs;
        activeTab = 0;
      }
      buildTabs();
      renderActiveDocument();
      showViewer();
    } catch (err) {
      showError(err.message);
    }
  }

  uploadZone.addEventListener('click', function (e) {
    if (e.target.closest('.upload-btn') || e.target.closest('#addFileInput')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files, false);
      fileInput.value = '';
    }
  });

  addFileInput.addEventListener('change', function () {
    if (addFileInput.files.length > 0) {
      handleFiles(addFileInput.files, true);
      addFileInput.value = '';
    }
  });

  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', function () {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, documents.length > 0);
    }
  });

  clearBtn.addEventListener('click', function () {
    showUploader();
  });

  editBtn.addEventListener('click', function () {
    if (editMode) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  });

  editorTextarea.addEventListener('input', function () {
    if (!editMode || documents.length === 0) return;
    documents[activeTab].content = editorTextarea.value;
    editorPreview.innerHTML = '<div class="markdown-body">' + renderMarkdown(documents[activeTab].content) + '</div>';
  });

  downloadBtn.addEventListener('click', function () {
    downloadDocument();
  });
})();
