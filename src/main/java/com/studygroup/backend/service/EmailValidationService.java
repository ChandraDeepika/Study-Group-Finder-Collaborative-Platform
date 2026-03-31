package com.studygroup.backend.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validates email addresses by:
 *  1. Format check
 *  2. Blocking known disposable/fake domains
 *
 * No DNS/MX lookup — avoids false positives on real emails.
 */
@Service
public class EmailValidationService {

    private static final Set<String> FAKE_DOMAINS = new HashSet<>(Arrays.asList(
        "mailinator.com", "guerrillamail.com", "guerrillamail.info", "guerrillamail.net",
        "guerrillamail.org", "guerrillamail.de", "grr.la", "sharklasers.com",
        "spam4.me", "trashmail.com", "trashmail.at", "trashmail.io", "trashmail.me",
        "dispostable.com", "maildrop.cc", "10minutemail.com", "10minutemail.net",
        "temp-mail.org", "tempmail.com", "fakeinbox.com", "getnada.com",
        "discard.email", "throwaway.email", "yopmail.com", "yopmail.fr",
        "mailnull.com", "spamgourmet.com", "spamspot.com", "tempr.email",
        "throwam.com", "filzmail.com", "zetmail.com", "mohmal.com",
        "mailnesia.com", "nospam.com", "fakemail.com", "notreal.com"
    ));

    /**
     * Returns null if valid, or an error message string if invalid.
     */
    public String validate(String email) {
        if (email == null || email.isBlank())
            return "Email is required.";

        String lower = email.toLowerCase().trim();

        // 1. Format check
        if (!lower.matches("^[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$"))
            return "Invalid email format. Please enter a valid email address.";

        String domain = lower.substring(lower.indexOf('@') + 1);

        // 2. Block known disposable/fake domains only
        if (FAKE_DOMAINS.contains(domain))
            return "Disposable or fake email addresses are not allowed. Please use a real email (Gmail, Outlook, Yahoo, etc.).";

        return null; // valid
    }
}
