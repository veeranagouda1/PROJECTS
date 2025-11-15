package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SmsService {

    @Value("${fast2sms.api.key}")
    private String apiKey;

    public void sendSms(String phoneNumber, String message) {
        try {
            RestTemplate rest = new RestTemplate();

            String url =
                    "https://www.fast2sms.com/dev/bulk?" +
                    "authorization=" + apiKey +
                    "&sender_id=TXTIND" +
                    "&message=" + message.replace(" ", "%20") +
                    "&language=english" +
                    "&route=q" +
                    "&numbers=" + phoneNumber;

            String response = rest.getForObject(url, String.class);
            System.out.println("SMS SENT RESPONSE: " + response);

        } catch (Exception e) {
            System.err.println("❌ SMS FAILED: " + e.getMessage());
        }
    }
}
