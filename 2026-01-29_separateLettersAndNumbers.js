/* 
=== Source ===
https://www.freecodecamp.org/learn/daily-coding-challenge/2026-01-29

=== read my blog ===
https://lebmac.github.io/react-hello-ghpages/#/challenge/the-secret-life-of-letters-and-numbers

=== Solution === */

function separateLettersAndNumbers(str) {
  let charSets = /\d+|[A-Za-z]+/g;
  let sets = str.match(charSets);
  return sets.join("-");
}
