import './style.css';import './theme';
import {analyzeTrace,summary,markdown,type Analysis} from './trace';import {readFile,copy,download,message} from './io';
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
let analysis:Analysis|null=null;
function status(text:string){el('status').hidden=false;el('status').textContent=text;}
function node(tag:string,text:string,cls=''){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function frames(){const body=el('frames');body.replaceChildren();if(!analysis)return;const query=el<HTMLInputElement>('search').value.toLowerCase();const rows=analysis.frames.filter(f=>[f.index,f.file,f.line,f.call].join(' ').toLowerCase().includes(query));el('count').textContent=rows.length+' / '+analysis.frames.length+' FRAME';
 const first=analysis.frames.find(f=>f.file&&!/[\\/]vendor[\\/]/i.test(f.file));
 for(const f of rows){const tr=document.createElement('tr');if(f===first||f.file&&f.file===analysis.root?.file)tr.className='trace-highlight';tr.append(node('td','#'+f.index),node('td',f.file?f.file+':'+f.line:'('+f.kind+')','mono'),node('td',f.call));body.append(tr);}
}
function render(){const result=el('result');result.replaceChildren();if(!analysis)return;result.append(node('h3',analysis.exception),node('p',analysis.message,'text-content'));const root=node('div',analysis.root?analysis.root.file+':'+analysis.root.line:'Lokasi exception tidak dicantumkan.','status mono');result.append(node('h3','Lokasi yang dilaporkan'),root,node('h3','Langkah pemeriksaan'));for(const h of analysis.hints)result.append(node('p',h));if(analysis.unsupportedFrames)result.append(node('p',analysis.unsupportedFrames+' frame belum dapat diparse. Pemanggilan mentah tetap ditampilkan.','status'));frames();}
function parse(){try{analysis=analyzeTrace(el<HTMLTextAreaElement>('source').value);render();el<HTMLButtonElement>('copy').disabled=false;el<HTMLButtonElement>('export').disabled=false;status('Trace dianalisis. Highlight menunjukkan lokasi yang dilaporkan dan frame aplikasi pertama, bukan penetapan penyebab pasti.');}catch(e){analysis=null;el('result').replaceChildren();el('frames').replaceChildren();el('count').textContent='0 FRAME';el<HTMLButtonElement>('copy').disabled=true;el<HTMLButtonElement>('export').disabled=true;status(message(e));}}
el('trace-form').addEventListener('submit',e=>{e.preventDefault();parse();});
el<HTMLInputElement>('file').addEventListener('change',async e=>{try{el<HTMLTextAreaElement>('source').value=await readFile((e.target as HTMLInputElement).files?.[0]);parse();}catch(err){status(message(err));}(e.target as HTMLInputElement).value='';});
el('search').addEventListener('input',frames);
el('copy').addEventListener('click',()=>{if(analysis)copy(summary(analysis)).then(()=>status('Ringkasan disalin.')).catch(e=>status(message(e)));});
el('export').addEventListener('click',()=>{if(analysis)download('stack-trace-report.md',markdown(analysis),'text/markdown');});
el('clear').addEventListener('click',()=>{analysis=null;el<HTMLTextAreaElement>('source').value='';el<HTMLInputElement>('search').value='';el('result').replaceChildren();el('frames').replaceChildren();el('count').textContent='0 FRAME';el<HTMLButtonElement>('copy').disabled=true;el<HTMLButtonElement>('export').disabled=true;status('Input dan hasil dibersihkan.');});
