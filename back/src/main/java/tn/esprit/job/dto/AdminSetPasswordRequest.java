package tn.esprit.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminSetPasswordRequest {
    @NotBlank
    @Size(min = 6, max = 255)
    private String newPassword;

    @NotBlank
    @Size(min = 6, max = 255)
    private String confirmPassword;
}