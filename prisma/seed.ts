import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const restaurants = [
  {
    name: "온기한상",
    category: "한식",
    description: "비빔밥과 된장찌개를 중심으로 든든한 집밥 한상을 내는 한식집",
    imageUrl: "/restaurant-images/1.png",
    menuItems: [
      { name: "전주 비빔밥", description: "나물과 고추장을 비벼 먹는 대표 한식", price: 9500 },
      { name: "차돌 된장찌개", description: "차돌박이와 두부가 들어간 구수한 찌개", price: 9000 },
      { name: "제육볶음 정식", description: "매콤한 돼지고기 볶음과 밥 반찬 구성", price: 11000 },
    ],
  },
  {
    name: "담백갈비탕",
    category: "한식",
    description: "갈비탕, 불고기, 김치찌개처럼 따뜻한 국물과 고기 메뉴가 강한 한식당",
    imageUrl: "/restaurant-images/2.png",
    menuItems: [
      { name: "왕갈비탕", description: "큼직한 갈비와 맑은 국물", price: 13000 },
      { name: "뚝배기 불고기", description: "달큰한 양념 불고기와 당면", price: 12000 },
      { name: "돼지고기 김치찌개", description: "묵은지와 돼지고기가 들어간 얼큰한 찌개", price: 9500 },
    ],
  },
  {
    name: "홍등반점",
    category: "중식",
    description: "짜장면, 짬뽕, 탕수육을 빠르게 조리하는 기본에 충실한 중식당",
    imageUrl: "/restaurant-images/3.png",
    menuItems: [
      { name: "옛날 짜장면", description: "춘장 향이 진한 기본 짜장면", price: 7000 },
      { name: "해물 짬뽕", description: "해산물과 채소를 볶아낸 얼큰한 국물", price: 9000 },
      { name: "찹쌀 탕수육", description: "쫀득한 튀김옷과 새콤달콤 소스", price: 18000 },
    ],
  },
  {
    name: "마라공방",
    category: "중식",
    description: "마라탕과 꿔바로우를 중심으로 얼얼한 향신료 맛을 살린 중식 전문점",
    imageUrl: "/restaurant-images/4.png",
    menuItems: [
      { name: "마라탕", description: "원하는 재료를 담아 먹는 얼얼한 국물 요리", price: 12000 },
      { name: "마라샹궈", description: "각종 재료를 매콤하게 볶은 사천식 메뉴", price: 15000 },
      { name: "꿔바로우", description: "바삭하고 쫀득한 중국식 탕수육", price: 16000 },
    ],
  },
  {
    name: "스시하루",
    category: "일식",
    description: "초밥과 사시미 덮밥을 깔끔하게 담아내는 일식집",
    imageUrl: "/restaurant-images/9.jpeg",
    menuItems: [
      { name: "모둠 초밥", description: "연어, 광어, 새우 등 기본 초밥 구성", price: 15000 },
      { name: "연어 사케동", description: "두툼한 연어와 와사비 간장 덮밥", price: 13500 },
      { name: "미니 우동", description: "따뜻한 국물의 곁들임 우동", price: 6000 },
    ],
  },
  {
    name: "라멘야 밤",
    category: "일식",
    description: "돈코츠 라멘과 가라아게를 판매하는 진한 국물의 라멘집",
    imageUrl: "/restaurant-images/5.png",
    menuItems: [
      { name: "돈코츠 라멘", description: "진한 돼지뼈 육수와 차슈", price: 11000 },
      { name: "매운 미소라멘", description: "미소 육수에 매콤한 양념을 더한 라멘", price: 11500 },
      { name: "치킨 가라아게", description: "바삭하게 튀긴 일본식 닭튀김", price: 7500 },
    ],
  },
  {
    name: "브릭오븐피자",
    category: "양식",
    description: "화덕 피자와 파스타를 함께 즐길 수 있는 캐주얼 양식당",
    imageUrl: "/restaurant-images/6.png",
    menuItems: [
      { name: "마르게리타 피자", description: "토마토, 바질, 모짜렐라의 기본 피자", price: 16000 },
      { name: "페퍼로니 피자", description: "짭짤한 페퍼로니를 듬뿍 올린 피자", price: 17500 },
      { name: "까르보나라", description: "크림소스와 베이컨이 들어간 파스타", price: 13500 },
    ],
  },
  {
    name: "파스타랩",
    category: "양식",
    description: "토마토 파스타, 스테이크, 샐러드를 단정하게 내는 양식 전문점",
    imageUrl: "/restaurant-images/7.png",
    menuItems: [
      { name: "토마토 미트 파스타", description: "진한 토마토소스와 다진 소고기", price: 13000 },
      { name: "부채살 스테이크", description: "구운 채소와 함께 나오는 스테이크", price: 24000 },
      { name: "시저 샐러드", description: "로메인, 크루통, 시저 드레싱", price: 9500 },
    ],
  },
  {
    name: "사이공키친",
    category: "아시안",
    description: "쌀국수와 반미를 판매하는 베트남 음식점",
    imageUrl: "/restaurant-images/10.jpeg",
    menuItems: [
      { name: "소고기 쌀국수", description: "맑은 육수와 숙주가 들어간 베트남 쌀국수", price: 10000 },
      { name: "그릴드 포크 반미", description: "바게트에 고기와 채소를 넣은 샌드위치", price: 8500 },
      { name: "새우 월남쌈", description: "라이스페이퍼에 새우와 채소를 감싼 메뉴", price: 9000 },
    ],
  },
  {
    name: "타이바질",
    category: "아시안",
    description: "팟타이와 그린커리처럼 향신료가 살아 있는 태국 음식점",
    imageUrl: "/restaurant-images/11.jpeg",
    menuItems: [
      { name: "팟타이", description: "새우와 숙주가 들어간 태국식 볶음쌀국수", price: 12000 },
      { name: "그린커리", description: "코코넛 밀크와 바질 향이 나는 커리", price: 12500 },
      { name: "똠얌꿍", description: "새콤하고 매콤한 태국식 새우 수프", price: 13000 },
    ],
  },
  {
    name: "버거스테이션",
    category: "패스트푸드",
    description: "수제버거와 감자튀김을 빠르게 즐길 수 있는 버거 전문점",
    imageUrl: "/restaurant-images/8.png",
    menuItems: [
      { name: "클래식 치즈버거", description: "소고기 패티와 체다치즈의 기본 버거", price: 8900 },
      { name: "베이컨 더블버거", description: "패티 두 장과 바삭한 베이컨", price: 12000 },
      { name: "케이준 감자튀김", description: "짭짤한 시즈닝의 감자튀김", price: 4500 },
    ],
  },
  {
    name: "크리스피치킨앤랩",
    category: "패스트푸드",
    description: "치킨버거, 랩, 너겟 같은 간편한 패스트푸드 메뉴를 판매하는 매장",
    imageUrl: "/restaurant-images/12.jpeg",
    menuItems: [
      { name: "크리스피 치킨버거", description: "바삭한 치킨 패티와 양상추", price: 8500 },
      { name: "치킨 랩", description: "또띠아에 치킨과 채소를 말아낸 메뉴", price: 7600 },
      { name: "치킨 너겟", description: "한입 크기의 바삭한 너겟 8조각", price: 5500 },
    ],
  },
  {
    name: "모닝브루",
    category: "카페",
    description: "커피와 샌드위치를 함께 판매하는 아침형 카페",
    imageUrl: "/restaurant-images/13.jpeg",
    menuItems: [
      { name: "아메리카노", description: "고소한 원두 향의 기본 커피", price: 4000 },
      { name: "카페라떼", description: "에스프레소와 우유의 부드러운 조합", price: 4800 },
      { name: "햄치즈 샌드위치", description: "햄, 치즈, 채소를 넣은 든든한 샌드위치", price: 6500 },
    ],
  },
  {
    name: "달콤베이크",
    category: "카페",
    description: "디저트 케이크와 음료를 함께 즐기는 베이커리 카페",
    imageUrl: "/restaurant-images/14.jpeg",
    menuItems: [
      { name: "딸기 생크림 케이크", description: "생크림과 딸기가 올라간 조각 케이크", price: 7200 },
      { name: "바닐라 라떼", description: "은은한 바닐라 향의 달콤한 라떼", price: 5500 },
      { name: "버터 크루아상", description: "겹겹이 바삭한 버터 풍미의 크루아상", price: 4300 },
    ],
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.orderRestaurant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favoriteRestaurant.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "데모유저",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  });

  for (const restaurant of restaurants) {
    await prisma.restaurant.create({
      data: {
        name: restaurant.name,
        category: restaurant.category,
        description: restaurant.description,
        imageUrl: restaurant.imageUrl,
        menuItems: {
          create: restaurant.menuItems,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
