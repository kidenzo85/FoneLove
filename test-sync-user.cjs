const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = {
    id: 'cmp59xnt80000v1ug6kwgzkvo',
    email: 'fabricewilliam73@gmail.com', // wait, fabricewilliam73@gmail.com is already registered with cmpd5tirc0000l504g7gjdqsq!
    phone: '+33612345678',
    firstName: 'fabrice',
    lastName: 'william',
    birthDate: '1990-01-01',
    gender: 'male',
    photos: [],
    prompts: [],
  };

  try {
    console.log('Running sync-user logic in test...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });
    console.log('Existing user check:', existingUser);

    if (!existingUser) {
      console.log('Creating user...');
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || `${user.id}@sync.local`,
          phone: user.phone || `+336${Date.now().toString().slice(-8)}`,
          password: 'synced-from-auth',
          firstName: user.firstName || 'Utilisateur',
          lastName: user.lastName || null,
          birthDate: user.birthDate ? new Date(user.birthDate) : null,
          gender: user.gender || null,
          bio: user.bio || null,
          mood: user.mood || null,
          isVerified: user.isVerified ?? false,
          isPremium: user.isPremium ?? false,
          profileScore: user.profileScore ?? 0,
          streakDays: user.streakDays ?? 0,
          dailyBoostUsed: user.dailyBoostUsed ?? false,
          lookingFor: user.lookingFor || null,
          lookingForGender: user.lookingForGender || null,
          city: user.city || null,
          countryCode: user.countryCode || null,
          isActive: true,
          role: (user.email === 'fabricewilliam73@gmail.com') ? 'super_admin' : 'user',
        },
      });
      console.log('User created successfully');
    }
  } catch (error) {
    console.error('Error during creation:', error.message);
    console.error('Full details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
