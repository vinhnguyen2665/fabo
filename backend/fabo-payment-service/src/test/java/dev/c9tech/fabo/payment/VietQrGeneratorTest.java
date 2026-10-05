package dev.c9tech.fabo.payment;

import dev.c9tech.fabo.payment.engine.VietQrGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit test for VietQrGenerator validating against official NAPAS Test Vectors
 * defined in documents/QR_Format_T&C_v1.0_VN_092021.pdf (Sections 6.1.1 - 6.1.4).
 */
public class VietQrGeneratorTest {

    @Test
    @DisplayName("Napas Test Vector 6.1.1: Static QR to Account - Expect CRC F4E5")
    void testNapasVector611_StaticQrAccount() {
        String inputWithoutCrc = "00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304";
        String expectedCrc = "F4E5";

        String calculatedCrc = VietQrGenerator.calculateCrc16CcittFalse(inputWithoutCrc);
        assertEquals(expectedCrc, calculatedCrc, "CRC should match official NAPAS Vector 6.1.1");
    }

    @Test
    @DisplayName("Napas Test Vector 6.1.2: Static QR to Card - Expect CRC 4F52")
    void testNapasVector612_StaticQrCard() {
        String inputWithoutCrc = "00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN6304";
        String expectedCrc = "4F52";

        String calculatedCrc = VietQrGenerator.calculateCrc16CcittFalse(inputWithoutCrc);
        assertEquals(expectedCrc, calculatedCrc, "CRC should match official NAPAS Vector 6.1.2");
    }

    @Test
    @DisplayName("Napas Test Vector 6.1.3: Dynamic QR to Account - Expect CRC 2E2E")
    void testNapasVector613_DynamicQrAccount() {
        String inputWithoutCrc = "00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang6304";
        String expectedCrc = "2E2E";

        String calculatedCrc = VietQrGenerator.calculateCrc16CcittFalse(inputWithoutCrc);
        assertEquals(expectedCrc, calculatedCrc, "CRC should match official NAPAS Vector 6.1.3");

        // Test generation from helper method
        String generatedPayload = VietQrGenerator.generatePayload(
                true,
                "970403",
                "0011012345678",
                false,
                "180000",
                "NPS6869",
                "thanh toan don hang"
        );
        String expectedFullPayload = inputWithoutCrc + expectedCrc;
        assertEquals(expectedFullPayload, generatedPayload, "Generated payload must match NAPAS 6.1.3 specification");
    }

    @Test
    @DisplayName("Napas Test Vector 6.1.4: Dynamic QR to Card - Expect CRC A203")
    void testNapasVector614_DynamicQrCard() {
        String inputWithoutCrc = "00020101021238600010A00000072701300006970403011697040311012345670208QRIBFTTC530370454061800005802VN62340107NPS68690819thanh toan don hang6304";
        String expectedCrc = "A203";

        String calculatedCrc = VietQrGenerator.calculateCrc16CcittFalse(inputWithoutCrc);
        assertEquals(expectedCrc, calculatedCrc, "CRC should match official NAPAS Vector 6.1.4");

        // Test generation from helper method
        String generatedPayload = VietQrGenerator.generatePayload(
                true,
                "970403",
                "9704031101234567",
                true,
                "180000",
                "NPS6869",
                "thanh toan don hang"
        );
        String expectedFullPayload = inputWithoutCrc + expectedCrc;
        assertEquals(expectedFullPayload, generatedPayload, "Generated payload must match NAPAS 6.1.4 specification");
    }

    @Test
    @DisplayName("Generate QR Base64 PNG check")
    void testGenerateBase64Png() throws Exception {
        String payload = "00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang63042E2E";
        String base64Image = VietQrGenerator.generateQrBase64Png(payload, 300, 300);
        assertNotNull(base64Image);
        assertTrue(base64Image.startsWith("data:image/png;base64,"));
        assertTrue(base64Image.length() > 100);
    }
}
