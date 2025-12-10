// API 기본 URL
const API_BASE = '/api/inquiries';
const AUTH_API_BASE = '/api/auth';
const PASSWORD_API_BASE = '/api/auth/change-password';

// 현재 선택된 문의 ID
let currentInquiryId = null;

// 로그인 상태 확인
async function checkAuth() {
    try {
        const response = await fetch(`${AUTH_API_BASE}/check`, {
            credentials: 'include',
        });
        const result = await response.json();
        
        if (!result.authenticated) {
            // 로그인되지 않았으면 로그인 페이지로 리다이렉트
            window.location.href = '/admin-login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('인증 확인 실패:', error);
        window.location.href = '/admin-login.html';
        return false;
    }
}

// DOM 요소
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const adminSidebar = document.getElementById('adminSidebar');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const inquiriesList = document.getElementById('inquiriesList');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const statusFilter = document.getElementById('statusFilter');
const refreshBtn = document.getElementById('refreshBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const statusSelect = document.getElementById('statusSelect');
const updateStatusBtn = document.getElementById('updateStatusBtn');
const deleteBtn = document.getElementById('deleteBtn');

// 모바일 메뉴 토글
function openSidebar() {
    adminSidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    adminSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', openSidebar);
}

if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

// 메뉴 아이템 클릭
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        
        // 로그아웃 버튼은 제외
        if (!section) return;
        
        // 활성 메뉴 업데이트
        menuItems.forEach(mi => {
            if (mi.getAttribute('data-section')) {
                mi.classList.remove('active');
            }
        });
        item.classList.add('active');
        
        // 섹션 전환
        contentSections.forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 모바일에서 사이드바 닫기
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
        
        // 통계 섹션이면 통계 로드
        if (section === 'stats') {
            loadStats();
        }
        
        // 비밀번호 변경 섹션이면 폼 초기화
        if (section === 'password') {
            resetPasswordForm();
        }
    });
});

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 상태 한글 변환
function getStatusText(status) {
    const statusMap = {
        'pending': '대기중',
        'contacted': '연락완료',
        'completed': '처리완료'
    };
    return statusMap[status] || status;
}

// 문의 리스트 로드
async function loadInquiries() {
    // 인증 확인
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return;
    }
    
    loading.style.display = 'block';
    emptyState.style.display = 'none';
    inquiriesList.innerHTML = '';
    
    try {
        const status = statusFilter.value;
        const url = status ? `${API_BASE}?status=${status}` : API_BASE;
        
        const response = await fetch(url, {
            credentials: 'include',
        });
        
        // 401 에러 시 로그인 페이지로 리다이렉트
        if (response.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            result.data.forEach(inquiry => {
                const item = createInquiryItem(inquiry);
                inquiriesList.appendChild(item);
            });
            loading.style.display = 'none';
        } else {
            loading.style.display = 'none';
            emptyState.style.display = 'block';
        }
    } catch (error) {
        console.error('문의 리스트 로드 실패:', error);
        loading.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = '<p>데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 문의 아이템 생성
function createInquiryItem(inquiry) {
    const item = document.createElement('div');
    item.className = 'inquiry-item';
    item.setAttribute('data-id', inquiry.id);
    
    item.innerHTML = `
        <div class="inquiry-header">
            <div class="inquiry-name">${escapeHtml(inquiry.name)}</div>
            <span class="inquiry-status ${inquiry.status}">${getStatusText(inquiry.status)}</span>
        </div>
        <div class="inquiry-info">
            <div class="inquiry-info-item">
                <strong>연락처:</strong>
                <span>${escapeHtml(inquiry.phone)}</span>
            </div>
            <div class="inquiry-info-item">
                <strong>문의유형:</strong>
                <span>${escapeHtml(inquiry.service)}</span>
            </div>
        </div>
        ${inquiry.message ? `<div class="inquiry-message">${escapeHtml(inquiry.message)}</div>` : ''}
        <div class="inquiry-date">${formatDate(inquiry.created_at)}</div>
    `;
    
    item.addEventListener('click', () => {
        openModal(inquiry);
    });
    
    return item;
}

// 모달 열기
function openModal(inquiry) {
    currentInquiryId = inquiry.id;
    statusSelect.value = inquiry.status;
    
    modalBody.innerHTML = `
        <div class="modal-detail-item">
            <div class="modal-detail-label">이름</div>
            <div class="modal-detail-value">${escapeHtml(inquiry.name)}</div>
        </div>
        <div class="modal-detail-item">
            <div class="modal-detail-label">연락처</div>
            <div class="modal-detail-value">${escapeHtml(inquiry.phone)}</div>
        </div>
        <div class="modal-detail-item">
            <div class="modal-detail-label">문의 유형</div>
            <div class="modal-detail-value">${escapeHtml(inquiry.service)}</div>
        </div>
        ${inquiry.message ? `
        <div class="modal-detail-item">
            <div class="modal-detail-label">문의 내용</div>
            <div class="modal-detail-value">${escapeHtml(inquiry.message)}</div>
        </div>
        ` : ''}
        <div class="modal-detail-item">
            <div class="modal-detail-label">등록일시</div>
            <div class="modal-detail-value">${formatDate(inquiry.created_at)}</div>
        </div>
        <div class="modal-detail-item">
            <div class="modal-detail-label">상태</div>
            <div class="modal-detail-value">${getStatusText(inquiry.status)}</div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 모달 닫기
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentInquiryId = null;
}

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// 상태 업데이트
if (updateStatusBtn) {
    updateStatusBtn.addEventListener('click', async () => {
        if (!currentInquiryId) return;
        
        // 인증 확인
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            return;
        }
        
        const newStatus = statusSelect.value;
        
        try {
            const response = await fetch(`${API_BASE}/${currentInquiryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include',
            });
            
            // 401 에러 시 로그인 페이지로 리다이렉트
            if (response.status === 401) {
                window.location.href = '/admin-login.html';
                return;
            }
            
            const result = await response.json();
            
            if (result.success) {
                closeModal();
                loadInquiries();
                loadStats();
            } else {
                alert('상태 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('상태 업데이트 실패:', error);
            alert('상태 업데이트 중 오류가 발생했습니다.');
        }
    });
}

// 문의 삭제
if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
        if (!currentInquiryId) return;
        
        // 인증 확인
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            return;
        }
        
        if (!confirm('정말 삭제하시겠습니까?')) return;
        
        try {
            const response = await fetch(`${API_BASE}/${currentInquiryId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            // 401 에러 시 로그인 페이지로 리다이렉트
            if (response.status === 401) {
                window.location.href = '/admin-login.html';
                return;
            }
            
            const result = await response.json();
            
            if (result.success) {
                closeModal();
                loadInquiries();
                loadStats();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    });
}

// 통계 로드
async function loadStats() {
    // 인증 확인
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return;
    }
    
    try {
        const [totalRes, pendingRes, contactedRes, completedRes] = await Promise.all([
            fetch(API_BASE, { credentials: 'include' }),
            fetch(`${API_BASE}?status=pending`, { credentials: 'include' }),
            fetch(`${API_BASE}?status=contacted`, { credentials: 'include' }),
            fetch(`${API_BASE}?status=completed`, { credentials: 'include' }),
        ]);
        
        // 401 에러 체크
        if (totalRes.status === 401 || pendingRes.status === 401 || contactedRes.status === 401 || completedRes.status === 401) {
            window.location.href = '/admin-login.html';
            return;
        }
        
        const totalData = await totalRes.json();
        const pendingData = await pendingRes.json();
        const contactedData = await contactedRes.json();
        const completedData = await completedRes.json();
        
        document.getElementById('totalInquiries').textContent = totalData.total || 0;
        document.getElementById('pendingInquiries').textContent = pendingData.total || 0;
        document.getElementById('contactedInquiries').textContent = contactedData.total || 0;
        document.getElementById('completedInquiries').textContent = completedData.total || 0;
    } catch (error) {
        console.error('통계 로드 실패:', error);
    }
}

// 필터 변경
if (statusFilter) {
    statusFilter.addEventListener('change', loadInquiries);
}

// 새로고침 버튼
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        loadInquiries();
        loadStats();
    });
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 비밀번호 변경 폼
const passwordChangeForm = document.getElementById('passwordChangeForm');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordErrorMessage = document.getElementById('passwordErrorMessage');
const changePasswordBtn = document.getElementById('changePasswordBtn');

// 비밀번호 변경 폼 초기화
function resetPasswordForm() {
    if (passwordChangeForm) {
        passwordChangeForm.reset();
    }
    if (passwordErrorMessage) {
        passwordErrorMessage.classList.remove('show');
        passwordErrorMessage.textContent = '';
    }
}

// 비밀번호 변경 에러 메시지 표시
function showPasswordError(message) {
    if (passwordErrorMessage) {
        passwordErrorMessage.textContent = message;
        passwordErrorMessage.classList.add('show');
        setTimeout(() => {
            passwordErrorMessage.classList.remove('show');
        }, 5000);
    }
}

// 비밀번호 변경 성공 메시지 표시
function showPasswordSuccess(message) {
    // 성공 메시지 요소가 없으면 생성
    let successMessage = document.getElementById('passwordSuccessMessage');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'passwordSuccessMessage';
        successMessage.className = 'password-success-message';
        if (passwordChangeForm && passwordErrorMessage) {
            passwordChangeForm.insertBefore(successMessage, passwordErrorMessage.nextSibling);
        }
    }
    successMessage.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// 비밀번호 변경 폼 제출
if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 인증 확인
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            return;
        }
        
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // 에러 메시지 초기화
        if (passwordErrorMessage) {
            passwordErrorMessage.classList.remove('show');
        }
        
        // 유효성 검사
        if (!currentPassword || !newPassword || !confirmPassword) {
            showPasswordError('모든 필드를 입력해주세요.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showPasswordError('새 비밀번호가 일치하지 않습니다.');
            confirmPasswordInput.focus();
            return;
        }
        
        if (currentPassword === newPassword) {
            showPasswordError('현재 비밀번호와 새 비밀번호가 동일합니다.');
            newPasswordInput.focus();
            return;
        }
        
        // 버튼 비활성화 및 로딩 상태
        if (changePasswordBtn) {
            changePasswordBtn.disabled = true;
            changePasswordBtn.textContent = '변경 중...';
        }
        
        try {
            const response = await fetch(PASSWORD_API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
                credentials: 'include',
            });
            
            const result = await response.json();
            
            // 401 에러 처리 (현재 비밀번호 불일치 또는 인증 만료)
            if (response.status === 401) {
                // 인증 만료인 경우 (success가 false이고 error가 '인증이 필요합니다'인 경우)
                if (result.error && result.error.includes('인증이 필요')) {
                    window.location.href = '/admin-login.html';
                    return;
                }
                // 현재 비밀번호 불일치인 경우 에러 메시지 표시
                showPasswordError(result.error || '현재 비밀번호가 일치하지 않습니다.');
                return;
            }
            
            if (result.success) {
                showPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
                resetPasswordForm();
            } else {
                showPasswordError(result.error || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            showPasswordError('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            // 버튼 활성화 및 원래 텍스트 복원
            if (changePasswordBtn) {
                changePasswordBtn.disabled = false;
                changePasswordBtn.textContent = '비밀번호 변경';
            }
        }
    });
}

// 로그아웃
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('로그아웃 하시겠습니까?')) {
            try {
                // 서버 측에서 쿠키 삭제
                await fetch(`${AUTH_API_BASE}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                });
            } catch (error) {
                console.error('로그아웃 API 호출 실패:', error);
            }
            
            // 클라이언트 측 쿠키도 삭제 시도 (HttpOnly가 아닌 경우를 위해)
            document.cookie = 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            // 로그인 페이지로 리다이렉트
            window.location.href = '/admin-login.html';
        }
    });
}

// 페이지 로드 시 즉시 인증 체크 (DOMContentLoaded 전에 실행)
(async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        // 인증되지 않았으면 여기서 중단 (리다이렉트됨)
        return;
    }
})();

// 초기 로드
document.addEventListener('DOMContentLoaded', async () => {
    // 로그인 확인 후 데이터 로드
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        // 인증되지 않았으면 리다이렉트됨
        return;
    }
    
    loadInquiries();
    loadStats();
    
    // 30초마다 자동 새로고침
    setInterval(() => {
        loadInquiries();
        loadStats();
    }, 30000);
});

