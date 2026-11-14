const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('hdr',{
 info:()=>ipcRenderer.invoke('app:info'),
 events:{list:()=>ipcRenderer.invoke('events:list'),add:x=>ipcRenderer.invoke('events:add',x)},
 sessions:{list:id=>ipcRenderer.invoke('sessions:list',id),add:x=>ipcRenderer.invoke('sessions:add',x)},
 photos:{list:()=>ipcRenderer.invoke('photos:list')},
 layouts:{list:()=>ipcRenderer.invoke('layouts:list'),add:x=>ipcRenderer.invoke('layouts:add',x)},
 vouchers:{list:()=>ipcRenderer.invoke('vouchers:list'),add:x=>ipcRenderer.invoke('vouchers:add',x)},
 settings:{get:()=>ipcRenderer.invoke('settings:get'),set:x=>ipcRenderer.invoke('settings:set',x)},
 camera:{discover:()=>ipcRenderer.invoke('camera:discover')},chooseFolder:()=>ipcRenderer.invoke('dialog:folder'),openPath:p=>ipcRenderer.invoke('shell:open',p)
});
