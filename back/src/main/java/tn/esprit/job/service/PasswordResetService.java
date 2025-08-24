package tn.esprit.job.service;// package tn.esprit.job.service;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.job.dto.ForgotPasswordRequest;
import tn.esprit.job.dto.ResetPasswordRequest;
import tn.esprit.job.dto.VerifyResetCodeRequest;
import tn.esprit.job.exceptions.UserException;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.UserRepository;
import tn.esprit.job.service.ForgotPasswordService;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final ForgotPasswordService mailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    private static final int EXPIRATION_MINUTES = 15;

    public void requestReset(ForgotPasswordRequest req) throws UserException {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UserException("No account found for this email"));

        String code = generateSixDigitCode();
        user.setResetCode(code);
        user.setResetCodeExpiresAt(Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES));
        userRepository.save(user);

        String link = frontendBaseUrl + "/reset-password?email=" + urlEncode(user.getEmail()) + "&code=" + urlEncode(code);

        try {
            mailService.sendEmail(
                    user.getEmail(),
                    user.getEmail(),
                    "forgot-password",
                    link,
                    code
            );
        } catch (MessagingException e) {
            throw new UserException("Failed to send reset email");
        }
    }

    public boolean verifyCode(VerifyResetCodeRequest req) throws UserException {
        User user = userRepository.findByEmailAndResetCode(req.getEmail(), req.getCode())
                .orElseThrow(() -> new UserException("Invalid code or email"));

        if (user.getResetCodeExpiresAt() == null || Instant.now().isAfter(user.getResetCodeExpiresAt())) {
            throw new UserException("Code expired, please request a new one");
        }
        return true;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) throws UserException {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new UserException("Passwords do not match");
        }

        User user = userRepository.findByEmailAndResetCode(req.getEmail(), req.getCode())
                .orElseThrow(() -> new UserException("Invalid code or email"));

        if (user.getResetCodeExpiresAt() == null || Instant.now().isAfter(user.getResetCodeExpiresAt())) {
            throw new UserException("Code expired, please request a new one");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setResetCode(null);
        user.setResetCodeExpiresAt(null);
        userRepository.save(user);
    }

    private static String generateSixDigitCode() {
        SecureRandom rnd = new SecureRandom();
        int n = 100000 + rnd.nextInt(900000);
        return String.valueOf(n);
    }

    private static String urlEncode(String s) {
        try {
            return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
}
