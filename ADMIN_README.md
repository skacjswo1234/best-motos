# 베스트 모터스 관리자 시스템

Cloudflare D1 데이터베이스와 Pages Functions를 사용한 관리자 화면입니다.

## 파일 구조

```
best-motos/
├── admin.html          # 관리자 페이지 HTML
├── admin.css           # 관리자 페이지 스타일
├── admin.js            # 관리자 페이지 JavaScript
├── schema.sql          # D1 데이터베이스 스키마
├── wrangler.toml       # Cloudflare 설정 파일
└── functions/
    └── api/
        └── inquiries/
            ├── index.ts    # 문의 리스트 API
            └── [id].ts     # 개별 문의 API
```

## 설정 방법

### 1. D1 데이터베이스 생성 및 스키마 적용

```bash
# 로컬 D1 데이터베이스 생성 (개발용)
npx wrangler d1 create best-motos-db

# 스키마 적용
npx wrangler d1 execute best-motos-db --file=./schema.sql
```

### 2. wrangler.toml 설정 확인

`wrangler.toml` 파일에 데이터베이스 정보가 올바르게 설정되어 있는지 확인하세요:

```toml
[[d1_databases]]
binding = "best-motos-db"
database_name = "best-motos-db"
database_id = "16c48beb-96d5-4688-8d13-5d9f37afcefd"
```

### 3. 로컬 개발 서버 실행

```bash
npx wrangler pages dev
```

### 4. 프로덕션 배포

```bash
# Cloudflare Pages에 배포
npx wrangler pages deploy
```

## 데이터베이스 스키마

### inquiries 테이블

```sql
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' -- pending, contacted, completed
);
```

## API 엔드포인트

### 문의 리스트 조회
- **GET** `/api/inquiries`
- **쿼리 파라미터:**
  - `status` (선택): `pending`, `contacted`, `completed`
  - `limit` (선택): 기본값 100
  - `offset` (선택): 기본값 0

### 문의 생성
- **POST** `/api/inquiries`
- **요청 본문:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "service": "중고차 구매",
  "message": "문의 내용"
}
```

### 개별 문의 조회
- **GET** `/api/inquiries/{id}`

### 문의 상태 업데이트
- **PUT** `/api/inquiries/{id}`
- **요청 본문:**
```json
{
  "status": "contacted"
}
```

### 문의 삭제
- **DELETE** `/api/inquiries/{id}`

## 관리자 화면 기능

### 데스크탑
- 왼쪽 사이드바에 네비게이션 메뉴
- 오른쪽에 문의 리스트 표시
- 문의 항목 클릭 시 상세 모달 표시
- 상태 필터링 및 업데이트 기능

### 모바일
- 오른쪽 상단 메뉴 아이콘 클릭 시 사이드바 슬라이드
- 반응형 디자인으로 모바일 최적화

## 디자인 특징

- 블랙 다크 테마 (#0a0a0a 배경)
- 골드 액센트 컬러 (#ffc107)
- 부드러운 애니메이션 및 트랜지션
- 반응형 레이아웃

## 주요 기능

1. **문의 리스트 조회**: 전체 또는 상태별 필터링
2. **문의 상세 보기**: 모달을 통한 상세 정보 확인
3. **상태 관리**: 대기중, 연락완료, 처리완료 상태 업데이트
4. **문의 삭제**: 불필요한 문의 삭제
5. **통계 대시보드**: 전체/상태별 문의 통계
6. **자동 새로고침**: 30초마다 자동으로 데이터 갱신

## 사용 방법

1. 관리자 페이지 접속: `/admin.html`
2. 문의 리스트에서 문의 항목 클릭하여 상세 확인
3. 상태 필터를 사용하여 원하는 상태의 문의만 조회
4. 상세 모달에서 상태 업데이트 또는 삭제 가능

