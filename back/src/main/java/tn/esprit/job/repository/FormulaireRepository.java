package tn.esprit.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.job.model.Formulaire;
import tn.esprit.job.model.User;

@Repository
public interface FormulaireRepository extends JpaRepository<Formulaire,Long> {
}
