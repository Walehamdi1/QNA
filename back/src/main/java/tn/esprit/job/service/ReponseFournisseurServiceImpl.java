package tn.esprit.job.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.job.model.ReponseClient;
import tn.esprit.job.model.ReponseFournisseur;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.ReponseClientRepository;
import tn.esprit.job.repository.ReponseFournisseurRepository;
import tn.esprit.job.repository.UserRepository;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReponseFournisseurServiceImpl implements ReponseFournisseurService {

    private final ReponseFournisseurRepository repository;
    private final ReponseClientRepository reponseClientRepository;
    private final UserRepository userRepository;

    @Override
    public ReponseFournisseur create(ReponseFournisseur reponse) {
        reponse.setDateReponse(new Date());

        // Safety check (optional but recommended)
        if (reponse.getReponseClient() != null && reponse.getReponseClient().getId_RClient() != null) {
            ReponseClient client = reponseClientRepository.findById(reponse.getReponseClient().getId_RClient())
                    .orElseThrow(() -> new RuntimeException("ReponseClient not found"));
            reponse.setReponseClient(client);
        }

        if (reponse.getUser() != null && reponse.getUser().getUserId() != null) {
            User user = userRepository.findById(reponse.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            reponse.setUser(user);
        }

        return repository.save(reponse);
    }

    @Override
    public List<ReponseFournisseur> getAll() {
        return repository.findAll();
    }

    @Override
    public ReponseFournisseur getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReponseFournisseur not found with ID: " + id));
    }

    @Override
    public ReponseFournisseur update(Long id, ReponseFournisseur updated) {
        ReponseFournisseur existing = getById(id);
        existing.setCommentaire(updated.getCommentaire());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot delete. ReponseFournisseur not found with ID: " + id);
        }
        repository.deleteById(id);
    }
}
