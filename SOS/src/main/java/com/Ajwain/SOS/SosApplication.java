package com.Ajwain.SOS;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
@EnableCaching()
@EnableAsync
@SpringBootApplication(scanBasePackages = "com.Ajwain.SOS")
public class SosApplication {

	public static void main(String[] args) {
		SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
		SpringApplication.run(SosApplication.class, args);
	}

}
