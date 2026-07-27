/* Seed data — only used the very first time the app runs (empty localStorage).
   Edit freely; once saved, your edits live in localStorage / your backup file. */

const SEED_GROCERIES = [
  // ALDI — prices checked live from aldi.com.au, late July 2026
  { id: "g1",  store: "ALDI", name: "Chicken Breast Fillets Value Pack ~1.38kg", category: "Protein", price: 15.17, checkedOn: "2026-07-27", history: [] },
  { id: "g2",  store: "ALDI", name: "RSPCA Chicken Breast Fillets ~0.6kg", category: "Protein", price: 7.19, checkedOn: "2026-07-27", history: [] },
  { id: "g3",  store: "ALDI", name: "RSPCA Chicken Thigh Fillets ~0.6kg", category: "Protein", price: 9.59, checkedOn: "2026-07-27", history: [] },
  { id: "g4",  store: "ALDI", name: "Chicken Drumsticks Bulk 2kg", category: "Protein", price: 7.29, checkedOn: "2026-07-27", history: [] },
  { id: "g5",  store: "ALDI", name: "Turkey Mince 500g", category: "Protein", price: 6.00, checkedOn: "2026-07-27", history: [] },
  { id: "g6",  store: "ALDI", name: "2 Star Beef Mince 500g", category: "Protein", price: 6.99, checkedOn: "2026-07-27", history: [] },
  { id: "g7",  store: "ALDI", name: "3 Star Beef Mince 500g", category: "Protein", price: 7.99, checkedOn: "2026-07-27", history: [] },
  { id: "g8",  store: "ALDI", name: "Long Grain Rice 2kg", category: "Carbs", price: 3.59, checkedOn: "2026-07-27", history: [] },
  { id: "g9",  store: "ALDI", name: "Rolled Oats 750g", category: "Carbs", price: 1.49, checkedOn: "2026-07-27", history: [] },
  { id: "g10", store: "ALDI", name: "Cucina Pasta Spirals 500g", category: "Carbs", price: 0.89, checkedOn: "2026-07-27", history: [] },
  { id: "g11", store: "ALDI", name: "Full Cream Milk 2L", category: "Dairy", price: 3.55, checkedOn: "2026-07-27", history: [] },
  { id: "g12", store: "ALDI", name: "Onset Platinum Protein Powder 500g", category: "Supplements", price: 23.99, checkedOn: "2026-07-27", history: [] },
  { id: "g13", store: "ALDI", name: "Yoguri Protein Yogurt 160g", category: "Dairy", price: 1.99, checkedOn: "2026-07-27", history: [] },
  { id: "g14", store: "ALDI", name: "Natural Almonds 250g", category: "Snacks", price: 4.99, checkedOn: "2026-07-27", history: [] },
  { id: "g15", store: "ALDI", name: "Mixed Vegetables 1kg (frozen)", category: "Veg", price: 2.79, checkedOn: "2026-07-27", history: [] },
  { id: "g16", store: "ALDI", name: "Broccoli 500g (frozen)", category: "Veg", price: 2.79, checkedOn: "2026-07-27", history: [] },
  { id: "g17", store: "ALDI", name: "Garden Peas 1kg (frozen)", category: "Veg", price: 2.49, checkedOn: "2026-07-27", history: [] },
  { id: "g18", store: "ALDI", name: "Hillcrest Protein Oat Bars 5-pack", category: "Snacks", price: 4.49, checkedOn: "2026-07-27", history: [] },
  // Chemist Warehouse — prices are estimates only (site blocks live price-checking), verify in-app
  { id: "g19", store: "Chemist Warehouse", name: "BSc Pure Creatine 200g", category: "Supplements", price: 28.00, checkedOn: "2026-07-27", estimate: true, history: [] },
  { id: "g20", store: "Chemist Warehouse", name: "Creatine Monohydrate 500g (any brand, ~100 serves)", category: "Supplements", price: 35.00, checkedOn: "2026-07-27", estimate: true, history: [] },
];

const SEED_RECIPES = [
  {
    id: "r1", meal: "Breakfast", name: "Protein Oats & Banana",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["60g rolled oats", "300ml full cream milk", "1 scoop protein powder", "1 banana"],
    method: "Cook oats with milk on the stove or microwave. Stir through protein powder once slightly cooled. Slice banana on top.",
    kcal: 649, protein: 43
  },
  {
    id: "r2", meal: "Lunch", name: "Chicken, Rice & Mixed Veg",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["200g chicken breast", "75g rice (dry weight)", "150g mixed frozen veg"],
    method: "Pan-fry or grill the chicken. Boil the rice. Steam or microwave the veg. Combine.",
    kcal: 650, protein: 67
  },
  {
    id: "r3", meal: "Lunch", name: "Turkey Mince, Rice & Peas",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["150g turkey mince", "75g rice (dry weight)", "150g peas"],
    method: "Brown the turkey mince in a pan with a little oil. Boil rice, steam peas, combine.",
    kcal: 560, protein: 55
  },
  {
    id: "r4", meal: "Lunch", name: "Beef Mince & Pasta",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["150g beef mince", "75g pasta (dry weight)", "150g broccoli"],
    method: "Brown mince, boil pasta, steam broccoli. Toss together, season to taste.",
    kcal: 610, protein: 48
  },
  {
    id: "r5", meal: "Dinner", name: "Beef Mince, Potato & Broccoli",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["150g beef mince", "250g potato", "150g broccoli"],
    method: "Brown the mince. Boil or roast the potato. Steam the broccoli. Plate together.",
    kcal: 570, protein: 35
  },
  {
    id: "r6", meal: "Dinner", name: "Chicken Thigh, Potato & Mixed Veg",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["200g chicken thigh fillet", "250g potato", "150g mixed veg"],
    method: "Pan-fry or oven-bake the chicken thigh until cooked through. Boil or roast potato. Steam veg.",
    kcal: 610, protein: 52
  },
  {
    id: "r7", meal: "Snack", name: "Protein Yogurt & Almonds",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["160g protein yogurt", "20g almonds (small handful)"],
    method: "Just combine and eat — zero prep.",
    kcal: 250, protein: 19
  },
  {
    id: "r8", meal: "Snack", name: "Protein Oat Bar",
    tags: ["egg-free", "fish-free", "apple-free"],
    ingredients: ["1 protein oat bar"],
    method: "Grab and go — keep a few in your bag for busy days.",
    kcal: 180, protein: 10
  },
];

const SEED_SUPPLEMENTS = [
  { id: "s1", name: "Vitamin D", timing: "Morning, with food", note: "Already in your routine — keep going." },
  { id: "s2", name: "Magnesium", timing: "Evening", note: "Already in your routine — keep going." },
  { id: "s3", name: "Vitamin C", timing: "Morning", note: "Already in your routine — keep going." },
  { id: "s4", name: "Protein powder", timing: "With breakfast shake", note: "Helps you hit your daily protein target." },
  { id: "s5", name: "Creatine monohydrate", timing: "Any time, 5g, every day", note: "Consistency matters more than timing." },
];

// Weekly recurring training program. Keyed by weekday name (Mon-first week).
const TRAINING_PROGRAM = {
  Monday: {
    title: "Push — Chest, Shoulders, Triceps",
    exercises: [
      { id: "mon-1", name: "Barbell floor press", sets: "4×8–10" },
      { id: "mon-2", name: "Standing barbell overhead press", sets: "3×8–10" },
      { id: "mon-3", name: "Dumbbell lateral raises", sets: "3×12–15" },
      { id: "mon-4", name: "Close-grip floor press", sets: "3×10–12" },
      { id: "mon-5", name: "Overhead dumbbell triceps extension", sets: "3×12–15" },
    ]
  },
  Tuesday: {
    title: "Pull — Back, Biceps",
    exercises: [
      { id: "tue-1", name: "Barbell bent-over rows", sets: "4×8–10" },
      { id: "tue-2", name: "Single-arm dumbbell rows", sets: "3×10–12 each side" },
      { id: "tue-3", name: "Barbell curls", sets: "4×8–10" },
      { id: "tue-4", name: "Alternating dumbbell hammer curls", sets: "3×10–12" },
      { id: "tue-5", name: "Concentration curls", sets: "3×12–15 each arm" },
    ]
  },
  Wednesday: {
    title: "Legs, Core + Conditioning",
    exercises: [
      { id: "wed-1", name: "Barbell back squats", sets: "4×8–10" },
      { id: "wed-2", name: "Romanian deadlifts", sets: "3×10" },
      { id: "wed-3", name: "Dumbbell walking lunges", sets: "3×10 each leg" },
      { id: "wed-4", name: "Standing dumbbell calf raises", sets: "3×15" },
      { id: "wed-5", name: "Plank", sets: "3×45–60 sec" },
      { id: "wed-6", name: "Skipping intervals", sets: "10–15 min" },
    ]
  },
  Thursday: {
    title: "Arm Specialization",
    exercises: [
      { id: "thu-1", name: "Barbell curls", sets: "4×8–10" },
      { id: "thu-2", name: "Close-grip floor press", sets: "4×8–10" },
      { id: "thu-3", name: "Hammer curls", sets: "3×10–12" },
      { id: "thu-4", name: "Lying dumbbell skull crushers", sets: "3×10–12" },
      { id: "thu-5", name: "21s barbell curls", sets: "3 sets" },
      { id: "thu-6", name: "Chair dips", sets: "3×AMRAP" },
    ]
  },
  Friday: {
    title: "Full Body + Conditioning",
    exercises: [
      { id: "fri-1", name: "Barbell deadlifts", sets: "3×6–8" },
      { id: "fri-2", name: "Dumbbell thrusters", sets: "3×10" },
      { id: "fri-3", name: "Renegade rows", sets: "3×10 each side" },
      { id: "fri-4", name: "Skipping intervals", sets: "15–20 min" },
    ]
  },
  Saturday: { title: "Rest", exercises: [] },
  Sunday: { title: "Rest", exercises: [] },
};
