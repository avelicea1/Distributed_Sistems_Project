package com.example.simulator;

import com.example.simulator.config.RabbitMQConfig;
import com.example.simulator.entities.Measurement;
import com.example.simulator.service.RabbitMQService;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;
import java.util.UUID;

@EnableScheduling
@SpringBootApplication
public class SimulatorApplication {

    private static UUID deviceId;
    private final RabbitMQService rabbitMQService;
    private static String csvFilePath;
    private CSVReader csvReader;
    private volatile boolean initialized = false;

    @Autowired
    public SimulatorApplication(RabbitMQService rabbitMQService) {
        this.rabbitMQService = rabbitMQService;
    }

    public static void main(String[] args) {
        SpringApplication.run(SimulatorApplication.class, args);
    }

    @Bean
    public CommandLineRunner run() {
        return args -> {
            if (args.length > 0) {
                String configFilePath = args[0];
                System.out.println("Loading configuration from: " + configFilePath);
                loadConfiguration(configFilePath);
                initializeCsvReader();
                initialized = true;
            } else {
                System.out.println("Not enough arguments provided. Please provide the config file path.");
            }
        };
    }

    private static void loadConfiguration(String configFilePath) {
        Properties properties = new Properties();
        try (FileInputStream input = new FileInputStream(configFilePath)) {
            properties.load(input);
            String deviceIdString = properties.getProperty("deviceId");
            if (deviceIdString != null && !deviceIdString.trim().isEmpty()) {
                deviceId = UUID.fromString(deviceIdString.trim());
                System.out.println("Loaded deviceId: " + deviceId);
            } else {
                System.out.println("Device ID is not set or empty in the configuration file.");
            }
            String csvFilePathFromConfig = properties.getProperty("csvFilePath");
            System.out.println("CSV file path: " + csvFilePathFromConfig);
            if (csvFilePathFromConfig != null && !csvFilePathFromConfig.trim().isEmpty()) {
                csvFilePath = csvFilePathFromConfig.trim();
                System.out.println("Loaded CSV file path: " + csvFilePath);
            } else {
                System.out.println("CSV file path is not set or empty in the configuration file.");
            }
        } catch (IOException | IllegalArgumentException e) {
            System.out.println("Error loading configuration: " + e.getMessage());
        }
    }

    private void initializeCsvReader() {
        try {
            if (csvFilePath != null && !csvFilePath.trim().isEmpty()) {
                csvReader = new CSVReader(new FileReader(csvFilePath));
                csvReader.readNext();
                System.out.println("CSV reader initialized with file: " + csvFilePath);
            } else {
                System.out.println("CSV file path is null or empty, cannot initialize CSV reader.");
            }
        } catch (IOException | CsvValidationException e) {
            System.out.println("Error initializing CSV reader: " + e.getMessage());
        }
    }

    public void readNextMeasurementAndSend() {
        try {
            if (csvReader == null) {
                initializeCsvReader();
            }
            String[] values = csvReader.readNext();
            if (values != null) {
                double measurementValue = Double.parseDouble(values[0]);
                Measurement measurement = new Measurement(System.currentTimeMillis(), deviceId, measurementValue);
                rabbitMQService.sendMessageToQueue(RabbitMQConfig.ROUTING_KEY_CLIENTS_SIMULATOR, measurement);
                System.out.println("Sent measurement to queue: " + measurementValue);
            } else {
                System.out.println("End of CSV file reached. No more measurements to send.");
                csvReader.close();
            }
        } catch (IOException | CsvValidationException e) {
            System.out.println("Error reading next measurement from CSV: " + e.getMessage());
        } catch (NumberFormatException e) {
            System.out.println("Invalid measurement value format: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 1 * 60 * 1000)
    public void scheduledReadAndSend() {
        if (!initialized) {
            System.out.println("Initialization not complete. Waiting before reading measurements...");
            return;
        }
        System.out.println("Scheduled task: Reading next measurement and sending it...");
        readNextMeasurementAndSend();
    }
}
