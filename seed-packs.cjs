const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const packs = [
    // === Packs ConnectCoins (CC) ===
    // 0.49 EUR = ~320 FCFA (so starting around 300 FCFA as requested)
    {
      currency: 'CC',
      packKey: 'cc_etincelle',
      name: "L'Étincelle",
      amount: 10,
      bonusAmount: 0,
      priceEur: 0.49,
      icon: '✨',
      bonusText: '',
      isActive: true,
    },
    {
      currency: 'CC',
      packKey: 'cc_coup_de_coeur',
      name: "Coup de Cœur",
      amount: 40,
      bonusAmount: 5,
      priceEur: 1.49,
      icon: '💖',
      bonusText: 'Petit plus',
      isActive: true,
    },
    {
      currency: 'CC',
      packKey: 'cc_charmeur',
      name: "Le Charmeur",
      amount: 100,
      bonusAmount: 20,
      priceEur: 2.99,
      icon: '🔥',
      bonusText: 'Le Choix Malin !',
      isActive: true,
    },
    {
      currency: 'CC',
      packKey: 'cc_irresistible',
      name: "L'Irrésistible",
      amount: 300,
      bonusAmount: 80,
      priceEur: 7.99,
      icon: '💎',
      bonusText: '+25% Offerts',
      isActive: true,
    },
    {
      currency: 'CC',
      packKey: 'cc_sans_limite',
      name: "Amour Sans Limite",
      amount: 700,
      bonusAmount: 300,
      priceEur: 15.99,
      icon: '👑',
      bonusText: 'VIP MAX',
      isActive: true,
    },

    // === Packs FoneLove (FL) ===
    // 300 FCFA as starting point
    {
      currency: 'FL',
      packKey: 'fl_sourire',
      name: "Sourire Timide",
      amount: 1,
      priceXaf: 300,
      icon: '😊',
      isActive: true,
    },
    {
      currency: 'FL',
      packKey: 'fl_premier_pas',
      name: "Premier Pas",
      amount: 5,
      priceXaf: 1500,
      icon: '🌹',
      isActive: true,
    },
    {
      currency: 'FL',
      packKey: 'fl_douce_attention',
      name: "Douce Attention",
      amount: 10,
      priceXaf: 3000,
      icon: '💝',
      isActive: true,
    },
    {
      currency: 'FL',
      packKey: 'fl_preuve_amour',
      name: "Preuve d'Amour",
      amount: 20,
      priceXaf: 6000,
      icon: '💘',
      isActive: true,
    },
    {
      currency: 'FL',
      packKey: 'fl_grand_jeu',
      name: "Le Grand Jeu",
      amount: 50,
      priceXaf: 15000,
      icon: '💍',
      isActive: true,
    }
  ]

  console.log('Seeding packs...')
  for (const pack of packs) {
    await prisma.packConfig.upsert({
      where: { packKey: pack.packKey },
      update: pack,
      create: pack,
    })
    console.log(`Upserted pack: ${pack.name}`)
  }
  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
