const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const USER_INCLUDE = {
  profile: true,
  photos: { orderBy: { position: 'asc' } },
  prompts: true,
  badges: true,
};

async function main() {
  const email = `test_${Date.now()}@example.com`;
  const given_name = "Test";
  const family_name = "User";
  const picture = "https://example.com/pic.jpg";

  console.log("Creating user...");
  let user = await prisma.user.create({
    data: {
      email,
      phone: `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      password: `google_${Date.now()}`,
      firstName: given_name || 'Utilisateur',
      lastName: family_name || null,
      isVerified: true,
      profileScore: 15,
      isActive: true,
      profile: {
        create: {
          onboardingStep: 0,
          onboardingDone: false,
        },
      },
      wallet: {
        create: {},
      },
    },
    include: USER_INCLUDE,
  });
  console.log("Created user id:", user.id);

  if (picture && user) {
    console.log("Creating photo...");
    await prisma.photo.create({
      data: {
        userId: user.id,
        url: picture,
        position: 0,
        isPrimary: true,
      },
    });

    console.log("Refetching user...");
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: USER_INCLUDE,
    });
    console.log("Refetched user:", !!user);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
