package com.studygroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    // Optional injection — null if mail not configured
   
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@studyconnect.com}")
    private String fromAddress;

    // ── Core send — all emails go through here ────────────────
    private void send(String to, String subject, String html) {
        if (!mailEnabled || mailSender == null) {
          log.info("📧 [SIMULATED EMAIL] To {} → {}", to, subject);)
          return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress, "StudyConnect");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
          
           log.info("✅ Email sent to {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}", to, e);
        }
    }

    // ── Welcome on registration ───────────────────────────────
    @Async
    public void sendWelcome(String to, String name) {
        send(to, "Welcome to StudyConnect 📚", """
            <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:26px;">📚 StudyConnect</h1>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Connect. Collaborate. Succeed.</p>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                <h2 style="color:#0f172a;margin:0 0 12px;">Welcome, %s! 🎉</h2>
                <p style="color:#475569;line-height:1.7;">Your account is ready. Start exploring courses, join study groups, and schedule sessions with your peers.</p>
                <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
                  <strong style="color:#1e40af;">Get started:</strong>
                  <ul style="color:#3b82f6;margin:8px 0 0;padding-left:20px;">
                    <li>Enroll in courses</li>
                    <li>Join or create a study group</li>
                    <li>Schedule your first session</li>
                  </ul>
                </div>
                <p style="color:#94a3b8;font-size:12px;margin:0;">You received this because you registered at StudyConnect.</p>
              </div>
            </div>
            """.formatted(name));
    }

    // ── Session created — notify OTHER members (not creator) ──
    @Async
    public void sendSessionCreated(
            List<String> memberEmails,   // already excludes creator
            String groupName,
            String sessionTitle,
            String sessionDescription,
            LocalDateTime sessionDate,
            String createdByName) {

        if (memberEmails == null || memberEmails.isEmpty()) return;

        String dateStr = sessionDate.format(
                DateTimeFormatter.ofPattern("EEEE, MMMM d yyyy 'at' h:mm a"));
        String desc = (sessionDescription != null && !sessionDescription.isBlank())
                ? sessionDescription : "No description provided.";

        String subject = "📅 New Session in " + groupName + " — " + sessionTitle;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#1e1b4b,#4338ca);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
                <div style="font-size:40px;">📅</div>
                <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">New Study Session Scheduled</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;">%s</p>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                <h2 style="color:#0f172a;margin:0 0 4px;">%s</h2>
                <p style="color:#64748b;margin:0 0 24px;">Scheduled by <strong>%s</strong></p>
                <div style="background:#eef2ff;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
                  <p style="margin:0 0 4px;color:#4338ca;font-weight:700;font-size:13px;">📆 Date &amp; Time</p>
                  <p style="margin:0;color:#1e293b;font-size:16px;font-weight:600;">%s</p>
                </div>
                <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                  <p style="margin:0 0 4px;color:#475569;font-weight:700;font-size:13px;">📝 Description</p>
                  <p style="margin:0;color:#334155;line-height:1.6;">%s</p>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;">Log in to StudyConnect to view and manage your sessions.</p>
              </div>
            </div>
            """.formatted(groupName, sessionTitle, createdByName, dateStr, desc);

        for (String email : memberEmails) send(email, subject, html);
    }

    // ── Join request approved ─────────────────────────────────
    @Async
    public void sendJoinApproved(String to, String memberName, String groupName) {
        send(to, "✅ You've been approved to join " + groupName, """
            <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#166534,#16a34a);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
                <div style="font-size:40px;">✅</div>
                <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">Join Request Approved!</h1>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                <h2 style="color:#0f172a;margin:0 0 12px;">Hi %s,</h2>
                <p style="color:#475569;line-height:1.7;">
                  Great news! Your request to join <strong>%s</strong> has been approved.
                  You can now access the group chat, view upcoming sessions, and collaborate with your peers.
                </p>
                <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">Log in to StudyConnect to get started.</p>
              </div>
            </div>
            """.formatted(memberName, groupName));
    }

    // ── New chat message — notify OTHER members ───────────────
    @Async
    public void sendNewChatMessage(
            List<String> memberEmails,   // already excludes sender
            String groupName,
            String senderName,
            String messageText) {

        if (memberEmails == null || memberEmails.isEmpty()) return;

        // Truncate long messages in email preview
        String preview = messageText != null && messageText.length() > 200
                ? messageText.substring(0, 200) + "…"
                : (messageText != null ? messageText : "Sent a file");

        String subject = "💬 New message in " + groupName;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
                <div style="font-size:40px;">💬</div>
                <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">New Message</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;">%s</p>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                <p style="color:#64748b;margin:0 0 16px;"><strong style="color:#0f172a;">%s</strong> sent a message:</p>
                <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
                  <p style="margin:0;color:#334155;line-height:1.7;font-style:italic;">"%s"</p>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;">Log in to StudyConnect to reply.</p>
              </div>
            </div>
            """.formatted(groupName, senderName, preview);

        for (String email : memberEmails) send(email, subject, html);
    }
}
// ✅ SESSION REMINDER (VERY IMPORTANT FOR YOUR MILESTONE)
    @Async
    public void sendSessionReminder(String to, String title, LocalDateTime time) {

        String dateStr = time.format(
                DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        String html = """
            <h2>⏰ Session Reminder</h2>
            <p>Your session <b>%s</b> is scheduled at %s</p>
            """.formatted(title, dateStr);

        send(to, "Session Reminder", html);
    }
}