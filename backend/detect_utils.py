import torch
from ultralytics import YOLO
from pathlib import Path
from PIL import Image
import io
import base64
import os
import requests

# ✅ Load models once
SOIL_MODEL_PATH = Path("models/yolo_soil_seg_best.pt")
VEG_MODEL_PATH = Path("models/best.pt")

soil_model = YOLO(SOIL_MODEL_PATH)
veg_model = YOLO(VEG_MODEL_PATH)

# ✅ Output folder
OUTPUT_DIR = Path("predictions")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_image(image_input):
    """
    Accepts either:
      - bytes (from UploadFile)
      - URL (string starting with http)
    Returns: PIL.Image (RGB, resized to 640x640)
    """
    try:
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")

        elif isinstance(image_input, str) and image_input.startswith(("http://", "https://")):
            response = requests.get(image_input, timeout=10)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content)).convert("RGB")

        else:
            raise ValueError("Invalid image input. Provide image bytes or a valid image URL.")

        # ✅ Resize to 640x640 before prediction
        image = image.resize((640, 640))
        return image

    except Exception as e:
        raise ValueError(f"Error loading image: {str(e)}")


def predict_image(image_input, model_type: str):
    try:
        # Load & resize image
        image = load_image(image_input)

        # Choose model
        if model_type == "soil":
            model = soil_model
        elif model_type == "vegetation":
            model = veg_model
        else:
            raise ValueError("Invalid model type. Use 'soil' or 'vegetation'.")

        # Run YOLO inference
        results = model.predict(image, conf=0.25, save=False)

        # Save result image
        output_path = OUTPUT_DIR / f"{model_type}_result.jpg"
        results[0].save(filename=output_path)

        # Convert result image to base64
        with open(output_path, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode("utf-8")

        return {
            "status": "success",
            "model_used": model_type,
            "output_image_path": str(output_path),
            "output_image_base64": img_base64
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
