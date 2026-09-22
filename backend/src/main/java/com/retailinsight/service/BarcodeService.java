package com.retailinsight.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import com.google.zxing.oned.EAN13Writer;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class BarcodeService {

    public byte[] generateBarcodePngBytes(String code, String formatStr, int width, int height) throws Exception {
        BarcodeFormat format = BarcodeFormat.CODE_128;
        if ("EAN_13".equalsIgnoreCase(formatStr) || "EAN13".equalsIgnoreCase(formatStr)) {
            format = BarcodeFormat.EAN_13;
        } else if ("QR_CODE".equalsIgnoreCase(formatStr) || "QR".equalsIgnoreCase(formatStr)) {
            format = BarcodeFormat.QR_CODE;
        }

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix;
        if (format == BarcodeFormat.EAN_13) {
            EAN13Writer writer = new EAN13Writer();
            bitMatrix = writer.encode(code, format, width, height, hints);
        } else if (format == BarcodeFormat.QR_CODE) {
            QRCodeWriter writer = new QRCodeWriter();
            bitMatrix = writer.encode(code, format, width, height, hints);
        } else {
            Code128Writer writer = new Code128Writer();
            bitMatrix = writer.encode(code, format, width, height, hints);
        }

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    public String generateBarcodeBase64(String code, String format, int width, int height) {
        try {
            byte[] bytes = generateBarcodePngBytes(code, format, width, height);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate barcode for " + code, e);
        }
    }
}
