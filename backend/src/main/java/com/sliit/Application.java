package com.sliit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "API",description = "Skill Sharing and Learning Platform"))
public class Application {

	public static void main(String[] args)
	{
		SpringApplication.run(Application.class, args);
	}
}
