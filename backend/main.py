from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from detect_utils import predict_image

app = FastAPI(
    title="Soil & Vegetation Detection API",
    description="YOLO-based detection backend using FastAPI",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Soil & Vegetation Detection API is running 🚀"}


# ✅ Prediction endpoint for uploaded images
@app.post("/predict/{model_type}")
async def predict(model_type: str, file: UploadFile = File(None), image_url: str = Form(None)):
    """
    model_type: 'soil' or 'vegetation'
    file: uploaded image (optional)
    image_url: direct online image URL (optional)
    """
    if file:
        image_bytes = await file.read()
        result = predict_image(image_bytes, model_type)
    elif image_url:
        result = predict_image(image_url, model_type)
    else:
        result = {"status": "error", "message": "No image provided (upload a file or provide image_url)."}

    return result
