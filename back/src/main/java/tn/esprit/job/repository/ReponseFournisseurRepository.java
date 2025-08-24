package tn.esprit.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.job.model.ReponseFournisseur;

import java.util.List;
import java.util.Optional;

public interface ReponseFournisseurRepository extends JpaRepository<ReponseFournisseur, Long> {
    @Query("""
        select rf
        from ReponseFournisseur rf
        where rf.reponseClient.id_RClient = :reponseClientId
          and rf.user.userId = :userId
    """)
    Optional<ReponseFournisseur> findByReponseClientIdAndUserId(@Param("reponseClientId") Long reponseClientId,
                                                                @Param("userId") Long userId);

    @Query("""
        select rf
        from ReponseFournisseur rf
        where rf.reponseClient.question.formulaire.id_F = :formulaireId
          and rf.user.userId = :userId
    """)
    List<ReponseFournisseur> findAllByFormulaireIdAndUserId(@Param("formulaireId") Long formulaireId,
                                                            @Param("userId") Long userId);
}
