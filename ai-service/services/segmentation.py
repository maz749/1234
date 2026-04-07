"""
Facade segmentation and texture replacement service.
Uses a lightweight approach: color-based segmentation + texture overlay.
For production: swap with SAM (Segment Anything Model) for better accuracy.
"""
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import io
import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class SegmentationService:
    """
    Segments furniture surfaces in an image.
    
    Strategy:
    1. Convert to HSV for better color separation
    2. Detect large rectangular regions (cabinet doors, panels)
    3. Build a mask of facade surfaces
    4. Apply new texture with realistic blending
    """

    def segment_facades(self, image_bytes: bytes) -> np.ndarray:
        """Returns a binary mask of detected facade surfaces."""
        img = self._bytes_to_cv2(image_bytes)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Edge detection to find structural boundaries
        edges = cv2.Canny(gray, 30, 100)
        
        # Dilate edges to connect nearby lines
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)

        # Find contours of large rectangular regions
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        mask = np.zeros(gray.shape, dtype=np.uint8)
        h, w = gray.shape
        min_area = (h * w) * 0.01  # At least 1% of image area

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < min_area:
                continue
            
            # Approximate to polygon
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
            
            # Accept quadrilaterals (door/panel shapes)
            if len(approx) >= 4:
                cv2.drawContours(mask, [cnt], -1, 255, -1)

        # If no good contours found, use GrabCut on center region
        if cv2.countNonZero(mask) < (h * w * 0.05):
            mask = self._grabcut_fallback(img)

        return mask

    def _grabcut_fallback(self, img: np.ndarray) -> np.ndarray:
        """GrabCut-based segmentation as fallback."""
        h, w = img.shape[:2]
        mask = np.zeros((h, w), np.uint8)
        
        # Assume furniture is in center 70% of the image
        rect = (int(w * 0.1), int(h * 0.1), int(w * 0.8), int(h * 0.8))
        
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        try:
            cv2.grabCut(img, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
            mask2 = np.where((mask == 2) | (mask == 0), 0, 255).astype(np.uint8)
        except Exception:
            # Last resort: center rectangle
            mask2 = np.zeros((h, w), np.uint8)
            mask2[int(h*0.1):int(h*0.9), int(w*0.1):int(w*0.9)] = 255

        return mask2

    def apply_texture(
        self,
        original_bytes: bytes,
        mask: np.ndarray,
        texture_color: str,  # hex color like "#8B6914"
        opacity: float = 0.75
    ) -> bytes:
        """
        Applies a solid color (simulating a material) to masked regions.
        Preserves shadows and highlights for realism.
        """
        orig_img = Image.open(io.BytesIO(original_bytes)).convert("RGBA")
        w, h = orig_img.size

        # Resize mask to match image
        mask_resized = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
        
        # Parse hex color
        r, g, b = self._hex_to_rgb(texture_color)
        
        # Create texture layer
        texture_layer = Image.new("RGBA", (w, h), (r, g, b, int(255 * opacity)))
        
        # Create mask image
        mask_pil = Image.fromarray(mask_resized).convert("L")
        mask_smooth = mask_pil.filter(ImageFilter.GaussianBlur(radius=3))
        
        # Composite: original + texture blended only on mask
        result = orig_img.copy()
        result.paste(texture_layer, mask=mask_smooth)
        
        # Enhance contrast slightly for more realistic look
        enhancer = ImageEnhance.Contrast(result)
        result = enhancer.enhance(1.05)

        # Convert back to bytes
        output = io.BytesIO()
        result.convert("RGB").save(output, format="JPEG", quality=92)
        return output.getvalue()

    def apply_texture_from_url(
        self,
        original_bytes: bytes,
        mask: np.ndarray,
        texture_url: str,
        opacity: float = 0.8
    ) -> bytes:
        """Apply a real texture image (downloaded from URL) to the mask."""
        orig_img = Image.open(io.BytesIO(original_bytes)).convert("RGBA")
        w, h = orig_img.size

        try:
            resp = httpx.get(texture_url, timeout=5)
            texture_img = Image.open(io.BytesIO(resp.content)).convert("RGBA")
            # Tile texture to fill the area
            tx, ty = texture_img.size
            tiled = Image.new("RGBA", (w, h))
            for x in range(0, w, tx):
                for y in range(0, h, ty):
                    tiled.paste(texture_img, (x, y))
        except Exception as e:
            logger.warning(f"Could not load texture from URL: {e}. Using color fallback.")
            return self.apply_texture(original_bytes, mask, "#8B6914", opacity)

        mask_resized = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
        mask_pil = Image.fromarray(mask_resized).convert("L")
        mask_smooth = mask_pil.filter(ImageFilter.GaussianBlur(radius=2))

        # Blend texture with original for realistic shadows
        blended = Image.blend(orig_img, tiled, alpha=opacity)
        result = orig_img.copy()
        result.paste(blended, mask=mask_smooth)

        output = io.BytesIO()
        result.convert("RGB").save(output, format="JPEG", quality=92)
        return output.getvalue()

    @staticmethod
    def _bytes_to_cv2(data: bytes) -> np.ndarray:
        arr = np.frombuffer(data, np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)

    @staticmethod
    def _hex_to_rgb(hex_color: str):
        hex_color = hex_color.lstrip("#")
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
