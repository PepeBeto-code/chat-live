package com.chat.api;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.security.Security;


@SpringBootApplication
@EnableScheduling // Habilita la ejecución de tareas automáticas
public class ApiApplication {

	public static void main(String[] args) {
		Security.addProvider(new BouncyCastleProvider()); // Provedor necesario para notificaciones push
		SpringApplication.run(ApiApplication.class, args);
	}

}
