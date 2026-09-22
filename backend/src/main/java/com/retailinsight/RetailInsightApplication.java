package com.retailinsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RetailInsightApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetailInsightApplication.class, args);
    }
}
