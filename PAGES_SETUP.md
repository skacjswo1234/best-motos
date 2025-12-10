# Cloudflare Pages 설정 가이드

## D1 데이터베이스 바인딩 설정

Cloudflare Pages에서 D1 데이터베이스를 사용하려면 **Pages 대시보드에서 직접 바인딩을 설정**해야 합니다.

### 설정 방법

1. Cloudflare 대시보드 접속
2. Pages 프로젝트 선택
3. Settings > Functions 탭으로 이동
4. D1 Database bindings 섹션에서 "Add binding" 클릭
5. 다음 정보 입력:
   - **Variable name**: `best-motos-db`
   - **D1 Database**: `best-motos-db` 선택 (또는 생성)
   - **Environment**: Production (또는 Preview)

### D1 데이터베이스 생성 (아직 없다면)

```bash
# D1 데이터베이스 생성
npx wrangler d1 create best-motos-db

# 스키마 적용
npx wrangler d1 execute best-motos-db --file=./schema.sql --remote
```

### 중요 사항

- `wrangler.toml`의 설정만으로는 Pages에 자동으로 적용되지 않습니다
- Pages 대시보드에서 직접 바인딩을 설정해야 합니다
- Production과 Preview 환경 모두 설정해야 할 수 있습니다

