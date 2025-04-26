package com.sliit.model;

import java.time.LocalDateTime;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class Varification {
	
	private boolean status=false;
	private LocalDateTime startedAt;
	private LocalDateTime endsAt;
	private String planType;

}
