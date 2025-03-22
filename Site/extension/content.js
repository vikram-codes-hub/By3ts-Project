let videoPlayer = null;
let translatedAudioPlayer = null;
let subtitleContainer = null;

// Find the video element on the page
videoPlayer = document.querySelector("video");

if (videoPlayer) {
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translate") {
            const language = request.language;

            // Extract the video URL
            const videoURL = videoPlayer.src;

            // Show loading indicator
            const loadingIndicator = document.createElement("div");
            loadingIndicator.textContent = "Translating... Please wait.";
            loadingIndicator.style.position = "fixed";
            loadingIndicator.style.top = "10px";
            loadingIndicator.style.left = "10px";
            loadingIndicator.style.backgroundColor = "#201636"; // Dark purple background
            loadingIndicator.style.color = "#ffffff"; // White text
            loadingIndicator.style.padding = "10px";
            loadingIndicator.style.border = "1px solid #4CAF50"; // Green border
            loadingIndicator.style.borderRadius = "5px"; // Rounded corners
            loadingIndicator.style.zIndex = "1000"; // Ensure it's on top
            document.body.appendChild(loadingIndicator);

            // Send the video to the backend for translation
            fetch("http://localhost:5001/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoURL, language }),
            })
            .then((response) => response.json())
            .then((data) => {
                // Remove loading indicator
                document.body.removeChild(loadingIndicator);

                // Convert base64 audio to a Blob
                const binaryString = atob(data.translated_audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const audioBlob = new Blob([bytes], { type: "audio/mpeg" });
                const audioURL = URL.createObjectURL(audioBlob);

                // Create an audio element and inject it into the webpage
                translatedAudioPlayer = new Audio(audioURL);
                translatedAudioPlayer.style.display = "none"; // Hide the audio element
                document.body.appendChild(translatedAudioPlayer);

                // Sync video playback with translated audio
                translatedAudioPlayer.addEventListener("play", function () {
                    if (videoPlayer.paused) {
                        videoPlayer.play().catch(error => console.log("Video play error:", error));
                    }
                });

                translatedAudioPlayer.addEventListener("pause", function () {
                    if (!videoPlayer.paused) {
                        videoPlayer.pause();
                    }
                });

                translatedAudioPlayer.addEventListener("seeked", function () {
                    videoPlayer.currentTime = translatedAudioPlayer.currentTime;
                });

                // Sync video events with translated audio
                videoPlayer.addEventListener("play", function () {
                    if (translatedAudioPlayer.paused) {
                        translatedAudioPlayer.play().catch(error => console.log("Audio play error:", error));
                    }
                });

                videoPlayer.addEventListener("pause", function () {
                    if (!translatedAudioPlayer.paused) {
                        translatedAudioPlayer.pause();
                    }
                });

                videoPlayer.addEventListener("seeked", function () {
                    translatedAudioPlayer.currentTime = videoPlayer.currentTime;
                });

                // Start playing the translated audio and video
                translatedAudioPlayer.play();
                videoPlayer.muted = true; // Mute the original video audio

                // Show a success message
                const successMessage = document.createElement("div");
                successMessage.textContent = "Translation complete! Playing translated audio.";
                successMessage.style.position = "fixed";
                successMessage.style.top = "10px";
                successMessage.style.left = "10px";
                successMessage.style.backgroundColor = "#201636"; // Dark purple background
                successMessage.style.color = "#ffffff"; // White text
                successMessage.style.padding = "10px";
                successMessage.style.border = "1px solid #4CAF50"; // Green border
                successMessage.style.borderRadius = "5px"; // Rounded corners
                successMessage.style.zIndex = "1000";
                document.body.appendChild(successMessage);

                // Remove the success message after a few seconds
                setTimeout(() => {
                    document.body.removeChild(successMessage);
                }, 3000);

                // Display subtitles (if available)
                if (data.subtitles) {
                    displaySubtitles(data.subtitles);
                }
            })
            .catch((error) => {
                console.error("Translation error:", error);

                // Remove loading indicator
                document.body.removeChild(loadingIndicator);

                // Show an error message
                const errorMessage = document.createElement("div");
                errorMessage.textContent = "Translation failed. Please try again.";
                errorMessage.style.position = "fixed";
                errorMessage.style.top = "10px";
                errorMessage.style.left = "10px";
                errorMessage.style.backgroundColor = "#201636"; // Dark purple background
                errorMessage.style.color = "#ffffff"; // White text
                errorMessage.style.padding = "10px";
                errorMessage.style.border = "1px solid #ff0000"; // Red border for error
                errorMessage.style.borderRadius = "5px"; // Rounded corners
                errorMessage.style.zIndex = "1000";
                document.body.appendChild(errorMessage);

                // Remove the error message after a few seconds
                setTimeout(() => {
                    document.body.removeChild(errorMessage);
                }, 3000);
            });
        }
    });
} else {
    console.log("No video found on the page.");
}

// Function to display subtitles
function displaySubtitles(subtitles) {
    // Create a subtitle container
    subtitleContainer = document.createElement("div");
    subtitleContainer.id = "subtitleContainer";
    subtitleContainer.style.position = "fixed";
    subtitleContainer.style.bottom = "20px"; // Position at the bottom
    subtitleContainer.style.left = "50%";
    subtitleContainer.style.transform = "translateX(-50%)"; // Center horizontally
    subtitleContainer.style.backgroundColor = "#201636"; // Dark purple background
    subtitleContainer.style.color = "#ffffff"; // White text
    subtitleContainer.style.padding = "10px";
    subtitleContainer.style.borderRadius = "5px"; // Rounded corners
    subtitleContainer.style.zIndex = "1000"; // Ensure it's on top
    subtitleContainer.style.textAlign = "center"; // Center text
    document.body.appendChild(subtitleContainer);

    // Update subtitles based on current playback time
    translatedAudioPlayer.addEventListener("timeupdate", function () {
        const currentTime = translatedAudioPlayer.currentTime;
        const currentSubtitle = subtitles.find(
            subtitle => currentTime >= subtitle.start && currentTime <= subtitle.end
        );
        if (currentSubtitle) {
            subtitleContainer.textContent = currentSubtitle.text;
        } else {
            subtitleContainer.textContent = "";
        }
    });
}