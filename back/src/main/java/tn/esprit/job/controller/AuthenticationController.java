package tn.esprit.job.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.job.dto.*;
import tn.esprit.job.exceptions.UserException;
import tn.esprit.job.model.User;
import tn.esprit.job.service.PasswordResetService;
import tn.esprit.job.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthenticationController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;


    /* ---------- Registration / Auth ---------- */

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.registerAccount(request);
            response.put("message", "Account created successfully");
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/auth")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = userService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /* ---------- Profile ---------- */

    @GetMapping("/profile/{email}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable String email) {
        return ResponseEntity.ok(userService.getProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody User userProfile) {
        return ResponseEntity.ok(userService.updateProfile(userProfile));
    }

    /* ---------- CRUD ---------- */
    // NOTE: Kept existing endpoints, but added non-conflicting RESTful routes.

    // List all users (existing + better route)
    @GetMapping("/getAllUsers") // existing
    public ResponseEntity<?> getAllUsersLegacy() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            String errorMessage = "An error occurred while fetching users.";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        }
    }

    @GetMapping // RESTful: GET /user
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Create user (admin or internal create)
    @PostMapping // RESTful: POST /user
    public ResponseEntity<?> createUser(@RequestBody User toCreate) {
        try {
            User created = userService.createUser(toCreate);
            // Avoid leaking password hash in response (your entity should hide it with @JsonIgnore ideally)
            created.setPassword(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get user by ID
    @GetMapping("/by-id/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Get user by Email (moved to non-conflicting path)
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            User user = userService.getUserByEmail(email);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Update user by ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User payload) {
        try {
            User updated = userService.updateUser(id, payload);
            updated.setPassword(null);
            return ResponseEntity.ok(updated);
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Delete user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "User deleted successfully");
            return ResponseEntity.ok(res);
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/{id}/password")
    public ResponseEntity<?> adminSetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminSetPasswordRequest req
    ) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }
        try {
            userService.adminSetPassword(id, req.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated"));
        } catch (UserException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            passwordResetService.requestReset(req);
            return ResponseEntity.ok(Map.of(
                    "message", "If the email exists, a reset code has been sent"
            ));
        } catch (UserException ex) {
            // Do NOT reveal whether an email exists; keep response generic
            return ResponseEntity.ok(Map.of(
                    "message", "If the email exists, a reset code has been sent"
            ));
        }
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest req) {
        try {
            boolean ok = passwordResetService.verifyCode(req);
            return ResponseEntity.ok(Map.of("valid", ok));
        } catch (UserException ex) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", ex.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        try {
            passwordResetService.resetPassword(req);
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } catch (UserException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

}
