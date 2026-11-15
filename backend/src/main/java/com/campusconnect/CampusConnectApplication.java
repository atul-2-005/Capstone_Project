package com.campusconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CampusConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusConnectApplication.class, args);
        System.out.println("=================================================");
        System.out.println("CampusConnect Backend started successfully on 8080");
        System.out.println("=================================================");
    }
}
