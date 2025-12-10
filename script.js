// 메뉴 토글 (PC/모바일 공통)
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');
const menuItems = document.querySelectorAll('.menu-item');

function openMenu() {
    navMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (menuToggle) {
    menuToggle.addEventListener('click', openMenu);
}

if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
}

if (menuItems.length > 0) {
    menuItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });
}

// 스크롤 시 헤더 스타일 변경
let lastScroll = 0;
const header = document.querySelector('.header');

if (header) {
    // 초기 상태 설정
    header.style.background = 'transparent';
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 모바일에서는 항상 투명 유지
            header.style.background = 'transparent';
            header.style.boxShadow = 'none';
        } else {
            // 데스크탑에서만 스크롤 시 배경색 변경
            if (currentScroll > 100) {
                header.style.background = '#000';
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            } else {
                header.style.background = 'transparent';
                header.style.boxShadow = 'none';
            }
        }
        
        lastScroll = currentScroll;
    });
}

// TOP 버튼
const topBtn = document.getElementById('topBtn');

if (topBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            topBtn.style.opacity = '1';
            topBtn.style.visibility = 'visible';
        } else {
            topBtn.style.opacity = '0';
            topBtn.style.visibility = 'hidden';
        }
    });

    topBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// API 기본 URL
const API_BASE = '/api/inquiries';

// 신청 완료 모달 제어
const successModalOverlay = document.getElementById('successModalOverlay');
const successModalClose = document.getElementById('successModalClose');

function showSuccessModal() {
    if (successModalOverlay) {
        successModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideSuccessModal() {
    if (successModalOverlay) {
        successModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (successModalClose) {
    successModalClose.addEventListener('click', hideSuccessModal);
}

if (successModalOverlay) {
    successModalOverlay.addEventListener('click', (e) => {
        if (e.target === successModalOverlay) {
            hideSuccessModal();
        }
    });
}

// 문의 폼 제출 공통 함수
async function submitInquiry(form, formElement) {
    const submitBtn = formElement.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    // 필수 필드 확인
    if (!form.name || !form.phone || !form.service) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 버튼 비활성화 및 로딩 상태
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '처리 중...';
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        });
        
        // 응답 상태 확인
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `서버 오류 (${response.status})`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // 폼 초기화
            formElement.reset();
            // 성공 모달 표시
            showSuccessModal();
        } else {
            alert(result.error || '신청 중 오류가 발생했습니다.\n다시 시도해주세요.');
        }
    } catch (error) {
        console.error('문의 제출 실패:', error);
        const errorMessage = error.message || '신청 중 오류가 발생했습니다.\n다시 시도해주세요.';
        alert(errorMessage);
    } finally {
        // 버튼 활성화 및 원래 텍스트 복원
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// 히어로 문의 폼 제출
const heroInquiryForm = document.getElementById('heroInquiryForm');

if (heroInquiryForm) {
    heroInquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(heroInquiryForm);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message') || '',
        };
        
        await submitInquiry(data, heroInquiryForm);
    });
}

// 하단 배너 문의 폼 제출
const bannerInquiryForm = document.getElementById('bannerInquiryForm');

if (bannerInquiryForm) {
    bannerInquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(bannerInquiryForm);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message') || '',
        };
        
        await submitInquiry(data, bannerInquiryForm);
    });
}

// 모바일 문의 모달 제어
const mobileInquiryBtn = document.getElementById('mobileInquiryBtn');
const heroMobileInquiryBtn = document.getElementById('heroMobileInquiryBtn');
const mobileInquiryModal = document.getElementById('mobileInquiryModal');
const mobileModalClose = document.getElementById('mobileModalClose');
const mobileInquiryForm = document.getElementById('mobileInquiryForm');

function openMobileModal() {
    if (mobileInquiryModal) {
        mobileInquiryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileModal() {
    if (mobileInquiryModal) {
        mobileInquiryModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (mobileInquiryBtn) {
    mobileInquiryBtn.addEventListener('click', openMobileModal);
}

if (heroMobileInquiryBtn) {
    heroMobileInquiryBtn.addEventListener('click', openMobileModal);
}

if (mobileModalClose) {
    mobileModalClose.addEventListener('click', closeMobileModal);
}

if (mobileInquiryModal) {
    mobileInquiryModal.addEventListener('click', (e) => {
        if (e.target === mobileInquiryModal) {
            closeMobileModal();
        }
    });
}

// 모바일 문의 폼 제출
if (mobileInquiryForm) {
    mobileInquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(mobileInquiryForm);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message') || '',
        };
        
        // 성공 여부를 확인하기 위해 submitInquiry를 수정
        const submitBtn = mobileInquiryForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        
        // 필수 필드 확인
        if (!data.name || !data.phone || !data.service) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        // 버튼 비활성화 및 로딩 상태
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '처리 중...';
        }
        
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            // 응답 상태 확인
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `서버 오류 (${response.status})`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // 폼 초기화
                mobileInquiryForm.reset();
                // 모바일 모달 닫기
                closeMobileModal();
                // 성공 모달 표시
                showSuccessModal();
            } else {
                alert(result.error || '신청 중 오류가 발생했습니다.\n다시 시도해주세요.');
            }
        } catch (error) {
            console.error('문의 제출 실패:', error);
            const errorMessage = error.message || '신청 중 오류가 발생했습니다.\n다시 시도해주세요.';
            alert(errorMessage);
        } finally {
            // 버튼 활성화 및 원래 텍스트 복원
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    // TOP 버튼 초기 상태
    if (topBtn) {
        topBtn.style.opacity = '0';
        topBtn.style.visibility = 'hidden';
        topBtn.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    }
});
