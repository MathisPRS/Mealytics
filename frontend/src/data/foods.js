// Base alimentaire statique - valeurs nutritionnelles pour 100g (sauf mention contraire)
// Sources : Ciqual ANSES 2020, USDA FoodData Central 2024
const foods = [

  // ─── FRUITS ────────────────────────────────────────────────────────────────
  { id: 'pomme',           name: 'Pomme',                category: 'Fruits', emoji: '🍎', calories: 52,  protein: 0.3, carbs: 14.0, fat: 0.2, fiber: 2.4, defaultUnit: 'g',   defaultQty: 150 },
  { id: 'banane',          name: 'Banane',               category: 'Fruits', emoji: '🍌', calories: 89,  protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6, defaultUnit: 'g',   defaultQty: 120 },
  { id: 'orange',          name: 'Orange',               category: 'Fruits', emoji: '🍊', calories: 47,  protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, defaultUnit: 'g',   defaultQty: 150 },
  { id: 'fraise',          name: 'Fraise',               category: 'Fruits', emoji: '🍓', calories: 32,  protein: 0.7, carbs: 7.7,  fat: 0.3, fiber: 2.0, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'framboise',       name: 'Framboise',            category: 'Fruits', emoji: '🫐', calories: 52,  protein: 1.2, carbs: 11.9, fat: 0.7, fiber: 6.5, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'myrtille',        name: 'Myrtille',             category: 'Fruits', emoji: '🫐', calories: 57,  protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'mure',            name: 'Mûre',                 category: 'Fruits', emoji: '🫐', calories: 43,  protein: 1.4, carbs: 9.6,  fat: 0.5, fiber: 5.3, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'fruits_rouges',   name: 'Fruits rouges (mix)',  category: 'Fruits', emoji: '🍓', calories: 47,  protein: 1.0, carbs: 11.0, fat: 0.4, fiber: 4.0, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'groseille',       name: 'Groseille',            category: 'Fruits', emoji: '🫐', calories: 56,  protein: 1.4, carbs: 13.8, fat: 0.2, fiber: 4.3, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'kiwi',            name: 'Kiwi',                 category: 'Fruits', emoji: '🥝', calories: 61,  protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3.0, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'mangue',          name: 'Mangue',               category: 'Fruits', emoji: '🥭', calories: 60,  protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, defaultUnit: 'g',   defaultQty: 150 },
  { id: 'raisin',          name: 'Raisin',               category: 'Fruits', emoji: '🍇', calories: 67,  protein: 0.6, carbs: 17.2, fat: 0.4, fiber: 0.9, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'peche',           name: 'Pêche',                category: 'Fruits', emoji: '🍑', calories: 39,  protein: 0.9, carbs: 9.5,  fat: 0.3, fiber: 1.5, defaultUnit: 'g',   defaultQty: 150 },
  { id: 'abricot',         name: 'Abricot',              category: 'Fruits', emoji: '🍑', calories: 48,  protein: 1.4, carbs: 11.1, fat: 0.4, fiber: 2.0, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'prune',           name: 'Prune',                category: 'Fruits', emoji: '🍇', calories: 46,  protein: 0.7, carbs: 11.4, fat: 0.3, fiber: 1.4, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'cerise',          name: 'Cerise',               category: 'Fruits', emoji: '🍒', calories: 63,  protein: 1.1, carbs: 16.0, fat: 0.2, fiber: 2.1, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'poire',           name: 'Poire',                category: 'Fruits', emoji: '🍐', calories: 57,  protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, defaultUnit: 'g',   defaultQty: 160 },
  { id: 'ananas',          name: 'Ananas',               category: 'Fruits', emoji: '🍍', calories: 50,  protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'avocat',          name: 'Avocat',               category: 'Fruits', emoji: '🥑', calories: 160, protein: 2.0, carbs: 8.5,  fat: 14.7, fiber: 6.7, defaultUnit: 'g',  defaultQty: 80  },
  { id: 'papaye',          name: 'Papaye',               category: 'Fruits', emoji: '🍈', calories: 43,  protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7, defaultUnit: 'g',   defaultQty: 150 },
  { id: 'melon',           name: 'Melon',                category: 'Fruits', emoji: '🍈', calories: 34,  protein: 0.8, carbs: 8.2,  fat: 0.2, fiber: 0.9, defaultUnit: 'g',   defaultQty: 200 },
  { id: 'pasteque',        name: 'Pastèque',             category: 'Fruits', emoji: '🍉', calories: 30,  protein: 0.6, carbs: 7.6,  fat: 0.2, fiber: 0.4, defaultUnit: 'g',   defaultQty: 200 },
  { id: 'clementine',      name: 'Clémentine',           category: 'Fruits', emoji: '🍊', calories: 47,  protein: 0.9, carbs: 12.0, fat: 0.1, fiber: 1.7, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'pamplemousse',    name: 'Pamplemousse',         category: 'Fruits', emoji: '🍊', calories: 42,  protein: 0.8, carbs: 10.7, fat: 0.1, fiber: 1.6, defaultUnit: 'g',   defaultQty: 150 },
  { id: 'citron',          name: 'Citron',               category: 'Fruits', emoji: '🍋', calories: 29,  protein: 1.1, carbs: 9.3,  fat: 0.3, fiber: 2.8, defaultUnit: 'g',   defaultQty: 30  },
  { id: 'grenade',         name: 'Grenade',              category: 'Fruits', emoji: '🍎', calories: 83,  protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4.0, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'figue',           name: 'Figue fraîche',        category: 'Fruits', emoji: '🍈', calories: 74,  protein: 0.8, carbs: 19.2, fat: 0.3, fiber: 2.9, defaultUnit: 'g',   defaultQty: 80  },
  { id: 'litchi',          name: 'Litchi',               category: 'Fruits', emoji: '🍈', calories: 66,  protein: 0.8, carbs: 16.5, fat: 0.4, fiber: 1.3, defaultUnit: 'g',   defaultQty: 100 },
  { id: 'fruit_passion',   name: 'Fruit de la passion',  category: 'Fruits', emoji: '🍈', calories: 97,  protein: 2.2, carbs: 23.4, fat: 0.7, fiber: 10.4, defaultUnit: 'g',  defaultQty: 50  },
  { id: 'noix_coco_chair', name: 'Noix de coco (chair)', category: 'Fruits', emoji: '🥥', calories: 354, protein: 3.3, carbs: 15.2, fat: 33.5, fiber: 9.0, defaultUnit: 'g',  defaultQty: 30  },
  { id: 'datte',           name: 'Datte',                category: 'Fruits', emoji: '🍈', calories: 282, protein: 2.5, carbs: 75.0, fat: 0.4, fiber: 8.0, defaultUnit: 'g',   defaultQty: 30  },
  { id: 'banane_plantain', name: 'Banane plantain cuite',category: 'Fruits', emoji: '🍌', calories: 116, protein: 0.8, carbs: 31.2, fat: 0.2, fiber: 2.3, defaultUnit: 'g',   defaultQty: 150 },

  // ─── LÉGUMES ───────────────────────────────────────────────────────────────
  { id: 'epinard',         name: 'Épinard',              category: 'Légumes', emoji: '🥬', calories: 23,  protein: 2.9, carbs: 3.6,  fat: 0.4, fiber: 2.2, defaultUnit: 'g', defaultQty: 100 },
  { id: 'brocoli',         name: 'Brocoli',              category: 'Légumes', emoji: '🥦', calories: 34,  protein: 2.8, carbs: 6.6,  fat: 0.4, fiber: 2.6, defaultUnit: 'g', defaultQty: 150 },
  { id: 'chou_fleur',      name: 'Chou-fleur',           category: 'Légumes', emoji: '🥦', calories: 25,  protein: 1.9, carbs: 5.0,  fat: 0.3, fiber: 2.0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'chou_rouge',      name: 'Chou rouge',           category: 'Légumes', emoji: '🥬', calories: 31,  protein: 1.4, carbs: 7.4,  fat: 0.2, fiber: 2.1, defaultUnit: 'g', defaultQty: 100 },
  { id: 'chou_vert',       name: 'Chou vert',            category: 'Légumes', emoji: '🥬', calories: 25,  protein: 1.3, carbs: 5.8,  fat: 0.1, fiber: 2.5, defaultUnit: 'g', defaultQty: 100 },
  { id: 'choux_bruxelles', name: 'Choux de Bruxelles',   category: 'Légumes', emoji: '🥦', calories: 43,  protein: 3.4, carbs: 8.9,  fat: 0.3, fiber: 3.8, defaultUnit: 'g', defaultQty: 100 },
  { id: 'carotte',         name: 'Carotte',              category: 'Légumes', emoji: '🥕', calories: 41,  protein: 0.9, carbs: 9.6,  fat: 0.2, fiber: 2.8, defaultUnit: 'g', defaultQty: 100 },
  { id: 'tomate',          name: 'Tomate',               category: 'Légumes', emoji: '🍅', calories: 18,  protein: 0.9, carbs: 3.9,  fat: 0.2, fiber: 1.2, defaultUnit: 'g', defaultQty: 150 },
  { id: 'tomate_cerise',   name: 'Tomate cerise',        category: 'Légumes', emoji: '🍅', calories: 18,  protein: 0.9, carbs: 3.9,  fat: 0.2, fiber: 1.2, defaultUnit: 'g', defaultQty: 100 },
  { id: 'concombre',       name: 'Concombre',            category: 'Légumes', emoji: '🥒', calories: 15,  protein: 0.7, carbs: 3.6,  fat: 0.1, fiber: 0.5, defaultUnit: 'g', defaultQty: 100 },
  { id: 'poivron',         name: 'Poivron rouge',        category: 'Légumes', emoji: '🫑', calories: 31,  protein: 1.0, carbs: 7.2,  fat: 0.3, fiber: 2.1, defaultUnit: 'g', defaultQty: 100 },
  { id: 'poivron_jaune',   name: 'Poivron jaune',        category: 'Légumes', emoji: '🫑', calories: 27,  protein: 1.0, carbs: 6.3,  fat: 0.2, fiber: 0.9, defaultUnit: 'g', defaultQty: 100 },
  { id: 'poivron_vert',    name: 'Poivron vert',         category: 'Légumes', emoji: '🫑', calories: 20,  protein: 0.9, carbs: 4.6,  fat: 0.2, fiber: 1.7, defaultUnit: 'g', defaultQty: 100 },
  { id: 'courgette',       name: 'Courgette',            category: 'Légumes', emoji: '🥒', calories: 17,  protein: 1.2, carbs: 3.1,  fat: 0.3, fiber: 1.0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'aubergine',       name: 'Aubergine',            category: 'Légumes', emoji: '🍆', calories: 25,  protein: 1.0, carbs: 5.9,  fat: 0.2, fiber: 3.0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'patate_douce',    name: 'Patate douce',         category: 'Légumes', emoji: '🍠', calories: 86,  protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'butternut',       name: 'Courge butternut',     category: 'Légumes', emoji: '🎃', calories: 45,  protein: 1.0, carbs: 11.7, fat: 0.1, fiber: 2.0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'champignon',      name: 'Champignon de Paris',  category: 'Légumes', emoji: '🍄', calories: 22,  protein: 3.1, carbs: 3.3,  fat: 0.3, fiber: 1.0, defaultUnit: 'g', defaultQty: 100 },
  { id: 'shiitake',        name: 'Shiitaké',             category: 'Légumes', emoji: '🍄', calories: 34,  protein: 2.2, carbs: 6.8,  fat: 0.5, fiber: 2.5, defaultUnit: 'g', defaultQty: 80  },
  { id: 'oignon',          name: 'Oignon',               category: 'Légumes', emoji: '🧅', calories: 40,  protein: 1.1, carbs: 9.3,  fat: 0.1, fiber: 1.7, defaultUnit: 'g', defaultQty: 80  },
  { id: 'poireau',         name: 'Poireau',              category: 'Légumes', emoji: '🥬', calories: 31,  protein: 1.5, carbs: 7.3,  fat: 0.3, fiber: 1.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'asperge',         name: 'Asperge',              category: 'Légumes', emoji: '🥦', calories: 20,  protein: 2.2, carbs: 3.9,  fat: 0.1, fiber: 2.1, defaultUnit: 'g', defaultQty: 150 },
  { id: 'artichaut',       name: 'Artichaut',            category: 'Légumes', emoji: '🥬', calories: 47,  protein: 3.3, carbs: 10.5, fat: 0.2, fiber: 5.4, defaultUnit: 'g', defaultQty: 120 },
  { id: 'betterave',       name: 'Betterave cuite',      category: 'Légumes', emoji: '🫚', calories: 44,  protein: 1.7, carbs: 10.0, fat: 0.2, fiber: 2.8, defaultUnit: 'g', defaultQty: 100 },
  { id: 'celeri',          name: 'Céleri branche',       category: 'Légumes', emoji: '🥬', calories: 16,  protein: 0.7, carbs: 3.0,  fat: 0.2, fiber: 1.6, defaultUnit: 'g', defaultQty: 100 },
  { id: 'celeri_rave',     name: 'Céleri-rave',          category: 'Légumes', emoji: '🥬', calories: 42,  protein: 1.5, carbs: 9.2,  fat: 0.3, fiber: 1.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'fenouil',         name: 'Fenouil',              category: 'Légumes', emoji: '🌿', calories: 31,  protein: 1.2, carbs: 7.3,  fat: 0.2, fiber: 3.1, defaultUnit: 'g', defaultQty: 150 },
  { id: 'radis',           name: 'Radis',                category: 'Légumes', emoji: '🥬', calories: 16,  protein: 0.7, carbs: 3.4,  fat: 0.1, fiber: 1.6, defaultUnit: 'g', defaultQty: 80  },
  { id: 'navet',           name: 'Navet',                category: 'Légumes', emoji: '🥬', calories: 28,  protein: 0.9, carbs: 6.4,  fat: 0.1, fiber: 1.8, defaultUnit: 'g', defaultQty: 100 },
  { id: 'ail',             name: 'Ail',                  category: 'Légumes', emoji: '🧄', calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, defaultUnit: 'g', defaultQty: 10  },
  { id: 'gingembre',       name: 'Gingembre frais',      category: 'Légumes', emoji: '🌿', calories: 80,  protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2.0, defaultUnit: 'g', defaultQty: 10  },
  { id: 'salade_mixte',    name: 'Salade mixte',         category: 'Légumes', emoji: '🥗', calories: 15,  protein: 1.3, carbs: 2.9,  fat: 0.2, fiber: 1.8, defaultUnit: 'g', defaultQty: 80  },
  { id: 'roquette',        name: 'Roquette',             category: 'Légumes', emoji: '🥬', calories: 25,  protein: 2.6, carbs: 3.7,  fat: 0.7, fiber: 1.6, defaultUnit: 'g', defaultQty: 40  },
  { id: 'chou_kale',       name: 'Chou kale',            category: 'Légumes', emoji: '🥬', calories: 49,  protein: 4.3, carbs: 8.8,  fat: 0.9, fiber: 3.6, defaultUnit: 'g', defaultQty: 80  },
  { id: 'mais',            name: 'Maïs (en grains)',     category: 'Légumes', emoji: '🌽', calories: 86,  protein: 3.3, carbs: 19.0, fat: 1.2, fiber: 2.7, defaultUnit: 'g', defaultQty: 100 },
  { id: 'pois_gourmand',   name: 'Pois gourmand',        category: 'Légumes', emoji: '🫛', calories: 42,  protein: 2.8, carbs: 7.6,  fat: 0.2, fiber: 2.6, defaultUnit: 'g', defaultQty: 100 },
  { id: 'petits_pois',     name: 'Petits pois',          category: 'Légumes', emoji: '🫛', calories: 81,  protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.5, defaultUnit: 'g', defaultQty: 100 },

  // ─── VIANDES & POISSONS ────────────────────────────────────────────────────
  { id: 'poulet_blanc',    name: 'Blanc de poulet',      category: 'Viandes & Poissons', emoji: '🍗', calories: 165, protein: 31.0, carbs: 0,    fat: 3.6,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'cuisse_poulet',   name: 'Cuisse de poulet',     category: 'Viandes & Poissons', emoji: '🍗', calories: 209, protein: 26.0, carbs: 0,    fat: 11.0, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'dinde',           name: 'Blanc de dinde',       category: 'Viandes & Poissons', emoji: '🍗', calories: 135, protein: 30.0, carbs: 0,    fat: 1.0,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'boeuf_hache',     name: 'Bœuf haché 5%',        category: 'Viandes & Poissons', emoji: '🥩', calories: 137, protein: 21.0, carbs: 0,    fat: 5.0,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'boeuf_hache_15',  name: 'Bœuf haché 15%',       category: 'Viandes & Poissons', emoji: '🥩', calories: 196, protein: 19.0, carbs: 0,    fat: 13.0, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'steak_boeuf',     name: 'Steak de bœuf',        category: 'Viandes & Poissons', emoji: '🥩', calories: 217, protein: 26.0, carbs: 0,    fat: 12.0, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'veau',            name: 'Escalope de veau',     category: 'Viandes & Poissons', emoji: '🥩', calories: 105, protein: 22.0, carbs: 0,    fat: 1.7,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'porc_filet',      name: 'Filet de porc',        category: 'Viandes & Poissons', emoji: '🥩', calories: 143, protein: 22.0, carbs: 0,    fat: 5.5,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'jambon_blanc',    name: 'Jambon blanc',         category: 'Viandes & Poissons', emoji: '🥩', calories: 101, protein: 17.0, carbs: 0.5,  fat: 3.0,  fiber: 0, defaultUnit: 'g', defaultQty: 80  },
  { id: 'agneau',          name: 'Gigot d\'agneau',      category: 'Viandes & Poissons', emoji: '🥩', calories: 218, protein: 26.0, carbs: 0,    fat: 12.0, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'magret_canard',   name: 'Magret de canard',     category: 'Viandes & Poissons', emoji: '🦆', calories: 190, protein: 22.0, carbs: 0,    fat: 11.0, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'foie_veau',       name: 'Foie de veau',         category: 'Viandes & Poissons', emoji: '🥩', calories: 140, protein: 20.0, carbs: 3.6,  fat: 4.9,  fiber: 0, defaultUnit: 'g', defaultQty: 120 },
  { id: 'saumon',          name: 'Saumon',               category: 'Viandes & Poissons', emoji: '🐟', calories: 208, protein: 20.0, carbs: 0,    fat: 13.0, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'saumon_fume',     name: 'Saumon fumé',          category: 'Viandes & Poissons', emoji: '🐟', calories: 177, protein: 25.0, carbs: 0,    fat: 8.5,  fiber: 0, defaultUnit: 'g', defaultQty: 80  },
  { id: 'thon_conserve',   name: 'Thon en conserve',     category: 'Viandes & Poissons', emoji: '🐟', calories: 116, protein: 26.0, carbs: 0,    fat: 1.0,  fiber: 0, defaultUnit: 'g', defaultQty: 130 },
  { id: 'cabillaud',       name: 'Cabillaud',            category: 'Viandes & Poissons', emoji: '🐟', calories: 82,  protein: 18.0, carbs: 0,    fat: 0.7,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'lieu_noir',       name: 'Lieu noir',            category: 'Viandes & Poissons', emoji: '🐟', calories: 90,  protein: 18.0, carbs: 0,    fat: 1.5,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'truite',          name: 'Truite',               category: 'Viandes & Poissons', emoji: '🐟', calories: 141, protein: 20.0, carbs: 0,    fat: 6.2,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'bar',             name: 'Bar (loup)',           category: 'Viandes & Poissons', emoji: '🐟', calories: 97,  protein: 18.0, carbs: 0,    fat: 2.5,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'daurade',         name: 'Daurade',              category: 'Viandes & Poissons', emoji: '🐟', calories: 96,  protein: 20.0, carbs: 0,    fat: 1.6,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'sardine',         name: 'Sardine',              category: 'Viandes & Poissons', emoji: '🐟', calories: 208, protein: 25.0, carbs: 0,    fat: 11.5, fiber: 0, defaultUnit: 'g', defaultQty: 100 },
  { id: 'maquereau',       name: 'Maquereau',            category: 'Viandes & Poissons', emoji: '🐟', calories: 205, protein: 19.0, carbs: 0,    fat: 13.9, fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'hareng',          name: 'Hareng',               category: 'Viandes & Poissons', emoji: '🐟', calories: 158, protein: 18.0, carbs: 0,    fat: 9.0,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'crevette',        name: 'Crevette',             category: 'Viandes & Poissons', emoji: '🦐', calories: 99,  protein: 24.0, carbs: 0.2,  fat: 0.3,  fiber: 0, defaultUnit: 'g', defaultQty: 100 },
  { id: 'moule',           name: 'Moule cuite',          category: 'Viandes & Poissons', emoji: '🦪', calories: 86,  protein: 12.0, carbs: 3.7,  fat: 2.2,  fiber: 0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'coquille_st_jac', name: 'Saint-Jacques',        category: 'Viandes & Poissons', emoji: '🦪', calories: 88,  protein: 17.0, carbs: 2.4,  fat: 0.8,  fiber: 0, defaultUnit: 'g', defaultQty: 120 },
  { id: 'oeuf',            name: 'Œuf entier',           category: 'Viandes & Poissons', emoji: '🥚', calories: 155, protein: 13.0, carbs: 1.1,  fat: 11.0, fiber: 0, defaultUnit: 'pcs', defaultQty: 2 },

  // ─── PRODUITS LAITIERS & ALTERNATIVES ──────────────────────────────────────
  { id: 'yaourt_nature',   name: 'Yaourt nature',        category: 'Produits laitiers', emoji: '🥛', calories: 59,  protein: 3.5,  carbs: 4.7,  fat: 3.3,  fiber: 0,   defaultUnit: 'g',  defaultQty: 125 },
  { id: 'yaourt_grec',     name: 'Yaourt grec nature',   category: 'Produits laitiers', emoji: '🥛', calories: 97,  protein: 9.0,  carbs: 3.6,  fat: 5.0,  fiber: 0,   defaultUnit: 'g',  defaultQty: 150 },
  { id: 'yaourt_grec_0',   name: 'Yaourt grec 0%',       category: 'Produits laitiers', emoji: '🥛', calories: 57,  protein: 10.0, carbs: 3.6,  fat: 0.2,  fiber: 0,   defaultUnit: 'g',  defaultQty: 150 },
  { id: 'skyr',            name: 'Skyr nature',          category: 'Produits laitiers', emoji: '🥛', calories: 63,  protein: 11.0, carbs: 4.0,  fat: 0.2,  fiber: 0,   defaultUnit: 'g',  defaultQty: 150 },
  { id: 'fromage_blanc',   name: 'Fromage blanc 0%',     category: 'Produits laitiers', emoji: '🧀', calories: 45,  protein: 7.9,  carbs: 3.8,  fat: 0.1,  fiber: 0,   defaultUnit: 'g',  defaultQty: 150 },
  { id: 'fromage_blanc_3', name: 'Fromage blanc 3%',     category: 'Produits laitiers', emoji: '🧀', calories: 67,  protein: 7.1,  carbs: 4.0,  fat: 3.1,  fiber: 0,   defaultUnit: 'g',  defaultQty: 150 },
  { id: 'cottage_cheese',  name: 'Cottage cheese',       category: 'Produits laitiers', emoji: '🧀', calories: 98,  protein: 11.0, carbs: 3.4,  fat: 4.3,  fiber: 0,   defaultUnit: 'g',  defaultQty: 100 },
  { id: 'ricotta',         name: 'Ricotta',              category: 'Produits laitiers', emoji: '🧀', calories: 174, protein: 11.3, carbs: 3.0,  fat: 13.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 80  },
  { id: 'lait_entier',     name: 'Lait entier',          category: 'Produits laitiers', emoji: '🥛', calories: 61,  protein: 3.2,  carbs: 4.8,  fat: 3.3,  fiber: 0,   defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_demi_ecreme',name: 'Lait demi-écrémé',     category: 'Produits laitiers', emoji: '🥛', calories: 46,  protein: 3.2,  carbs: 4.7,  fat: 1.5,  fiber: 0,   defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_ecreme',     name: 'Lait écrémé',          category: 'Produits laitiers', emoji: '🥛', calories: 35,  protein: 3.4,  carbs: 4.9,  fat: 0.1,  fiber: 0,   defaultUnit: 'ml', defaultQty: 200 },
  { id: 'creme_fraiche',   name: 'Crème fraîche 30%',    category: 'Produits laitiers', emoji: '🥛', calories: 292, protein: 2.0,  carbs: 2.8,  fat: 30.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 30  },
  { id: 'creme_legere',    name: 'Crème légère 15%',     category: 'Produits laitiers', emoji: '🥛', calories: 161, protein: 2.7,  carbs: 3.3,  fat: 15.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 30  },
  { id: 'parmesan',        name: 'Parmesan',             category: 'Produits laitiers', emoji: '🧀', calories: 431, protein: 38.0, carbs: 0,    fat: 29.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 20  },
  { id: 'mozzarella',      name: 'Mozzarella',           category: 'Produits laitiers', emoji: '🧀', calories: 280, protein: 17.0, carbs: 2.2,  fat: 22.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 80  },
  { id: 'emmental',        name: 'Emmental',             category: 'Produits laitiers', emoji: '🧀', calories: 397, protein: 27.0, carbs: 0.5,  fat: 31.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 30  },
  { id: 'camembert',       name: 'Camembert',            category: 'Produits laitiers', emoji: '🧀', calories: 299, protein: 19.0, carbs: 0.5,  fat: 24.0, fiber: 0,   defaultUnit: 'g',  defaultQty: 50  },
  { id: 'feta',            name: 'Feta',                 category: 'Produits laitiers', emoji: '🧀', calories: 264, protein: 14.2, carbs: 4.1,  fat: 21.3, fiber: 0,   defaultUnit: 'g',  defaultQty: 50  },
  { id: 'beurre',          name: 'Beurre',               category: 'Produits laitiers', emoji: '🧈', calories: 717, protein: 0.9,  carbs: 0.1,  fat: 81.1, fiber: 0,   defaultUnit: 'g',  defaultQty: 10  },

  // ─── LAITS VÉGÉTAUX ────────────────────────────────────────────────────────
  { id: 'lait_amande',     name: 'Lait d\'amande',       category: 'Laits végétaux', emoji: '🥛', calories: 13,  protein: 0.5, carbs: 0.5,  fat: 1.1,  fiber: 0.2, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_avoine',     name: 'Lait d\'avoine',       category: 'Laits végétaux', emoji: '🥛', calories: 45,  protein: 1.0, carbs: 7.5,  fat: 1.5,  fiber: 0.8, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_soja',       name: 'Lait de soja',         category: 'Laits végétaux', emoji: '🥛', calories: 33,  protein: 3.0, carbs: 1.6,  fat: 1.8,  fiber: 0.4, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_coco',       name: 'Lait de coco',         category: 'Laits végétaux', emoji: '🥥', calories: 152, protein: 1.5, carbs: 3.4,  fat: 14.7, fiber: 0,   defaultUnit: 'ml', defaultQty: 100 },
  { id: 'lait_riz',        name: 'Lait de riz',          category: 'Laits végétaux', emoji: '🥛', calories: 47,  protein: 0.3, carbs: 9.8,  fat: 0.9,  fiber: 0.1, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_noisette',   name: 'Lait de noisette',     category: 'Laits végétaux', emoji: '🥛', calories: 30,  protein: 0.5, carbs: 3.3,  fat: 1.7,  fiber: 0.3, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_noix_coco',  name: 'Boisson coco légère',  category: 'Laits végétaux', emoji: '🥥', calories: 19,  protein: 0.2, carbs: 2.7,  fat: 0.9,  fiber: 0,   defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_epeautre',   name: 'Lait d\'épeautre',     category: 'Laits végétaux', emoji: '🥛', calories: 50,  protein: 1.8, carbs: 7.5,  fat: 1.6,  fiber: 0.3, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'lait_cajou',      name: 'Lait de cajou',        category: 'Laits végétaux', emoji: '🥛', calories: 19,  protein: 0.5, carbs: 1.5,  fat: 1.2,  fiber: 0.1, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'creme_avoine',    name: 'Crème d\'avoine',      category: 'Laits végétaux', emoji: '🥛', calories: 150, protein: 1.0, carbs: 14.0, fat: 10.0, fiber: 0.5, defaultUnit: 'ml', defaultQty: 30  },
  { id: 'yaourt_soja',     name: 'Yaourt soja nature',   category: 'Laits végétaux', emoji: '🥛', calories: 58,  protein: 3.8, carbs: 4.2,  fat: 2.5,  fiber: 0.1, defaultUnit: 'g',  defaultQty: 125 },
  { id: 'yaourt_coco',     name: 'Yaourt coco',          category: 'Laits végétaux', emoji: '🥥', calories: 108, protein: 1.2, carbs: 8.0,  fat: 8.0,  fiber: 0.5, defaultUnit: 'g',  defaultQty: 125 },

  // ─── CÉRÉALES & FÉCULENTS ──────────────────────────────────────────────────
  { id: 'riz_blanc',       name: 'Riz blanc cuit',       category: 'Céréales & Féculents', emoji: '🍚', calories: 130, protein: 2.7,  carbs: 28.2, fat: 0.3,  fiber: 0.4, defaultUnit: 'g', defaultQty: 150 },
  { id: 'riz_complet',     name: 'Riz complet cuit',     category: 'Céréales & Féculents', emoji: '🍚', calories: 111, protein: 2.6,  carbs: 23.0, fat: 0.9,  fiber: 1.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'riz_basmati',     name: 'Riz basmati cuit',     category: 'Céréales & Féculents', emoji: '🍚', calories: 121, protein: 2.8,  carbs: 25.0, fat: 0.4,  fiber: 0.5, defaultUnit: 'g', defaultQty: 150 },
  { id: 'pates_blanches',  name: 'Pâtes cuites',         category: 'Céréales & Féculents', emoji: '🍝', calories: 158, protein: 5.8,  carbs: 31.0, fat: 0.9,  fiber: 1.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'pates_completes', name: 'Pâtes complètes cuites',category: 'Céréales & Féculents', emoji: '🍝', calories: 141, protein: 5.3,  carbs: 27.0, fat: 1.1,  fiber: 3.5, defaultUnit: 'g', defaultQty: 150 },
  { id: 'quinoa',          name: 'Quinoa cuit',          category: 'Céréales & Féculents', emoji: '🌾', calories: 120, protein: 4.4,  carbs: 21.3, fat: 1.9,  fiber: 2.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'boulgour',        name: 'Boulgour cuit',        category: 'Céréales & Féculents', emoji: '🌾', calories: 83,  protein: 3.1,  carbs: 18.6, fat: 0.2,  fiber: 4.5, defaultUnit: 'g', defaultQty: 150 },
  { id: 'millet',          name: 'Millet cuit',          category: 'Céréales & Féculents', emoji: '🌾', calories: 119, protein: 3.5,  carbs: 23.7, fat: 1.0,  fiber: 1.3, defaultUnit: 'g', defaultQty: 150 },
  { id: 'sarrasin',        name: 'Sarrasin cuit',        category: 'Céréales & Féculents', emoji: '🌾', calories: 92,  protein: 3.4,  carbs: 19.9, fat: 0.6,  fiber: 2.7, defaultUnit: 'g', defaultQty: 150 },
  { id: 'epeautre',        name: 'Épeautre cuit',        category: 'Céréales & Féculents', emoji: '🌾', calories: 127, protein: 5.5,  carbs: 26.0, fat: 0.9,  fiber: 3.9, defaultUnit: 'g', defaultQty: 150 },
  { id: 'orge',            name: 'Orge perlé cuit',      category: 'Céréales & Féculents', emoji: '🌾', calories: 123, protein: 2.3,  carbs: 28.2, fat: 0.4,  fiber: 3.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'avoine_cuite',    name: 'Porridge / avoine cuite', category: 'Céréales & Féculents', emoji: '🥣', calories: 71, protein: 2.5, carbs: 12.0, fat: 1.4,  fiber: 1.7, defaultUnit: 'g', defaultQty: 200 },
  { id: 'flocons_avoine',  name: 'Flocons d\'avoine crus', category: 'Céréales & Féculents', emoji: '🥣', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, defaultUnit: 'g', defaultQty: 50 },
  { id: 'polenta',         name: 'Polenta cuite',        category: 'Céréales & Féculents', emoji: '🌽', calories: 70,  protein: 1.6,  carbs: 15.2, fat: 0.3,  fiber: 1.0, defaultUnit: 'g', defaultQty: 150 },
  { id: 'pain_complet',    name: 'Pain complet',         category: 'Céréales & Féculents', emoji: '🍞', calories: 247, protein: 8.5,  carbs: 48.0, fat: 3.4,  fiber: 6.5, defaultUnit: 'g', defaultQty: 60  },
  { id: 'pain_blanc',      name: 'Pain blanc (baguette)', category: 'Céréales & Féculents', emoji: '🥖', calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2,  fiber: 2.7, defaultUnit: 'g', defaultQty: 60  },
  { id: 'pain_seigle',     name: 'Pain de seigle',       category: 'Céréales & Féculents', emoji: '🍞', calories: 259, protein: 8.5,  carbs: 48.3, fat: 3.3,  fiber: 5.8, defaultUnit: 'g', defaultQty: 50  },
  { id: 'pain_epeautre',   name: 'Pain épeautre',        category: 'Céréales & Féculents', emoji: '🍞', calories: 271, protein: 9.8,  carbs: 51.0, fat: 3.6,  fiber: 4.1, defaultUnit: 'g', defaultQty: 50  },
  { id: 'pomme_de_terre',  name: 'Pomme de terre cuite', category: 'Céréales & Féculents', emoji: '🥔', calories: 77,  protein: 2.0,  carbs: 17.5, fat: 0.1,  fiber: 2.2, defaultUnit: 'g', defaultQty: 200 },
  { id: 'gnocchi',         name: 'Gnocchi cuits',        category: 'Céréales & Féculents', emoji: '🥔', calories: 130, protein: 3.0,  carbs: 27.0, fat: 1.0,  fiber: 1.5, defaultUnit: 'g', defaultQty: 150 },
  { id: 'granola',         name: 'Granola',              category: 'Céréales & Féculents', emoji: '🥣', calories: 471, protein: 8.9,  carbs: 64.0, fat: 20.0, fiber: 6.0, defaultUnit: 'g', defaultQty: 40  },
  { id: 'tortilla_ble',    name: 'Tortilla blé',         category: 'Céréales & Féculents', emoji: '🫓', calories: 298, protein: 7.5,  carbs: 50.0, fat: 7.4,  fiber: 2.9, defaultUnit: 'g', defaultQty: 60  },
  { id: 'galette_mais',    name: 'Galette de maïs',      category: 'Céréales & Féculents', emoji: '🫓', calories: 381, protein: 7.9,  carbs: 79.0, fat: 4.1,  fiber: 2.4, defaultUnit: 'g', defaultQty: 20  },
  { id: 'pain_grille',     name: 'Pain grillé',          category: 'Céréales & Féculents', emoji: '🍞', calories: 315, protein: 9.5,  carbs: 60.0, fat: 4.0,  fiber: 3.5, defaultUnit: 'g', defaultQty: 30  },

  // ─── LÉGUMINEUSES ──────────────────────────────────────────────────────────
  { id: 'pois_chiche',     name: 'Pois chiches cuits',   category: 'Légumineuses', emoji: '🫘', calories: 164, protein: 8.9,  carbs: 27.4, fat: 2.6,  fiber: 7.6, defaultUnit: 'g', defaultQty: 150 },
  { id: 'lentilles',       name: 'Lentilles vertes cuites', category: 'Légumineuses', emoji: '🫘', calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4,  fiber: 7.9, defaultUnit: 'g', defaultQty: 150 },
  { id: 'lentilles_corail', name: 'Lentilles corail cuites', category: 'Légumineuses', emoji: '🫘', calories: 100, protein: 7.6, carbs: 17.5, fat: 0.3, fiber: 4.5, defaultUnit: 'g', defaultQty: 150 },
  { id: 'haricots_noirs',  name: 'Haricots noirs cuits', category: 'Légumineuses', emoji: '🫘', calories: 132, protein: 8.9,  carbs: 23.7, fat: 0.5,  fiber: 8.7, defaultUnit: 'g', defaultQty: 150 },
  { id: 'haricots_rouges', name: 'Haricots rouges cuits',category: 'Légumineuses', emoji: '🫘', calories: 127, protein: 8.7,  carbs: 22.8, fat: 0.5,  fiber: 7.4, defaultUnit: 'g', defaultQty: 150 },
  { id: 'haricots_blancs', name: 'Haricots blancs cuits',category: 'Légumineuses', emoji: '🫘', calories: 139, protein: 9.7,  carbs: 25.4, fat: 0.5,  fiber: 6.3, defaultUnit: 'g', defaultQty: 150 },
  { id: 'flageolets',      name: 'Flageolets cuits',     category: 'Légumineuses', emoji: '🫘', calories: 97,  protein: 6.6,  carbs: 17.5, fat: 0.4,  fiber: 5.8, defaultUnit: 'g', defaultQty: 150 },
  { id: 'feves',           name: 'Fèves cuites',         category: 'Légumineuses', emoji: '🫘', calories: 110, protein: 7.6,  carbs: 19.7, fat: 0.4,  fiber: 5.4, defaultUnit: 'g', defaultQty: 150 },
  { id: 'pois_casses',     name: 'Pois cassés cuits',    category: 'Légumineuses', emoji: '🫘', calories: 118, protein: 8.3,  carbs: 21.1, fat: 0.4,  fiber: 8.3, defaultUnit: 'g', defaultQty: 150 },
  { id: 'azuki',           name: 'Haricots azuki cuits', category: 'Légumineuses', emoji: '🫘', calories: 128, protein: 7.5,  carbs: 24.8, fat: 0.1,  fiber: 7.3, defaultUnit: 'g', defaultQty: 150 },
  { id: 'lupin',           name: 'Lupin cuit',           category: 'Légumineuses', emoji: '🫘', calories: 119, protein: 15.6, carbs: 9.9,  fat: 2.9,  fiber: 2.9, defaultUnit: 'g', defaultQty: 100 },
  { id: 'edamame',         name: 'Edamame',              category: 'Légumineuses', emoji: '🫛', calories: 122, protein: 11.0, carbs: 9.9,  fat: 5.2,  fiber: 5.2, defaultUnit: 'g', defaultQty: 100 },
  { id: 'tofu',            name: 'Tofu ferme',           category: 'Légumineuses', emoji: '⬜', calories: 76,  protein: 8.1,  carbs: 1.9,  fat: 4.2,  fiber: 0.3, defaultUnit: 'g', defaultQty: 150 },
  { id: 'tofu_soyeux',     name: 'Tofu soyeux',          category: 'Légumineuses', emoji: '⬜', calories: 55,  protein: 5.0,  carbs: 2.4,  fat: 2.7,  fiber: 0.1, defaultUnit: 'g', defaultQty: 150 },
  { id: 'tempeh',          name: 'Tempeh',               category: 'Légumineuses', emoji: '🟫', calories: 193, protein: 20.3, carbs: 9.4,  fat: 10.8, fiber: 0,   defaultUnit: 'g', defaultQty: 100 },
  { id: 'seitan',          name: 'Seitan',               category: 'Légumineuses', emoji: '🟫', calories: 370, protein: 75.2, carbs: 14.0, fat: 1.9,  fiber: 0.6, defaultUnit: 'g', defaultQty: 100 },
  { id: 'houmous',         name: 'Houmous',              category: 'Légumineuses', emoji: '🫘', calories: 177, protein: 5.0,  carbs: 14.3, fat: 11.4, fiber: 4.0, defaultUnit: 'g', defaultQty: 60  },

  // ─── NOIX & GRAINES ────────────────────────────────────────────────────────
  { id: 'amandes',         name: 'Amandes',              category: 'Noix & Graines', emoji: '🌰', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, defaultUnit: 'g', defaultQty: 30 },
  { id: 'noix',            name: 'Noix',                 category: 'Noix & Graines', emoji: '🌰', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'noix_cajou',      name: 'Noix de cajou',        category: 'Noix & Graines', emoji: '🌰', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'noix_bresil',     name: 'Noix du Brésil',       category: 'Noix & Graines', emoji: '🌰', calories: 656, protein: 14.3, carbs: 12.3, fat: 66.4, fiber: 7.5,  defaultUnit: 'g', defaultQty: 20 },
  { id: 'noix_pecan',      name: 'Noix de pécan',        category: 'Noix & Graines', emoji: '🌰', calories: 691, protein: 9.2,  carbs: 13.9, fat: 72.0, fiber: 9.6,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'noix_macadamia',  name: 'Noix de macadamia',    category: 'Noix & Graines', emoji: '🌰', calories: 718, protein: 7.9,  carbs: 13.8, fat: 75.8, fiber: 8.6,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'noisettes',       name: 'Noisettes',            category: 'Noix & Graines', emoji: '🌰', calories: 628, protein: 15.0, carbs: 16.7, fat: 60.8, fiber: 9.7,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'pistaches',       name: 'Pistaches',            category: 'Noix & Graines', emoji: '🌰', calories: 562, protein: 20.2, carbs: 27.5, fat: 45.3, fiber: 10.3, defaultUnit: 'g', defaultQty: 30 },
  { id: 'cacahuetes',      name: 'Cacahuètes',           category: 'Noix & Graines', emoji: '🥜', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'beurre_cacahuete',name: 'Beurre de cacahuète',  category: 'Noix & Graines', emoji: '🥜', calories: 588, protein: 25.1, carbs: 20.1, fat: 50.4, fiber: 6.0,  defaultUnit: 'g', defaultQty: 30 },
  { id: 'beurre_amande',   name: 'Beurre d\'amande',     category: 'Noix & Graines', emoji: '🌰', calories: 614, protein: 21.0, carbs: 18.8, fat: 55.5, fiber: 10.3, defaultUnit: 'g', defaultQty: 30 },
  { id: 'tahini',          name: 'Tahini (purée sésame)', category: 'Noix & Graines', emoji: '🌱', calories: 595, protein: 17.0, carbs: 21.2, fat: 53.8, fiber: 9.3, defaultUnit: 'g', defaultQty: 20 },
  { id: 'graines_chia',    name: 'Graines de chia',      category: 'Noix & Graines', emoji: '🌱', calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, defaultUnit: 'g', defaultQty: 15 },
  { id: 'graines_lin',     name: 'Graines de lin',       category: 'Noix & Graines', emoji: '🌱', calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, defaultUnit: 'g', defaultQty: 15 },
  { id: 'graines_tournesol',name: 'Graines de tournesol', category: 'Noix & Graines', emoji: '🌻', calories: 584, protein: 20.8, carbs: 20.0, fat: 51.5, fiber: 8.6, defaultUnit: 'g', defaultQty: 20 },
  { id: 'graines_courge',  name: 'Graines de courge',    category: 'Noix & Graines', emoji: '🌱', calories: 559, protein: 30.2, carbs: 10.7, fat: 49.1, fiber: 6.0,  defaultUnit: 'g', defaultQty: 20 },
  { id: 'graines_chanvre', name: 'Graines de chanvre',   category: 'Noix & Graines', emoji: '🌱', calories: 553, protein: 31.6, carbs: 8.7,  fat: 48.8, fiber: 4.0,  defaultUnit: 'g', defaultQty: 20 },
  { id: 'graines_sesame',  name: 'Graines de sésame',    category: 'Noix & Graines', emoji: '🌱', calories: 573, protein: 17.7, carbs: 23.5, fat: 49.7, fiber: 11.8, defaultUnit: 'g', defaultQty: 10 },

  // ─── MATIÈRES GRASSES ──────────────────────────────────────────────────────
  { id: 'huile_olive',     name: 'Huile d\'olive',       category: 'Matières grasses', emoji: '🫒', calories: 884, protein: 0,    carbs: 0,    fat: 100.0, fiber: 0, defaultUnit: 'ml', defaultQty: 10 },
  { id: 'huile_colza',     name: 'Huile de colza',       category: 'Matières grasses', emoji: '🫒', calories: 884, protein: 0,    carbs: 0,    fat: 100.0, fiber: 0, defaultUnit: 'ml', defaultQty: 10 },
  { id: 'huile_tournesol', name: 'Huile de tournesol',   category: 'Matières grasses', emoji: '🌻', calories: 884, protein: 0,    carbs: 0,    fat: 100.0, fiber: 0, defaultUnit: 'ml', defaultQty: 10 },
  { id: 'huile_coco',      name: 'Huile de coco',        category: 'Matières grasses', emoji: '🥥', calories: 862, protein: 0,    carbs: 0,    fat: 100.0, fiber: 0, defaultUnit: 'ml', defaultQty: 10 },
  { id: 'huile_sesame',    name: 'Huile de sésame',      category: 'Matières grasses', emoji: '🫒', calories: 884, protein: 0,    carbs: 0,    fat: 100.0, fiber: 0, defaultUnit: 'ml', defaultQty: 5  },
  { id: 'ghee',            name: 'Ghee (beurre clarifié)',category: 'Matières grasses', emoji: '🧈', calories: 900, protein: 0.3,  carbs: 0,    fat: 99.5,  fiber: 0, defaultUnit: 'g',  defaultQty: 10 },
  { id: 'margarine',       name: 'Margarine',            category: 'Matières grasses', emoji: '🧈', calories: 717, protein: 0.2,  carbs: 0.7,  fat: 80.0,  fiber: 0, defaultUnit: 'g',  defaultQty: 10 },

  // ─── BOISSONS ──────────────────────────────────────────────────────────────
  { id: 'jus_orange',      name: 'Jus d\'orange pressé', category: 'Boissons', emoji: '🍊', calories: 45,  protein: 0.7, carbs: 10.4, fat: 0.2, fiber: 0.2, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'jus_pomme',       name: 'Jus de pomme',         category: 'Boissons', emoji: '🍎', calories: 44,  protein: 0.1, carbs: 11.3, fat: 0.1, fiber: 0.1, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'jus_raisin',      name: 'Jus de raisin',        category: 'Boissons', emoji: '🍇', calories: 60,  protein: 0.6, carbs: 14.9, fat: 0.3, fiber: 0.2, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'jus_tomate',      name: 'Jus de tomate',        category: 'Boissons', emoji: '🍅', calories: 17,  protein: 0.8, carbs: 4.2,  fat: 0.1, fiber: 0.4, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'jus_carotte',     name: 'Jus de carotte',       category: 'Boissons', emoji: '🥕', calories: 40,  protein: 0.9, carbs: 9.3,  fat: 0.2, fiber: 0.5, defaultUnit: 'ml', defaultQty: 200 },
  { id: 'eau_coco',        name: 'Eau de coco',          category: 'Boissons', emoji: '🥥', calories: 19,  protein: 0.7, carbs: 3.7,  fat: 0.2, fiber: 1.1, defaultUnit: 'ml', defaultQty: 250 },
  { id: 'cafe',            name: 'Café noir',            category: 'Boissons', emoji: '☕', calories: 2,   protein: 0.3, carbs: 0,    fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 150 },
  { id: 'the_vert',        name: 'Thé vert',             category: 'Boissons', emoji: '🍵', calories: 1,   protein: 0,   carbs: 0.2,  fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 250 },
  { id: 'the_noir',        name: 'Thé noir',             category: 'Boissons', emoji: '🍵', calories: 1,   protein: 0,   carbs: 0.3,  fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 250 },
  { id: 'kombucha',        name: 'Kombucha',             category: 'Boissons', emoji: '🫙', calories: 22,  protein: 0,   carbs: 5.5,  fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 250 },
  { id: 'kefir',           name: 'Kéfir de lait',        category: 'Boissons', emoji: '🥛', calories: 61,  protein: 3.3, carbs: 4.7,  fat: 3.3, fiber: 0,   defaultUnit: 'ml', defaultQty: 200 },
  { id: 'smoothie_vert',   name: 'Smoothie vert maison', category: 'Boissons', emoji: '🥤', calories: 45,  protein: 1.5, carbs: 9.0,  fat: 0.4, fiber: 1.5, defaultUnit: 'ml', defaultQty: 300 },
  { id: 'coca_cola',       name: 'Soda cola',            category: 'Boissons', emoji: '🥤', calories: 42,  protein: 0,   carbs: 10.6, fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 250 },
  { id: 'coca_zero',       name: 'Soda light / zéro',    category: 'Boissons', emoji: '🥤', calories: 1,   protein: 0,   carbs: 0.1,  fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 250 },

  // ─── COMPLÉMENTS & PROTÉINES ───────────────────────────────────────────────
  { id: 'whey_protein',    name: 'Whey protéine',        category: 'Compléments', emoji: '💪', calories: 400, protein: 80.0, carbs: 8.0,  fat: 6.0,  fiber: 0,   defaultUnit: 'g', defaultQty: 30 },
  { id: 'whey_vegan',      name: 'Protéine végétale',    category: 'Compléments', emoji: '🌱', calories: 380, protein: 72.0, carbs: 12.0, fat: 7.0,  fiber: 2.0, defaultUnit: 'g', defaultQty: 30 },
  { id: 'caseine',         name: 'Caséine',              category: 'Compléments', emoji: '💪', calories: 380, protein: 78.0, carbs: 8.0,  fat: 4.0,  fiber: 0,   defaultUnit: 'g', defaultQty: 30 },
  { id: 'creatine',        name: 'Créatine',             category: 'Compléments', emoji: '💊', calories: 0,   protein: 0,    carbs: 0,    fat: 0,    fiber: 0,   defaultUnit: 'g', defaultQty: 5  },
  { id: 'bcaa',            name: 'BCAA',                 category: 'Compléments', emoji: '💊', calories: 20,  protein: 5.0,  carbs: 0,    fat: 0,    fiber: 0,   defaultUnit: 'g', defaultQty: 10 },

  // ─── SUCRE, DOUCEURS & CONDIMENTS ─────────────────────────────────────────
  { id: 'miel',            name: 'Miel',                 category: 'Sucre & Épices', emoji: '🍯', calories: 304, protein: 0.3,  carbs: 82.4, fat: 0,    fiber: 0.2, defaultUnit: 'g', defaultQty: 15 },
  { id: 'sirop_agave',     name: 'Sirop d\'agave',       category: 'Sucre & Épices', emoji: '🍯', calories: 310, protein: 0,    carbs: 76.0, fat: 0,    fiber: 0,   defaultUnit: 'g', defaultQty: 15 },
  { id: 'sirop_erable',    name: 'Sirop d\'érable',      category: 'Sucre & Épices', emoji: '🍁', calories: 260, protein: 0,    carbs: 67.1, fat: 0.1,  fiber: 0,   defaultUnit: 'g', defaultQty: 15 },
  { id: 'sucre_blanc',     name: 'Sucre blanc',          category: 'Sucre & Épices', emoji: '🧂', calories: 387, protein: 0,    carbs: 99.8, fat: 0,    fiber: 0,   defaultUnit: 'g', defaultQty: 10 },
  { id: 'sucre_complet',   name: 'Sucre complet',        category: 'Sucre & Épices', emoji: '🧂', calories: 380, protein: 0.4,  carbs: 97.8, fat: 0.1,  fiber: 0,   defaultUnit: 'g', defaultQty: 10 },
  { id: 'stevia',          name: 'Stévia',               category: 'Sucre & Épices', emoji: '🌿', calories: 0,   protein: 0,    carbs: 0,    fat: 0,    fiber: 0,   defaultUnit: 'g', defaultQty: 2  },
  { id: 'chocolat_noir',   name: 'Chocolat noir 70%',    category: 'Sucre & Épices', emoji: '🍫', calories: 598, protein: 7.8,  carbs: 45.9, fat: 42.6, fiber: 10.9, defaultUnit: 'g', defaultQty: 20 },
  { id: 'chocolat_lait',   name: 'Chocolat au lait',     category: 'Sucre & Épices', emoji: '🍫', calories: 535, protein: 7.7,  carbs: 59.5, fat: 30.0, fiber: 3.4, defaultUnit: 'g', defaultQty: 20 },
  { id: 'confiture',       name: 'Confiture',            category: 'Sucre & Épices', emoji: '🍓', calories: 250, protein: 0.4,  carbs: 65.1, fat: 0.1,  fiber: 0.6, defaultUnit: 'g', defaultQty: 20 },
  { id: 'nutella',         name: 'Pâte à tartiner noisette', category: 'Sucre & Épices', emoji: '🍫', calories: 539, protein: 6.3, carbs: 57.5, fat: 30.9, fiber: 3.4, defaultUnit: 'g', defaultQty: 20 },
  { id: 'ketchup',         name: 'Ketchup',              category: 'Sucre & Épices', emoji: '🍅', calories: 112, protein: 1.4,  carbs: 27.2, fat: 0.1,  fiber: 0.5, defaultUnit: 'g', defaultQty: 20 },
  { id: 'moutarde',        name: 'Moutarde',             category: 'Sucre & Épices', emoji: '🌿', calories: 66,  protein: 3.7,  carbs: 6.3,  fat: 3.6,  fiber: 1.9, defaultUnit: 'g', defaultQty: 15 },
  { id: 'sauce_soja',      name: 'Sauce soja',           category: 'Sucre & Épices', emoji: '🫙', calories: 60,  protein: 8.1,  carbs: 5.6,  fat: 0.1,  fiber: 0.8, defaultUnit: 'ml', defaultQty: 15 },
  { id: 'vinaigre_balsamique', name: 'Vinaigre balsamique', category: 'Sucre & Épices', emoji: '🫙', calories: 88, protein: 0.5, carbs: 17.0, fat: 0,   fiber: 0,   defaultUnit: 'ml', defaultQty: 15 },
];

export default foods;

// Helper : calcule les macros pour une quantité donnée
export function calcNutrition(food, quantity) {
  const factor = food.defaultUnit === 'pcs'
    ? quantity  // Pour les unités (ex: oeuf), quantity = nombre de pièces
    : quantity / 100;  // Pour g/ml, valeurs pour 100g/100ml
  return {
    calories: Math.round(food.calories * (food.defaultUnit === 'pcs' ? (quantity * 55 / 100) : factor)),
    protein: Math.round((food.protein * factor) * 10) / 10,
    carbs: Math.round((food.carbs * factor) * 10) / 10,
    fat: Math.round((food.fat * factor) * 10) / 10,
  };
}

// Pour les œufs : 1 oeuf ≈ 55g
export function calcNutritionFull(food, quantity, unit) {
  let grams = quantity;
  if (unit === 'pcs') {
    grams = quantity * 55; // 1 oeuf ≈ 55g
  }
  const factor = grams / 100;
  return {
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fat: Math.round(food.fat * factor * 10) / 10,
  };
}

export function getFoodById(id) {
  return foods.find(f => f.id === id);
}

export function searchFoods(query) {
  if (!query) return foods;
  const q = query.toLowerCase();
  return foods.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  );
}

export const CATEGORIES = [...new Set(foods.map(f => f.category))];
