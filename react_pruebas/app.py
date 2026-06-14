from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from roboflow import Roboflow

app = Flask(__name__)
CORS(app)

# ----------- CONFIGURAR ROBOFLOW -----------
API_KEY = "bIEffQon4i3YDu1Pkmpq"
WORKSPACE = "prueba1-6ybfl"
PROJECT = "melanomas-wppel"
VERSION = 2

rf = Roboflow(api_key=API_KEY)
project = rf.workspace(WORKSPACE).project(PROJECT)
model = project.version(VERSION).model

# Carpeta temporal para guardar imágenes
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ----------- RUTA PRINCIPAL -----------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "OK", "message": "API funcionando"})

# ----------- PROCESAR IMAGEN -----------
@app.route("/analizar", methods=["POST"])
def analizar():
    if "file" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    image = request.files["file"]

    # Guardar archivo temporalmente
    img_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(img_path)

    try:
        prediction = model.predict(img_path, confidence=40, overlap=30)
        data = prediction.json()
    except Exception as e:
        return jsonify({"error": "Error ejecutando el modelo", "details": str(e)}), 500

    # Formato simplificado para React
    if "predictions" in data and len(data["predictions"]) > 0:
        p = data["predictions"][0]
        response = {
            "class": p.get("class"),
            "confidence": round(p.get("confidence", 0) * 100, 2),
            "class_id": p.get("class_id"),
            "raw": data
        }
    else:
        response = {
            "class": None,
            "confidence": None,
            "class_id": None,
            "message": "No se detectó ninguna lesión."
        }

    return jsonify(response)

# ----------- INICIAR SERVIDOR -----------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
