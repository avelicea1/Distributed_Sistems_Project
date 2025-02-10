package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.MonitorDetailsDto;
import ro.tuc.ds2020.dtos.MonitorDto;
import ro.tuc.ds2020.entities.Monitor;

public class MonitorBuilder {
    private MonitorBuilder(){

    }
    public static MonitorDto toMonitorDto(Monitor monitor){
        return new MonitorDto(monitor.getDeviceId(),monitor.getPersonId(),monitor.getMhc(),monitor.getLastIndex(), monitor.getValues());
    }
    public static MonitorDetailsDto toMonitorDetailsDto(Monitor monitor){
        return new MonitorDetailsDto(monitor.getDeviceId(),monitor.getPersonId(), monitor.getMhc(), monitor.getLastIndex(), monitor.getValues());
    }
    public static Monitor toMonitor(MonitorDetailsDto monitorDetailsDto){
        return new Monitor(monitorDetailsDto.getDeviceId(),monitorDetailsDto.getPersonId(), monitorDetailsDto.getMhc(), monitorDetailsDto.getLastIndex(), monitorDetailsDto.getValues());
    }
}
