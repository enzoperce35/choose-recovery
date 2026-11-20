export const SCENES = [
  // Scene 1 (original)
  [
    {
      text: "Tandaan Mo",
      delay: 0,
      style: "text-2xl md:text-4xl text-stone-300 font-normal",
    },
    {
      text: "Sa Unang Taya Ka lang may control",
      delay: 1600,
      style: "text-3xl md:text-5xl text-stone-100 font-bold tracking-tight",
    },
    {
      text: "Ang mga susunod?",
      delay: 3400,
      style: "text-xl md:text-3xl text-stone-400 italic pt-2",
    },
    {
      text: "Sila na.",
      delay: 5400,
      style:
        "text-3xl md:text-5xl text-amber-300/90 font-semibold tracking-[0.18em] pt-4 border-t border-stone-800/80 max-w-xs mx-auto",
    },
  ],

  // Scene 2 (new)
  [
    {
      text: "Control?",
      delay: 0,
      style: "text-2xl md:text-4xl text-stone-300 font-normal",
    },
    {
      text: "Wala na nga di ba",
      delay: 1600,
      style: "text-3xl md:text-5xl text-stone-100 font-bold tracking-tight",
    },
    {
      text: "Mananalo pero Ipapabawi mo lang",
      delay: 3400,
      style: "text-xl md:text-3xl text-stone-400 italic pt-2",
    },
    {
      text: "Tama na.",
      delay: 5400,
      style:
        "text-3xl md:text-5xl text-amber-300/90 font-semibold tracking-[0.18em] pt-4 border-t border-stone-800/80 max-w-xs mx-auto",
    },
  ],
];

// Picks a random scene, avoiding the one just shown (if given)
export function pickRandomScene(current = null) {
  const choices = SCENES.filter((s) => s !== current);
  const pool = choices.length ? choices : SCENES;
  return pool[Math.floor(Math.random() * pool.length)];
}
