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

// 히어로 문의 폼 제출
const heroInquiryForm = document.getElementById('heroInquiryForm');

if (heroInquiryForm) {
    heroInquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(heroInquiryForm);
        const data = Object.fromEntries(formData);
        
        // 여기에 실제 폼 제출 로직을 추가하세요 (API 호출 등)
        console.log('문의 폼 제출:', data);
        
        // 간단한 알림 (실제 구현 시에는 서버로 전송)
        alert('상담 신청이 완료되었습니다.\n빠른 시일 내에 연락드리겠습니다.');
        
        // 폼 초기화
        heroInquiryForm.reset();
    });
}

// 하단 배너 문의 폼 제출
const bannerInquiryForm = document.getElementById('bannerInquiryForm');

if (bannerInquiryForm) {
    bannerInquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(bannerInquiryForm);
        const data = Object.fromEntries(formData);
        
        // 여기에 실제 폼 제출 로직을 추가하세요 (API 호출 등)
        console.log('하단 배너 문의 폼 제출:', data);
        
        // 간단한 알림 (실제 구현 시에는 서버로 전송)
        alert('상담 신청이 완료되었습니다.\n빠른 시일 내에 연락드리겠습니다.');
        
        // 폼 초기화
        bannerInquiryForm.reset();
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
    mobileInquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(mobileInquiryForm);
        const data = Object.fromEntries(formData);
        
        // 여기에 실제 폼 제출 로직을 추가하세요 (API 호출 등)
        console.log('모바일 문의 폼 제출:', data);
        
        // 간단한 알림 (실제 구현 시에는 서버로 전송)
        alert('상담 신청이 완료되었습니다.\n빠른 시일 내에 연락드리겠습니다.');
        
        // 폼 초기화 및 모달 닫기
        mobileInquiryForm.reset();
        closeMobileModal();
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
