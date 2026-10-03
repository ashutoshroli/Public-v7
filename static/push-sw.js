/* Push handlers are imported into the generated Workbox service worker. */
'use strict';
var DB='chhath-notifications', VERSION=1, STORE='items', MAX=50;
function safePath(raw,origin){
 if(typeof raw!=='string'||!raw.trim()||raw.trim().indexOf('//')===0)return '/';
 try{var u=new URL(raw.trim(),origin);if((u.protocol!=='https:'&&u.protocol!=='http:')||u.origin!==new URL(origin).origin)return '/';return u.pathname+u.search+u.hash;}catch(e){return '/';}
}
function openDb(){return new Promise(function(resolve,reject){if(typeof indexedDB==='undefined'){reject(new Error('IndexedDB unavailable'));return;}var r=indexedDB.open(DB,VERSION);r.onupgradeneeded=function(){var db=r.result;if(!db.objectStoreNames.contains(STORE)){var s=db.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});s.createIndex('receivedAt','receivedAt');}};r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error||new Error('DB open failed'));};});}
function saveItem(item){return openDb().then(function(db){return new Promise(function(resolve,reject){var tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).add(item);tx.oncomplete=function(){resolve(db);};tx.onerror=function(){reject(tx.error);};tx.onabort=function(){reject(tx.error);};});}).then(function(db){return new Promise(function(resolve){var tx=db.transaction(STORE,'readwrite'),s=tx.objectStore(STORE),q=s.count();q.onsuccess=function(){var extra=q.result-MAX;if(extra<=0){resolve();return;}var removed=0,cur=s.openCursor();cur.onsuccess=function(){var c=cur.result;if(!c||removed>=extra){resolve();return;}c.delete();removed++;c.continue();};cur.onerror=function(){resolve();};};q.onerror=function(){resolve();};});});}
function tellClients(type){return self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){list.forEach(function(client){client.postMessage({type:type});});}).catch(function(){});}
self.addEventListener('push',function(event){
 var payload={};if(event.data){try{payload=event.data.json()||{};}catch(e){try{payload={body:event.data.text()};}catch(e2){payload={};}}}
 var title=String(payload.title||'Chhath Puja'),body=String(payload.body||''),url=safePath(payload.url,self.location.origin),tag=String(payload.tag||'chhath');
 var options={body:body,icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:tag,renotify:false,data:{url:url}};
 event.waitUntil(Promise.all([
  self.registration.showNotification(title,options),
  saveItem({title:title,body:body,url:url,tag:tag,receivedAt:Date.now(),read:0}).then(function(){return tellClients('push-received');}).catch(function(){})
 ]));
});
self.addEventListener('notificationclick',function(event){
 event.notification.close();var target=safePath(event.notification.data&&event.notification.data.url,self.location.origin);
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  for(var i=0;i<list.length;i++){var client=list[i];if(new URL(client.url).origin===self.location.origin&&'navigate' in client){return client.navigate(target).then(function(c){return c&&c.focus?c.focus():undefined;});}}
  return self.clients.openWindow(target);
 }));
});
self.addEventListener('pushsubscriptionchange',function(event){
 event.waitUntil((async function(){
  try{
   var old=event.oldSubscription, key=(event.newSubscription&&event.newSubscription.options&&event.newSubscription.options.applicationServerKey)||(old&&old.options&&old.options.applicationServerKey);
   var sub=event.newSubscription||(key?await self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key}):null);
   if(!sub)return;
   var clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   clients.forEach(function(c){c.postMessage({type:'push-subscription-changed',subscription:sub.toJSON()});});
  }catch(e){}
 })());
});
