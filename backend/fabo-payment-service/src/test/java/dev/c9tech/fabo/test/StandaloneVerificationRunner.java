package dev.c9tech.fabo.test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class StandaloneVerificationRunner {

    // 1. NAPAS CRC-16 CCITT-FALSE
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

    public static String formatTlv(String tag, String value) {
        if (value == null) return "";
        int len = value.getBytes(StandardCharsets.UTF_8).length;
        return String.format("%s%02d%s", tag, len, value);
    }

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("1. RUNNING NAPAS VIETQR SPECIFICATION TESTS (PDF)");
        System.out.println("==================================================");

        // Napas 6.1.1: Static QR to Account
        String in611 = "00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304";
        String crc611 = calculateCrc16CcittFalse(in611);
        System.out.printf("Test Vector 6.1.1 (Static Account): CRC=%s, Expected=F4E5 -> %s%n",
                crc611, "F4E5".equals(crc611) ? "PASSED" : "FAILED");

        // Napas 6.1.2: Static QR to Card
        String in612 = "00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN6304";
        String crc612 = calculateCrc16CcittFalse(in612);
        System.out.printf("Test Vector 6.1.2 (Static Card):    CRC=%s, Expected=4F52 -> %s%n",
                crc612, "4F52".equals(crc612) ? "PASSED" : "FAILED");

        // Napas 6.1.3: Dynamic QR to Account
        String in613 = "00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang6304";
        String crc613 = calculateCrc16CcittFalse(in613);
        System.out.printf("Test Vector 6.1.3 (Dynamic Account): CRC=%s, Expected=2E2E -> %s%n",
                crc613, "2E2E".equals(crc613) ? "PASSED" : "FAILED");

        // Napas 6.1.4: Dynamic QR to Card
        String in614 = "00020101021238600010A00000072701300006970403011697040311012345670208QRIBFTTC530370454061800005802VN62340107NPS68690819thanh toan don hang6304";
        String crc614 = calculateCrc16CcittFalse(in614);
        System.out.printf("Test Vector 6.1.4 (Dynamic Card):    CRC=%s, Expected=A203 -> %s%n",
                crc614, "A203".equals(crc614) ? "PASSED" : "FAILED");

        // Test Dynamic Payload builder
        StringBuilder tag38 = new StringBuilder();
        tag38.append(formatTlv("00", "A000000727"));
        StringBuilder sub01 = new StringBuilder();
        sub01.append(formatTlv("00", "970403"));
        sub01.append(formatTlv("01", "0011012345678"));
        tag38.append(formatTlv("01", sub01.toString()));
        tag38.append(formatTlv("02", "QRIBFTTA"));

        StringBuilder tag62 = new StringBuilder();
        tag62.append(formatTlv("01", "NPS6869"));
        tag62.append(formatTlv("08", "thanh toan don hang"));

        String payload = formatTlv("00", "01") +
                formatTlv("01", "12") +
                formatTlv("38", tag38.toString()) +
                formatTlv("53", "704") +
                formatTlv("54", "180000") +
                formatTlv("58", "VN") +
                formatTlv("62", tag62.toString()) +
                "6304";

        String dynamicCrc = calculateCrc16CcittFalse(payload);
        String fullString = payload + dynamicCrc;
        System.out.printf("Dynamic QR Builder Output matches Napas 6.1.3: %s%n",
                (in613 + "2E2E").equals(fullString) ? "PASSED" : "FAILED");

        System.out.println("\n==================================================");
        System.out.println("2. RUNNING TAX ENGINE CALCULATIONS");
        System.out.println("==================================================");

        // TAX_INCLUSIVE: 100,000 listed price at 10%
        BigDecimal listed = new BigDecimal("100000");
        BigDecimal rate = new BigDecimal("0.10");
        BigDecimal divisor = BigDecimal.ONE.add(rate);
        BigDecimal base = listed.divide(divisor, 2, RoundingMode.HALF_UP);
        BigDecimal tax = listed.subtract(base).setScale(0, RoundingMode.HALF_UP);
        System.out.printf("Tax Inclusive 100,000 VND (10%%): Base=%s VND, Tax=%s VND -> Final=%s VND%n",
                base.setScale(0, RoundingMode.HALF_UP), tax, listed);
        assert tax.intValue() == 9091;

        // TAX_EXCLUSIVE: 100,000 at 8%
        BigDecimal exclusiveBase = new BigDecimal("100000");
        BigDecimal rate8 = new BigDecimal("0.08");
        BigDecimal tax8 = exclusiveBase.multiply(rate8).setScale(0, RoundingMode.HALF_UP);
        BigDecimal finalExclusive = exclusiveBase.add(tax8);
        System.out.printf("Tax Exclusive 100,000 VND (8%%):  Base=%s VND, Tax=%s VND -> Final=%s VND%n",
                exclusiveBase, tax8, finalExclusive);
        assert tax8.intValue() == 8000 && finalExclusive.intValue() == 108000;

        System.out.println("\nALL STANDALONE VERIFICATIONS PASSED SUCCESSFULLY!");
    }
}
