package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.DeviceDetailsDto;
import ro.tuc.ds2020.dtos.DeviceDto;
import ro.tuc.ds2020.entities.Device;

public class DeviceBuilder {
    private DeviceBuilder(){

    }
    public static DeviceDto toDeviceDto(Device device){
        return new DeviceDto(device.getId(), device.getDescription(), device.getAddress(),device.getMhc(), device.getPerson());
    }

    public static DeviceDetailsDto toDeviceDetailsDto (Device device){
        return new DeviceDetailsDto(device.getId(), device.getDescription(), device.getAddress(),device.getMhc(), device.getPerson());
    }

    public static Device toDevice(DeviceDetailsDto deviceDetailsDto){
        return new Device(deviceDetailsDto.getId(), deviceDetailsDto.getDescription(),deviceDetailsDto.getAddress(),deviceDetailsDto.getMhc(),deviceDetailsDto.getPerson());
    }
}
