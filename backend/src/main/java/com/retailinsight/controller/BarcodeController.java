package com.retailinsight.controller;

import com.retailinsight.service.BarcodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/barcode")
@Tag(name = "Barcode & QR Code Generator", description = "Generate visual barcodes (Code128, EAN13) and QR codes")
public class BarcodeController {

    private final BarcodeService barcodeService;

    public BarcodeController(BarcodeService barcodeService) {
        this.barcodeService = barcodeService;
    }

    @GetMapping(value = "/generate", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Generate raw PNG barcode image")
    public ResponseEntity<byte[]> generateBarcodeImage(
            @RequestParam("code") String code,
            @RequestParam(value = "format", defaultValue = "CODE_128") String format,
            @RequestParam(value = "width", defaultValue = "250") int width,
            @RequestParam(value = "height", defaultValue = "80") int height) {
        try {
            byte[] imageBytes = barcodeService.generateBarcodePngBytes(code, format, width, height);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + code + ".png\"")
                    .contentType(MediaType.IMAGE_PNG)
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/base64")
    @Operation(summary = "Generate Data URL Base64 string for direct frontend embedding")
    public ResponseEntity<Map<String, String>> generateBarcodeBase64(
            @RequestParam("code") String code,
            @RequestParam(value = "format", defaultValue = "CODE_128") String format,
            @RequestParam(value = "width", defaultValue = "250") int width,
            @RequestParam(value = "height", defaultValue = "80") int height) {
        String base64 = barcodeService.generateBarcodeBase64(code, format, width, height);
        return ResponseEntity.ok(Map.of("code", code, "format", format, "dataUrl", base64));
    }
}
