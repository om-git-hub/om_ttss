const dcMap = {
 "ch":"Ç","dh":"Ð","ny":"Ñ",
 "ph":"Þ","ts":"Ŧ","sh":"Š","zy":"Ž"
};
const APOST = "Ƶ";
const revMap = Object.fromEntries(
  Object.entries(dcMap).map(([k,v])=>[v,k])
);

// ---------- NORMALIZE ----------
function normalize(w){
  let s = w.toLowerCase();
  for(const k in dcMap){
    s = s.split(k).join(dcMap[k]);
  }
  return s.replace(/'/g, APOST);
}

function unNormalizePiece(p){
  let s = p;
  for(const [v,k] of Object.entries(revMap)){
    s = s.split(v).join(k);
  }
  return s.split(APOST).join("'");
}

// ---------- HELPERS ----------
function isV(ch){
  return ch && "aeiou".includes(ch);
}

function isC(ch){
  if(!ch) return false;

  // normalized double consonants
  if(Object.values(dcMap).includes(ch)) return true;

  // apostrophe akka consonant
  if(ch === "'" || ch === APOST) return true;

  // y akka consonant
  if(ch === "y") return true;

  return /^[a-z]$/i.test(ch) && !"aeiou".includes(ch);
}

// ---------- SPACE RULE ----------
function fixSpaceVowelRule(text){
  return text.replace(/ ([aeiou])/gi, " '$1");
}

// ---------- DUPLICATE ----------
function duplicateSecondConsonant(word){
  let out = "";
  for(let i=0;i<word.length;i++){
    let cur = word[i];
    let prev = word[i-1];

    if(isC(prev) && isC(cur) && prev!==cur){
      out += cur;
    }
    out += cur;
  }
  return out;
}

// ---------- extractEnd ----------
function extractEnd(norm){
  const L = norm.length;
  const s=i=>norm[i]||"";

  if(L>=5){
    const [c1,c2,v1,v2,c3]=[s(L-5),s(L-4),s(L-3),s(L-2),s(L-1)];
    if(isC(c1)&&isC(c2)&&isV(v1)&&isV(v2)&&isC(c3)) return norm.slice(L-5);
  }

  if(L>=4){
    const [a,b,c,d]=[s(L-4),s(L-3),s(L-2),s(L-1)];
    if(isC(a)&&isC(b)&&isV(c)&&isC(d)) return norm.slice(L-4);
    if(isC(a)&&isV(b)&&isV(c)&&isC(d)) return norm.slice(L-4);
    if(isC(a)&&isC(b)&&isV(c)&&isV(d)) return norm.slice(L-4);
  }

  if(L>=3){
    const [a,b,c]=[s(L-3),s(L-2),s(L-1)];
    if(isC(a)&&isV(b)&&isC(c)) return norm.slice(L-3);
    if(isC(a)&&isC(b)&&isV(c)) return norm.slice(L-3);
    if(isC(a)&&isV(b)&&isV(c)) return norm.slice(L-3);
  }

  if(L>=2){
    const [a,b]=[s(L-2),s(L-1)];
    if(isC(a)&&isV(b)) return norm.slice(L-2);
  }

  return norm.slice(-1);
}

// ---------- backwardSegments ----------
function backwardSegments(norm){
  const pieces=[];
  while(norm.length>0){
    const end = extractEnd(norm);
    pieces.push(end);
    norm = norm.slice(0,norm.length-end.length);
  }
  return pieces;
}

// ---------- START VOWEL ----------
function applyStartVowelRule(w){
  if(!w) return w;
  return "aeiou".includes(w[0]) ? "'"+w : w;
}

// ---------- MAIN ----------
function splitAndDisplay(word){

  // normalize FIRST
  word = normalize(word.toLowerCase());

  word = duplicateSecondConsonant(word);
  word = applyStartVowelRule(word);

  let parts = backwardSegments(word)
                .reverse()
                .map(unNormalizePiece);

  let result = parts.join("-");

  // clean dots
  result = result.replace(/-+\./g,".");
  result = result.replace(/\.{2,}/g,".");

  return result;
}

// ---------- COUNT ----------
function syllableCountFromSaga1(clean){
  if(!clean.trim()) return 0;
  return (clean.match(/-/g)||[]).length+1;
}