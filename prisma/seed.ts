import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const restaurants = [
    {
      name: "한빛분식",
      category: "분식",
      description: "떡볶이와 김밥이 빠르게 도착하는 학교 앞 분식집",
      imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80",
      menuItems: [
        { name: "국물 떡볶이", description: "매콤달콤한 기본 떡볶이", price: 5500 },
        { name: "참치 김밥", description: "든든한 참치마요 김밥", price: 4500 },
        { name: "모둠 튀김", description: "김말이, 오징어, 야채튀김", price: 6000 },
      ],
    },
    {
      name: "코드치킨",
      category: "치킨",
      description: "바삭한 후라이드와 양념치킨 전문점",
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80",
      menuItems: [
        { name: "후라이드 치킨", description: "겉은 바삭하고 속은 촉촉한 한 마리", price: 19000 },
        { name: "양념 치킨", description: "달콤매콤한 대표 양념", price: 20000 },
        { name: "치즈볼", description: "쫀득한 사이드 5개", price: 5500 },
      ],
    },
    {
      name: "새벽중화요리",
      category: "중식",
      description: "늦은 시간에도 든든한 중식 메뉴",
      imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80",
      menuItems: [
        { name: "짜장면", description: "춘장 향이 진한 기본 짜장면", price: 7000 },
        { name: "짬뽕", description: "얼큰한 해물 국물", price: 8500 },
        { name: "탕수육", description: "바삭한 고기와 새콤달콤 소스", price: 18000 },
      ],
    },
  ];

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
