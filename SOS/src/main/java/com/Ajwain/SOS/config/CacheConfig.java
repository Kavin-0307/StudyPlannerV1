package com.Ajwain.SOS.config;

import java.time.Duration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
@Configuration
public class CacheConfig {
@Bean 
public RedisCacheConfiguration cacheConfiguration() {
	return (RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(60)).disableCachingNullValues()
			.serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())));
}
@Bean
public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(RedisCacheConfiguration config) {
	return (builder)-> builder.withCacheConfiguration("subjects",config.entryTtl(Duration.ofMinutes(10))).
			withCacheConfiguration("deadlines",config.entryTtl(Duration.ofMinutes(20))).
			withCacheConfiguration("studyplan",config.entryTtl(Duration.ofMinutes(10)));
}
}
