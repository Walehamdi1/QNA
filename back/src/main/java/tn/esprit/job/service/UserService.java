package tn.esprit.job.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.job.config.PasswordEncoder;
import tn.esprit.job.dto.*;
import tn.esprit.job.enumeration.Role;
import tn.esprit.job.exceptions.UserException;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.UserRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /* ---------- Registration / Auth ---------- */

    public void registerAccount(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserException("A user already exists with the same email");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new UserException("Password is required");
        }
        if (!Objects.equals(request.getPassword(), request.getConfirmPassword())) {
            throw new UserException("Passwords do not match");
        }

        Role assignedRole = "ADMIN".equalsIgnoreCase(request.getUserType()) ? Role.ADMIN : Role.CLIENT;

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            var user = userRepository.getUserByEmail(request.getEmail());
            if (user == null) {
                throw new UserException("User not found.");
            }

            Map<String, String> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("email", user.getEmail());
            claims.put("id", String.valueOf(user.getUserId()));

            var jwtToken = jwtService.genToken(user, claims);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .role(user.getRole())
                    .email(user.getEmail())
                    .messageResponse("You have been successfully authenticated!")
                    .user(user)
                    .build();

        } catch (AuthenticationException e) {
            throw new UserException("Invalid credentials.");
        }
    }

    /* ---------- Profile ---------- */

    public ProfileResponse getProfile(String email) {
        User user = userRepository.getUserByEmail(email);
        if (user == null) throw new UserException("User not found");
        return ProfileResponse.fromEntity(user);
    }

    public ProfileResponse updateProfile(User updatedUser) {
        if (updatedUser.getUserId() == null) {
            throw new UserException("User ID is required for update");
        }
        User existing = userRepository.findById(updatedUser.getUserId())
                .orElseThrow(() -> new UserException("User not found"));

        // Only updatable fields here (email typically not changed via profile, but keep if you want)
        existing.setFirstName(updatedUser.getFirstName());
        existing.setLastName(updatedUser.getLastName());
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(existing.getEmail())) {
            // Ensure email uniqueness
            userRepository.findByEmail(updatedUser.getEmail()).ifPresent(u -> {
                if (!u.getUserId().equals(existing.getUserId())) {
                    throw new UserException("Email already in use by another account");
                }
            });
            existing.setEmail(updatedUser.getEmail());
        }
        // Role / enabled usually not part of self profile; keep as-is.

        // If password provided, re-encode
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        User saved = userRepository.save(existing);
        return ProfileResponse.fromEntity(saved);
    }

    /* ---------- CRUD (Admin / General) ---------- */

    // Create (Admin-use or generic create)
    public User createUser(User toCreate) {
        if (toCreate.getEmail() == null || toCreate.getEmail().isBlank())
            throw new UserException("Email is required");

        userRepository.findByEmail(toCreate.getEmail()).ifPresent(u -> {
            throw new UserException("A user already exists with the same email");
        });

        if (toCreate.getPassword() == null || toCreate.getPassword().isBlank())
            throw new UserException("Password is required");

        // Default role if missing
        Role role = (toCreate.getRole() != null) ? toCreate.getRole() : Role.CLIENT;

        User newUser = User.builder()
                .firstName(toCreate.getFirstName())
                .lastName(toCreate.getLastName())
                .email(toCreate.getEmail())
                .password(passwordEncoder.encode(toCreate.getPassword()))
                .role(role)
                .build();

        return userRepository.save(newUser);
    }

    // Read by ID
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserException("User not found"));
    }

    // Read by Email
    public User getUserByEmail(String email) {
        User u = userRepository.getUserByEmail(email);
        if (u == null) throw new UserException("User not found");
        return u;
    }

    // Update by ID (Admin/general update)
    public User updateUser(Long id, User patch) {
        User existing = userRepository.findById(id).orElseThrow(() -> new UserException("User not found"));

        if (patch.getFirstName() != null) existing.setFirstName(patch.getFirstName());
        if (patch.getLastName() != null) existing.setLastName(patch.getLastName());

        if (patch.getEmail() != null && !patch.getEmail().equals(existing.getEmail())) {
            userRepository.findByEmail(patch.getEmail()).ifPresent(u -> {
                if (!u.getUserId().equals(existing.getUserId())) {
                    throw new UserException("Email already in use by another account");
                }
            });
            existing.setEmail(patch.getEmail());
        }

        if (patch.getPassword() != null && !patch.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(patch.getPassword()));
        }

        if (patch.getRole() != null) existing.setRole(patch.getRole());

        return userRepository.save(existing);
    }

    public void adminSetPassword(Long userId, String rawPassword) throws UserException {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));
        u.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(u);
    }

    // Delete by ID
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new UserException("User not found");
        userRepository.deleteById(id);
    }

    // List
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
