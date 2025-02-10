package ro.tuc.ds2020.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.tuc.ds2020.entities.Monitor;

import java.util.UUID;

public interface MonitorRepository extends JpaRepository<Monitor, UUID> {
    @Query("SELECT m FROM Monitor m  WHERE m.deviceId = :deviceId")
    Monitor findByDeviceId(@Param("deviceId") UUID deviceId);
}
