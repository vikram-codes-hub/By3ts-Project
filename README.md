# Spiko - Real-Time Translation Extension for Online Learning

Spiko is a **real-time video audio translation browser extension** designed to break language barriers in online learning. It captures video audio, translates it into the user's preferred language, and provides live subtitles and voice translation. Spiko enhances accessibility and engagement for global audiences, making online education more inclusive.

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Proposed Solution](#proposed-solution)
3. [Features](#features)
4. [Technical Implementation](#technical-implementation)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Team](#team)
8. Conclusion (#Conclusion)


---

## Problem Statement
Millions of people watch online videos daily, but language barriers limit access to content. Subtitles are often unavailable, inaccurate, or difficult to follow. Existing solutions lack real-time voice translation, making content less engaging for non-native speakers.

### Impact of the Problem
- Limited access to global educational, entertainment, and informational videos.
- Reduced engagement for users who struggle with foreign languages.
- Missed opportunities for creators to reach a wider audience.

---

## Proposed Solution
**Spiko** is a browser extension that:
- Captures video audio from any website.
- Uses AI-powered **Speech-to-Text**, **Translation**, and **Text-to-Speech**.
- Provides live voice translation in the user’s preferred language and subtitles.
- Enhances accessibility and engagement for global audiences.

---

## Features
- **Real-Time Voice Translation**: Translates video audio in real-time (only server wait time).
- **Multiple Language Support**: Supports a wide range of languages.
- **Real-Time Captions**: Displays subtitles in the selected language.
- **Play/Pause Functionality**: Pauses translation when the video is paused.
- **Multi-Platform Support**: Works on various platforms.

---

## Technical Implementation
Spiko is built using the following technologies:

1. **Capture Video Audio**:
   - The **Web Audio API** extracts audio from online videos and sends it to the backend.

2. **Speech-to-Text**:
   - The **Flask** server receives the audio and uses **OpenAI’s Whisper AI** to convert speech to text.

3. **Text Translation**:
   - The detected text is translated into the user’s preferred language using the **Google Translate API**.

4. **Text-to-Speech**:
   - The translated text is converted into speech using **gTTS** and sent back to the frontend.

5. **Play Translated Audio**:
   - The frontend (built with **React**) receives the translated speech and plays it in sync with the video.

---

## Installation
To install and run Spiko locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/spiko.git
   cd spiko

2. **Install Dependencies**
   Install the required Dependencies

3. **Run the Python Server**
   ```bash
   python server.py

4. **Run the WebSite in your local system**
5. **Uplaod the video file and load the extension tab**
6. **Click on Translate button and wait for some time**

## Usage
- Open any video on a supported platform.
- Click the Spiko extension icon.
- Select your preferred language.
- Enjoy real-time translation and subtitles!

## Team
- Veer Jain
- Vijay Kant
- Ritik Raj
- Vikram Singh Gangwar

## Conclusion
Spiko eliminates language barriers, making online education accessible to everyone, everywhere. By combining AI-driven speech-to-text, translation, and accessibility tools, we provide a seamless learning experience for millions of users.
