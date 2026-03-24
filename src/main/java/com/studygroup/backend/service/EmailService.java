package com.studygroup.backend.service;

import com.studygroup.backend.model.Session;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    // ✅ Optional: Only used if SMTP configured
    private final JavaMailSender mailSender;

    // 🔧 Toggle for development mode
    private static final boolean EMAIL_ENABLED = false;

    // 📅 Formatter
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // 🔥 MAIN METHOD (SESSION REMINDER)
    @Async
    public void sendSessionReminder(Long userId, Session session) {

        String subject = "📚 Study Session Reminder";
        String content = buildSessionEmailContent(session);

        try {
            log.info("📧 [SIMULATED EMAIL] To User {} → {}", userId, subject);
            log.info("Content: {}", content);
        } catch (Exception e) {
            log.error("❌ Failed to send email to userId={}", userId, e);
        }
    }

    // 🔥 GENERIC EMAIL SENDER (HTML)
    public void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(Objects.requireNonNull(to));
        helper.setSubject(Objects.requireNonNull(subject));
        helper.setText(Objects.requireNonNull(htmlContent), true);

        mailSender.send(message);

        log.info("✅ Email sent to {}", to);
    }

    // 🔥 SIMPLE TEXT EMAIL (Fallback)
    public void sendSimpleEmail(String to, String subject, String text) {

        if (!EMAIL_ENABLED) {
            log.info("📧 [SIMULATED TEXT EMAIL] To {} → {}", to, subject);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        log.info("✅ Simple email sent to {}", to);
    }

    // 🔥 EMAIL TEMPLATE BUILDER (HTML)
    private String buildSessionEmailContent(Session session) {

        String formattedDate = session.getDateTime().format(FORMATTER);

        return """
                <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>📚 New Study Session Scheduled!</h2>
                    <p><strong>Title:</strong> %s</p>
                    <p><strong>Description:</strong> %s</p>
                    <p><strong>Date & Time:</strong> %s</p>
                    <hr/>
                    <p>Join your study group and stay productive 🚀</p>
                </body>
                </html>
                """.formatted(
                session.getTitle(),
                session.getDescription() != null ? session.getDescription() : "N/A",
                formattedDate
        );
    }
}