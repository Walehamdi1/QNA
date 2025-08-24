package tn.esprit.job.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        uniqueConstraints = @UniqueConstraint(
                name = "uk_rf_user_reponseclient",
                columnNames = {"user_id", "reponse_client_id"}
        )
)
public class ReponseFournisseur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_RFournisseur;

    private Date dateReponse;
    private String Commentaire;

    @ManyToOne
    @JoinColumn(name = "reponse_client_id")
    private ReponseClient reponseClient;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
