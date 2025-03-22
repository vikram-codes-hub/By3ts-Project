document.addEventListener("DOMContentLoaded", function () {
    const startTranslationButton = document.getElementById("startTranslation");
    const loadingIndicator = document.getElementById("loading");
    const audioPlayerContainer = document.getElementById("audioPlayerContainer");
    const translatedAudioPlayer = document.getElementById("translatedAudio");
    const subtitleContainer = document.getElementById("subtitleContainer");

    if (startTranslationButton && loadingIndicator && audioPlayerContainer && translatedAudioPlayer && subtitleContainer) {
        startTranslationButton.addEventListener("click", function () {
            const language = document.getElementById("language").value;

            // Show loading indicator
            loadingIndicator.style.display = "block";

            // Send translation request to the content script
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "translate", language });
            });
        });
    } else {
        console.error("One or more elements are missing in the DOM.");
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "showAudioPlayer") {
        const audioBlob = request.audioBlob;
        const audioURL = URL.createObjectURL(audioBlob);

        // Show the audio player and set its source
        const translatedAudioPlayer = document.getElementById("translatedAudio");
        const audioPlayerContainer = document.getElementById("audioPlayerContainer");
        if (translatedAudioPlayer && audioPlayerContainer) {
            translatedAudioPlayer.src = audioURL;
            audioPlayerContainer.style.display = "block";
        } else {
            console.error("Audio player or container not found.");
        }

        // Display subtitles (if available)
        if (request.subtitles) {
            displaySubtitles(request.subtitles);
        }
    }
});

// Function to display subtitles
function displaySubtitles(subtitles) {
    const subtitleContainer = document.getElementById("subtitleContainer");
    const subtitleText = document.getElementById("subtitleText");

    if (subtitleContainer && subtitleText) {
        subtitleContainer.style.display = "block"; // Show subtitle container

        // Update subtitles based on current playback time
        const translatedAudioPlayer = document.getElementById("translatedAudio");
        translatedAudioPlayer.addEventListener("timeupdate", function () {
            const currentTime = translatedAudioPlayer.currentTime;
            const currentSubtitle = subtitles.find(
                subtitle => currentTime >= subtitle.start && currentTime <= subtitle.end
            );
            if (currentSubtitle) {
                subtitleText.textContent = currentSubtitle.text;
            } else {
                subtitleText.textContent = "";
            }
        });
    } else {
        console.error("Subtitle container or text element not found.");
    }
}