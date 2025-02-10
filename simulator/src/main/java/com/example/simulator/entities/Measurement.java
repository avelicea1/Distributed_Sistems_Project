package com.example.simulator.entities;


import java.util.Date;
import java.util.UUID;

public class Measurement {
    private long timestamp;
    private UUID deviceId;
    private double measurementValue;

    public long getTimestamp() {
        return timestamp;
    }

    public UUID getDeviceId() {
        return deviceId;
    }

    public Measurement(long timestamp, UUID deviceId, double measurementValue) {
        this.timestamp = timestamp;
        this.deviceId = deviceId;
        this.measurementValue = measurementValue;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public void setDeviceId(UUID deviceId) {
        this.deviceId = deviceId;
    }

    public void setMeasurementValue(double measurementValue) {
        this.measurementValue = measurementValue;
    }

    public double getMeasurementValue() {
        return measurementValue;
    }
}
