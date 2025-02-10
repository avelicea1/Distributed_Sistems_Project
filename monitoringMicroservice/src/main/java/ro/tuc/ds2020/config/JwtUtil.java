package ro.tuc.ds2020.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    public static final String SECRET_KEY = "t3pdSx3wx1ExbQ5z43XXB8my/KR24aon4EH/niU9iZi1I9rk5ff1QhlMFFsTrZIY";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        JwtParser jwtParser = Jwts.parser()
                .setSigningKey(SECRET_KEY);
        return jwtParser.parseClaimsJws(token).getBody();
    }


    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean validateToken(String token) {
        return !isTokenExpired(token);
    }

}
