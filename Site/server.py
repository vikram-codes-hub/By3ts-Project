from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import whisper
from googletrans import Translator
from gtts import gTTS
from moviepy import VideoFileClip

app = Flask(__name__)
# Added CORS support
CORS(app)

# Directory to store uploaded videos
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["CURRENT_VIDEO_PATH"] = None  # Track the current video path

# Supported languages
LANGUAGE_CODES = {"hindi": "hi", "french": "fr", "english": "en"}

# Endpoint to handle video uploads
@app.route("/upload", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file uploaded"}), 400

    video_file = request.files["video"]
    if video_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save the video file
    video_path = os.path.join(app.config["UPLOAD_FOLDER"], "uploaded_video.mp4")
    video_file.save(video_path)
    
    # Store the path for later use
    app.config["CURRENT_VIDEO_PATH"] = video_path

    return jsonify({"message": "Video uploaded successfully", "video_path": video_path}), 200

# Endpoint to handle translation requests
@app.route("/translate", methods=["POST"])
def translate_video():
    try:
        data = request.json
        language = data.get("language", "hindi").lower()
        language_code = LANGUAGE_CODES.get(language, "hi")

        # Get the video path from the app config
        video_path = app.config.get("CURRENT_VIDEO_PATH")
        if not video_path or not os.path.exists(video_path):
            return jsonify({"error": "No video available for translation"}), 400

        # Extract audio from video using moviepy
        audio_path = os.path.join(app.config["UPLOAD_FOLDER"], "extracted_audio.wav")
        video_clip = VideoFileClip(video_path)
        video_clip.audio.write_audiofile(audio_path)
        video_clip.close()  # Close the video clip to avoid file lock issues

        # Transcribe audio using Whisper
        model = whisper.load_model("tiny")
        result = model.transcribe(audio_path)
        transcribed_text = result["text"]

        # Translate text
        translator = Translator()
        translated_text = translator.translate(transcribed_text, dest=language_code).text

        # Generate subtitles from the transcribed segments
        subtitles = []
        for segment in result["segments"]:
            start_time = segment["start"]
            end_time = segment["end"]
            text = segment["text"]
            translated_segment = translator.translate(text, dest=language_code).text
            subtitles.append({
                "start": start_time,
                "end": end_time,
                "text": translated_segment  # Translated subtitle text
            })

        # Convert translated text to speech
        tts = gTTS(text=translated_text, lang=language_code, slow=False)
        output_audio_file = os.path.join(app.config["UPLOAD_FOLDER"], f"translated_audio_{language_code}.mp3")
        tts.save(output_audio_file)

        # Send translated audio and subtitles back to frontend
        with open(output_audio_file, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode("utf-8")

        return jsonify({
            "translated_text": translated_text,
            "translated_audio": audio_base64,
            "subtitles": subtitles  # Include subtitles in the response
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Starting the app
if __name__ == "__main__":
    print("Server starting on http://localhost:5001")
    # Run the Flask app without SocketIO
    app.run(debug=True, host="0.0.0.0", port=5001)