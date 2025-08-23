package tn.esprit.job.dto;

import tn.esprit.job.enumeration.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.job.model.User;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private String messageResponse;
    private Role role;
    private String email;
    private User user;

}
