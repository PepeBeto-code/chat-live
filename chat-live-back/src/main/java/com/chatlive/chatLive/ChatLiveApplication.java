package com.chatlive.chatLive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import java.security.Security;

@SpringBootApplication
@EnableScheduling // Habilita la ejecución de tareas automáticas
public class ChatLiveApplication {

	public static void main(String[] args) {
		Security.addProvider(new BouncyCastleProvider()); // Provedor necesario para notificaciones push
		SpringApplication.run(ChatLiveApplication.class, args);
	}

}
