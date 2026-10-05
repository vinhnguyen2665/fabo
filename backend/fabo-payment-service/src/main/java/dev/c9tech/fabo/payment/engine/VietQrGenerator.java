package dev.c9tech.fabo.payment.engine;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * VietQrGenerator implements the official NAPAS VietQR specification (NAPAS247 v1.0).
 * Handles TLV (Tag-Length-Value) formatting and CRC-16/CCITT-FALSE checksum generation.
 */
public class VietQrGenerator {

    public static final String GUID_NAPAS = "A000000727";
    public static final String SERVICE_ACCOUNT = "QRIBFTTA";
    public static final String SERVICE_CARD = "QRIBFTTC";
    public static final String CURRENCY_VND = "704";
    public static final String COUNTRY_VN = "VN";

    /**
     * Builds standard TLV element: Tag (2 digits) + Length (2 digits) + Value
     */
    public static String formatTlv(String tag, String value) {
        if (value == null) {
            return "";
        }
        int len = value.getBytes(StandardCharsets.UTF_8).length;
        return String.format("%s%02d%s", tag, len, value);
    }

    /**
     * Calculates CRC-16/CCITT-FALSE checksum according to ISO/IEC 13239.
     * Polynomial: 0x1021, Initial: 0xFFFF, RefIn: false, RefOut: false, XorOut: 0x0000.
     */
    public static String calculateCrc16CcittFalse(String data) {
        int crc = 0xFFFF;
        int polynomial = 0x1021;
        byte[] bytes = data.getBytes(StandardCharsets.UTF_8);

        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i) & 1) == 1);
                boolean c15 = ((crc >> 15 & 1) == 1);
                crc <<= 1;
                if (c15 ^ bit) {
                    crc ^= polynomial;
                }
            }
        }
        crc &= 0xFFFF;
        return String.format("%04X", crc);
    }

    /**
     * Generates raw VietQR payload string (TLV encoded with CRC-16 checksum).
     */
    public static String generatePayload(
            boolean isDynamic,
            String bnbBin,
            String consumerId,
            boolean isCard,
            String amount,
            String billNumber,
            String purpose
    ) {
        StringBuilder sb = new StringBuilder();

        // Tag 00: Payload Format Indicator (Fixed "01")
        sb.append(formatTlv("00", "01"));

        // Tag 01: Point of Initiation Method ("11" = Static, "12" = Dynamic)
        sb.append(formatTlv("01", isDynamic ? "12" : "11"));

        // Tag 38: Consumer Account Information (Beneficiary)
        StringBuilder tag38Builder = new StringBuilder();
        tag38Builder.append(formatTlv("00", GUID_NAPAS));

        // Sub 01: BNB ID + Consumer ID
        StringBuilder sub01Builder = new StringBuilder();
        sub01Builder.append(formatTlv("00", bnbBin));
        sub01Builder.append(formatTlv("01", consumerId));
        tag38Builder.append(formatTlv("01", sub01Builder.toString()));

        // Sub 02: Service Code
        tag38Builder.append(formatTlv("02", isCard ? SERVICE_CARD : SERVICE_ACCOUNT));

        sb.append(formatTlv("38", tag38Builder.toString()));

        // Tag 53: Transaction Currency (VND = 704)
        sb.append(formatTlv("53", CURRENCY_VND));

        // Tag 54: Transaction Amount (Dynamic QR)
        if (amount != null && !amount.trim().isEmpty()) {
            sb.append(formatTlv("54", amount.trim()));
        }

        // Tag 58: Country Code (VN)
        sb.append(formatTlv("58", COUNTRY_VN));

        // Tag 62: Additional Data Field Template
        if ((billNumber != null && !billNumber.trim().isEmpty()) || (purpose != null && !purpose.trim().isEmpty())) {
            StringBuilder tag62Builder = new StringBuilder();
            if (billNumber != null && !billNumber.trim().isEmpty()) {
                tag62Builder.append(formatTlv("01", billNumber.trim()));
            }
            if (purpose != null && !purpose.trim().isEmpty()) {
                tag62Builder.append(formatTlv("08", purpose.trim()));
            }
            sb.append(formatTlv("62", tag62Builder.toString()));
        }

        // Tag 63: CRC Header "6304"
        sb.append("6304");

        // Calculate CRC over the whole payload including "6304"
        String crc = calculateCrc16CcittFalse(sb.toString());

        sb.append(crc);
        return sb.toString();
    }

    /**
     * Generates a Base64-encoded PNG QR Code image from a given text payload.
     */
    public static String generateQrBase64Png(String content, int width, int height) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        byte[] pngData = outputStream.toByteArray();

        return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
    }
}
