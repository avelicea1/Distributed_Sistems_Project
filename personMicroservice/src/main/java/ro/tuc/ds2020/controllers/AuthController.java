package ro.tuc.ds2020.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import ro.tuc.ds2020.config.JwtUtil;
import ro.tuc.ds2020.dtos.DeviceProperties;
import ro.tuc.ds2020.dtos.LoginRequest;
import ro.tuc.ds2020.dtos.LoginResponse;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.dtos.builders.PersonBuilder;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.PersonRepository;
import ro.tuc.ds2020.services.CustomUserDetailsService;
import ro.tuc.ds2020.services.PersonService;

import javax.transaction.Transactional;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(value = "/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PersonRepository personRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PersonService personService;


    private final String DEVICE_SERVICE_URL = "http://device-backend-container:8081/api-device";


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(new LoginResponse("Incorrect username or password"), HttpStatus.UNAUTHORIZED);
        }
        Person person = personRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Person not found"));
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails.getUsername(), person.getId(), person.getRole().name() );
        return ResponseEntity.ok(new LoginResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody PersonDetailsDTO personDetailsDTO) {
        System.out.println("Received registration request for: " + personDetailsDTO.getEmail());
        if (personRepository.findByEmail(personDetailsDTO.getEmail()).isPresent()) {
            System.out.println("Person already exists with email: " + personDetailsDTO.getEmail());
            return new ResponseEntity<>(Map.of("message","Person already exists"), HttpStatus.CONFLICT);
        }
        try {
            System.out.println("Registering person: " + personDetailsDTO.getEmail());
            Person person = PersonBuilder.toEntity(personDetailsDTO);
            person.setPassword(passwordEncoder.encode(personDetailsDTO.getPassword()));
            UUID personId = personService.insert(personDetailsDTO);
            informDeviceServiceAboutPersonAdd(personId);
            return new ResponseEntity<>(Map.of("message", "User registered successfully"), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("message", "Failed to save user"), HttpStatus.BAD_REQUEST);
        }
    }


    private void informDeviceServiceAboutPersonAdd(UUID personId) {
        String url = DEVICE_SERVICE_URL + "/person/person-added/" + personId;
        restTemplate.postForEntity(url, null, Void.class);
    }

    @GetMapping("/test")
    public String test() {
        return "Test successful!";
    }
}
