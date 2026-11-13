
/* ---------- hosted page (GitHub Pages) ----------
   The claude.ai version gets voice, file saving, Claude rewriting and a shared
   database from window.claude. On a plain web page none of that exists, so
   this file swaps in browser equivalents where there are any. */
const REPO="https://github.com/Kalindc/moon-base-race";
const CLAUDE_VERSION="https://claude.ai/artifact/T3U7q59bmcxbcfezXhHe6i";
if(!(window.claude&&window.claude.use)){
  // Mission control voice: the browser's own speech synthesis.
  if(window.speechSynthesis&&window.SpeechSynthesisUtterance){
    tts={speak(t){return new Promise(res=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.05;u.onend=u.onerror=()=>res();speechSynthesis.speak(u)}catch(e){res()}})},
         stop(){try{speechSynthesis.cancel()}catch(e){}return Promise.resolve()}};
  }
  // Result card: a normal browser download.
  downloads={save({filename,data}){const a=document.createElement("a"),url=URL.createObjectURL(data);a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return Promise.resolve()}};
  render();
}
function hostedShare(side,readJson,isSet,say){
  const dl=(name,obj)=>downloads.save({filename:name,data:new Blob([JSON.stringify(obj,null,1)+"\n"],{type:"application/json"})});
  const note=h("input",{type:"text",id:"edNote",placeholder:"What did you change, and your source?"});
  side.append(
    h("p",{class:"note",text:"This copy of the game lives on GitHub. Your draft stays in this browser. To get a change into the game everyone plays, propose it on GitHub, where the maintainer reviews it."}),
    h("h3",{text:"Propose this stage"}),note,h("div",{style:"height:8px"}),
    h("button",{class:"btn small",onclick:async()=>{
      if(isSet){say("Proposals carry one stage. Pick a stage first, or download the whole draft below.",true);return}
      const o=readJson();if(!o)return;
      const json=JSON.stringify(o,null,1),title="Scene proposal: "+o.title;
      let url=REPO+"/issues/new?template=scene-proposal.yml&title="+encodeURIComponent(title)+"&summary="+encodeURIComponent(note.value.slice(0,500));
      const fit=[json,JSON.stringify(o)].find(j=>encodeURIComponent(j).length<6500);
      if(fit){url+="&stage="+encodeURIComponent(fit);say("Opening GitHub with your stage filled in. Sign in to GitHub and press Create.")}
      else{try{await navigator.clipboard.writeText(json);say("This stage is too long to send in a link, so it is copied. Paste it into the Stage data box on the GitHub page.")}catch(e){say("This stage is too long to send in a link. Use Download draft below and attach the file on GitHub.",true)}}
      window.open(url,"_blank","noopener")}},"Propose on GitHub"),
    h("h3",{text:"Whole draft"}),
    h("p",{class:"note",text:"Download your full draft as scenario.json to attach to a proposal or to open a pull request, or load one someone sent you."}),
    h("div",{class:"row"},
      h("button",{class:"btn ghost small",onclick:()=>{if(readJson())dl("scenario.json",draft)}},"Download draft"),
      h("label",{class:"btn ghost small",style:"margin:0;cursor:pointer"},"Load a scenario file",h("input",{type:"file",accept:".json,application/json",hidden:true,onchange:async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!validScenario(d))throw 0;draft=d;saveDraft();edSel=0;edMsg=["Loaded "+f.name+" into your draft.",false]}catch(x){edMsg=["That file is not a valid game scenario.",true]}editView()}}))),
    h("h3",{text:"Rewrite with Claude"}),
    h("p",{class:"note"},"Plain-language rewriting needs Claude, so it only works in ",h("a",{href:CLAUDE_VERSION,target:"_blank",rel:"noopener",text:"the claude.ai version of the game"}),". Here, edit the stage data by hand."));
}
