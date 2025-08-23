package tn.esprit.job.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import tn.esprit.job.model.Formulaire;
import tn.esprit.job.model.Question;

import java.util.Collection;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("select q.id_Q from Question q where q.formulaire.id_F = :formulaireId")
    List<Long> findIdsByFormulaireId(@Param("formulaireId") Long formulaireId);

    // explicit query for id list (because field is id_Q)
    @Query("select q from Question q where q.id_Q in :ids")
    List<Question> findAllByIdIn(@Param("ids") Collection<Long> ids);

    @Modifying
    @Query("update Question q set q.formulaire = null " +
            "where q.formulaire.id_F = :formulaireId and q.id_Q not in :keepIds")
    int detachMissing(@Param("formulaireId") Long formulaireId, @Param("keepIds") Collection<Long> keepIds);

    @Modifying
    @Query("update Question q set q.formulaire = :formulaire where q.id_Q in :ids")
    int attachToFormulaire(@Param("formulaire") Formulaire formulaire,
                           @Param("ids") Collection<Long> ids);

    @Modifying
    @Query("update Question q set q.formulaire = null where q.formulaire.id_F = :formulaireId")
    int detachAll(@Param("formulaireId") Long formulaireId);

    // ---- Option 2: hard-coded ORDER BY on id_Q ----
    @Query("select q from Question q order by q.id_Q desc")
    Page<Question> findAllOrderByIdQDesc(Pageable pageable);

    @Query("""
           select q from Question q
           where (:type is null or q.type = :type)
             and (:term is null or lower(q.contenu) like lower(concat('%', :term, '%')))
           order by q.id_Q desc
           """)
    Page<Question> searchOrderByIdQDesc(@Param("type") String type,
                                        @Param("term") String term,
                                        Pageable pageable);

    // -------- REPLACEMENTS for underscored IDs (avoid derived parsing) --------
    @Query("select q from Question q where q.formulaire.id_F = :formulaireId")
    List<Question> findByFormulaireId(@Param("formulaireId") Long formulaireId);

    @Query("select (count(q) > 0) from Question q where q.id_Q = :questionId and q.formulaire.id_F = :formulaireId")
    boolean existsByIdInFormulaire(@Param("questionId") Long questionId,
                                   @Param("formulaireId") Long formulaireId);
}
