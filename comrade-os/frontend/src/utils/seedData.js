// Default data seeded on first app load
// Uses KES (Kenyan Shillings) for Kenyan campus students

const SEED_KEY = 'comradeos_seeded';

const defaultUser = {
    name: 'Comrade',
    xp: 150,
    badges: ['Disciplined Comrade'],
    createdAt: new Date().toISOString()
};

const defaultFinance = {
    incomeWeekly: 2000,
    balance: 1850,
    expenses: [
        { id: 1, category: 'Food', amount: 100, date: new Date().toISOString() },
        { id: 2, category: 'Transport', amount: 50, date: new Date().toISOString() }
    ]
};

const defaultSchedule = {
    sleepHours: 7,
    studyHours: 4,
    freeTimeHours: 5,
    optimalSchedule: [
        { time: '06:00', activity: 'Wake up + stretch' },
        { time: '06:30', activity: 'Breakfast' },
        { time: '07:00', activity: 'Morning study session' },
        { time: '10:00', activity: 'Lectures' },
        { time: '12:30', activity: 'Lunch break' },
        { time: '13:30', activity: 'Afternoon classes / study' },
        { time: '16:00', activity: 'Group study / assignments' },
        { time: '18:00', activity: 'Dinner' },
        { time: '19:00', activity: 'Free time / fitness' },
        { time: '21:00', activity: 'Revision & prep' },
        { time: '22:00', activity: 'Wind down' },
        { time: '23:00', activity: 'Sleep' }
    ]
};

const defaultDiet = {
    budgetMode: 'normal',
    meals: [
        { id: 1, name: 'Chai & Mandazi', cost: 50, calories: 350, type: 'breakfast' },
        { id: 2, name: 'Ugali & Sukuma Wiki', cost: 80, calories: 500, type: 'lunch' },
        { id: 3, name: 'Rice & Beans (Githeri)', cost: 100, calories: 600, type: 'dinner' },
        { id: 4, name: 'Banana & Groundnuts', cost: 30, calories: 200, type: 'snack' }
    ]
};

const defaultStudy = {
    notes: []
};

const defaultFitness = {
    lastSleepQuality: 7,
    energyLevel: 7,
    availableMinutes: 45,
    suggestedWorkout: { type: 'Bodyweight circuit', duration: 20, intensity: 'moderate' }
};

export function seedIfNeeded() {
    if (localStorage.getItem(SEED_KEY)) return;

    localStorage.setItem('comradeos_user', JSON.stringify(defaultUser));
    localStorage.setItem('comradeos_finance', JSON.stringify(defaultFinance));
    localStorage.setItem('comradeos_schedule', JSON.stringify(defaultSchedule));
    localStorage.setItem('comradeos_diet', JSON.stringify(defaultDiet));
    localStorage.setItem('comradeos_study', JSON.stringify(defaultStudy));
    localStorage.setItem('comradeos_fitness', JSON.stringify(defaultFitness));
    localStorage.setItem(SEED_KEY, 'true');
}

export const survivalMeals = [
    { id: 101, name: 'Uji (Porridge)', cost: 20, calories: 300, type: 'breakfast' },
    { id: 102, name: 'Githeri plain', cost: 40, calories: 400, type: 'lunch' },
    { id: 103, name: 'Chapati & Beans', cost: 60, calories: 450, type: 'dinner' },
    { id: 104, name: 'Banana', cost: 10, calories: 100, type: 'snack' }
];

export const normalMeals = [
    { id: 1, name: 'Chai & Mandazi', cost: 50, calories: 350, type: 'breakfast' },
    { id: 2, name: 'Ugali & Sukuma Wiki', cost: 80, calories: 500, type: 'lunch' },
    { id: 3, name: 'Rice & Beans (Githeri)', cost: 100, calories: 600, type: 'dinner' },
    { id: 4, name: 'Banana & Groundnuts', cost: 30, calories: 200, type: 'snack' }
];
