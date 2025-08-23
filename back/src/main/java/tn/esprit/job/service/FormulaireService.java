package tn.esprit.job.service;

import tn.esprit.job.dto.FormulaireDetailDTO;
import tn.esprit.job.dto.FormulaireListDTO;
import tn.esprit.job.model.Formulaire;
import tn.esprit.job.model.User;

import java.util.List;

public interface FormulaireService {
    Formulaire createFormulaire(Formulaire formulaire, Long userId);
    List<Formulaire> getAllFormulaires();
    Formulaire getFormulaireById(Long id);
    Formulaire updateFormulaire(Long id, Formulaire formulaire);
    void deleteFormulaire(Long id);
    FormulaireDetailDTO getDetail(Long formulaireId);
    public List<FormulaireListDTO> listAll();
}
