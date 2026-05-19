import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- TEST: Collecte de Bonus Quotidien ---');
  let testUser;

  try {
    // 1. Créer un utilisateur de test
    console.log('1. Création d\'un utilisateur de test...');
    testUser = await prisma.user.create({
      data: {
        phoneNumber: '+33600000001',
        deviceType: 'ios',
      },
    });
    console.log('✅ Utilisateur créé:', testUser.id);

    const baseUrl = 'http://localhost:3000';

    // 2. Vérifier le solde initial (simule le chargement de la page)
    console.log('\n2. Vérification du solde initial (Chargement de la page)...');
    const balanceRes1 = await fetch(`${baseUrl}/api/credits/balance?userId=${testUser.id}`);
    const balanceData1 = await balanceRes1.json();
    console.log('Données initiales:', balanceData1);
    
    if (balanceData1.dailyFreeClaimed === true) {
      throw new Error('Le bonus quotidien ne devrait pas être réclamé initialement.');
    }
    console.log('✅ Le bonus n\'est pas encore réclamé.');

    // 3. Réclamer le bonus quotidien
    console.log('\n3. Réclamation du bonus quotidien (Clic sur "Collecter")...');
    const claimRes = await fetch(`${baseUrl}/api/credits/daily-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUser.id }),
    });
    const claimData = await claimRes.json();
    console.log('Résultat de la réclamation:', claimData);

    if (claimData.error) {
      throw new Error(`Erreur lors de la réclamation: ${claimData.error}`);
    }
    console.log('✅ Bonus réclamé avec succès. Nouveau solde:', claimData.newBalance);

    // 4. Simuler le rafraîchissement de la page
    console.log('\n4. Simulation du rafraîchissement de la page...');
    const balanceRes2 = await fetch(`${baseUrl}/api/credits/balance?userId=${testUser.id}`);
    const balanceData2 = await balanceRes2.json();
    console.log('Données après rafraîchissement:', balanceData2);

    if (balanceData2.dailyFreeClaimed !== true) {
      throw new Error('❌ ÉCHEC: Le statut "réclamé" a disparu après le rafraîchissement !');
    }
    console.log('✅ SUCCÈS: Le statut "réclamé" est bien conservé après rafraîchissement !');
    
    // 5. Tenter de réclamer à nouveau (ne devrait pas marcher)
    console.log('\n5. Tentative de réclamation à nouveau...');
    const claimRes2 = await fetch(`${baseUrl}/api/credits/daily-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUser.id }),
    });
    const claimData2 = await claimRes2.json();
    if (claimRes2.status !== 400 || !claimData2.error) {
      throw new Error('❌ ÉCHEC: L\'utilisateur a pu réclamer le bonus deux fois !');
    }
    console.log('✅ SUCCÈS: Bloqué correctement lors de la deuxième tentative.');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error);
  } finally {
    // Nettoyage
    if (testUser) {
      console.log('\n6. Nettoyage: Suppression de l\'utilisateur de test...');
      // Supprimer le wallet et le dailyStreak d'abord à cause des clés étrangères
      await prisma.transaction.deleteMany({ where: { wallet: { userId: testUser.id } } });
      await prisma.wallet.deleteMany({ where: { userId: testUser.id } });
      await prisma.dailyStreak.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('✅ Utilisateur de test supprimé.');
    }
  }
}

runTest();
