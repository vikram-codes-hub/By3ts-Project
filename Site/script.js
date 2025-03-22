let videoPlayer = null;
let translatedAudioPlayer = null;

document.addEventListener("DOMContentLoaded", function() {
    videoPlayer = document.getElementById("videoPlayer");
    translatedAudioPlayer = document.getElementById("translatedAudio");

    // Sync video playback with translated audio
    translatedAudioPlayer.addEventListener("play", function() {
        if (videoPlayer.paused) {
            videoPlayer.play().catch(error => console.log("Video play error:", error));
        }
    });

    // Sync video pause with translated audio
    translatedAudioPlayer.addEventListener("pause", function() {
        if (!videoPlayer.paused) {
            videoPlayer.pause();
        }
    });

    // Sync video seek with translated audio
    translatedAudioPlayer.addEventListener("seeked", function() {
        videoPlayer.currentTime = translatedAudioPlayer.currentTime;
    });
});

// When a new video is selected
document.getElementById("videoInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        // Reset previous audio
        translatedAudioPlayer.src = "";
        document.getElementById("audioPlayerContainer").style.display = "none";
        
        // Show new video immediately
        const videoURL = URL.createObjectURL(file);
        videoPlayer.src = videoURL;
        videoPlayer.style.display = "block";
    }
});

// Upload video to server
document.getElementById("uploadVideo").addEventListener("click", function () {
    const fileInput = document.getElementById("videoInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a video file first.");
        return;
    }

    document.getElementById("loading").style.display = "block";
    const formData = new FormData();
    formData.append("video", file);

    fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Upload success:", data);
        document.getElementById("translationStatus").textContent = "Video uploaded successfully!";
        videoPlayer.style.display = "block"; // Ensure video stays visible
    })
    .catch((error) => {
        console.error("Upload error:", error);
        document.getElementById("translationStatus").textContent = "Upload failed. Please try again.";
    })
    .finally(() => {
        document.getElementById("loading").style.display = "none";
    });
});

// Translate video
document.getElementById("startTranslation").addEventListener("click", function () {
    const language = document.getElementById("language").value;
    
    if (!videoPlayer.src) {
        alert("Please upload a video first.");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("translationStatus").textContent = "Translating...";

    fetch("http://localhost:5001/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
    })
    .then((response) => response.json())
    .then((data) => {
        // Show translated audio player
        const audioBlob = new Blob(
            [Uint8Array.from(atob(data.translated_audio), c => c.charCodeAt(0))],
            { type: "audio/mpeg" }
        );
        translatedAudioPlayer.src = URL.createObjectURL(audioBlob);
        document.getElementById("audioPlayerContainer").style.display = "block";

        // Mute original video audio
        videoPlayer.muted = document.getElementById("muteOriginal").checked;
        
        document.getElementById("translationStatus").textContent = "Translation complete!";
    })
    .catch((error) => {
        console.error("Translation error:", error);
        document.getElementById("translationStatus").textContent = "Translation failed. Please try again.";
    })
    .finally(() => {
        document.getElementById("loading").style.display = "none";
    });
});

// Mute checkbox handler
document.getElementById("muteOriginal").addEventListener("change", function() {
    videoPlayer.muted = this.checked;
});