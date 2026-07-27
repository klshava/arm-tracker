/* Exercise guides — beginner-friendly "what is this and how do I do it"
   reference for every exercise in the training program. Pure original
   content and hand-drawn SVG line-art (no external images/assets), keyed
   by pattern so similar movements (all the curl variants, both floor
   press variants, etc.) share one animated diagram. */

const PATTERN_SVGS = {
  "press-horizontal": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="66" x2="150" y2="66"/>
      <line class="stroke" x1="38" y1="58" x2="88" y2="58"/>
      <circle class="fill" cx="28" cy="58" r="9"/>
      <line class="stroke" x1="88" y1="58" x2="104" y2="42"/>
      <line class="stroke" x1="104" y1="42" x2="122" y2="56"/>
      <line class="stroke" x1="55" y1="58" x2="55" y2="40"/>
      <g class="guide-move" style="--ty:-22px">
        <line class="stroke accent" x1="30" y1="40" x2="80" y2="40"/>
        <circle class="plate" cx="30" cy="40" r="7"/>
        <circle class="plate" cx="80" cy="40" r="7"/>
      </g>
    </svg>`,
  "press-overhead": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <circle class="fill" cx="80" cy="26" r="9"/>
      <line class="stroke" x1="80" y1="35" x2="80" y2="74"/>
      <line class="stroke" x1="80" y1="74" x2="66" y2="110"/>
      <line class="stroke" x1="80" y1="74" x2="94" y2="110"/>
      <line class="stroke" x1="80" y1="40" x2="55" y2="45"/>
      <line class="stroke" x1="80" y1="40" x2="105" y2="45"/>
      <g class="guide-move" style="--ty:-32px">
        <line class="stroke accent" x1="45" y1="46" x2="115" y2="46"/>
        <circle class="plate" cx="45" cy="46" r="7"/>
        <circle class="plate" cx="115" cy="46" r="7"/>
      </g>
    </svg>`,
  "lateral-raise": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <circle class="fill" cx="80" cy="26" r="9"/>
      <line class="stroke" x1="80" y1="35" x2="80" y2="74"/>
      <line class="stroke" x1="80" y1="74" x2="66" y2="110"/>
      <line class="stroke" x1="80" y1="74" x2="94" y2="110"/>
      <line class="stroke" x1="80" y1="42" x2="70" y2="68"/>
      <line class="stroke" x1="80" y1="42" x2="90" y2="68"/>
      <g class="guide-move" style="--tx:-30px; --ty:-20px">
        <circle class="plate" cx="70" cy="68" r="8"/>
      </g>
      <g class="guide-move" style="--tx:30px; --ty:-20px">
        <circle class="plate" cx="90" cy="68" r="8"/>
      </g>
    </svg>`,
  "triceps-overhead": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <circle class="fill" cx="80" cy="26" r="9"/>
      <line class="stroke" x1="80" y1="35" x2="80" y2="74"/>
      <line class="stroke" x1="80" y1="74" x2="66" y2="110"/>
      <line class="stroke" x1="80" y1="74" x2="94" y2="110"/>
      <line class="stroke" x1="80" y1="40" x2="80" y2="20"/>
      <g class="guide-move" style="--ty:16px">
        <line class="stroke accent" x1="66" y1="18" x2="94" y2="18"/>
        <circle class="plate" cx="66" cy="18" r="6"/>
        <circle class="plate" cx="94" cy="18" r="6"/>
      </g>
    </svg>`,
  "row-bent": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-tilt" style="--rot:-8deg; transform-origin:110px 78px">
        <circle class="fill" cx="128" cy="46" r="9"/>
        <line class="stroke" x1="122" y1="53" x2="102" y2="90"/>
        <line class="stroke" x1="102" y1="60" x2="70" y2="60"/>
      </g>
      <line class="stroke" x1="102" y1="90" x2="90" y2="112"/>
      <line class="stroke" x1="102" y1="90" x2="114" y2="112"/>
      <g class="guide-move" style="--ty:-22px">
        <line class="stroke accent" x1="50" y1="88" x2="90" y2="88"/>
        <circle class="plate" cx="50" cy="88" r="7"/>
        <circle class="plate" cx="90" cy="88" r="7"/>
      </g>
    </svg>`,
  "row-single-arm": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <rect class="stroke" x="98" y="70" width="40" height="8" rx="3"/>
      <circle class="fill" cx="118" cy="40" r="9"/>
      <line class="stroke" x1="112" y1="47" x2="80" y2="72"/>
      <line class="stroke" x1="112" y1="70" x2="126" y2="70"/>
      <line class="stroke" x1="80" y1="72" x2="70" y2="110"/>
      <line class="stroke" x1="80" y1="72" x2="100" y2="90"/>
      <g class="guide-move" style="--ty:-22px">
        <circle class="plate" cx="70" cy="90" r="8"/>
      </g>
    </svg>`,
  "curl": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <circle class="fill" cx="80" cy="26" r="9"/>
      <line class="stroke" x1="80" y1="35" x2="80" y2="74"/>
      <line class="stroke" x1="80" y1="74" x2="66" y2="110"/>
      <line class="stroke" x1="80" y1="74" x2="94" y2="110"/>
      <line class="stroke" x1="80" y1="40" x2="66" y2="70"/>
      <line class="stroke" x1="80" y1="40" x2="94" y2="70"/>
      <g class="guide-move" style="--ty:-30px">
        <line class="stroke accent" x1="55" y1="72" x2="105" y2="72"/>
        <circle class="plate" cx="55" cy="72" r="7"/>
        <circle class="plate" cx="105" cy="72" r="7"/>
      </g>
    </svg>`,
  "squat": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-thruster-body">
        <circle class="fill" cx="80" cy="26" r="9"/>
        <line class="stroke" x1="80" y1="35" x2="80" y2="72"/>
        <line class="stroke" x1="80" y1="72" x2="66" y2="110"/>
        <line class="stroke" x1="80" y1="72" x2="94" y2="110"/>
        <line class="stroke" x1="80" y1="42" x2="60" y2="42"/>
        <line class="stroke" x1="80" y1="42" x2="100" y2="42"/>
        <line class="stroke accent" x1="55" y1="42" x2="105" y2="42"/>
        <circle class="plate" cx="55" cy="42" r="7"/>
        <circle class="plate" cx="105" cy="42" r="7"/>
      </g>
    </svg>`,
  "hinge": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-tilt" style="--rot:-10deg; transform-origin:100px 82px">
        <circle class="fill" cx="118" cy="44" r="9"/>
        <line class="stroke" x1="112" y1="52" x2="100" y2="82"/>
      </g>
      <line class="stroke" x1="100" y1="82" x2="88" y2="112"/>
      <line class="stroke" x1="100" y1="82" x2="112" y2="112"/>
      <g class="guide-move" style="--ty:-26px">
        <line class="stroke accent" x1="55" y1="94" x2="95" y2="94"/>
        <circle class="plate" cx="55" cy="94" r="7"/>
        <circle class="plate" cx="95" cy="94" r="7"/>
      </g>
    </svg>`,
  "lunge": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-thruster-body">
        <circle class="fill" cx="76" cy="26" r="9"/>
        <line class="stroke" x1="76" y1="35" x2="80" y2="70"/>
        <line class="stroke" x1="80" y1="70" x2="104" y2="88"/>
        <line class="stroke" x1="104" y1="88" x2="98" y2="112"/>
        <line class="stroke" x1="80" y1="70" x2="66" y2="90"/>
        <line class="stroke" x1="66" y1="90" x2="76" y2="112"/>
        <line class="stroke accent" x1="60" y1="42" x2="60" y2="66"/>
        <circle class="plate" cx="60" cy="66" r="6"/>
        <line class="stroke accent" x1="92" y1="42" x2="92" y2="66"/>
        <circle class="plate" cx="92" cy="66" r="6"/>
      </g>
    </svg>`,
  "calf-raise": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-move" style="--ty:-8px">
        <circle class="fill" cx="80" cy="26" r="9"/>
        <line class="stroke" x1="80" y1="35" x2="80" y2="74"/>
        <line class="stroke" x1="80" y1="74" x2="68" y2="108"/>
        <line class="stroke" x1="80" y1="74" x2="92" y2="108"/>
        <line class="stroke accent" x1="60" y1="42" x2="60" y2="66"/>
        <circle class="plate" cx="60" cy="66" r="6"/>
        <line class="stroke accent" x1="100" y1="42" x2="100" y2="66"/>
        <circle class="plate" cx="100" cy="66" r="6"/>
      </g>
      <line class="ground" x1="60" y1="110" x2="100" y2="110"/>
    </svg>`,
  "plank": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="94" x2="150" y2="94"/>
      <g class="guide-pulse">
        <circle class="fill" cx="30" cy="68" r="9"/>
        <line class="stroke" x1="38" y1="70" x2="120" y2="86"/>
        <line class="stroke" x1="38" y1="70" x2="38" y2="88"/>
        <line class="stroke" x1="120" y1="86" x2="140" y2="70"/>
        <line class="stroke" x1="120" y1="86" x2="140" y2="98"/>
      </g>
    </svg>`,
  "skipping": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-hop">
        <circle class="fill" cx="80" cy="26" r="9"/>
        <line class="stroke" x1="80" y1="35" x2="80" y2="70"/>
        <line class="stroke" x1="80" y1="70" x2="70" y2="106"/>
        <line class="stroke" x1="80" y1="70" x2="90" y2="106"/>
        <line class="stroke" x1="80" y1="42" x2="62" y2="55"/>
        <line class="stroke" x1="80" y1="42" x2="98" y2="55"/>
      </g>
      <path class="stroke accent guide-rope" d="M 62 55 Q 80 118 98 55" fill="none"/>
    </svg>`,
  "skull-crusher": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="66" x2="150" y2="66"/>
      <line class="stroke" x1="35" y1="58" x2="85" y2="58"/>
      <circle class="fill" cx="25" cy="58" r="9"/>
      <line class="stroke" x1="85" y1="58" x2="101" y2="42"/>
      <line class="stroke" x1="101" y1="42" x2="119" y2="56"/>
      <line class="stroke" x1="45" y1="58" x2="35" y2="34"/>
      <g class="guide-move" style="--ty:20px">
        <line class="stroke accent" x1="18" y1="30" x2="52" y2="30"/>
        <circle class="plate" cx="18" cy="30" r="6"/>
        <circle class="plate" cx="52" cy="30" r="6"/>
      </g>
    </svg>`,
  "dip": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="stroke" x1="55" y1="30" x2="55" y2="90"/>
      <line class="stroke" x1="105" y1="30" x2="105" y2="90"/>
      <line class="ground" x1="20" y1="90" x2="140" y2="90"/>
      <g class="guide-move" style="--ty:16px">
        <circle class="fill" cx="80" cy="30" r="9"/>
        <line class="stroke" x1="80" y1="39" x2="80" y2="64"/>
        <line class="stroke" x1="80" y1="64" x2="70" y2="86"/>
        <line class="stroke" x1="80" y1="64" x2="90" y2="86"/>
        <line class="stroke" x1="80" y1="46" x2="55" y2="60"/>
        <line class="stroke" x1="80" y1="46" x2="105" y2="60"/>
      </g>
    </svg>`,
  "thruster": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="112" x2="150" y2="112"/>
      <g class="guide-thruster-body">
        <circle class="fill" cx="80" cy="26" r="9"/>
        <line class="stroke" x1="80" y1="35" x2="80" y2="72"/>
        <line class="stroke" x1="80" y1="72" x2="66" y2="110"/>
        <line class="stroke" x1="80" y1="72" x2="94" y2="110"/>
        <line class="stroke" x1="80" y1="42" x2="60" y2="42"/>
        <line class="stroke" x1="80" y1="42" x2="100" y2="42"/>
      </g>
      <g class="guide-thruster-bar">
        <line class="stroke accent" x1="55" y1="42" x2="105" y2="42"/>
        <circle class="plate" cx="55" cy="42" r="7"/>
        <circle class="plate" cx="105" cy="42" r="7"/>
      </g>
    </svg>`,
  "renegade-row": `
    <svg viewBox="0 0 160 120" class="guide-svg" aria-hidden="true">
      <line class="ground" x1="10" y1="94" x2="150" y2="94"/>
      <circle class="fill" cx="30" cy="68" r="9"/>
      <line class="stroke" x1="38" y1="70" x2="120" y2="86"/>
      <line class="stroke" x1="38" y1="70" x2="38" y2="88"/>
      <line class="stroke" x1="120" y1="86" x2="140" y2="70"/>
      <line class="stroke" x1="120" y1="86" x2="140" y2="98"/>
      <circle class="plate" cx="140" cy="98" r="6"/>
      <g class="guide-move" style="--ty:-16px">
        <circle class="plate" cx="38" cy="88" r="6"/>
      </g>
    </svg>`
};

const EXERCISE_GUIDES = {
  "Barbell floor press": {
    pattern: "press-horizontal",
    muscles: "Chest, front shoulders, triceps",
    setup: "Lie on your back on the floor or a mat, knees bent, feet flat. Hold the bar above your chest with hands just outside shoulder width.",
    cues: [
      "Lower the bar under control until your upper arms touch the floor — that's your stopping point.",
      "Press back up until your arms are straight without locking out hard.",
      "Keep your wrists stacked directly over your elbows the whole rep."
    ],
    tip: "The floor is doing your spotting for you — if the bar feels heavy at the bottom, resting your upper arms on the ground means it's safe to pause and reset."
  },
  "Standing barbell overhead press": {
    pattern: "press-overhead",
    muscles: "Shoulders, triceps, upper chest, core",
    setup: "Stand with feet hip-width apart, bar racked at your collarbone with an overhand grip just outside shoulder width.",
    cues: [
      "Brace your core and glutes, then press the bar straight up.",
      "Move your head back slightly so the bar can travel in a straight line.",
      "Finish with the bar over your mid-foot, arms fully extended, then lower back to your collarbone under control."
    ],
    tip: "Squeeze your glutes and stay tight through your torso — don't lean back to \"help\" the bar up, that's your lower back taking over from your shoulders."
  },
  "Dumbbell lateral raises": {
    pattern: "lateral-raise",
    muscles: "Side (lateral) shoulders",
    setup: "Stand holding a light dumbbell in each hand at your sides, palms facing your body, slight bend in the elbows.",
    cues: [
      "Raise both arms out to the sides until roughly level with your shoulders.",
      "Lead with your elbows rather than your hands.",
      "Lower slowly — the lowering is where most of the work happens."
    ],
    tip: "Go lighter than you think. If you're swinging the weights up using momentum, drop the weight — this is a small, controlled movement."
  },
  "Close-grip floor press": {
    pattern: "press-horizontal",
    muscles: "Triceps, inner chest",
    setup: "Same floor position as the floor press, but hands roughly shoulder-width apart or slightly narrower.",
    cues: [
      "Keep your elbows tucked close to your body as you lower the bar to your chest.",
      "Press back up, focusing on your triceps doing the final lockout."
    ],
    tip: "Don't grip too narrow — inside shoulder-width is enough. Too narrow puts unnecessary strain on your wrists."
  },
  "Overhead dumbbell triceps extension": {
    pattern: "triceps-overhead",
    muscles: "Triceps",
    setup: "Sit or stand tall, holding one dumbbell with both hands overhead, arms straight.",
    cues: [
      "Keep your upper arms still and close to your ears.",
      "Bend at the elbows to lower the dumbbell behind your head.",
      "Extend back up to straight arms."
    ],
    tip: "Only your forearms should move. If your elbows are flaring out or your upper arms are swinging, lighten the load."
  },
  "Barbell bent-over rows": {
    pattern: "row-bent",
    muscles: "Back (lats, traps, rear delts), biceps",
    setup: "Hinge at the hips with a soft knee bend until your torso is around 45°, holding the bar with an overhand grip, arms hanging straight down.",
    cues: [
      "Pull the bar up towards your lower ribs, squeezing your shoulder blades together at the top.",
      "Lower with control back to a full arm extension."
    ],
    tip: "Keep your back flat, not rounded, for the whole set — think about keeping your chest proud rather than curling forward to meet the bar."
  },
  "Single-arm dumbbell rows": {
    pattern: "row-single-arm",
    muscles: "Back (lats, traps), biceps",
    setup: "Place one knee and hand on a bench for support, other foot on the floor, torso roughly parallel to the ground. Hold a dumbbell in the free hand, arm hanging straight down.",
    cues: [
      "Pull the dumbbell up towards your hip, keeping your elbow close to your body.",
      "Lower under control until your arm is fully extended."
    ],
    tip: "Avoid twisting your torso to help the weight up — rotation is a sign the weight's too heavy or you're rushing the rep."
  },
  "Barbell curls": {
    pattern: "curl",
    muscles: "Biceps",
    setup: "Stand tall, holding the bar with an underhand (palms-up) grip, hands shoulder-width apart, elbows close to your sides.",
    cues: [
      "Curl the bar up towards your shoulders without swinging your hips or shoulders to help.",
      "Lower it all the way back down under control."
    ],
    tip: "Keep your elbows pinned to your sides throughout — if they're drifting forward, you're using momentum instead of your biceps."
  },
  "Alternating dumbbell hammer curls": {
    pattern: "curl",
    muscles: "Biceps, forearms",
    setup: "Stand holding a dumbbell in each hand at your sides, palms facing your body (like you're about to shake hands).",
    cues: [
      "Curl one dumbbell up towards your shoulder, keeping your palm facing in the whole way.",
      "Lower it, then repeat on the other side."
    ],
    tip: "The \"hammer\" grip is what shifts some of the work onto your forearms — don't rotate your wrist as you lift."
  },
  "Concentration curls": {
    pattern: "curl",
    muscles: "Biceps, with a strong peak-contraction focus",
    setup: "Sit on a bench, legs apart, and brace the back of your upper arm against the inside of your thigh, dumbbell hanging straight down.",
    cues: [
      "Curl the dumbbell up towards your shoulder, focusing on squeezing at the top.",
      "Lower slowly and fully."
    ],
    tip: "This one's about control over weight — because your arm is braced, there's nowhere for momentum to hide. Go slow."
  },
  "Barbell back squats": {
    pattern: "squat",
    muscles: "Quads, glutes, hamstrings, core",
    setup: "Bar racked across your upper back (not your neck), feet roughly shoulder-width apart, toes slightly out.",
    cues: [
      "Sit your hips back and down, keeping your chest up and knees tracking over your toes.",
      "Go until your thighs are at least parallel to the floor, then drive back up through your whole foot."
    ],
    tip: "Keep your weight spread through your whole foot, not just your toes — if your heels are lifting, work on ankle mobility or lower the depth slightly."
  },
  "Romanian deadlifts": {
    pattern: "hinge",
    muscles: "Hamstrings, glutes, lower back",
    setup: "Stand holding the bar at hip height, feet hip-width apart, soft bend in the knees.",
    cues: [
      "Push your hips straight back, lowering the bar close to your legs until you feel a stretch in your hamstrings (usually around mid-shin).",
      "This isn't a squat — your knees barely bend further as you lower.",
      "Drive your hips forward to return to standing."
    ],
    tip: "Keep the bar brushing your legs the whole way down — if it drifts forward, the weight moves further from your body and strains your lower back."
  },
  "Dumbbell walking lunges": {
    pattern: "lunge",
    muscles: "Quads, glutes, hamstrings, balance/core",
    setup: "Stand holding a dumbbell in each hand at your sides.",
    cues: [
      "Step forward into a lunge, lowering your back knee towards the floor without letting it slam down.",
      "Front knee tracks over your front foot.",
      "Push through your front heel to bring your back leg forward into the next step."
    ],
    tip: "Keep your torso upright rather than leaning forward — an upright chest keeps the work in your legs, not your lower back."
  },
  "Standing dumbbell calf raises": {
    pattern: "calf-raise",
    muscles: "Calves",
    setup: "Stand holding a dumbbell in each hand (or bodyweight to start), feet hip-width apart.",
    cues: [
      "Rise up onto your toes as high as you can, pause briefly.",
      "Lower your heels back down under control — don't just drop."
    ],
    tip: "The slow lowering is the part most people skip — that's where a lot of the growth stimulus comes from, so don't rush it."
  },
  "Plank": {
    pattern: "plank",
    muscles: "Core (abs, obliques), shoulders",
    setup: "Forearms on the floor, elbows under your shoulders, body in a straight line from head to heels, feet hip-width apart.",
    cues: [
      "Squeeze your glutes and brace your abs like you're about to be poked in the stomach.",
      "Hold the position for the set time without letting your hips sag or pike up."
    ],
    tip: "A shaking core is normal, a sagging lower back isn't — if your hips are dropping, that's the cue to stop the set rather than push through with bad form."
  },
  "Skipping intervals": {
    pattern: "skipping",
    muscles: "Calves, cardiovascular system, coordination",
    setup: "Hold the rope handles loosely, elbows close to your body, jump on the balls of your feet.",
    cues: [
      "Small, low hops — just enough to clear the rope — rather than big jumps.",
      "Keep a steady rhythm and let your wrists do most of the rope-turning work, not your whole arms."
    ],
    tip: "If you're tripping a lot, slow the pace down and focus on the rhythm before trying to speed back up — it's a timing skill as much as a fitness one."
  },
  "Hammer curls": {
    pattern: "curl",
    muscles: "Biceps, forearms",
    setup: "Stand holding a dumbbell in each hand at your sides, palms facing your body.",
    cues: [
      "Curl the dumbbells up towards your shoulders, keeping palms facing in the whole way.",
      "Lower under control back to the start."
    ],
    tip: "Don't rotate your wrist as you lift — the neutral \"hammer\" grip is what puts extra emphasis on your forearms."
  },
  "Lying dumbbell skull crushers": {
    pattern: "skull-crusher",
    muscles: "Triceps",
    setup: "Lie on a bench or the floor, holding a dumbbell in each hand (or one held with both hands) straight above your chest.",
    cues: [
      "Keeping your upper arms still, bend at the elbows to lower the weight towards your forehead.",
      "Extend back up to straight arms."
    ],
    tip: "Despite the name, the weight shouldn't actually get near your skull — stop the descent once you feel a stretch in your triceps, well before your forehead."
  },
  "21s barbell curls": {
    pattern: "curl",
    muscles: "Biceps",
    setup: "Stand holding the bar with an underhand grip, same setup as a regular barbell curl.",
    cues: [
      "7 reps through just the bottom half of the curl (hip to halfway up).",
      "7 reps through just the top half (halfway to shoulders).",
      "7 full-range reps — 21 total."
    ],
    tip: "This is about time under tension, so the weight will need to be lighter than your normal curl weight. That's expected, not a sign you're doing it wrong."
  },
  "Chair dips": {
    pattern: "dip",
    muscles: "Triceps, chest, front shoulders",
    setup: "Sit on the edge of a sturdy chair or bench, hands gripping the edge next to your hips, legs extended out in front of you.",
    cues: [
      "Slide your hips off the edge and lower your body by bending your elbows to around 90°.",
      "Press back up through your palms to straighten your arms."
    ],
    tip: "Keep your elbows pointing mostly backward, not flaring out to the sides — and keep your hips close to the chair, not drifting forward."
  },
  "Barbell deadlifts": {
    pattern: "hinge",
    muscles: "Hamstrings, glutes, back, core — a full posterior-chain movement",
    setup: "Stand with the bar over your mid-foot, feet hip-width apart, grip just outside your legs, hips down and chest up before you lift.",
    cues: [
      "Drive through your whole foot to stand up, keeping the bar close to your legs the entire way.",
      "Hips and shoulders rise together.",
      "Lock out standing tall, then reverse the movement to lower it back down."
    ],
    tip: "Your hips and shoulders should rise at the same rate — if your hips shoot up first, your lower back is starting the lift instead of your legs."
  },
  "Dumbbell thrusters": {
    pattern: "thruster",
    muscles: "Full body — quads, glutes, shoulders, triceps, core",
    setup: "Stand holding a dumbbell in each hand at shoulder height, feet shoulder-width apart.",
    cues: [
      "Squat down until your thighs are at least parallel to the floor.",
      "Drive up explosively, using that momentum to press the dumbbells overhead in one continuous motion.",
      "Lower the dumbbells back to your shoulders as you descend into the next squat."
    ],
    tip: "Let the leg drive do the work of starting the press — this is meant to be one fluid motion, not a squat followed by a separate press."
  },
  "Renegade rows": {
    pattern: "renegade-row",
    muscles: "Core, back, shoulders — an anti-rotation core exercise as much as a back one",
    setup: "Start in a plank position with a hand on each dumbbell, feet a little wider than usual for stability.",
    cues: [
      "Row one dumbbell up towards your hip while keeping your hips square to the floor.",
      "Resist the urge to rotate your torso.",
      "Lower it back down and repeat on the other side."
    ],
    tip: "If your hips are twisting with every row, widen your feet or use a lighter weight — the \"core\" part of this exercise is staying still, not the rowing itself."
  }
};
