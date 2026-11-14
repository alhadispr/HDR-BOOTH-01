const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {execFile}=require('node:child_process'); const Database=require('better-sqlite3'); let db;
function init(){const dir=path.join(app.getPath('userData'),'data');fs.mkdirSync(dir,{recursive:true});db=new Database(path.join(dir,'hdr-booth.sqlite'));db.pragma('journal_mode=WAL');db.exec(`
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,name TEXT NOT NULL,client TEXT,date TEXT,status TEXT DEFAULT 'Aktif',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(id INTEGER PRIMARY KEY,event_id INTEGER,guest_name TEXT,photo_count INTEGER DEFAULT 0,status TEXT DEFAULT 'Selesai',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS photos(id INTEGER PRIMARY KEY,event_id INTEGER,session_id INTEGER,file_path TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS layouts(id INTEGER PRIMARY KEY,name TEXT NOT NULL,width INTEGER DEFAULT 1200,height INTEGER DEFAULT 1800,config TEXT DEFAULT '{}');
CREATE TABLE IF NOT EXISTS vouchers(id INTEGER PRIMARY KEY,code TEXT UNIQUE,amount REAL DEFAULT 0,uses_left INTEGER DEFAULT 1,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT);`)}
const all=(sql,p=[])=>db.prepare(sql).all(...p),run=(sql,p=[])=>db.prepare(sql).run(...p);
function win(){const w=new BrowserWindow({width:1440,height:920,minWidth:1080,minHeight:700,backgroundColor:'#08111f',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});w.loadFile(path.join(__dirname,'src/index.html'))}
app.whenReady().then(()=>{init();win();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)win()})});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('app:info',()=>({version:app.getVersion(),platform:process.platform,computer:os.hostname()}));
ipcMain.handle('events:list',()=>all('SELECT * FROM events ORDER BY id DESC'));
ipcMain.handle('events:add',(_,e)=>({id:run('INSERT INTO events(name,client,date,status) VALUES(?,?,?,?)',[e.name,e.client||'',e.date||'',e.status||'Aktif']).lastInsertRowid}));
ipcMain.handle('sessions:list',(_,id)=>all('SELECT * FROM sessions WHERE event_id=? ORDER BY id DESC',[id]));
ipcMain.handle('sessions:add',(_,s)=>({id:run('INSERT INTO sessions(event_id,guest_name,photo_count) VALUES(?,?,?)',[s.event_id,s.guest_name||'',s.photo_count||0]).lastInsertRowid}));
ipcMain.handle('photos:list',()=>all('SELECT * FROM photos ORDER BY id DESC LIMIT 500'));
ipcMain.handle('layouts:list',()=>all('SELECT * FROM layouts ORDER BY id DESC'));
ipcMain.handle('layouts:add',(_,l)=>({id:run('INSERT INTO layouts(name,width,height,config) VALUES(?,?,?,?)',[l.name,l.width||1200,l.height||1800,JSON.stringify(l.config||{})]).lastInsertRowid}));
ipcMain.handle('vouchers:list',()=>all('SELECT * FROM vouchers ORDER BY id DESC'));
ipcMain.handle('vouchers:add',(_,v)=>({id:run('INSERT INTO vouchers(code,amount,uses_left) VALUES(?,?,?)',[v.code,v.amount||0,v.uses_left||1]).lastInsertRowid}));
ipcMain.handle('settings:get',()=>Object.fromEntries(all('SELECT key,value FROM settings').map(x=>[x.key,x.value])));
ipcMain.handle('settings:set',(_,o)=>{const s=db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');for(const [k,v] of Object.entries(o))s.run(k,String(v));return true});
ipcMain.handle('camera:discover',()=>new Promise(resolve=>execFile('powershell.exe',['-NoProfile','-Command',`Get-PnpDevice -PresentOnly | Where-Object {$_.FriendlyName -match 'Canon|EOS|Digital Camera'} | Select-Object Status,Class,FriendlyName,InstanceId | ConvertTo-Json -Compress`],{windowsHide:true,timeout:12000},(err,out,stderr)=>{if(err)return resolve({ok:false,devices:[],message:(stderr||err.message).trim()});try{let d=JSON.parse(out.trim()||'[]');resolve({ok:true,devices:Array.isArray(d)?d:(d?[d]:[]),message:'Pemeriksaan Windows selesai'})}catch{resolve({ok:true,devices:[],message:'Tidak ada perangkat Canon terdeteksi'})}})));
ipcMain.handle('dialog:folder',async()=>{const r=await dialog.showOpenDialog({properties:['openDirectory','createDirectory']});return r.canceled?null:r.filePaths[0]});
ipcMain.handle('shell:open',(_,p)=>shell.openPath(p));
