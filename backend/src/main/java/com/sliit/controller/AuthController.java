package com.sliit.controller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import javax.security.auth.login.CredentialException;

import com.sliit.config.JwtProvider;
import com.sliit.exception.UserException;
import com.sliit.model.User;
import com.sliit.model.Varification;
import com.sliit.repository.UserRepository;
import com.sliit.request.LoginRequest;
import com.sliit.request.LoginWithGooleRequest;
import com.sliit.response.AuthResponse;
import com.sliit.service.CustomeUserDetailsServiceImplementation;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Tag(name="Authentication Management", description = "Endpoints for user authentication and authorization")
public class AuthController {

	private UserRepository userRepository;
	private PasswordEncoder passwordEncoder;
	private JwtProvider jwtProvider;
	private CustomeUserDetailsServiceImplementation customUserDetails;
	
	
	 private static final String GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
	
	
	public AuthController(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			JwtProvider jwtProvider,
			CustomeUserDetailsServiceImplementation customUserDetails
			) {
		this.userRepository=userRepository;
		this.passwordEncoder=passwordEncoder;
		this.jwtProvider=jwtProvider;
		this.customUserDetails=customUserDetails;
		
	}
	
	  @PostMapping("/signin/google")
	    public ResponseEntity<AuthResponse> googleLogin(@RequestBody LoginWithGooleRequest req) throws GeneralSecurityException, IOException {
	        
	        User user = validateGoogleIdToken(req);
	        
	        String email = user.getEmail();
	        User existingUser = userRepository.findByEmail(email);

	        if (existingUser == null) {
	           
	            User newUser = new User();
	            newUser.setEmail(email);
	            newUser.setImage(user.getImage());
	            newUser.setFullName(user.getFullName());
	            newUser.setLogin_with_google(true);
	            newUser.setPassword(user.getPassword());
	            newUser.setVerification(new Varification());
	            
	            userRepository.save(newUser);
	        }

//	        System.out.println("email ---- "+ existingUser.getEmail()+" jwt - ");
	      
	        Authentication authentication =  new UsernamePasswordAuthenticationToken(email, user.getPassword());
	   
	        
	        SecurityContextHolder.getContext().setAuthentication(authentication);

	        String token = jwtProvider.generateToken(authentication);
	        
	        
	        AuthResponse authResponse = new AuthResponse();
	        authResponse.setStatus(true);
	        authResponse.setJwt(token);
	        
//	        System.out.println("email ---- "+ existingUser.getEmail()+" jwt - "+token);

	        return new ResponseEntity<>(authResponse, HttpStatus.OK);
	    }

	
	private User validateGoogleIdToken(LoginWithGooleRequest req) throws GeneralSecurityException, IOException {
		HttpTransport transport = new NetHttpTransport();
		JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();
        
		GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
			    .setAudience(Collections.singletonList(req.getClientId()))
			    .build();

			GoogleIdToken token = verifier.verify(req.getCredential());
			if (req.getCredential() != null) {
				
			  Payload payload = token.getPayload();
			  String userId = payload.getSubject();
			  
			  System.out.println("User ID: " + userId);

			  String email = payload.getEmail();
			  boolean emailVerified = Boolean.valueOf(payload.getEmailVerified());
			  String name = (String) payload.get("name");
			  String pictureUrl = (String) payload.get("picture");
			  String locale = (String) payload.get("locale");
			  String familyName = (String) payload.get("family_name");
			  String givenName = (String) payload.get("given_name");

			 User user=new User();
			 user.setImage(pictureUrl);
			 user.setEmail(email);
			 user.setFullName(name);
			 user.setPassword(userId);
			 
			 System.out.println("image url - -  "+pictureUrl);
			 
			 return user;

			} else {
			  throw new CredentialException("invalid id token...");
			}
			
			
	}

	@PostMapping("/signup")
	public ResponseEntity<AuthResponse> createUserHandler(@Valid @RequestBody User user) throws UserException {
		try {
			String email = user.getEmail();
			String password = user.getPassword();
			String fullName = user.getFullName();
			String birthDate = user.getBirthDate();
			
			System.out.println("Signup attempt - Email: " + email + ", FullName: " + fullName + ", BirthDate: " + birthDate);
			
			User isEmailExist = userRepository.findByEmail(email);
			
			if (isEmailExist != null) {
				System.out.println("Email already exists: " + email);
				throw new UserException("Email Is Already Used With Another Account");
			}

			// Create new user
			User createdUser = new User();
			createdUser.setEmail(email);
			createdUser.setFullName(fullName);
			createdUser.setPassword(passwordEncoder.encode(password));
			createdUser.setBirthDate(birthDate);
			createdUser.setVerification(new Varification());
			
			try {
				userRepository.save(createdUser);
				System.out.println("User created successfully: " + email);
			} catch (Exception e) {
				System.err.println("Error saving user to database: " + e.getMessage());
				e.printStackTrace();
				throw e;
			}
			
			AuthResponse authResponse = new AuthResponse();
			authResponse.setStatus(true);
			authResponse.setMessage("Registration successful");
			
			return new ResponseEntity<AuthResponse>(authResponse, HttpStatus.OK);
		} catch (UserException e) {
			System.err.println("UserException during signup: " + e.getMessage());
			AuthResponse authResponse = new AuthResponse();
			authResponse.setStatus(false);
			authResponse.setMessage(e.getMessage());
			return new ResponseEntity<AuthResponse>(authResponse, HttpStatus.BAD_REQUEST);
		} catch (Exception e) {
			System.err.println("Unexpected error during signup: " + e.getMessage());
			e.printStackTrace();
			AuthResponse authResponse = new AuthResponse();
			authResponse.setStatus(false);
			authResponse.setMessage("An error occurred during registration: " + e.getMessage());
			return new ResponseEntity<AuthResponse>(authResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest loginRequest) {
        try {
            String username = loginRequest.getEmail();
            String password = loginRequest.getPassword();
            
            Authentication authentication = authenticate(username, password);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String token = jwtProvider.generateToken(authentication);
            AuthResponse authResponse = new AuthResponse();
            authResponse.setJwt(token);
            authResponse.setStatus(true);
            
            return new ResponseEntity<AuthResponse>(authResponse, HttpStatus.OK);
        } catch (BadCredentialsException e) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(false);
            if (e.getMessage().equals("User not Found")) {
                authResponse.setMessage("User not Found");
            } else if (e.getMessage().equals("Invalid password")) {
                authResponse.setMessage("Invalid password");
            } else {
                authResponse.setMessage("Invalid credentials");
            }
            return new ResponseEntity<AuthResponse>(authResponse, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(false);
            authResponse.setMessage("Invalid credentials");
            return new ResponseEntity<AuthResponse>(authResponse, HttpStatus.UNAUTHORIZED);
        }
    }

	
	private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserDetails.loadUserByUsername(username);
        
        if (userDetails == null) {
            throw new BadCredentialsException("User not Found");
        }
        
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}
