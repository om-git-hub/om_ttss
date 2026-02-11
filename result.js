const inp=document.getElementById("word");
const out=document.getElementById("result");
const s1=document.getElementById("saga1");
const s2=document.getElementById("saga2");
const s3=document.getElementById("saga3");
const cnt=document.getElementById("count");

document.getElementById("go").addEventListener("click",()=>{

    const raw = inp.value.trim();
    if(!raw) return;

    // 1️⃣ Display original word in lowercase
    out.textContent = raw.toLowerCase();

    // 2️⃣ Fix space & apply syllable split (for internal calculation)
    const fixed = fixSpaceVowelRule(raw);
    const outStr = splitAndDisplay(fixed);

    let clean = outStr.replace(/\s+/g,"")
                      .replace(/--+/g,"-")
                      .replace(/^-+/, "")
                      .replace(/-+$/, "");

    s1.textContent = clean;

    const s2v = saga2Transform(clean);
    s2.textContent = s2v;

    const s3v = saga3Transform(s2v);
    s3.textContent = s3v;

    cnt.textContent = syllableCountFromSaga1(clean);
});

document.getElementById("clear").addEventListener("click",()=>{
    inp.value="";
    out.textContent="";
    s1.textContent="";
    s2.textContent="";
    s3.textContent="";
    cnt.textContent="";
    inp.focus();
});

inp.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      e.preventDefault();
      document.getElementById("go").click();
    }
});