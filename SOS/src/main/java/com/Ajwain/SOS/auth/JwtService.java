package com.Ajwain.SOS.auth;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.Ajwain.SOS.entities.User;

import io.jsonwebtoken.security.Keys;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
@Service
public class JwtService {
	private static final String SECRET = "your-very-long-secret-key-at-least-32-characters";
	public String generateToken(String identifier) {
		Map<String,Object> claims=new HashMap<>();
		
		return Jwts.builder().setClaims(claims).setSubject(identifier).setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis()+1000*60*30)).signWith(getSignKey(),SignatureAlgorithm.HS256).compact();
	}
	public Key getSignKey() {
		return Keys.hmacShaKeyFor(SECRET.getBytes());
	}
	public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token,Function<Claims,T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);

    }
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

}
