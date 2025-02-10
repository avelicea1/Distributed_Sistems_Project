package ro.tuc.ds2020.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import ro.tuc.ds2020.service.MonitorService;

import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost")
public class IndexController {
}
