from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, JSONResponse
from services.segmentation import SegmentationService
import base64
import logging

router = APIRouter(prefix="/api/v1", tags=["ai"])
svc = SegmentationService()
logger = logging.getLogger(__name__)


@router.post("/preview")
async def generate_preview(
    image: UploadFile = File(..., description="Photo of the room/apartment"),
    material_color: str = Form(..., description="Hex color of material e.g. #8B6914"),
    texture_url: str = Form(None, description="Optional texture image URL"),
    opacity: float = Form(0.75, ge=0.1, le=1.0),
):
    """
    Main AI pipeline:
    1. Receive room photo
    2. Segment facade surfaces
    3. Apply material texture/color
    4. Return preview image
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(400, "Файл должен быть изображением")

    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "Изображение слишком большое (макс. 10MB)")

    try:
        # Step 1: Segment
        logger.info("Segmenting facade surfaces...")
        mask = svc.segment_facades(image_bytes)

        # Step 2: Apply texture
        logger.info(f"Applying material: color={material_color}, texture_url={texture_url}")
        if texture_url:
            result_bytes = svc.apply_texture_from_url(image_bytes, mask, texture_url, opacity)
        else:
            result_bytes = svc.apply_texture(image_bytes, mask, material_color, opacity)

        logger.info("Preview generated successfully")
        return Response(content=result_bytes, media_type="image/jpeg")

    except Exception as e:
        logger.error(f"Preview generation failed: {e}")
        raise HTTPException(500, f"Ошибка генерации превью: {str(e)}")


@router.post("/preview/base64")
async def generate_preview_base64(
    image: UploadFile = File(...),
    material_color: str = Form(...),
    texture_url: str = Form(None),
    opacity: float = Form(0.75),
):
    """Same as /preview but returns base64-encoded JSON (useful for frontend)."""
    if not image.content_type.startswith("image/"):
        raise HTTPException(400, "Файл должен быть изображением")

    image_bytes = await image.read()

    try:
        mask = svc.segment_facades(image_bytes)
        if texture_url:
            result_bytes = svc.apply_texture_from_url(image_bytes, mask, texture_url, opacity)
        else:
            result_bytes = svc.apply_texture(image_bytes, mask, material_color, opacity)

        return JSONResponse({
            "image": base64.b64encode(result_bytes).decode(),
            "mime_type": "image/jpeg",
        })
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/health")
def health():
    return {"status": "ok", "service": "facade-ai"}
