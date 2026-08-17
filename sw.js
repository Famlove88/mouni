/* مونتك — service worker (network-first, cache fallback) + إشعارات FCM */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
try{
  firebase.initializeApp({apiKey:"AIzaSyAuumq9cF5-OS_KH5r1TsiporPHBSiYPLA",authDomain:"mouni-eba45.firebaseapp.com",
    projectId:"mouni-eba45",storageBucket:"mouni-eba45.firebasestorage.app",
    messagingSenderId:"776432305618",appId:"1:776432305618:web:676673a2ba435874e4340b"});
  const messaging=firebase.messaging();
  messaging.onBackgroundMessage(p=>{
    const n=(p&&p.notification)||{};
    self.registration.showNotification(n.title||'مونتك 🧺',{
      body:n.body||'في جديد عنا — فوت شوف!',
      icon:'icon-192.png',badge:'icon-192.png',dir:'rtl',lang:'ar',
      data:{url:'./'}
    });
  });
  self.addEventListener('notificationclick',e=>{
    e.notification.close();
    e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
      for(const w of ws){if('focus' in w)return w.focus();}
      return clients.openWindow('./');
    }));
  });
}catch(e){}

const C = 'mountak-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(C).then(c => c.put(e.request, cp)).catch(() => {});
      return r;
    }).catch(() =>
      caches.match(e.request).then(m => m || caches.match('./index.html'))
    )
  );
});
