// 메뉴 토글 (PC/모바일 공통)
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuClose = document.getElementById('menuClose');
const menuItems = document.querySelectorAll('.menu-item');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (menuClose) {
    menuClose.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
}

if (menuItems.length > 0) {
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// 스크롤 시 헤더 스타일 변경
let lastScroll = 0;
const header = document.querySelector('.header');

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = '#333';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        } else {
            header.style.background = '#333';
            header.style.boxShadow = 'none';
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

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    // TOP 버튼 초기 상태
    if (topBtn) {
        topBtn.style.opacity = '0';
        topBtn.style.visibility = 'hidden';
        topBtn.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    }
});
