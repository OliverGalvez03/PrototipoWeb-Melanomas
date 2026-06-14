from flask import Flask, render_template, request, jsonify
from model import model
import os

app = Flask(__name__)

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    image = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    # Ejecutar modelo Roboflow (YOLOv8)
    prediction = model.predict(image_path, confidence=40, overlap=30)
    result = prediction.json()

    # Puedes imprimir para ver en consola:
    print(result)

    return render_template(
        "result.html",
        image_path=image_path,
        result=result
    )

@app.route("/api/predict", methods=["POST"])
def api_predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    image = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    try:
        # Ejecutar modelo Roboflow (YOLOv8)
        prediction = model.predict(image_path, confidence=40, overlap=30)
        result = prediction.json()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)