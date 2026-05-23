/**
 * French translations — default locale
 * All 178+ user-facing strings
 */
const fr = {
  // === Metadata ===
  metadata: {
    title: 'ConnectPhone - La Dating App',
    description: 'La dating app où le numéro est la destination. Demande, accepte, connecte.',
  },

  // === Common ===
  common: {
    loading: 'Chargement...',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    confirming: 'Confirmer...',
    confirmCost: 'Confirmer {cost} CC',
    processing: 'Traitement...',
    close: 'Fermer',
    copied: 'Copié !',
    copy: 'Copier',
    someone: 'Quelqu\'un',
    inProgress: 'En cours...',
    earned: 'CC gagnés',
    spent: 'CC dépensés',
  },

  // === Login / Auth ===
  login: {
    tagline: 'La dating app où le numéro est la destination',
    firstNamePlaceholder: 'Prénom',
    passwordPlaceholder: 'Mot de passe',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    quickDemo: 'Démo rapide (Alex Martin)',
    noAccountYet: 'Pas encore de compte ?',
    alreadyHaveAccount: 'Déjà un compte ?',
  },

  // === Tabs ===
  tabs: {
    discover: 'Découvrir',
    requests: 'Demandes',
    messages: 'Messages',
    connections: 'Contacts',
    profile: 'Profil',
  },

  // === Discover ===
  discover: {
    profileCount: '{count} profils',
  },

  // === Requests ===
  requests: {
    pendingCount: '{count} en attente',
    received: 'Reçues',
    sent: 'Envoyées',
    noneReceived: 'Aucune demande',
    noneReceivedDesc: 'Quand quelqu\'un te demande ton numéro, ça apparaîtra ici',
    recent: 'Récentes',
    noneSent: 'Aucune demande envoyée',
    noneSentDesc: 'Demande le numéro de quelqu\'un qui te plaît !',
  },

  // === Messages ===
  messages: {
    conversationCount: '{count} conversation{s}',
  },

  // === Connections ===
  connections: {
    contactCount: '{count} contact{s}',
    moments: 'Moments',
    none: 'Aucun contact',
    noneDesc: 'Quand tu échanges un numéro, la personne apparaît ici',
    numbersExchanged: 'Numéros échangés',
  },

  // === Profile ===
  profile: {
    myProfile: 'Mon Profil',
    score: 'Score',
    badges: 'Badges',
    whoVisitedMe: 'Qui m\'a visité',
    noVisits: 'Aucune visite pour le moment',
    adminDashboard: 'Tableau de bord Admin',
    logout: 'Se déconnecter',
  },

  // === Settings ===
  settings: {
    language: 'Langue',
    darkMode: 'Mode sombre',
    incognitoMode: 'Mode incognito',
    pauseAccount: 'Mettre en pause',
  },

  // === Request Dialog ===
  requestDialog: {
    title: 'Demander le numéro de {name}',
    description: 'Écris un message accrocheur pour convaincre {name} de te donner son numéro',
    messagePlaceholder: 'Salut {name} ! J\'aimerais faire ta connaissance 😊',
    defaultMessage: 'Salut {name} ! J\'aimerais faire ta connaissance 😊',
    sending: 'Envoi en cours...',
    send: 'Envoyer la demande',
    buyCC: 'Acheter des CC',
  },

  // === Phone Reveal ===
  phoneReveal: {
    phoneNumber: 'Numéro de téléphone',
    revealNumber: 'Révéler le numéro',
    buyCCtoReveal: 'Acheter des CC pour révéler',
  },

  // === Boost ===
  boost: {
    used: 'Utilisé',
    button: 'Boost',
  },

  // === Spend Confirm ===
  spendConfirm: {
    actionCompleted: 'Action effectuée',
    remainingBalance: 'solde restant',
    insufficientBalance: 'Solde insuffisant — il manque {amount} CC',
    buy: 'Acheter',
    remains: 'Reste :',
    confirmCost: 'Confirmer {cost} CC',
  },

  // === Credit Store ===
  store: {
    title: 'ConnectCoin Store',
    subtitle: 'Crédits & Avantages premium',
    tabPacks: 'Packs',
    tabActions: 'Actions',
    tabHistory: 'Historique',
    activePromotions: 'Promotions actives',
    buyConnectCoins: 'Acheter des ConnectCoins',
    firstPurchaseBonus: '+20 CC bonus sur votre première commande !',
    pricingIn: 'Tarification en {currency}',
    pricingFooter: 'Les prix sont automatiquement convertis et ajustés selon la parité de pouvoir d\'achat de votre région.',
    actionsInfo: 'Plus de CC = plus d\'avantages. Les actions premium rendent ton profil unique !',
    recentTransactions: 'Transactions récentes',
    noTransactions: 'Aucune transaction pour le moment',
  },

  // === Countdown ===
  countdown: {
    expired: 'Expiré',
  },

  // === Currency Selector ===
  currencySelector: {
    popularCurrencies: 'Devises populaires',
    priceAdjustment: 'Les prix sont ajustés automatiquement selon votre région',
    pppLabel: 'parité pouvoir d\'achat',
  },

  // === Daily Free ===
  dailyFree: {
    title: 'CC Gratuits',
    subtitle: 'Chaque jour, ça paye !',
    claimedAmount: '+{amount} CC réclamés !',
    alreadyClaimed: 'Déjà réclamé aujourd\'hui',
    claiming: 'Réclamation...',
    claimButton: 'Réclamer +{amount} CC gratuits',
  },

  // === Packs ===
  packs: {
    bestValue: 'Meilleur rapport',
    popular: 'Populaire',
    regionDiscount: 'région',
    discovery: 'Découverte',
    trend: 'Tendance',
    trendBonus: '+5 CC offerts',
    passion: 'Passion',
    passionBonus: '+15 CC + 1 Rose Connect',
    flame: 'Flamme',
    flameBonus: '+40 CC + 3 Roses + Thème',
  },

  // === Actions (Premium) ===
  actions: {
    interaction: 'Interaction',
    visibility: 'Visibilité',
    cosmetic: 'Cosmétique',
    superRequest: { name: 'Super Demande', desc: 'Demande de numéro mise en avant avec badge doré' },
    roseConnect: { name: 'Rose Connect', desc: 'Signal d\'intérêt premium avec animation unique' },
    boost: { name: 'Boost Visibilité', desc: 'Profil en tête des résultats pendant 30 min' },
    extraRequest: { name: 'Demande supplémentaire', desc: 'Demande de numéro au-delà du quota gratuit' },
    seeVisitors: { name: 'Voir les visiteurs', desc: 'Révélation des profils ayant visité votre profil' },
    readReceipt: { name: 'Accusé de lecture', desc: 'Voir si votre message a été lu' },
    ghostMode: { name: 'Mode Fantôme', desc: 'Naviguer invisiblement sans laisser de traces (24h)' },
    filtersPlus: { name: 'Filtres Connect+', desc: 'Filtres avancés : taille, signe, études (24h)' },
    undoPass: { name: 'Annuler un pass', desc: 'Revenir sur un swipe gauche accidentel' },
    themeFlame: { name: 'Thème Flamme', desc: 'Cadre animé flamme autour de votre photo' },
    themeStar: { name: 'Thème Étoile', desc: 'Effet scintillant sur votre photo de profil' },
    themeAura: { name: 'Thème Aura', desc: 'Halo lumineux personnalisé' },
    customBadge: { name: 'Badge personnalisé', desc: 'Texte personnalisé affiché sur votre profil' },
    requestAnimation: { name: 'Animation de demande', desc: 'Animation spéciale lors de l\'envoi d\'une demande' },
  },

  // === Purchase ===
  purchase: {
    successTitle: 'Achat réussi !',
    added: 'ajoutés',
    ccBalance: 'CC solde',
    packName: 'Pack {name}',
    regionDiscount: 'région',
  },

  // === Level Badge ===
  levelBadge: {
    levelNumber: 'Niveau {number}',
    ccSpent: '{amount} CC dépensés',
    nextLevel: 'Prochain niveau',
    benefits: 'Avantages',
    moreBenefits: '+{count} autres avantages',
  },

  // === Streak Inline ===
  streakInline: {
    daysInARow: '{count} jours de suite',
    nextMilestone: 'Prochain palier : Jour {day}',
    record: 'Record',
  },

  // === Levels ===
  levels: {
    bronze: 'Bronze',
    silver: 'Argent',
    gold: 'Or',
    platinum: 'Platine',
    diamond: 'Diamant',
    bronzeBenefits: ['Accès de base aux fonctionnalités', '3 CC gratuits par jour'],
    silverBenefits: ['Tout de Bronze', 'Voir les derniers visiteurs', 'Filtres avancés'],
    goldBenefits: ['Tout d\'Argent', 'Mode Fantôme gratuit', 'Accusés de lecture', 'Boost quotidien bonus'],
    platinumBenefits: ['Tout d\'Or', 'Thème exclusif', 'Badge personnalisé', 'Priorité dans les résultats'],
    diamondBenefits: ['Tout de Platine', 'Tous les thèmes gratuits', 'Animations exclusives', 'Support prioritaire', '1 CC bonus quotidien supplémentaire'],
  },

  // === Streak ===
  streak: {
    daysShort: '{count}j',
    daysInARow: '{count} jours de suite',
    record: 'Record : {count} jours',
    today: 'Aujourd\'hui',
    nextMilestone: 'Prochain palier : Jour {day}',
    milestones: 'Paliers',
    claimed: 'Réclamé ! +{amount} CC',
    alreadyCheckedIn: 'Check-in effectué aujourd\'hui',
    checkIn: 'Check-in +{amount} CC gratuits',
  },

  // === Milestones ===
  milestones: {
    day5: 'Jour 5 : +2 CC bonus',
    day7: 'Jour 7 : +3 CC bonus + Boost gratuit',
    day14: 'Jour 14 : +4 CC bonus + Rose Connect gratuite',
    day30: 'Jour 30 : +5 CC bonus + Thème Légende',
  },

  // === Challenges ===
  challenges: {
    weeklyTitle: 'Défis hebdomadaires',
    resetsMonday: 'Se réinitialisent chaque lundi',
    noneAvailable: 'Aucun défi disponible',
    claiming: 'Réclamation...',
    claimReward: 'Réclamer +{amount} CC',
  },

  // === Feedback System ===
  feedback: {
    matchTitle: 'Match !',
    matchSubtitle: 'C\'est un match !',
    sendMessage: 'Envoyer un message 💌',
    continueDiscovering: 'Continuer à découvrir',
    requestSent: 'Demande envoyée !',
    requestSentDesc: '{name} recevra ta demande de numéro. Croise les doigts ! 🤞',
    statusSent: 'Envoyée',
    statusPending: 'En attente',
    statusNumber: 'Numéro',
    great: 'Super ! ✨',
    numberObtained: 'Numéro obtenu ! 🎉',
    requestAcceptedDesc: '{name} a accepté ta demande !',
    revealNumber: 'Révéler le numéro',
    boostActivated: 'Boost activé !',
    boostDesc: 'Tu es en haut des résultats pendant 30min 🚀',
    streakDays: '{days} jours !',
    streakOnFire: 'Ta série est en feu ! Continue comme ça 🔥',
    streakGreat: 'Super série de {days} jours ! Ne la brise pas !',
    daysBeforeOnFireBadge: '{count} jours avant le badge "En feu"',
    continueStreak: 'Continuer 🔥',
    newBadge: 'Nouveau badge !',
    badgeUnlocked: 'Tu as débloqué ce badge sur ton profil ! Les autres pourront le voir 👀',
    awesome: 'Génial ! 🏅',
    welcomePremium: 'Bienvenue en Premium !',
    premiumAccessDesc: 'Tu as maintenant accès à toutes les fonctionnalités exclusives ✨',
  },

  // === Badges ===
  badges: {
    verified: 'Vérifié',
    popular: 'Populaire',
    quickReply: 'Réponse rapide',
    loyal: 'Fidèle',
    premium: 'Premium',
    streak5: 'Série de 5 jours',
    firstRequest: 'Première demande',
    firstMatch: 'Premier match',
    firstMessage: 'Premier message',
  },

  // === Conversation ===
  conversation: {
    none: 'Aucune conversation',
    noneDesc: 'Demande un numéro pour commencer à discuter',
    msgRemaining: '{count} msg restants',
  },

  // === Connection Card ===
  connectionCard: {
    show: 'Afficher',
    call: 'Appeler',
  },

  // === Onboarding ===
  onboarding: {
    whoAreYou: 'Qui es-tu ?',
    tellUsAboutYou: 'Parle-nous un peu de toi',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Ton prénom',
    birthDate: 'Date de naissance',
    age: 'Quel âge as-tu ?',
    selectAge: 'Sélectionne ton âge',
    gender: 'Tu es...',
    male: '👨 Homme',
    female: '👩 Femme',
    otherGender: '✨ Autre',
    yourPhotos: 'Tes plus belles photos',
    addMinPhotos: 'Ajoute au moins 2 photos pour continuer',
    clickToAddPhotos: 'Clique pour ajouter des photos (simulation)',
    talkAboutYou: 'Parle de toi',
    bioAndPrompts: 'Bio et prompts pour te démarquer',
    bioPlaceholder: 'Décris-toi en quelques mots...',
    choosePrompts: 'Choisis tes prompts (max 3)',
    yourAnswer: 'Ta réponse...',
    yourInterests: "Tes centres d'intérêt",
    chooseInterests: 'Choisis entre 3 et 8 intérêts',
    selected: 'sélectionnés',
    phoneVerification: 'Vérification téléphone',
    enterSmsCode: 'Entre le code reçu par SMS (mock)',
    demoCode: 'Code de démonstration : 1234',
    verifiedSuccessfully: 'Vérifié avec succès !',
    profileScore: 'Score de profil',
    photosLabel: 'Photos',
    bioLabel: 'Bio',
    interestsLabel: 'Intérêts',
    continueBtn: 'Continuer',
    fillNameAndGender: 'Remplis le prénom et le genre pour continuer',
    addMinPhotosContinue: 'Ajoute au moins 2 photos pour continuer',
    chooseMinInterests: "Choisis au moins 3 centres d'intérêt",
    skipStep: 'Passer cette étape',
    letsGo: "C'est parti !",
    skipVerification: 'Passer la vérification',
    newUserMood: '✨ Nouveau ici !',
    defaultUser: 'Utilisateur',
    minPhotos: '{count}/2 min',
    minInterests: '{count}/3 min',
    interests: ['🎵 Musique', '🎬 Cinéma', '📸 Photo', '🎨 Art', '🏋️ Sport', '🍳 Cuisine', '✈️ Voyage', '📚 Lecture', '🎮 Gaming', '🧘 Yoga', '🍷 Vin', '☕ Café', '🌿 Nature', '💃 Danse', '🎸 Guitare', '🏖️ Plage', '⛰️ Rando', '🎭 Théâtre', '🐾 Animaux', '💻 Tech', '🎵 Concerts', '🏖️ Surf', '🎨 Peinture', '🚲 Vélo', '✍️ Écriture'],
    prompts: ['Mon plus grand talent caché ?', 'Je ne pourrais pas vivre sans...', 'Ma plus belle aventure ?', 'Mon guilty pleasure ?', 'Ce qui me fait rire ?', 'Mon plat réconfort ?'],
  },

  // === Streak extras ===
  streakExtra: {
    days: 'jours',
    onFire: 'En feu !',
    almostOnFire: 'Bientôt en feu !',
  },

  // === Filter ===
  filter: {
    title: 'Filtres',
    description: 'Affine ta recherche',
    age: 'Âge',
    yearsOld: 'ans',
    maxDistance: 'Distance maximale',
    lookingFor: 'Je cherche',
    all: 'Tous',
    women: '👩 Femmes',
    men: '👨 Hommes',
    relationType: 'Type de relation',
    everything: '🔍 Tout',
    relationship: '❤️ Relation',
    friendship: '🤝 Amitié',
    resetFilters: 'Réinitialiser les filtres',
  },

  // === Chat ===
  chat: {
    numberExchanged: 'Numéro échangé',
    messagesRemaining: '{count} message{s} restant{s}',
    almostLimit: 'Plus que {count} message{s} ! Échangez vos numéros pour continuer',
    limitReached: 'Limite atteinte !',
    exchangeToContinue: 'Échangez vos numéros pour continuer la conversation',
    startConversation: 'Commence la conversation avec {name} !',
    suggestedIceBreakers: 'Brise-glace suggérés',
    writeMessage: 'Écrire un message...',
    exchangeNumbersCta: 'Échangez vos numéros pour continuer la conversation',
    iceBreaker1: "Qu'est-ce qui te fait sourire aujourd'hui ? 😊",
    iceBreaker2: "Ton voyage de rêve, c'est où ? ✈️",
    iceBreaker3: 'Plutôt café ou thé ? ☕',
    iceBreaker4: 'Quel est ton plat préféré ? 🍽️',
    iceBreaker5: 'Tu es plutôt matin ou soir ? 🌙',
    mockReplies: ['Merci pour ton message ! 😄', "C'est super comme idée !", "Haha, j'adore ! 😊", 'On se capte bientôt ?'],
  },

  // === Request Card ===
  requestCard: {
    numberExchanged: 'Numéro échangé !',
    new: 'Nouveau',
    super: 'Super',
    pending: 'En attente',
    accepted: 'Accepté',
    declined: 'Décliné',
    decline: 'Décliner',
    accepting: 'Acceptation...',
    accept: 'Accepter',
  },

  // === Profile Card (Discover) ===
  profileCard: {
    no: 'NON',
    request: 'Demander',
    requestShort: 'Numéro',
    viewProfile: 'Voir le profil',
  },

  // === Profile Detail ===
  profileDetail: {
    profileOf: 'Profil de {name}',
    interests: "Centres d'intérêt",
    spotifyAnthem: 'Hymne Spotify',
    requestNumber: 'Demander le numéro',
    requestNumberShort: 'Numéro',
  },

  // === Profile Editor ===
  profileEditor: {
    photos: 'Photos',
    information: 'Informations',
    save: 'Sauvegarder',
    edit: 'Modifier',
    firstName: 'Prénom',
    bio: 'Bio',
    jobTitle: 'Métier',
    company: 'Entreprise',
    city: 'Ville',
    interests: "Centres d'intérêt",
    firstNameLabel: 'Prénom :',
    bioLabel: 'Bio :',
    jobTitleLabel: 'Métier :',
    companyLabel: 'Entreprise :',
    cityLabel: 'Ville :',
  },

  // === TikTok Viewer ===
  tiktok: {
    welcome: 'Bienvenue sur ConnectPhone ✨',
    discoverProfiles: 'Découvre des profils comme jamais',
    swipeUp: 'Glisse vers le haut',
    discoverNext: 'pour découvrir le profil suivant',
    doubleTapLike: 'Double-tap pour liker ❤️',
    useSideButtons: 'ou utilise les boutons sur le côté',
    letsGo: "C'est parti !",
    start: 'Commencer',
    number: 'Numéro',
    pass: 'Passer',
    share: 'Partager',
    swipeUpArrow: 'Glisse vers le haut ↑',
    noMoreProfiles: 'Plus de profils pour le moment',
    comeBackLater: 'Reviens bientôt pour de nouvelles rencontres',
    refresh: 'Rafraîchir',
    autoRefresh: 'Auto-rafraîchissement dans {countdown}s',
    spotifyAnthem: 'Hymne Spotify',
  },

  // === Admin ===
  admin: {
    overview: "Vue d'ensemble",
    users: 'Utilisateurs',
    numberRequests: 'Demandes de numéro',
    messages: 'Messages',
    connections: 'Connexions',
    moments: 'Moments',
    reports: 'Signalements',
    premium: 'Premium',
    configuration: 'Configuration',
    gamification: 'Gamification',
    totalUsers: 'Total utilisateurs',
    activeUsers: 'Utilisateurs actifs',
    todayRequests: "Demandes aujourd'hui",
    acceptanceRate: "Taux d'acceptation",
    premiumRevenue: 'Revenus Premium',
    monthlyConnections: 'Connexions ce mois',
    inscriptionsOver30: 'Inscriptions sur 30 jours',
    newUsersEvolution: 'Évolution des nouveaux utilisateurs',
    premiumVsFree: 'Répartition Premium vs Gratuit',
    subscriptionTypes: "Types d'abonnement",
    requestsByStatus: 'Demandes par statut',
    numberRequestDistribution: 'Répartition des demandes de numéro',
    dailyActivity: 'Activité quotidienne',
    messagesRequestsConnections: 'Messages, demandes et connexions',
    recentActivity: 'Activité récente',
    latestActions: 'Dernières actions sur la plateforme',
    total: 'Total',
    active: 'Actif',
    verified: 'Vérifié',
    searchUser: 'Rechercher un utilisateur...',
    status: 'Statut',
    all: 'Tous',
    suspended: 'Suspendu',
    banned: 'Banni',
    gender: 'Genre',
    male: 'Homme',
    female: 'Femme',
    nonBinary: 'Non-binaire',
    user: 'Utilisateur',
    email: 'Email',
    age: 'Âge',
    city: 'Ville',
    score: 'Score',
    actions: 'Actions',
    view: 'Voir',
    verify: 'Vérifier',
    suspend: 'Suspendre',
    delete: 'Supprimer',
    showing: 'Affichage de {shown} sur {total} utilisateurs',
    yearsOld: 'ans',
    registration: 'Inscription',
    lastActivity: 'Dernière activité',
    totalRequests: 'Total demandes',
    pendingRequests: 'En attente',
    acceptedRequests: 'Acceptées',
    avgResponseTime: 'Temps de réponse moyen',
    filterByStatus: 'Filtrer par statut',
    pending: 'En attente',
    accepted: 'Acceptée',
    refused: 'Refusée',
    sender: 'Expéditeur',
    receiver: 'Destinataire',
    message: 'Message',
    date: 'Date',
    superRequest: 'Super demande',
    totalMessages: 'Total messages',
    totalConversations: 'Conversations',
    avgPerConversation: 'Moy. par conversation',
    preNumber: 'Avant numéro',
    user1: 'Utilisateur 1',
    user2: 'Utilisateur 2',
    totalConnections: 'Total connexions',
    phonesExchanged: 'Numéros échangés',
    thisMonth: 'Ce mois',
    totalMoments: 'Total moments',
    activeMoments: 'Actifs',
    expiredMoments: 'Expirés',
    reportedMoments: 'Signalés',
    caption: 'Légende',
    likes: 'Likes',
    comments: 'Commentaires',
    totalReports: 'Total signalements',
    inProgress: 'En cours',
    resolved: 'Résolu',
    ignored: 'Ignoré',
    reporter: 'Signaleur',
    reported: 'Signalé',
    reason: 'Raison',
    totalPremium: 'Total abonnés',
    activeSubscriptions: 'Actifs',
    monthlyRevenue: 'Revenu mensuel',
    plan: 'Plan',
    price: 'Prix',
    startDate: 'Date début',
    nextBilling: 'Prochaine facturation',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    annual: 'Annuel',
    expired: 'Expiré',
    cancelled: 'Annulé',
    free: 'Gratuit',
    inscriptions: 'Inscriptions',
    demandes: 'Demandes',
    connexions: 'Connexions',
    backToApp: "Retour à l'app",
  },

  // === Premium ===
  premium: {
    title: 'ConnectPhone Premium',
    freeTrial: 'Essai gratuit 7 jours',
    pricingDisclaimer: '9,99€/mois · Annule quand tu veux',
    unlimitedBoosts: 'Boosts illimités',
    superRequests: 'Super demandes',
    incognitoMode: 'Mode incognito',
    unlimitedMessages: 'Messages illimités',
    seeVisitors: 'Voir qui t\'a visité',
  },

  // === Loading Screen ===
  loading: {
    status1: 'Allumage du signal amoureux...',
    status2: 'Synchronisation des cœurs...',
    status3: 'Recherche de profils...',
    status4: 'Finalisation de la connexion...',
    status5: 'Prêt ! Lancement de Fonelove...',
  },
} as const

export default fr
export type Translations = typeof fr
