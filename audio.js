async function playSaga3Audio() {
let text = document.getElementById("saga3").innerText;
if (!text) return;

let words = text  
    .split(/\s+/)  
    .filter(w => w.trim() !== "");    

let finalPieces = [];    

words.forEach((word, wIndex) => {  
    word = word.replace(/\s+/g, "-");  

    // Find all star indexes in the word  
    let starIndexes = [];  
    for(let i = 0; i < word.length; i++) {  
        if(word[i] === "*") starIndexes.push(i);  
    }  

    // split by - and *  
    let partsRaw = word.split(/[-*]/).filter(p => p.trim() !== "");  

    partsRaw.forEach((piece, i) => {  
        let cleaned = piece.replace(/[!?;:"]/g, "").trim();  

        if (cleaned.endsWith(".-.")) cleaned = cleaned.slice(0, -3) + "..";  

        // Determine if current part is immediately before any star  
        let isBeforeStar = false;  

        for (const starIndex of starIndexes) {  
            let before = word.substring(0, starIndex);  
            let countBefore = before.split(/[-*]/)  
                .filter(p => p.trim() !== "").length;  

            if (i === countBefore - 1) {  
                isBeforeStar = true;  
                break;  
            }  
        }  

        // Apply rules  
        if(isBeforeStar){  
            if (!cleaned.startsWith("-")) cleaned = "-" + cleaned;  
        }  
        else if (i === 0 && wIndex > 0) {  
            cleaned = cleaned.replace(/^-+/, "");    
            if (!cleaned.endsWith("-")) cleaned += "-";  
        }   
        else if (i === 0 && wIndex === 0) {  
            if (!cleaned.endsWith("-")) cleaned += "-";  
        }   
        else if (i === partsRaw.length - 1) {  
            if (!cleaned.startsWith("-")) cleaned = "-" + cleaned;  
        }   
        else {  
            if (!cleaned.startsWith("-")) cleaned = "-" + cleaned;  
            if (!cleaned.endsWith("-")) cleaned += "-";  
        }  

        finalPieces.push(cleaned);  
    });  
});  

// URL build based on rules  
let urls = finalPieces.map(p => {  

    if(p.endsWith(".-.")) p = p.slice(0, -3);  
    if(p.endsWith(".-")) p = p.slice(0, -2) + "-";  
    if(p.endsWith("."))  p = p.slice(0, -1);  

    let starts = p.startsWith("-");  
    let ends   = p.endsWith("-");  

    let folder = "";  

    if(!starts && ends){  
        folder = "sa";     
    }  
    else if(starts && ends){  
        folder = "se";     
    }  
    else if(starts && !ends){  
        folder = "si";     
    }  
    else {  
        folder = "si";  
    }  

    return folder + "/" + p + ".ogg";  
});  

const fileNameArea = document.getElementById("audioFileNames");    
if (fileNameArea) fileNameArea.value = urls.join("\n");    

await mergeAndPlay(urls);

}

async function mergeAndPlay(urls) {  
  if (!urls.length) return;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  let buffers = [];

  for (let url of urls) {
    try {
      let res = await fetch(url);
      let arr = await res.arrayBuffer();
      let buf = await ctx.decodeAudioData(arr);
      buffers.push(buf);
    } catch (e) {
      console.warn("Missing:", url);
    }
  }

  if (!buffers.length) return;

  const crossFadeTime = 0.03; // 40ms smooth
  const sr = buffers[0].sampleRate;
  const fadeSamples = Math.floor(sr * crossFadeTime);

  let totalLength = buffers.reduce((s,b)=>s+b.length,0) 
                    - fadeSamples * (buffers.length - 1);

  let output = ctx.createBuffer(
    buffers[0].numberOfChannels,
    totalLength,
    sr
  );

  let offset = 0;

  for (let i = 0; i < buffers.length; i++) {
    let buf = buffers[i];

    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      let out = output.getChannelData(ch);
      let data = buf.getChannelData(ch);

      for (let j = 0; j < data.length; j++) {
        let pos = offset + j;

        if (i > 0 && j < fadeSamples) {
          let fadeIn = j / fadeSamples;
          let fadeOut = 1 - fadeIn;
          out[pos] = out[pos] * fadeOut + data[j] * fadeIn;
        } else {
          out[pos] = data[j];
        }
      }
    }

    offset += buf.length - fadeSamples;
  }

  // Audio source
  let source = ctx.createBufferSource();
  source.buffer = output;

  // 🔑 Pitch unify
  source.playbackRate.value = 1.0; // speed normal
  source.detune.value = 200;         // pitch same for all phonemes

  // simple smoothing gain
  let gain = ctx.createGain();
  gain.gain.value = 3.5;

  source.connect(gain).connect(ctx.destination);
  source.start();
}