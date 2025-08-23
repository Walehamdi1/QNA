package tn.esprit.job;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("tn.esprit.job.model")
public class Job {

    public static void main(String[] args) {
        SpringApplication.run(Job.class, args);
    }

}
