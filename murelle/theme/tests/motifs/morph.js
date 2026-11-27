// Remplaçant minimal de @theme/morph (Horizon) pour le test : remplace les enfants.
export function morph(oldTree, newTree) { oldTree.innerHTML = newTree.innerHTML; return oldTree; }
