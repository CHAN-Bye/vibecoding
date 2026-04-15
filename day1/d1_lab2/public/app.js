let currentPage = 1;
let currentSearch = '';
let currentInquiryId = null;

// --- View Navigation ---

function showListView() {
  document.getElementById('list-view').style.display = '';
  document.getElementById('write-view').style.display = 'none';
  document.getElementById('detail-view').style.display = 'none';
  loadInquiries();
}

function showWriteView() {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('write-view').style.display = '';
  document.getElementById('detail-view').style.display = 'none';
  document.getElementById('inquiry-form').reset();
}

function showDetailView() {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('write-view').style.display = 'none';
  document.getElementById('detail-view').style.display = '';
}

// --- API Calls ---

async function loadInquiries() {
  const params = new URLSearchParams({ page: currentPage });
  if (currentSearch) params.set('search', currentSearch);

  const res = await fetch('/api/inquiries?' + params);
  const data = await res.json();

  renderList(data.inquiries);
  renderPagination(data.page, data.totalPages);
}

function renderList(inquiries) {
  const tbody = document.getElementById('inquiry-list');
  const table = document.getElementById('inquiry-table');
  const empty = document.getElementById('empty-message');

  if (inquiries.length === 0) {
    table.style.display = 'none';
    empty.style.display = '';
    return;
  }

  table.style.display = '';
  empty.style.display = 'none';

  tbody.innerHTML = inquiries.map(item => `
    <tr data-id="${item.id}">
      <td class="col-no">${item.id}</td>
      <td class="col-category">${escapeHtml(item.category)}</td>
      <td class="col-title">${escapeHtml(item.title)}</td>
      <td class="col-name">${escapeHtml(item.name)}</td>
      <td class="col-status">
        <span class="badge badge-status ${item.status === '답변완료' ? 'completed' : ''}">${escapeHtml(item.status)}</span>
      </td>
      <td class="col-date">${formatDate(item.created_at)}</td>
    </tr>
  `).join('');
}

function renderPagination(page, totalPages) {
  const container = document.getElementById('pagination');
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  const start = Math.max(1, page - 4);
  const end = Math.min(totalPages, start + 9);

  if (page > 1) {
    html += `<button onclick="goToPage(${page - 1})">&lt;</button>`;
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (page < totalPages) {
    html += `<button onclick="goToPage(${page + 1})">&gt;</button>`;
  }

  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadInquiries();
}

function searchInquiries() {
  currentSearch = document.getElementById('search-input').value.trim();
  currentPage = 1;
  loadInquiries();
}

// Enter key for search
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchInquiries();
});

async function submitInquiry(e) {
  e.preventDefault();

  const body = {
    name: document.getElementById('inp-name').value.trim(),
    email: document.getElementById('inp-email').value.trim(),
    category: document.getElementById('inp-category').value,
    title: document.getElementById('inp-title').value.trim(),
    content: document.getElementById('inp-content').value.trim(),
    password: document.getElementById('inp-password').value,
  };

  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || '오류가 발생했습니다.');
    return;
  }

  alert('문의가 등록되었습니다.');
  showListView();
}

async function viewInquiry(id) {
  const res = await fetch('/api/inquiries/' + id);
  if (!res.ok) {
    alert('문의를 찾을 수 없습니다.');
    return;
  }

  const item = await res.json();
  currentInquiryId = id;

  document.getElementById('detail-title').textContent = item.title;
  document.getElementById('detail-category').textContent = item.category;
  document.getElementById('detail-category').className = 'badge badge-category';
  document.getElementById('detail-status').textContent = item.status;
  document.getElementById('detail-status').className = 'badge badge-status' + (item.status === '답변완료' ? ' completed' : '');
  document.getElementById('detail-name').textContent = item.name + ' (' + item.email + ')';
  document.getElementById('detail-date').textContent = formatDate(item.created_at);
  document.getElementById('detail-content').textContent = item.content;

  // AI 분석 결과 표시
  const aiSection = document.getElementById('ai-analysis-section');
  if (item.ai_category) {
    aiSection.style.display = '';

    document.getElementById('ai-category').innerHTML =
      `<span class="ai-badge category-badge">${escapeHtml(item.ai_category)}</span>`;

    const sentimentMap = { '긍정': 'positive', '부정': 'negative', '중립': 'neutral' };
    const sentimentClass = sentimentMap[item.ai_sentiment] || 'neutral';
    document.getElementById('ai-sentiment').innerHTML =
      `<span class="ai-badge sentiment-${sentimentClass}">${escapeHtml(item.ai_sentiment)}</span>`;

    const urgencyMap = { '높음': 'high', '보통': 'medium', '낮음': 'low' };
    const urgencyClass = urgencyMap[item.ai_urgency] || 'medium';
    document.getElementById('ai-urgency').innerHTML =
      `<span class="ai-badge urgency-${urgencyClass}">${escapeHtml(item.ai_urgency)}</span>`;

    let keywords = [];
    try { keywords = JSON.parse(item.ai_keywords); } catch {}
    document.getElementById('ai-keywords').innerHTML =
      keywords.map(k => `<span class="ai-tag">${escapeHtml(k)}</span>`).join('');

    document.getElementById('ai-summary').textContent = item.ai_summary || '';
  } else {
    aiSection.style.display = '';
    document.getElementById('ai-category').innerHTML = '';
    document.getElementById('ai-sentiment').innerHTML = '';
    document.getElementById('ai-urgency').innerHTML = '';
    document.getElementById('ai-keywords').innerHTML = '';
    document.getElementById('ai-summary').innerHTML =
      '<span class="ai-loading">AI 분석 중입니다... 잠시 후 새로고침 해주세요.</span>';
  }

  const replySection = document.getElementById('detail-reply-section');
  if (item.reply) {
    replySection.style.display = '';
    document.getElementById('detail-reply').textContent = item.reply;
  } else {
    replySection.style.display = 'none';
  }

  showDetailView();
}

async function deleteInquiry() {
  if (!currentInquiryId) return;

  const password = prompt('비밀번호를 입력하세요:');
  if (!password) return;

  const res = await fetch('/api/inquiries/' + currentInquiryId, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || '삭제에 실패했습니다.');
    return;
  }

  alert('문의가 삭제되었습니다.');
  showListView();
}

// --- Utilities ---

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- Event Delegation ---
document.getElementById('inquiry-list').addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-id]');
  if (row) viewInquiry(Number(row.dataset.id));
});

// --- Init ---
loadInquiries();
