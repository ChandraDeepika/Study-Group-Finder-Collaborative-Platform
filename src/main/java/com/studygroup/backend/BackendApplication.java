package com.studygroup.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "com.studygroup")
@EnableScheduling   // 🔥 Enables scheduled tasks (cron jobs)
@EnableAsync        // 🔥 Enables async methods (email sending, etc.)
public class BackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(BackendApplication.class, args);

        System.out.println("🚀 Study Group Backend Application Started Successfully!");
    }
}