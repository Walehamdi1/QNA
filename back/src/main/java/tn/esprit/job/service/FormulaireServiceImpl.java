package tn.esprit.job.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.job.dto.FormulaireDetailDTO;
import tn.esprit.job.dto.FormulaireListDTO;
import tn.esprit.job.dto.QuestionDTO;
import tn.esprit.job.model.Formulaire;
import tn.esprit.job.model.Question;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.FormulaireRepository;
import tn.esprit.job.repository.QuestionRepository;
import tn.esprit.job.repository.UserRepository;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormulaireServiceImpl implements FormulaireService {

    private final FormulaireRepository formulaireRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    @Override
    public Formulaire createFormulaire(Formulaire formulaire, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        formulaire.setUser(user);
        formulaire.setDateCreation(new Date());

        return formulaireRepository.save(formulaire);
    }

    @Override
    public List<Formulaire> getAllFormulaires() {
        return formulaireRepository.findAll();
    }

    @Override
    public Formulaire getFormulaireById(Long id) {
        return formulaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulaire not found with ID: " + id));
    }

    @Override
    public Formulaire updateFormulaire(Long id, Formulaire updatedFormulaire) {
        Formulaire existing = getFormulaireById(id);

        existing.setTitre(updatedFormulaire.getTitre());

        if (updatedFormulaire.getUser() != null && updatedFormulaire.getUser().getUserId() != null) {
            Long newUserId = updatedFormulaire.getUser().getUserId();
            User user = userRepository.findById(newUserId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + newUserId));
            existing.setUser(user);
        }

        return formulaireRepository.save(existing);
    }

    @Override
    public void deleteFormulaire(Long id) {
        if (!formulaireRepository.existsById(id)) {
            throw new RuntimeException("Formulaire not found with ID: " + id);
        }
        formulaireRepository.deleteById(id);
    }

    @Override
    public List<FormulaireListDTO> listAll() {
        return formulaireRepository.findAll().stream()
                .map(f -> FormulaireListDTO.builder()
                        .id(f.getId_F())
                        .titre(f.getTitre())
                        .dateCreation(f.getDateCreation())
                        .ownerEmail(f.getUser() != null ? f.getUser().getEmail() : null)
                        .build())
                .toList();
    }

    @Override
    public FormulaireDetailDTO getDetail(Long formulaireId) {
        Formulaire f = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new IllegalArgumentException("Formulaire not found"));

        List<Question> qs = questionRepository.findByFormulaireId(formulaireId);
        List<QuestionDTO> qdtos = qs.stream()
                .map(q -> QuestionDTO.builder()
                        .id(q.getId_Q())
                        .contenu(q.getContenu())
                        .type(q.getType())
                        .build())
                .toList();

        return FormulaireDetailDTO.builder()
                .id(f.getId_F())
                .titre(f.getTitre())
                .dateCreation(f.getDateCreation())
                .questions(qdtos)
                .build();
    }

}
