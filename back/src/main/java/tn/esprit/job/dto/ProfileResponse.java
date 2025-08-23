package tn.esprit.job.dto;

import tn.esprit.job.enumeration.Role;
import tn.esprit.job.model.User;
import lombok.*;

import java.util.Date;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ProfileResponse {
    private Long id ;
    private String firstName ;
    private String lastName ;
    private String email;
    private Role role;
    public static ProfileResponse fromEntity(User user)
    {
        if(user == null)
        {
            return null ;
        }

        return ProfileResponse.builder()
                .id(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build() ;
    }


}
