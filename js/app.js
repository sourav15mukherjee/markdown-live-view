(function () {
  'use strict';

  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB

  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const errorMessage = document.getElementById('errorMessage');
  const uploadSection = document.getElementById('uploadSection');
  const viewerSection = document.getElementById('viewerSection');
  const tabsContainer = document.getElementById('tabs');
  const viewerContent = document.getElementById('viewerContent');
  const clearBtn = document.getElementById('clearBtn');

  let documents = [];
  let activeTab = 0;

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

  function validateFiles(files) {
    if (files.length === 0) return false;

    if (files.length > MAX_FILES) {
      showError('Maximum ' + MAX_FILES + ' files allowed. You selected ' + files.length + '.');
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
    tabsContainer.innerHTML = '';
    viewerContent.innerHTML = '';
  }

  function buildTabs() {
    tabsContainer.innerHTML = '';
    documents.forEach(function (doc, index) {
      var tab = document.createElement('button');
      tab.className = 'tab' + (index === activeTab ? ' active' : '');
      tab.textContent = doc.name;
      tab.addEventListener('click', function () {
        activeTab = index;
        buildTabs();
        renderActiveDocument();
      });
      tabsContainer.appendChild(tab);
    });
  }

  function renderActiveDocument() {
    if (documents.length === 0) return;
    var doc = documents[activeTab];
    viewerContent.innerHTML = '<div class="markdown-body">' + renderMarkdown(doc.content) + '</div>';
  }

  async function handleFiles(files) {
    errorMessage.hidden = true;

    var fileArray = Array.from(files).filter(function (f) {
      return f.name.match(/\.md$/i) || f.name.match(/\.markdown$/i) || f.name.match(/\.mdx$/i);
    });

    if (fileArray.length === 0) {
      showError('Please select valid markdown files (.md, .markdown, .mdx)');
      return;
    }

    if (!validateFiles(fileArray)) return;

    try {
      documents = await Promise.all(fileArray.map(readFile));
      activeTab = 0;
      buildTabs();
      renderActiveDocument();
      showViewer();
    } catch (err) {
      showError(err.message);
    }
  }

  uploadZone.addEventListener('click', function (e) {
    if (e.target.closest('.upload-btn')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
      fileInput.value = '';
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
      handleFiles(e.dataTransfer.files);
    }
  });

  clearBtn.addEventListener('click', function () {
    showUploader();
  });
})();
