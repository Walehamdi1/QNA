package tn.esprit.job.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        uniqueConstraints = @UniqueConstraint(
                name = "uk_reponse_client_user_question",
                columnNames = {"user_id", "question_id"}
        )
)
public class ReponseClient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_RClient;

    private String valeur;
    private Date dateSoumission;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "reponseClient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReponseFournisseur> reponsesFournisseur;
}
