package tn.esprit.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.job.model.ReponseClient;

import java.util.List;
import java.util.Optional;

public interface ReponseClientRepository extends JpaRepository<ReponseClient, Long> {
    @Query("""
           select rc from ReponseClient rc
           where rc.user.userId = :userId
             and rc.question.id_Q = :questionId
           """)
    Optional<ReponseClient> findByUserIdAndQuestionId(@Param("userId") Long userId,
                                                      @Param("questionId") Long questionId);

    // replaces: findAllByUser_UserIdAndQuestion_Formulaire_Id_F(Long userId, Long formulaireId)
    @Query("""
           select rc from ReponseClient rc
           where rc.user.userId = :userId
             and rc.question.formulaire.id_F = :formulaireId
           """)
    List<ReponseClient> findAllByUserIdAndFormulaireId(@Param("userId") Long userId,
                                                       @Param("formulaireId") Long formulaireId);
}
