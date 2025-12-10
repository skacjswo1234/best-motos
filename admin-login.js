// API 기본 URL
const API_BASE = '/api/auth';

// DOM 요소
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

// 에러 메시지 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// 에러 메시지 숨기기
function hideError() {
    errorMessage.classList.remove('show');
}

// 로그인 폼 제출
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            showError('비밀번호를 입력해주세요.');
            return;
        }
        
        // 버튼 비활성화 및 로딩 상태
        loginBtn.disabled = true;
        loginBtn.textContent = '로그인 중...';
        
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
                credentials: 'include', // 쿠키 포함
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 로그인 성공 - 관리자 페이지로 이동
                window.location.href = '/admin.html';
            } else {
                showError(result.error || '로그인에 실패했습니다.');
                passwordInput.focus();
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            showError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            // 버튼 활성화 및 원래 텍스트 복원
            loginBtn.disabled = false;
            loginBtn.textContent = '로그인';
        }
    });
}

// Enter 키로 제출
if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}

// 페이지 로드 시 비밀번호 입력 필드에 포커스
window.addEventListener('DOMContentLoaded', () => {
    if (passwordInput) {
        passwordInput.focus();
    }
});

