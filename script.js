document.addEventListener('DOMContentLoaded', () => {

    // --- PENTING: PUSAT KUSTOMISASI ASET ---
    // Semua path sekarang sudah benar mengarah ke folder /media/ Anda.
    // Pastikan nama file Anda sama persis dengan yang tertulis di sini.
    const config = {
        lockscreenImage: 'media/photos/FOTO_LOCKSCREEN.jpg',
        mapImage: 'media/maps/PETA_BANYUWANGI.png',
        widgetPhoto: 'media/photos/FOTO_WIDGET.jpg',
        // --- PERUBAHAN DI SINI ---
        widgetVideo: 'media/videos/VIDEO_WIDGET.mp4', // Diubah dari online ke lokal
        albumPhotos: [
            'media/photos/ALBUM_FOTO_1.jpg', 'media/photos/ALBUM_FOTO_2.jpg',
            'media/photos/ALBUM_FOTO_3.jpg', 'media/photos/ALBUM_FOTO_4.jpg',
            'media/photos/ALBUM_FOTO_5.jpg', 'media/photos/ALBUM_FOTO_6.jpg',
            'media/photos/ALBUM_FOTO_7.jpg', 'media/photos/ALBUM_FOTO_8.jpg',
            'media/photos/ALBUM_FOTO_9.jpg', 'media/photos/ALBUM_FOTO_10.jpg'
        ],
        // --- DAN PERUBAHAN DI SINI ---
        backgroundMusic: 'media/audio/LAGU_KITA.mp3', // Diubah dari online ke lokal
        voiceNotes: [
            'media/audio/PESAN_SUARA_1.mp3',
            'media/audio/PESAN_SUARA_2.mp3',
            'media/audio/PESAN_SUARA_3.mp3'
        ],
        mainVideo: 'media/videos/VIDEO_PANJANG.mp4'
    };
    // ---------------------------------------------

    // Fungsi untuk memuat semua aset dari konfigurasi
    function loadAssets() {
        document.getElementById('lockscreen').style.backgroundImage = `url('${config.lockscreenImage}')`;
        document.getElementById('map-container').style.backgroundImage = `url('${config.mapImage}')`;
        document.getElementById('widget-photo').src = config.widgetPhoto;
        document.getElementById('widget-video').src = config.widgetVideo;
        
        const albumContainer = document.getElementById('photo-album');
        if (albumContainer) {
            albumContainer.innerHTML = '';
            config.albumPhotos.forEach(photoUrl => {
                albumContainer.innerHTML += `<img src="${photoUrl}" alt="Foto Kenangan">`;
            });
        }

        document.getElementById('bg-music').src = config.backgroundMusic;
        document.getElementById('voice1').src = config.voiceNotes[0];
        document.getElementById('voice2').src = config.voiceNotes[1];
        document.getElementById('voice3').src = config.voiceNotes[2];
        
        const mainVideoPlayer = document.querySelector('#page-video-main video');
        if (mainVideoPlayer) {
            const sourceElement = mainVideoPlayer.querySelector('source');
            if(sourceElement) {
                sourceElement.src = config.mainVideo;
            } else {
                mainVideoPlayer.src = config.mainVideo;
            }
            mainVideoPlayer.load();
        }
    }

    // Fungsi untuk mengupdate jam
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const homescreenTime = document.getElementById('homescreen-time');
        if(homescreenTime) homescreenTime.innerText = timeString;
    }

    // Menambahkan event listener ke lockscreen
    const lockscreenElement = document.getElementById('lockscreen');
    if (lockscreenElement) {
        lockscreenElement.addEventListener('click', unlockScreen);
    }

    // Jalankan fungsi saat halaman dimuat
    loadAssets();
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set jam statis saat pertama kali dibuka untuk efek dramatis
    document.getElementById('lockscreen-clock').innerText = '00:01';
    document.getElementById('homescreen-time').innerText = '00:01';
    document.getElementById('lockscreen-date').innerText = 'Jumat, 1 Agustus';
});

// Variabel global untuk mengelola state audio
const bgMusic = document.getElementById('bg-music');
let musicWasPlaying = false;

// Fungsi untuk membuka HP
function unlockScreen() {
    const lockscreen = document.getElementById('lockscreen');
    const homescreen = document.getElementById('homescreen');
    const dynamicIsland = document.getElementById('dynamic-island');
    
    bgMusic.play().catch(error => console.error("Autoplay dicegah:", error));
    lockscreen.style.opacity = '0';
    setTimeout(() => { lockscreen.style.display = 'none'; }, 1000);
    
    homescreen.style.display = 'block';
    homescreen.style.animation = 'fadeIn 1s';

    bgMusic.onplaying = () => { 
        dynamicIsland.classList.add('playing');
        musicWasPlaying = true;
    };
    bgMusic.onpause = () => {
        if (musicWasPlaying) {
             dynamicIsland.classList.remove('playing');
        }
    };
}

// Fungsi navigasi aplikasi
function openApp(pageId) { 
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'page-video-main') {
        if (!bgMusic.paused) {
            bgMusic.pause();
            musicWasPlaying = true;
        }
    }
}

function closeApp(pageId) { 
    document.getElementById(pageId).classList.remove('active');

    if (pageId === 'page-video-main') {
        const mainVideoPlayer = document.querySelector('#page-video-main video');
        if(mainVideoPlayer) {
            mainVideoPlayer.pause();
            mainVideoPlayer.currentTime = 0;
        }
        if (musicWasPlaying) {
            bgMusic.play();
        }
    }
}

// Logika Pesan Suara dengan kontrol musik latar
let currentVoice = null; 
let currentPlayBtn = null;
function playVoiceMemo(btn, voiceId) {
    const audio = document.getElementById(voiceId);
    
    document.querySelectorAll('audio').forEach(a => { 
        if(a !== audio && a.id !== 'bg-music') {
            a.pause();
            a.currentTime = 0;
        }
    });

    if (currentVoice && currentVoice !== audio && currentPlayBtn) { 
        currentPlayBtn.innerText = '▶'; 
    }

    if (audio.paused) {
        if (!bgMusic.paused) {
            bgMusic.pause();
            musicWasPlaying = true;
        }
        audio.play();
        btn.innerText = '⏸️';
        currentVoice = audio;
        currentPlayBtn = btn;
    } else {
        audio.pause();
        btn.innerText = '▶';
        currentVoice = null;
        currentPlayBtn = null;
        if (musicWasPlaying) {
            bgMusic.play();
        }
    }

    audio.onended = () => {
        btn.innerText = '▶';
        if (musicWasPlaying) {
            bgMusic.play();
        }
    };
}

// Logika Modal Peta
const mapModal = document.getElementById('mapModal');
function showMapMemory(title, text) {
    document.getElementById('mapModalTitle').innerText = title;
    document.getElementById('mapModalText').innerText = text;
    mapModal.classList.add('active');
}
function closeMapModal() { mapModal.classList.remove('active'); }
