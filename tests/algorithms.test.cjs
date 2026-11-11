const fs = require('fs');
const vm = require('vm');
const nodes = {};
function node(id) {
  return nodes[id] ||= {innerHTML:'', textContent:'', onclick:null, setAttribute(){}, classList:{toggle(){}}, querySelectorAll(){return []}};
}
const storage = {};
const context = {
  document: {getElementById: node, addEventListener(){}},
  window: {addEventListener(){}},
  localStorage: {setItem: (k,v) => storage[k]=v, getItem: k => storage[k] || null, removeItem: k => delete storage[k]},
  cancelAnimationFrame(){}, clearInterval(){}, Set, Math, console,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/adventure.js','utf8'), context);
vm.runInContext(`
  if (!validCode([2,3,1]) || validCode([2,1,3]) || validCode([2,2,1])) throw Error('CSP check failed');
  if (solveCode([1]) !== null || solveCode([2]).join(',') !== '2,3,1') throw Error('CSP hint failed');
  for (let test=0; test<300; test++) {
    const origin=Math.floor(Math.random()*40), walls=[];
    for (let i=0;i<40;i++) if(i!==origin && i!==goalCell && Math.random()<.28) walls.push(i);
    const result=findRoute(walls,origin), queue=[[origin,0]], seen=new Set([origin]); let distance=null;
    while(queue.length){const [u,d]=queue.shift();if(u===goalCell){distance=d;break}for(const v of neighbors(u))if(!walls.includes(v)&&!seen.has(v)){seen.add(v);queue.push([v,d+1])}}
    if ((result.path ? result.path.length-1 : null) !== distance) throw Error('A* disagrees with BFS');
  }
  const p=calculateBelief(['camera','log','chat']);
  if(Math.abs(p.reduce((a,b)=>a+b,0)-1)>1e-9 || p[0]<=p[1]) throw Error('Bayesian update failed');
  state=fresh(); state.stage=2; state.walls=[...defaultWalls.filter(i=>i!==26)];
  routePos=startCell;routeSteps=0;routeMode='walk';routeBusy=false;
  const path=findRoute(state.walls).path;
  for(const cell of path.slice(1)) routeClick(cell);
  if(routePos!==goalCell || !state.routeFound || !document.getElementById('route-next').innerHTML.includes('to-expo')) throw Error('Manual route completion failed');
  state.stage=3;state.found=['camera','log'];state.attempts=2;saveGame();
  const saved=loadGame();
  if(saved.stage!==3 || saved.found.length!==2 || saved.tripSteps!==path.length-1 || saved.attempts!==2) throw Error('Checkpoint failed');
  console.log('Passed: CSP, 300 A* comparisons, Bayes, manual route completion, checkpoint.');
`, context);
