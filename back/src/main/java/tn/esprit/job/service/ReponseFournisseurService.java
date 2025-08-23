package tn.esprit.job.service;

import tn.esprit.job.model.ReponseFournisseur;

import java.util.List;

public interface ReponseFournisseurService {
    ReponseFournisseur create(ReponseFournisseur reponse);
    List<ReponseFournisseur> getAll();
    ReponseFournisseur getById(Long id);
    ReponseFournisseur update(Long id, ReponseFournisseur updated);
    void delete(Long id);
}
