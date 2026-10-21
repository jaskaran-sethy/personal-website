import style from "./lift.module.css";

// The hover "jump" every piece of the home page shares. Uses `translate`, so it stacks with any `transform`.
export const lift = style.lift;

// A shorter jump for blocks of text, where the full lift reads as jittery.
export const liftSmall = `${style.lift} ${style.small}`;
