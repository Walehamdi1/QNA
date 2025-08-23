package tn.esprit.job.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.esprit.job.enumeration.Role;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.UserRepository;
import tn.esprit.job.service.UserService;

@Component
public class Initialize implements CommandLineRunner {
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Override
    public void run(String... args) throws Exception {
        try {
            createManagerUserIfNeeded();
            createEmployeeUserIfNeeded();
            createFournisseurUserIfNeeded();
        }
        catch (Exception e){
            throw new Exception(e.getMessage());
        }
    }
    private void createManagerUserIfNeeded() {
        User adminUser = userService.getUserByEmail("admin@admin.com");
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setFirstName("admin");
            adminUser.setLastName("admin");
            adminUser.setEmail("admin@admin.com");
            adminUser.setPassword(passwordEncoder.encode("adminadmin"));
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            userRepository.save(adminUser);
        }
    }
    private void createEmployeeUserIfNeeded() {
        User adminUser = userService.getUserByEmail("client@client.com");
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setFirstName("client");
            adminUser.setLastName("client");
            adminUser.setEmail("client@client.com");
            adminUser.setPassword(passwordEncoder.encode("clientclient"));
            adminUser.setRole(Role.CLIENT);
            adminUser.setEnabled(true);
            userRepository.save(adminUser);        }
    }
    private void createFournisseurUserIfNeeded() {
        User adminUser = userService.getUserByEmail("fournisseur@fournisseur.com");
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setFirstName("fournisseur");
            adminUser.setLastName("fournisseur");
            adminUser.setEmail("fournisseur@fournisseur.com");
            adminUser.setPassword(passwordEncoder.encode("fournisseurfournisseur"));
            adminUser.setRole(Role.FOURNISSEUR);
            adminUser.setEnabled(true);
            userRepository.save(adminUser);        }
    }


}
