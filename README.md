# Delivery Final Project

컴퓨터과학개론 기말 프로젝트용 배달앱입니다.

## 목표

Next.js 기반 배달앱을 만들고 GitHub → Vercel로 배포합니다.

## 필수 기능

1. 회원가입 / 로그인 / 로그아웃
2. 식당 · 메뉴 목록 보기
3. 장바구니 담기
4. 주문하기
5. 내 주문 내역 보기

## 기술 스택 예정

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite 로컬 데모
- Neon PostgreSQL 배포 DB
- Vercel
- GitHub

## 로컬 실행

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## Vercel 배포 준비

로컬 데모는 SQLite를 사용하지만, Vercel 배포에서는 파일 DB에 쓰기 작업을 안정적으로 할 수 없으므로 Neon PostgreSQL을 사용합니다.

1. Neon에서 PostgreSQL 프로젝트를 만들고 connection string을 복사합니다.
2. Vercel 프로젝트의 Environment Variables에 `DATABASE_URL`을 추가합니다.

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

3. Vercel Build Command는 `vercel.json`에 설정된 `npm run build:vercel`을 사용합니다.
4. 배포 DB에 테이블과 seed 데이터를 넣습니다.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require" npm run db:push:prod
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require" npm run db:seed:prod
```

5. GitHub에 push한 뒤 Vercel에서 배포합니다.

배포용 Prisma schema는 `prisma/schema.postgres.prisma`입니다. DB 모델 구조는 로컬 SQLite schema와 동일하고 datasource provider만 PostgreSQL입니다.

## 테스트 계정

- 이메일: `demo@example.com`
- 비밀번호: `password123`

회원가입 화면에서 새 계정을 만들어도 됩니다.

## 데모 테스트 순서

1. `/signup`에서 회원가입 또는 `/login`에서 테스트 계정 로그인
2. `/`에서 식당과 메뉴 확인
3. 메뉴를 장바구니에 담기
4. `/cart`에서 수량 변경, 삭제, 식당별 요청사항 입력
5. 주문하기
6. `/orders`에서 주문 전체, 식당별 묶음, 메뉴 snapshot 확인
7. 로그아웃

## DB 구조

요구사항 문서 기준으로 `users`, `restaurants`, `menu_items`, `orders`, `order_restaurants`, `order_items`, `favorite_restaurants` 테이블을 사용합니다.

`orders`는 사용자의 한 번의 주문 전체를 저장하고, `order_restaurants`는 그 주문 안의 식당별 묶음을 저장합니다. `order_items`에는 주문 당시 메뉴명과 가격을 snapshot으로 저장해 메뉴판이 바뀌어도 과거 주문 내역이 유지되도록 했습니다.

## 버그 기록

- 증상: `npm run db:push` 실행 시 Prisma CLI가 `Schema engine error`만 출력하고 SQLite DB 생성을 실패했습니다.
- 확인: 동일 스키마는 `prisma validate`에서 정상이고, 최소 Prisma SQLite 스키마도 같은 오류가 발생했습니다.
- 원인 후보: 현재 로컬 Node v25.6.0과 Prisma schema engine 조합 문제로 판단했습니다.
- 해결: 데모 진행을 위해 동일 구조의 `prisma/init.sql`을 만들고 `sqlite3 prisma/dev.db '.read prisma/init.sql'`을 `npm run db:init`으로 실행했습니다. 이후 Prisma Client seed는 정상 동작했습니다.

## 데모 테스트 기록_ 장윤정
- 회원가입 기능 정상 확인
    김철수
    kcs1234@kkk.com
    secret1234!
- 
