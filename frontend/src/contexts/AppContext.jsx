import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { calcUserNeeds } from '../utils/nutrition';

const AppContext = createContext(null);

// Date helpers
export const todayKey = () => new Date().toISOString().split('T')[0];
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};
export const formatDateShort = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

// Token helpers
const TOKEN_KEY = 'mealytics_token';
const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const setStoredToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export function AppProvider({ children }) {
  const [token, setToken]         = useState(() => getStoredToken());
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(!!getStoredToken()); // loading while we verify token

  // Per-day journal cache: { "YYYY-MM-DD": { petit_dejeuner:[], ... } }
  const [journal, setJournal]     = useState({});
  const [weightLog, setWeightLog] = useState([]);
  const [recipes, setRecipes]     = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents]     = useState([]);
  const [waterCache, setWaterCache] = useState({}); // { "YYYY-MM-DD": ml }

  // ── Bootstrap: verify stored token ────────────────────────
  useEffect(() => {
    if (!token) { setAuthLoading(false); return; }
    api.auth.me()
      .then(({ user: u }) => { setUser(u); })
      .catch(() => { setStoredToken(null); setToken(null); })
      .finally(() => setAuthLoading(false));
  }, []); // run once on mount

  // When user is loaded, pre-fetch static data
  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.recipes.getAll().then(setRecipes).catch(console.error),
      api.favorites.getAll().then(setFavorites).catch(console.error),
      api.recents.getAll().then(setRecents).catch(console.error),
      api.weight.getAll().then(setWeightLog).catch(console.error),
    ]);
  }, [user?.id]);

  const userNeeds = user?.onboarded ? calcUserNeeds({
    gender:        user.gender,
    weight:        user.weight,
    height:        user.height,
    age:           user.age,
    jobActivity:   user.job_activity,
    sportActivity: user.sport_activity,
    metabolism:    user.metabolism,
    activityLevel: user.activity_level, // legacy fallback
    goal:          user.custom_calories ? 'custom' : user.goal,
    customCalories: user.custom_calories,
  }) : null;

  // Override daily calories if user set a custom value
  const effectiveUserNeeds = userNeeds && user?.custom_calories
    ? { ...userNeeds, dailyCalories: user.custom_calories }
    : userNeeds;

  // ── AUTH ACTIONS ─────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const { token: t, user: u } = await api.auth.login(email, password);
    setStoredToken(t);
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const { token: t, user: u } = await api.auth.register(email, password, name);
    setStoredToken(t);
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    setJournal({});
    setWeightLog([]);
    setRecipes([]);
    setFavorites([]);
    setRecents([]);
    setWaterCache({});
  }, []);

  // ── PROFILE ACTIONS ──────────────────────────────────────

  const updateUser = useCallback(async (data) => {
    // Map camelCase frontend keys to snake_case DB columns
    const mapped = {};
    const keyMap = {
      activityLevel:   'activity_level',
      targetWeight:    'target_weight',
      customCalories:  'custom_calories',
      memberSince:     'member_since',
    };
    for (const [k, v] of Object.entries(data)) {
      mapped[keyMap[k] || k] = v;
    }
    const { user: updated } = await api.profile.update(mapped);
    setUser(updated);
    return updated;
  }, []);

  const completeOnboarding = useCallback(async (profileData) => {
    return updateUser({ ...profileData, onboarded: true });
  }, [updateUser]);

  // ── JOURNAL ACTIONS ──────────────────────────────────────

  const getDayJournal = useCallback(async (date = todayKey()) => {
    if (journal[date]) return journal[date];
    const data = await api.journal.get(date);
    setJournal(prev => ({ ...prev, [date]: data }));
    return data;
  }, [journal]);

  // Sync version for components that need it synchronously (use cached value)
  const getDayJournalSync = useCallback((date = todayKey()) => {
    return journal[date] || { petit_dejeuner: [], dejeuner: [], diner: [], collation: [] };
  }, [journal]);

  const loadDayJournal = useCallback(async (date = todayKey()) => {
    const data = await api.journal.get(date);
    setJournal(prev => ({ ...prev, [date]: data }));
    return data;
  }, []);

  const addFoodToMeal = useCallback(async (date, mealType, entry) => {
    const created = await api.journal.add({
      date,
      mealType,
      foodId:   entry.foodId,
      foodName: entry.name,
      quantity: entry.quantity,
      unit:     entry.unit,
      calories: entry.calories,
      protein:  entry.protein,
      carbs:    entry.carbs,
      fat:      entry.fat,
    });
    setJournal(prev => {
      const day = prev[date] || { petit_dejeuner: [], dejeuner: [], diner: [], collation: [] };
      return {
        ...prev,
        [date]: {
          ...day,
          [mealType]: [...(day[mealType] || []), created],
        },
      };
    });
    // Update recents cache
    setRecents(prev => [entry.foodId, ...prev.filter(id => id !== entry.foodId)].slice(0, 20));
  }, []);

  const removeFoodFromMeal = useCallback(async (date, mealType, entryId) => {
    await api.journal.remove(entryId);
    setJournal(prev => {
      const day = prev[date] || { petit_dejeuner: [], dejeuner: [], diner: [], collation: [] };
      return {
        ...prev,
        [date]: {
          ...day,
          [mealType]: (day[mealType] || []).filter(e => e.id !== entryId),
        },
      };
    });
  }, []);

  const getDayTotals = useCallback((date = todayKey()) => {
    const day = getDayJournalSync(date);
    const all = [...day.petit_dejeuner, ...day.dejeuner, ...day.diner, ...day.collation];
    return all.reduce((acc, e) => ({
      calories: acc.calories + (parseFloat(e.calories) || 0),
      protein:  acc.protein  + (parseFloat(e.protein)  || 0),
      carbs:    acc.carbs    + (parseFloat(e.carbs)     || 0),
      fat:      acc.fat      + (parseFloat(e.fat)       || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [getDayJournalSync]);

  const getMealTotals = useCallback((date, mealType) => {
    const day = getDayJournalSync(date);
    const entries = day[mealType] || [];
    return entries.reduce((acc, e) => ({
      calories: acc.calories + (parseFloat(e.calories) || 0),
      protein:  acc.protein  + (parseFloat(e.protein)  || 0),
      carbs:    acc.carbs    + (parseFloat(e.carbs)     || 0),
      fat:      acc.fat      + (parseFloat(e.fat)       || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [getDayJournalSync]);

  // ── WEIGHT ACTIONS ───────────────────────────────────────

  const addWeight = useCallback(async (date, weight, note = '') => {
    const entry = await api.weight.add(date, weight, note);
    setWeightLog(prev => {
      const filtered = prev.filter(w => w.date !== date);
      return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  const getLatestWeight = useCallback(() => {
    if (weightLog.length === 0) return user?.weight || null;
    return weightLog[weightLog.length - 1].weight;
  }, [weightLog, user]);

  // ── RECIPE ACTIONS ───────────────────────────────────────

  const addRecipe = useCallback(async (recipe) => {
    const created = await api.recipes.create(recipe.name, recipe.ingredients);
    setRecipes(prev => [created, ...prev]);
    return created;
  }, []);

  const updateRecipe = useCallback(async (id, data) => {
    const updated = await api.recipes.update(id, data);
    setRecipes(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, []);

  const deleteRecipe = useCallback(async (id) => {
    await api.recipes.remove(id);
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleLikeRecipe = useCallback(async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    const updated = await api.recipes.update(id, { liked: !recipe.liked });
    setRecipes(prev => prev.map(r => r.id === id ? updated : r));
  }, [recipes]);

  // ── FAVORITES ACTIONS ────────────────────────────────────

  const toggleFavorite = useCallback(async (foodId) => {
    const { favorited } = await api.favorites.toggle(foodId);
    setFavorites(prev =>
      favorited ? [...prev, foodId] : prev.filter(id => id !== foodId)
    );
  }, []);

  const isFavorite = useCallback((foodId) => favorites.includes(foodId), [favorites]);

  // ── WATER TRACKING ───────────────────────────────────────

  const getDayWater = useCallback((date = todayKey()) => {
    return waterCache[date] ?? 0;
  }, [waterCache]);

  const loadDayWater = useCallback(async (date = todayKey()) => {
    const { amount } = await api.water.get(date);
    setWaterCache(prev => ({ ...prev, [date]: amount }));
    return amount;
  }, []);

  const addWater = useCallback(async (date = todayKey(), amount = 250) => {
    const { amount: newAmount } = await api.water.update(date, amount);
    setWaterCache(prev => ({ ...prev, [date]: newAmount }));
  }, []);

  const removeWater = useCallback(async (date = todayKey(), amount = 250) => {
    const { amount: newAmount } = await api.water.update(date, -amount);
    setWaterCache(prev => ({ ...prev, [date]: newAmount }));
  }, []);

  return (
    <AppContext.Provider value={{
      // Auth state
      token, authLoading,
      login, register, logout,

      // User
      user, updateUser, completeOnboarding, userNeeds: effectiveUserNeeds,

      // Journal
      journal,
      getDayJournalSync,   // sync — returns cached or empty
      loadDayJournal,      // async — always fetches
      addFoodToMeal, removeFoodFromMeal, getDayTotals, getMealTotals,

      // Weight
      weightLog, addWeight,

      // Recipes
      recipes, addRecipe, updateRecipe, deleteRecipe, toggleLikeRecipe,

      // Favorites & Recents
      favorites, recents, toggleFavorite, isFavorite,

      // Water
      getDayWater, loadDayWater, addWater, removeWater,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
