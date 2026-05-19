/**
 * English translations — fallback locale
 * Mirrors the FR dictionary structure exactly
 */
const en = {
  // === Metadata ===
  metadata: {
    title: 'ConnectPhone - The Dating App',
    description: 'The dating app where the phone number is the destination. Request, accept, connect.',
  },

  // === Common ===
  common: {
    loading: 'Loading...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    confirming: 'Confirming...',
    confirmCost: 'Confirm {cost} CC',
    processing: 'Processing...',
    close: 'Close',
    copied: 'Copied!',
    copy: 'Copy',
    someone: 'Someone',
    inProgress: 'In progress...',
    earned: 'CC earned',
    spent: 'CC spent',
  },

  // === Login / Auth ===
  login: {
    tagline: 'The dating app where the number is the destination',
    firstNamePlaceholder: 'First name',
    passwordPlaceholder: 'Password',
    signIn: 'Sign in',
    signUp: 'Sign up',
    quickDemo: 'Quick demo (Alex Martin)',
    noAccountYet: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
  },

  // === Tabs ===
  tabs: {
    discover: 'Discover',
    requests: 'Requests',
    messages: 'Messages',
    connections: 'Contacts',
    profile: 'Profile',
  },

  // === Discover ===
  discover: {
    profileCount: '{count} profiles',
  },

  // === Requests ===
  requests: {
    pendingCount: '{count} pending',
    received: 'Received',
    sent: 'Sent',
    noneReceived: 'No requests',
    noneReceivedDesc: "When someone asks for your number, it'll show up here",
    recent: 'Recent',
    noneSent: 'No requests sent',
    noneSentDesc: 'Request the number of someone you like!',
  },

  // === Messages ===
  messages: {
    conversationCount: '{count} conversation{s}',
  },

  // === Connections ===
  connections: {
    contactCount: '{count} contact{s}',
    moments: 'Moments',
    none: 'No contacts',
    noneDesc: 'When you exchange a number, the person appears here',
    numbersExchanged: 'Numbers exchanged',
  },

  // === Profile ===
  profile: {
    myProfile: 'My Profile',
    score: 'Score',
    badges: 'Badges',
    whoVisitedMe: 'Who visited me',
    noVisits: 'No visits yet',
    adminDashboard: 'Admin Dashboard',
    logout: 'Log out',
  },

  // === Settings ===
  settings: {
    language: 'Language',
    darkMode: 'Dark mode',
    incognitoMode: 'Incognito mode',
    pauseAccount: 'Pause account',
  },

  // === Request Dialog ===
  requestDialog: {
    title: "Request {name}'s number",
    description: 'Write a catchy message to convince {name} to share their number',
    messagePlaceholder: "Hi {name}! I'd love to get to know you 😊",
    defaultMessage: "Hi {name}! I'd love to get to know you 😊",
    sending: 'Sending...',
    send: 'Send request',
    buyCC: 'Buy CC',
  },

  // === Phone Reveal ===
  phoneReveal: {
    phoneNumber: 'Phone number',
    revealNumber: 'Reveal number',
    buyCCtoReveal: 'Buy CC to reveal',
  },

  // === Boost ===
  boost: {
    used: 'Used',
    button: 'Boost',
  },

  // === Spend Confirm ===
  spendConfirm: {
    actionCompleted: 'Action completed',
    remainingBalance: 'remaining balance',
    insufficientBalance: 'Insufficient balance — {amount} CC needed',
    buy: 'Buy',
    remains: 'Remains:',
    confirmCost: 'Confirm {cost} CC',
  },

  // === Credit Store ===
  store: {
    title: 'ConnectCoin Store',
    subtitle: 'Credits & Premium benefits',
    tabPacks: 'Packs',
    tabActions: 'Actions',
    tabHistory: 'History',
    activePromotions: 'Active promotions',
    buyConnectCoins: 'Buy ConnectCoins',
    firstPurchaseBonus: '+20 CC bonus on your first order!',
    pricingIn: 'Pricing in {currency}',
    pricingFooter: 'Prices are automatically converted and adjusted based on purchasing power parity in your region.',
    actionsInfo: 'More CC = more benefits. Premium actions make your profile unique!',
    recentTransactions: 'Recent transactions',
    noTransactions: 'No transactions yet',
  },

  // === Countdown ===
  countdown: {
    expired: 'Expired',
  },

  // === Currency Selector ===
  currencySelector: {
    popularCurrencies: 'Popular currencies',
    priceAdjustment: 'Prices are automatically adjusted based on your region',
    pppLabel: 'purchasing power parity',
  },

  // === Daily Free ===
  dailyFree: {
    title: 'Free CC',
    subtitle: 'Every day, it pays off!',
    claimedAmount: '+{amount} CC claimed!',
    alreadyClaimed: 'Already claimed today',
    claiming: 'Claiming...',
    claimButton: 'Claim +{amount} free CC',
  },

  // === Packs ===
  packs: {
    bestValue: 'Best value',
    popular: 'Popular',
    regionDiscount: 'region',
    discovery: 'Discovery',
    trend: 'Trend',
    trendBonus: '+5 CC free',
    passion: 'Passion',
    passionBonus: '+15 CC + 1 Rose Connect',
    flame: 'Flame',
    flameBonus: '+40 CC + 3 Roses + Theme',
  },

  // === Actions (Premium) ===
  actions: {
    interaction: 'Interaction',
    visibility: 'Visibility',
    cosmetic: 'Cosmetic',
    superRequest: { name: 'Super Request', desc: 'Featured number request with golden badge' },
    roseConnect: { name: 'Rose Connect', desc: 'Premium interest signal with unique animation' },
    boost: { name: 'Visibility Boost', desc: 'Profile at the top of results for 30 min' },
    extraRequest: { name: 'Extra request', desc: 'Number request beyond the free quota' },
    seeVisitors: { name: 'See visitors', desc: 'Reveal profiles that visited your profile' },
    readReceipt: { name: 'Read receipt', desc: 'See if your message has been read' },
    ghostMode: { name: 'Ghost Mode', desc: 'Browse invisibly without leaving traces (24h)' },
    filtersPlus: { name: 'Connect+ Filters', desc: 'Advanced filters: height, sign, education (24h)' },
    undoPass: { name: 'Undo pass', desc: 'Undo an accidental left swipe' },
    themeFlame: { name: 'Flame Theme', desc: 'Animated flame frame around your photo' },
    themeStar: { name: 'Star Theme', desc: 'Sparkling effect on your profile photo' },
    themeAura: { name: 'Aura Theme', desc: 'Custom glowing halo' },
    customBadge: { name: 'Custom badge', desc: 'Custom text displayed on your profile' },
    requestAnimation: { name: 'Request animation', desc: 'Special animation when sending a request' },
  },

  // === Purchase ===
  purchase: {
    successTitle: 'Purchase successful!',
    added: 'added',
    ccBalance: 'CC balance',
    packName: 'Pack {name}',
    regionDiscount: 'region',
  },

  // === Level Badge ===
  levelBadge: {
    levelNumber: 'Level {number}',
    ccSpent: '{amount} CC spent',
    nextLevel: 'Next level',
    benefits: 'Benefits',
    moreBenefits: '+{count} more benefits',
  },

  // === Streak Inline ===
  streakInline: {
    daysInARow: '{count} days in a row',
    nextMilestone: 'Next milestone: Day {day}',
    record: 'Record',
  },

  // === Levels ===
  levels: {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
    diamond: 'Diamond',
    bronzeBenefits: ['Basic feature access', '3 free CC per day'],
    silverBenefits: ['Everything in Bronze', 'See recent visitors', 'Advanced filters'],
    goldBenefits: ['Everything in Silver', 'Free Ghost Mode', 'Read receipts', 'Bonus daily boost'],
    platinumBenefits: ['Everything in Gold', 'Exclusive theme', 'Custom badge', 'Priority in results'],
    diamondBenefits: ['Everything in Platinum', 'All themes free', 'Exclusive animations', 'Priority support', '1 extra daily CC bonus'],
  },

  // === Streak ===
  streak: {
    daysShort: '{count}d',
    daysInARow: '{count} days in a row',
    record: 'Record: {count} days',
    today: 'Today',
    nextMilestone: 'Next milestone: Day {day}',
    milestones: 'Milestones',
    claimed: 'Claimed! +{amount} CC',
    alreadyCheckedIn: 'Already checked in today',
    checkIn: 'Check-in +{amount} free CC',
  },

  // === Milestones ===
  milestones: {
    day5: 'Day 5: +2 CC bonus',
    day7: 'Day 7: +3 CC bonus + Free boost',
    day14: 'Day 14: +4 CC bonus + Free Rose Connect',
    day30: 'Day 30: +5 CC bonus + Legend Theme',
  },

  // === Challenges ===
  challenges: {
    weeklyTitle: 'Weekly challenges',
    resetsMonday: 'Reset every Monday',
    noneAvailable: 'No challenges available',
    claiming: 'Claiming...',
    claimReward: 'Claim +{amount} CC',
  },

  // === Feedback System ===
  feedback: {
    matchTitle: 'Match!',
    matchSubtitle: "It's a match!",
    sendMessage: 'Send a message 💌',
    continueDiscovering: 'Keep discovering',
    requestSent: 'Request sent!',
    requestSentDesc: '{name} will receive your number request. Fingers crossed! 🤞',
    statusSent: 'Sent',
    statusPending: 'Pending',
    statusNumber: 'Number',
    great: 'Great! ✨',
    numberObtained: 'Number obtained! 🎉',
    requestAcceptedDesc: '{name} accepted your request!',
    revealNumber: 'Reveal number',
    boostActivated: 'Boost activated!',
    boostDesc: 'You\'re at the top of results for 30min 🚀',
    streakDays: '{days} days!',
    streakOnFire: 'Your streak is on fire! Keep it going 🔥',
    streakGreat: 'Great {days}-day streak! Don\'t break it!',
    daysBeforeOnFireBadge: '{count} days until "On Fire" badge',
    continueStreak: 'Continue 🔥',
    newBadge: 'New badge!',
    badgeUnlocked: 'You unlocked this badge on your profile! Others will be able to see it 👀',
    awesome: 'Awesome! 🏅',
    welcomePremium: 'Welcome to Premium!',
    premiumAccessDesc: 'You now have access to all exclusive features ✨',
  },

  // === Badges ===
  badges: {
    verified: 'Verified',
    popular: 'Popular',
    quickReply: 'Quick Reply',
    loyal: 'Loyal',
    premium: 'Premium',
    streak5: '5-Day Streak',
    firstRequest: 'First Request',
    firstMatch: 'First Match',
    firstMessage: 'First Message',
  },

  // === Conversation ===
  conversation: {
    none: 'No conversations',
    noneDesc: 'Request a number to start chatting',
    msgRemaining: '{count} msg remaining',
  },

  // === Connection Card ===
  connectionCard: {
    show: 'Show',
    call: 'Call',
  },

  // === Onboarding ===
  onboarding: {
    whoAreYou: 'Who are you?',
    tellUsAboutYou: 'Tell us a bit about yourself',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    birthDate: 'Date of birth',
    gender: 'Gender',
    male: '👨 Male',
    female: '👩 Female',
    otherGender: '✨ Other',
    yourPhotos: 'Your best photos',
    addMinPhotos: 'Add at least 2 photos to continue',
    clickToAddPhotos: 'Click to add photos (simulation)',
    talkAboutYou: 'Talk about yourself',
    bioAndPrompts: 'Bio & prompts to stand out',
    bioPlaceholder: 'Describe yourself in a few words...',
    choosePrompts: 'Choose your prompts (max 3)',
    yourAnswer: 'Your answer...',
    yourInterests: 'Your interests',
    chooseInterests: 'Choose between 3 and 8 interests',
    selected: 'selected',
    phoneVerification: 'Phone verification',
    enterSmsCode: 'Enter the code received by SMS (mock)',
    demoCode: 'Demo code: 1234',
    verifiedSuccessfully: 'Verified successfully!',
    profileScore: 'Profile score',
    photosLabel: 'Photos',
    bioLabel: 'Bio',
    interestsLabel: 'Interests',
    continueBtn: 'Continue',
    fillNameAndGender: 'Fill in first name and gender to continue',
    addMinPhotosContinue: 'Add at least 2 photos to continue',
    chooseMinInterests: 'Choose at least 3 interests',
    skipStep: 'Skip this step',
    letsGo: "Let's go!",
    skipVerification: 'Skip verification',
    newUserMood: '✨ New here!',
    defaultUser: 'User',
    minPhotos: '{count}/2 min',
    minInterests: '{count}/3 min',
    interests: ['🎵 Music', '🎬 Cinema', '📸 Photo', '🎨 Art', '🏋️ Sport', '🍳 Cooking', '✈️ Travel', '📚 Reading', '🎮 Gaming', '🧘 Yoga', '🍷 Wine', '☕ Coffee', '🌿 Nature', '💃 Dance', '🎸 Guitar', '🏖️ Beach', '⛰️ Hiking', '🎭 Theater', '🐾 Animals', '💻 Tech', '🎵 Concerts', '🏖️ Surf', '🎨 Painting', '🚲 Cycling', '✍️ Writing'],
    prompts: ['My greatest hidden talent?', "I couldn't live without...", 'My greatest adventure?', 'My guilty pleasure?', 'What makes me laugh?', 'My comfort food?'],
  },

  // === Streak extras ===
  streakExtra: {
    days: 'days',
    onFire: 'On fire!',
    almostOnFire: 'Almost on fire!',
  },

  // === Filter ===
  filter: {
    title: 'Filters',
    description: 'Refine your search',
    age: 'Age',
    yearsOld: 'years old',
    maxDistance: 'Maximum distance',
    lookingFor: "I'm looking for",
    all: 'All',
    women: '👩 Women',
    men: '👨 Men',
    relationType: 'Relationship type',
    everything: '🔍 Everything',
    relationship: '❤️ Relationship',
    friendship: '🤝 Friendship',
    resetFilters: 'Reset filters',
  },

  // === Chat ===
  chat: {
    numberExchanged: 'Number exchanged',
    messagesRemaining: '{count} message{s} remaining',
    almostLimit: 'Only {count} message{s} left! Exchange numbers to continue',
    limitReached: 'Limit reached!',
    exchangeToContinue: 'Exchange your numbers to continue the conversation',
    startConversation: 'Start a conversation with {name}!',
    suggestedIceBreakers: 'Suggested ice breakers',
    writeMessage: 'Write a message...',
    exchangeNumbersCta: 'Exchange numbers to continue the conversation',
    iceBreaker1: "What makes you smile today? 😊",
    iceBreaker2: "Where's your dream trip? ✈️",
    iceBreaker3: 'Coffee or tea? ☕',
    iceBreaker4: "What's your favorite dish? 🍽️",
    iceBreaker5: 'Are you a morning or evening person? 🌙',
    mockReplies: ['Thanks for your message! 😄', "That's a great idea!", "Haha, I love it! 😊", 'Shall we meet up soon?'],
  },

  // === Request Card ===
  requestCard: {
    numberExchanged: 'Number exchanged!',
    new: 'New',
    super: 'Super',
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    decline: 'Decline',
    accepting: 'Accepting...',
    accept: 'Accept',
  },

  // === Profile Card (Discover) ===
  profileCard: {
    no: 'NO',
    request: 'Request',
    requestShort: 'Number',
    viewProfile: 'View profile',
  },

  // === Profile Detail ===
  profileDetail: {
    profileOf: "{name}'s profile",
    interests: 'Interests',
    spotifyAnthem: 'Spotify Anthem',
    requestNumber: 'Request number',
    requestNumberShort: 'Number',
  },

  // === Profile Editor ===
  profileEditor: {
    photos: 'Photos',
    information: 'Information',
    save: 'Save',
    edit: 'Edit',
    firstName: 'First name',
    bio: 'Bio',
    jobTitle: 'Job title',
    company: 'Company',
    city: 'City',
    interests: 'Interests',
    firstNameLabel: 'First name:',
    bioLabel: 'Bio:',
    jobTitleLabel: 'Job title:',
    companyLabel: 'Company:',
    cityLabel: 'City:',
  },

  // === TikTok Viewer ===
  tiktok: {
    welcome: 'Welcome to ConnectPhone ✨',
    discoverProfiles: 'Discover profiles like never before',
    swipeUp: 'Swipe up',
    discoverNext: 'to discover the next profile',
    doubleTapLike: 'Double-tap to like ❤️',
    useSideButtons: 'or use the buttons on the side',
    letsGo: "Let's go!",
    start: 'Start',
    number: 'Number',
    pass: 'Pass',
    share: 'Share',
    swipeUpArrow: 'Swipe up ↑',
    noMoreProfiles: 'No more profiles for now',
    comeBackLater: 'Come back soon for new matches',
    refresh: 'Refresh',
    autoRefresh: 'Auto-refresh in {countdown}s',
    spotifyAnthem: 'Spotify Anthem',
  },

  // === Admin ===
  admin: {
    overview: 'Overview',
    users: 'Users',
    numberRequests: 'Number requests',
    messages: 'Messages',
    connections: 'Connections',
    moments: 'Moments',
    reports: 'Reports',
    premium: 'Premium',
    configuration: 'Configuration',
    gamification: 'Gamification',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    todayRequests: "Today's requests",
    acceptanceRate: 'Acceptance rate',
    premiumRevenue: 'Premium revenue',
    monthlyConnections: 'Connections this month',
    inscriptionsOver30: 'Signups over 30 days',
    newUsersEvolution: 'New users evolution',
    premiumVsFree: 'Premium vs Free distribution',
    subscriptionTypes: 'Subscription types',
    requestsByStatus: 'Requests by status',
    numberRequestDistribution: 'Number request distribution',
    dailyActivity: 'Daily activity',
    messagesRequestsConnections: 'Messages, requests and connections',
    recentActivity: 'Recent activity',
    latestActions: 'Latest actions on the platform',
    total: 'Total',
    active: 'Active',
    verified: 'Verified',
    searchUser: 'Search for a user...',
    status: 'Status',
    all: 'All',
    suspended: 'Suspended',
    banned: 'Banned',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    nonBinary: 'Non-binary',
    user: 'User',
    email: 'Email',
    age: 'Age',
    city: 'City',
    score: 'Score',
    actions: 'Actions',
    view: 'View',
    verify: 'Verify',
    suspend: 'Suspend',
    delete: 'Delete',
    showing: 'Showing {shown} of {total} users',
    yearsOld: 'years old',
    registration: 'Registration',
    lastActivity: 'Last activity',
    totalRequests: 'Total requests',
    pendingRequests: 'Pending',
    acceptedRequests: 'Accepted',
    avgResponseTime: 'Avg. response time',
    filterByStatus: 'Filter by status',
    pending: 'Pending',
    accepted: 'Accepted',
    refused: 'Refused',
    sender: 'Sender',
    receiver: 'Receiver',
    message: 'Message',
    date: 'Date',
    superRequest: 'Super request',
    totalMessages: 'Total messages',
    totalConversations: 'Conversations',
    avgPerConversation: 'Avg. per conversation',
    preNumber: 'Pre-number',
    user1: 'User 1',
    user2: 'User 2',
    totalConnections: 'Total connections',
    phonesExchanged: 'Numbers exchanged',
    thisMonth: 'This month',
    totalMoments: 'Total moments',
    activeMoments: 'Active',
    expiredMoments: 'Expired',
    reportedMoments: 'Reported',
    caption: 'Caption',
    likes: 'Likes',
    comments: 'Comments',
    totalReports: 'Total reports',
    inProgress: 'In progress',
    resolved: 'Resolved',
    ignored: 'Ignored',
    reporter: 'Reporter',
    reported: 'Reported',
    reason: 'Reason',
    totalPremium: 'Total subscribers',
    activeSubscriptions: 'Active',
    monthlyRevenue: 'Monthly revenue',
    plan: 'Plan',
    price: 'Price',
    startDate: 'Start date',
    nextBilling: 'Next billing',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annual: 'Annual',
    expired: 'Expired',
    cancelled: 'Cancelled',
    free: 'Free',
    inscriptions: 'Signups',
    demandes: 'Requests',
    connexions: 'Connections',
    backToApp: 'Back to app',
  },

  // === Premium ===
  premium: {
    title: 'ConnectPhone Premium',
    freeTrial: '7-day free trial',
    pricingDisclaimer: '€9.99/month · Cancel anytime',
    unlimitedBoosts: 'Unlimited boosts',
    superRequests: 'Super requests',
    incognitoMode: 'Incognito mode',
    unlimitedMessages: 'Unlimited messages',
    seeVisitors: 'See who visited you',
  },
} as const

export default en
export type Translations = typeof en
