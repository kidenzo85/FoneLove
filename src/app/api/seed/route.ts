import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const FRENCH_PROFILES = [
  { firstName: 'Camille', gender: 'F', age: 26, bio: 'Amoureuse de la vie et des petits bonheurs 🌸 Parisienne dans l\'âme, je cherche quelqu\'un pour partager mes brunchs du dimanche.', city: 'Paris', jobTitle: 'Architecte d\'intérieur', company: 'Studio Lumière', education: 'École Boulle', interests: '["Design","Photographie","Brunch","Voyage","Yoga"]', lookingFor: 'relation', astrologicalSign: 'Gémeaux', height: 168, mood: '✨ En quête d\'authenticité' },
  { firstName: 'Léa', gender: 'F', age: 24, bio: 'Pâtissière le jour, danseuse la nuit 🍰💃 La vie est trop courte pour ne pas être extraordinaire !', city: 'Lyon', jobTitle: 'Pâtissière', company: 'Maison Pralus', education: 'Institut Paul Bocuse', interests: '["Pâtisserie","Danse","Musique","Vin","Randonnée"]', lookingFor: 'relation', astrologicalSign: 'Lion', height: 165, mood: '🍰 Sweet life' },
  { firstName: 'Chloé', gender: 'F', age: 28, bio: 'Ingénieure qui code la journée et explore le monde la nuit 🌍-tech', city: 'Bordeaux', jobTitle: 'Ingénieure Data', company: 'Cdiscount', education: 'ENSEIRB', interests: '["Technologie","Voyage","Œnologie","Running","Lecture"]', lookingFor: 'relation', astrologicalSign: 'Vierge', height: 172, mood: '🍷 Bordeauloise heureuse' },
  { firstName: 'Manon', gender: 'F', age: 23, bio: 'Étudiante en art et créatrice de contenu 🎨 Mon monde est en couleurs !', city: 'Marseille', jobTitle: 'Créatrice de contenu', company: 'Freelance', education: 'École des Beaux-Arts', interests: '["Art","Mode","Surf","Méditation","Cinéma"]', lookingFor: 'amitié', astrologicalSign: 'Poissons', height: 160, mood: '🎨 Créative & curieuse' },
  { firstName: 'Juliette', gender: 'F', age: 30, bio: 'Avocate la semaine, guitariste le weekend 🎸 La justice et le rock\'n\'roll !', city: 'Paris', jobTitle: 'Avocate', company: 'Cabinet Dupont', education: 'Sciences Po Paris', interests: '["Musique","Justice","Écriture","Café","Théâtre"]', lookingFor: 'relation', astrologicalSign: 'Scorpion', height: 174, mood: '🎸 Rock & loi' },
  { firstName: 'Sophie', gender: 'F', age: 27, bio: 'Médecin généraliste 🩺 Croyante en l\'amour et les secondes chances', city: 'Toulouse', jobTitle: 'Médecin', company: 'CHU Toulouse', education: 'Faculté de Médecine', interests: '["Médecine","Cuisine","Jardinage","Podcast","Natation"]', lookingFor: 'relation', astrologicalSign: 'Balance', height: 163, mood: '🌻 Douce & déterminée' },
  { firstName: 'Amélie', gender: 'F', age: 25, bio: 'Photographe professionnelle 📸 Je capture les moments que vous oubliez de vivre', city: 'Nice', jobTitle: 'Photographe', company: 'Studio Azur', education: 'Gobelins', interests: '["Photographie","Voyage","Plongée","Cuisine","Danse"]', lookingFor: 'relation', astrologicalSign: 'Cancer', height: 170, mood: '📸 La vie en photo' },
  { firstName: 'Lucas', gender: 'M', age: 27, bio: 'Chef dans un resto étoilé ⭐ La cuisine c\'est de l\'amour sur une assiette', city: 'Paris', jobTitle: 'Chef cuisinier', company: 'Le Petit Bistrot', education: 'Ferrandi', interests: '["Cuisine","Œnologie","Randonnée","Jazz","Lecture"]', lookingFor: 'relation', astrologicalSign: 'Taureau', height: 182, mood: '👨‍🍳 Aux fourneaux' },
  { firstName: 'Hugo', gender: 'M', age: 29, bio: 'Entrepreneur tech et marathonien 🏃‍♂️ Je cours après mes rêves (et parfois le bus)', city: 'Paris', jobTitle: 'CEO', company: 'TechStart', education: 'HEC Paris', interests: '["Entrepreneuriat","Running","Tech","Échecs","Cinéma"]', lookingFor: 'relation', astrologicalSign: 'Bélier', height: 185, mood: '🚀 Ambition & fun' },
  { firstName: 'Mathieu', gender: 'M', age: 25, bio: 'Musicien et prof de guitare 🎵 La musique adoucit les mœurs et les coeurs', city: 'Nantes', jobTitle: 'Musicien', company: 'Conservatoire', education: 'Conservatoire de Nantes', interests: '["Musique","Concerts","Surf","Bière artisanale","Cinéma"]', lookingFor: 'amitié', astrologicalSign: 'Verseau', height: 178, mood: '🎵 Rock on!' },
  { firstName: 'Antoine', gender: 'M', age: 31, bio: 'Architecte & passionné de design urbain 🏙️ Bâtir des villes plus belles, une rue à la fois', city: 'Strasbourg', jobTitle: 'Architecte', company: 'Atelier Rhénan', education: 'ENSAIS', interests: '["Architecture","Design","Vélo","Photographie","Café"]', lookingFor: 'relation', astrologicalSign: 'Capricorne', height: 180, mood: '🏙️ Visionnaire' },
  { firstName: 'Théo', gender: 'M', age: 26, bio: 'Développeur et gamer 🎮 Le code le jour, les jeux la nuit. Oui, c\'est possible !', city: 'Lille', jobTitle: 'Développeur Full-stack', company: 'La French Tech', education: '42', interests: '["Programmation","Gaming","Manga","Escalade","Craft Beer"]', lookingFor: 'amitié', astrologicalSign: 'Sagittaire', height: 176, mood: '🎮 Level up!' },
  { firstName: 'Maxime', gender: 'M', age: 28, bio: 'Kinésithérapeute et passionné de sport 🏋️ Le mouvement c\'est la vie !', city: 'Montpellier', jobTitle: 'Kinésithérapeute', company: 'Cabinet privé', education: 'IFMK', interests: '["Sport","Bien-être","Surf","Nutrition","Randonnée"]', lookingFor: 'relation', astrologicalSign: 'Lion', height: 183, mood: '💪 En forme !' },
  { firstName: 'Pierre', gender: 'M', age: 32, bio: 'Journaliste et globe-trotter ✈️ J\'écris sur le monde, un voyage à la fois', city: 'Paris', jobTitle: 'Journaliste', company: 'Le Monde', education: 'CFJ Paris', interests: '["Écriture","Voyage","Politique","Café","Théâtre"]', lookingFor: 'relation', astrologicalSign: 'Gémeaux', height: 179, mood: '✍️ Curieux de tout' },
  { firstName: 'Émilie', gender: 'F', age: 29, bio: 'Fleuriste et amoureuse de la nature 🌿 Chaque bouquet raconte une histoire', city: 'Aix-en-Provence', jobTitle: 'Fleuriste', company: 'Au Bouquet Provencal', education: 'École du Paysage', interests: '["Fleurs","Nature","Peinture","Thé","Marché"]', lookingFor: 'relation', astrologicalSign: 'Taureau', height: 167, mood: '🌺 Fleurie & joyeuse' },
  { firstName: 'Clara', gender: 'F', age: 22, bio: 'Étudiante en médecine vétérinaire 🐾 Les animaux sont ma famille', city: 'Tours', jobTitle: 'Étudiante', company: 'ENSV', education: 'ENSV', interests: '["Animaux","Nature","Lecture","Équitation","Dessin"]', lookingFor: 'amitié', astrologicalSign: 'Vierge', height: 162, mood: '🐾 Animal lover' },
]

const PROMPTS = [
  { question: 'Mon plus grand talent caché ?', answer: 'Je sais faire claquer mes doigts en rythme parfait' },
  { question: 'Je ne pourrais pas vivre sans...', answer: 'Le café du matin et les couchers de soleil' },
  { question: 'Ma plus belle aventure ?', answer: 'Un roadtrip solo au Japon pendant 3 semaines' },
  { question: 'Le meilleur conseil qu\'on m\'ait donné ?', answer: 'Ne compare jamais ton début à la milieu de quelqu\'un d\'autre' },
  { question: 'Mon guilty pleasure ?', answer: 'Regarder des épisodes entiers de cooking shows à minuit' },
  { question: 'Ce qui me fait rire ?', answer: 'Les mèmes de chats, sans honte' },
  { question: 'Mon plat réconfort ?', answer: 'Une bonne raclette entre amis' },
  { question: 'Mon rêve d\'enfant ?', answer: 'Devenir astronaute... toujours pas réalisé 😄' },
]

export async function POST() {
  try {
    // Check if database is already seeded
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Base de données déjà peuplée, skip seed.',
        userCount
      })
    }

    // Clean existing data only if empty (just in case)
    // Actually, if userCount is 0, we don't need to delete, but for safety:
    const deleteOrder = [

      prisma.cosmeticItem.deleteMany(),
      prisma.userPromo.deleteMany(),
      prisma.challengeProgress.deleteMany(),
      prisma.promoOffer.deleteMany(),
      prisma.challenge.deleteMany(),
      prisma.dailyStreak.deleteMany(),
      prisma.transaction.deleteMany(),
      prisma.wallet.deleteMany(),
      prisma.profileVisit.deleteMany(),
      prisma.report.deleteMany(),
      prisma.eventSignup.deleteMany(),
      prisma.message.deleteMany(),
      prisma.connection.deleteMany(),
      prisma.numberRequest.deleteMany(),
      prisma.like.deleteMany(),
      prisma.moment.deleteMany(),
      prisma.prompt.deleteMany(),
      prisma.photo.deleteMany(),
      prisma.badge.deleteMany(),
      prisma.profile.deleteMany(),
      prisma.user.deleteMany(),
    ]
    await prisma.$transaction(deleteOrder)

    // Create "me" user first
    const me = await prisma.user.create({
      data: {
        email: 'moi@fonelove.fr',
        phone: '+33612345678',
        password: 'demo123',
        firstName: 'Alex',
        lastName: 'Martin',
        birthDate: new Date('1998-03-15'),
        gender: 'M',
        bio: 'Passionné de tech et de bonne ambiance 🚀 Toujours prêt pour une nouvelle aventure !',
        isVerified: true,
        isPhotoVerified: true,
        isPremium: false,
        profileScore: 75,
        streakDays: 5,
        dailyBoostUsed: false,
        superRequestsLeft: 3,
        lookingFor: 'relation',
        astrologicalSign: 'Poissons',
        height: 180,
        mood: '🌟 Prêt à rencontrer',
      },
    })

    // Create "me" profile
    await prisma.profile.create({
      data: {
        userId: me.id,
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        interests: '["Tech","Musique","Cinéma","Voyage","Cuisine"]',
        onboardingDone: true,
      },
    })

    // Create "me" photos
    await prisma.photo.createMany({
      data: [
        { userId: me.id, url: 'https://i.pravatar.cc/400?img=11', position: 0, isPrimary: true },
        { userId: me.id, url: 'https://i.pravatar.cc/400?img=12', position: 1, isPrimary: false },
        { userId: me.id, url: 'https://i.pravatar.cc/400?img=13', position: 2, isPrimary: false },
      ],
    })

    // Create "me" prompts
    await prisma.prompt.createMany({
      data: [
        { userId: me.id, question: 'Mon plus grand talent caché ?', answer: 'Je code en écoutant du jazz 🎷' },
        { userId: me.id, question: 'Je ne pourrais pas vivre sans...', answer: 'Les ramens du samedi soir' },
      ],
    })

    // Create "me" badges
    await prisma.badge.createMany({
      data: [
        { userId: me.id, type: 'verified' },
        { userId: me.id, type: 'streak_5' },
      ],
    })

    // Create demo profiles
    const createdUsers: Array<{ id: string; phone: string }> = []

    for (let i = 0; i < FRENCH_PROFILES.length; i++) {
      const p = FRENCH_PROFILES[i]
      const genderImg = p.gender === 'F' ? (i % 50 + 1) : (i % 50 + 51)
      const birthYear = new Date().getFullYear() - p.age
      const birthDate = `${birthYear}-06-15`
      const phone = `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`

      const user = await prisma.user.create({
        data: {
          email: `${p.firstName.toLowerCase()}.${i}@fonelove.fr`,
          phone,
          password: 'demo123',
          firstName: p.firstName,
          birthDate: new Date(birthDate),
          gender: p.gender,
          bio: p.bio,
          isVerified: Math.random() > 0.3,
          isPhotoVerified: Math.random() > 0.5,
          isPremium: Math.random() > 0.7,
          profileScore: Math.floor(Math.random() * 40) + 50,
          streakDays: Math.floor(Math.random() * 10),
          dailyBoostUsed: Math.random() > 0.5,
          superRequestsLeft: Math.floor(Math.random() * 5),
          lookingFor: p.lookingFor,
          astrologicalSign: p.astrologicalSign,
          height: p.height,
          mood: p.mood,
        },
      })

      // Create profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          city: p.city,
          country: 'France',
          latitude: 48.8 + Math.random() * 2 - 1,
          longitude: 2.3 + Math.random() * 2 - 1,
          jobTitle: p.jobTitle,
          company: p.company,
          education: p.education,
          interests: p.interests,
          onboardingDone: true,
        },
      })

      // Create photos
      await prisma.photo.createMany({
        data: [
          { userId: user.id, url: `https://i.pravatar.cc/400?img=${genderImg}`, position: 0, isPrimary: true },
          { userId: user.id, url: `https://i.pravatar.cc/400?img=${genderImg + 1}`, position: 1, isPrimary: false },
          { userId: user.id, url: `https://i.pravatar.cc/400?img=${genderImg + 2}`, position: 2, isPrimary: false },
        ],
      })

      // Create prompts
      await prisma.prompt.createMany({
        data: [
          { userId: user.id, ...PROMPTS[i % PROMPTS.length] },
          { userId: user.id, ...PROMPTS[(i + 3) % PROMPTS.length] },
        ],
      })

      // Create badges
      const badgeData: Array<{ userId: string; type: string }> = []
      if (Math.random() > 0.3) badgeData.push({ userId: user.id, type: 'verified' })
      if (Math.random() > 0.6) badgeData.push({ userId: user.id, type: 'popular' })
      if (Math.random() > 0.7) badgeData.push({ userId: user.id, type: 'quick_reply' })
      if (badgeData.length > 0) {
        await prisma.badge.createMany({ data: badgeData })
      }

      // Create like from this user to "me"
      if (i < 8) {
        await prisma.like.create({
          data: { senderId: user.id, receiverId: me.id, isMutual: false },
        })
      }

      // Create number request sent by "me" to this user
      if (i < 3) {
        const status = i === 0 ? 'accepted' : i === 1 ? 'declined' : 'pending'
        const request = await prisma.numberRequest.create({
          data: {
            senderId: me.id,
            receiverId: user.id,
            message: `Salut ${p.firstName} ! J'adore ton profil, on pourrait se rencontrer ? ☕`,
            status,
            ...(status !== 'pending' ? { respondedAt: new Date() } : {}),
          },
        })

        if (status === 'accepted') {
          await prisma.connection.create({
            data: {
              user1Id: me.id,
              user2Id: user.id,
              requestId: request.id,
              phoneNumber1: me.phone,
              phoneNumber2: user.phone,
            },
          })

          await prisma.message.createMany({
            data: [
              { senderId: me.id, receiverId: user.id, requestId: request.id, content: 'Hey ! Ravi que tu aies accepté 😊' },
              { senderId: user.id, receiverId: me.id, requestId: request.id, content: 'Merci ! Ton profil m\'a intriguée 😄' },
              { senderId: me.id, receiverId: user.id, requestId: request.id, content: 'On se prend un café cette semaine ?' },
            ],
          })
        }
      }

      // Create number request received by "me" from this user
      if (i >= 3 && i < 6) {
        const status = i === 3 ? 'accepted' : i === 4 ? 'declined' : 'pending'
        const request = await prisma.numberRequest.create({
          data: {
            senderId: user.id,
            receiverId: me.id,
            message: `Coucou ! Je suis ${p.firstName}, ton profil m'a plu ! On fait connaissance ? 🌟`,
            status,
            ...(status !== 'pending' ? { respondedAt: new Date() } : {}),
          },
        })

        if (status === 'accepted') {
          await prisma.connection.create({
            data: {
              user1Id: user.id,
              user2Id: me.id,
              requestId: request.id,
              phoneNumber1: user.phone,
              phoneNumber2: me.phone,
            },
          })

          await prisma.message.createMany({
            data: [
              { senderId: user.id, receiverId: me.id, requestId: request.id, content: 'Super, on est connectés ! 🎉' },
              { senderId: me.id, receiverId: user.id, requestId: request.id, content: 'Trop bien ! On s\'appelle bientôt ?' },
            ],
          })
        }
      }

      createdUsers.push({ id: user.id, phone: user.phone })
    }

    // Create some moments
    const momentData = [
      'Mon brunch du dimanche 🍳',
      'Coucher de soleil à Paris 🌅',
      'Nouveau look ! ✂️',
      'En mode chill ☕',
      'Roadtrip ce weekend 🚗',
      'Ma recette du jour 🍰',
    ]

    for (let i = 0; i < Math.min(6, createdUsers.length); i++) {
      await prisma.moment.create({
        data: {
          userId: createdUsers[i].id,
          content: momentData[i],
          mediaUrl: `https://i.pravatar.cc/300?img=${(i + 1) * 5}`,
          type: 'photo',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    }

    // Profile visits
    for (let i = 0; i < Math.min(4, createdUsers.length); i++) {
      await prisma.profileVisit.create({
        data: {
          visitorId: createdUsers[i].id,
          profileId: me.id,
        },
      })
    }

    // === ConnectCoin: Seed Weekly Challenges ===
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(now)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const challengeTemplates = [
      { type: 'sociable', title: 'Sociable', description: 'Envoie 5 likes cette semaine', targetCount: 5, reward: 5 },
      { type: 'audacieux', title: 'Audacieux', description: 'Envoie 2 demandes de numéro', targetCount: 2, reward: 8 },
      { type: 'complet', title: 'Complet', description: 'Ajoute 3 photos + 1 prompt', targetCount: 4, reward: 6 },
      { type: 'actif', title: 'Actif', description: 'Connecte-toi 5 jours sur 7', targetCount: 5, reward: 4 },
      { type: 'curieux', title: 'Curieux', description: 'Visite 20 profils cette semaine', targetCount: 20, reward: 3 },
    ]

    for (const template of challengeTemplates) {
      await prisma.challenge.create({
        data: {
          type: template.type,
          title: template.title,
          description: template.description,
          targetCount: template.targetCount,
          reward: template.reward,
          resetsAt: weekEnd,
        },
      })
    }

    // Create wallet for "me" user
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId: me.id },
    })

    if (!existingWallet) {
      const wallet = await prisma.wallet.create({
        data: {
          userId: me.id,
          balance: 10,
          totalEarned: 10,
        },
      })

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'earn_bonus',
          amount: 10,
          description: 'Bonus de bienvenue +10 CC',
        },
      })
    }

    // Create a sample promo offer
    const existingPromo = await prisma.promoOffer.findFirst({
      where: { type: 'first_purchase' },
    })

    if (!existingPromo) {
      const promoEnd = new Date(now)
      promoEnd.setMonth(promoEnd.getMonth() + 3)
      await prisma.promoOffer.create({
        data: {
          type: 'first_purchase',
          title: 'Première commande',
          description: 'Reçois +20 CC bonus sur ta première commande !',
          bonusCC: 20,
          startsAt: now,
          expiresAt: promoEnd,
          isActive: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Base de données peuplée avec succès !',
      userId: me.id,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Erreur lors du seed' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
