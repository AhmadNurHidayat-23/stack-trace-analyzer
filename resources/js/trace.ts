export interface Frame{index:number;file:string|null;line:number|null;call:string;kind:'file'|'internal'|'main'|'unknown';raw:string}
export interface Analysis{exception:string;message:string;root:{file:string;line:number}|null;frames:Frame[];unsupportedFrames:number;source:'PHP/Laravel';hints:string[]}
function unwrap(input:string):string{
 const start=input.indexOf('{');
 if(start>=0)try{const data=JSON.parse(input.slice(start));if(data&&typeof data.exception==='string')return data.exception;}catch{}
 return input;
}
export function analyzeTrace(input:string):Analysis{
 if(!input.trim())throw new Error('Masukkan stack trace terlebih dahulu.');
 if(input.length>1000000)throw new Error('Trace maksimal 1 MB.');
 const text=unwrap(input.trim()).replaceAll('\r\n','\n');
 const lines=text.split(/\r?\n/);const firstFrame=lines.findIndex(l=>/^\s*#\d+\s/.test(l));
 const header=(firstFrame<0?text:lines.slice(0,firstFrame).join('\n')).split(/Stack trace:|\[stacktrace\]/)[0].trim();
 const typed=header.match(/(?:Uncaught\s+)?([A-Za-z_\\][A-Za-z0-9_\\]*(?:Exception|Error)|Exception|Error)(?:\([^)]*\))?:\s*([\s\S]*)/);
 const severity=header.match(/PHP (?:Fatal error|Parse error|Warning|Notice):\s*([\s\S]*)/);
 const exception=typed?.[1]||(severity?severity[0].split(':')[0]:'Tidak teridentifikasi');
 let message=typed?.[2]||severity?.[1]||header;let root:Analysis['root']=null;
 const location=message.match(/\s+(?:in|at)\s+(.+?)(?::(\d+)|\s+on line\s+(\d+))\)?\s*$/);
 if(location){root={file:location[1],line:Number(location[2]||location[3])};message=message.slice(0,location.index).trim();}
 if(!root){const thrown=text.match(/thrown in (.+?) on line (\d+)\s*$/m);if(thrown)root={file:thrown[1],line:+thrown[2]};}
 const frames:Frame[]=[];
 for(const raw of lines){const start=raw.match(/^\s*#(\d+)\s+(.*)$/);if(!start)continue;
  if(frames.length>=2000)throw new Error('Trace maksimal 2.000 stack frame.');
  const rest=start[2],file=rest.match(/^(.+?)(?:\((\d+)\)|:(\d+)):\s*(.*)$/);
  if(file)frames.push({index:+start[1],file:file[1],line:+(file[2]||file[3]),call:file[4],kind:'file',raw});
  else if(rest.startsWith('[internal function]'))frames.push({index:+start[1],file:null,line:null,call:rest.replace(/^\[internal function\]:?\s*/,''),kind:'internal',raw});
  else if(rest.trim()==='{main}')frames.push({index:+start[1],file:null,line:null,call:'{main}',kind:'main',raw});
  else frames.push({index:+start[1],file:null,line:null,call:rest,kind:'unknown',raw});
 }
 if(exception==='Tidak teridentifikasi'&&!frames.length&&!root)throw new Error('Format belum dikenali. Gunakan trace native PHP (#0 file(line): fungsi) atau log Laravel dengan field exception.');
 const hints=['Baca pesan exception dan cocokkan file/baris yang dilaporkan dengan source code versi yang sama.','Urutan frame menunjukkan jalur pemanggilan yang tercatat, bukan bukti penyebab pasti error.'];
 if(exception.endsWith('TypeError'))hints.push('Bandingkan tipe argumen atau nilai balik dengan signature fungsi yang disebutkan.');
 if(/QueryException|PDOException/.test(exception))hints.push('Periksa kode SQLSTATE dan operasi database dalam pesan; verifikasi schema dan parameter pada lingkungan pengujian.');
 return {exception,message:message||'(Pesan tidak dicantumkan)',root,frames,unsupportedFrames:frames.filter(f=>f.kind==='unknown').length,source:'PHP/Laravel',hints};
}
const safe=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','\\|').replaceAll(String.fromCharCode(96),"'").replace(/[\r\n]+/g,' ');
export function summary(a:Analysis):string{return a.exception+': '+a.message+'\nLokasi: '+(a.root?a.root.file+':'+a.root.line:'Tidak dicantumkan')+'\nFrame: '+a.frames.length+'; format belum dikenali: '+a.unsupportedFrames;}
export function markdown(a:Analysis):string{
 return ['# Analisis stack trace','','## Informasi yang tercantum','','- Exception: '+safe(a.exception),'- Pesan: '+safe(a.message),'- Lokasi: '+(a.root?safe(a.root.file)+':'+a.root.line:'Tidak dicantumkan'),'- Frame yang belum dikenali: '+a.unsupportedFrames,'','## Urutan pemanggilan','','| Frame | File | Baris | Pemanggilan |','| --- | --- | --- | --- |',...a.frames.map(f=>'| #'+f.index+' | '+safe(f.file||'('+f.kind+')')+' | '+(f.line??'—')+' | '+safe(f.call)+' |'),'','## Langkah pemeriksaan','',...a.hints.map(h=>'- '+h),'','Analisis ini tidak menentukan penyebab pasti error. Tidak ada source code atau runtime yang diperiksa.'].join('\n');
}
