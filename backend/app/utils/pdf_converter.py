"""
PDF to Image Converter Utility

This module handles PDF file conversion to images for processing with Gemini API.
Converts each page of a PDF into a separate image that can be processed.
"""

from pdf2image import convert_from_bytes
from PIL import Image
import io
from typing import List, Tuple


class PDFConverter:
    """
    Handles conversion of PDF files to images.
    """
    
    @staticmethod
    def is_pdf(file_bytes: bytes) -> bool:
        """
        Check if the file is a PDF by examining the header.
        
        Args:
            file_bytes: The file content as bytes
            
        Returns:
            True if file is a PDF, False otherwise
        """
        return file_bytes.startswith(b'%PDF')
    
    @staticmethod
    def convert_pdf_to_images(
        pdf_bytes: bytes, 
        dpi: int = 300,
        max_pages: int = 10
    ) -> List[bytes]:
        """
        Convert PDF pages to images.
        
        Args:
            pdf_bytes: PDF file content as bytes
            dpi: Resolution for image conversion (default: 300 DPI for good quality)
            max_pages: Maximum number of pages to convert (default: 10)
            
        Returns:
            List of image bytes (PNG format) for each page
            
        Raises:
            Exception: If PDF conversion fails
        """
        try:
            # Convert PDF to list of PIL Images
            images = convert_from_bytes(
                pdf_bytes,
                dpi=dpi,
                fmt='png',
                first_page=1,
                last_page=max_pages
            )
            
            # Convert PIL Images to bytes
            image_bytes_list = []
            for idx, image in enumerate(images):
                # Convert to RGB if necessary (some PDFs have RGBA)
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Save to bytes buffer
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format='PNG', optimize=True)
                img_byte_arr.seek(0)
                
                image_bytes_list.append(img_byte_arr.getvalue())
            
            return image_bytes_list
            
        except Exception as e:
            raise Exception(f"Failed to convert PDF to images: {str(e)}")
    
    @staticmethod
    def convert_pdf_to_images_with_info(
        pdf_bytes: bytes,
        dpi: int = 300,
        max_pages: int = 10
    ) -> Tuple[List[bytes], int]:
        """
        Convert PDF pages to images with additional info.
        
        Args:
            pdf_bytes: PDF file content as bytes
            dpi: Resolution for image conversion
            max_pages: Maximum number of pages to convert
            
        Returns:
            Tuple of (list of image bytes, total page count)
        """
        image_bytes_list = PDFConverter.convert_pdf_to_images(
            pdf_bytes, dpi, max_pages
        )
        return image_bytes_list, len(image_bytes_list)


# Singleton instance
pdf_converter = PDFConverter()
